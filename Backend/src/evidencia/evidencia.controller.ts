import { Request, Response, NextFunction } from "express";
import { Evidencia } from "./evidencia.entity.js";
import { orm } from "../shared/db/orm.js";
import { Carpeta } from "../carpeta/carpeta.entity.js";

const em = orm.em
function sanitizeEvidenciaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    descripcion: req.body.descripcion,
    fechaRecoleccion: req.body.fechaRecoleccion ? new Date(req.body.fechaRecoleccion) : new Date(),
    carpetaId: req.body.carpetaId,
    imagen: req.body.imagen,
    latitud: req.body.latitud,
    longitud: req.body.longitud
  }

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })

  next()
}


async function findAll(req:Request, res:Response){
    try {
    // Un metahumano solo ve las evidencias de sus propias carpetas
    const filtro: any = (req as any).role === 'METAHUMANO'
      ? { carpeta: { metahumano: (req as any).perfilId } }
      : {}
    const evidencias = await em.find(Evidencia, filtro, {populate :['carpeta.metahumano', 'multas']})
    res.status(200).json({message : 'find All evidencias', data: evidencias})
    } catch (error : any) {
      console.error(error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
}

async function findOne(req:Request, res: Response){
  try {
    const id = Number.parseInt(req.params.id)
    const evidencia = await em.findOneOrFail(Evidencia, { id }, {populate :['multas', 'carpeta']})
    if ((req as any).role === 'METAHUMANO' && evidencia.carpeta?.metahumano?.id !== (req as any).perfilId) {
      return res.status(403).json({ message: 'No podés ver esta evidencia' })
    }
    res.status(200).json({message: 'find one evidencia', data : evidencia})
  } catch (error : any) {
    console.error(error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}


async function add(req:Request , res: Response){
  try { 
    const {carpetaId, ...sanitizedInput} = req.body.sanitizedInput
    const nuevaEvidencia = em.create(Evidencia, sanitizedInput)
    
    if (!nuevaEvidencia.fechaRecoleccion || isNaN(nuevaEvidencia.fechaRecoleccion.getTime())) {
      return res.status(400).json({error: "La fecha de recolección es requerida y debe ser una fecha válida"})
    }
    
    const limit = new Date()
    limit.setDate(limit.getDate() + 1)
    limit.setHours(0, 0, 0, 0)
    if (nuevaEvidencia.fechaRecoleccion >= limit) {
      return res.status(400).json({error: "La fecha de recolección no puede ser futura"})
    }
    
    if(carpetaId){
      const carpeta = await em.findOneOrFail(Carpeta, {id : Number(carpetaId)});
      if (String(carpeta.estado).toUpperCase() === 'CERRADA') {
        return res.status(400).json({error: "No se pueden agregar evidencias a una carpeta cerrada"})
      }
      nuevaEvidencia.carpeta = carpeta;
    }
    
    await em.flush();
    res.status(201).json({message : 'Evidencia creada exitosamente', data : nuevaEvidencia})
    
  } catch (error : any) {
    console.error(error)
    res.status(500).json({ message: 'Error interno del servidor' })
  } 
}

async function update(req:Request , res:Response){
  try {
    const id = Number.parseInt(req.params.id)
    const evidenciaToUpdate = await em.findOneOrFail(Evidencia, {id})
    
    em.assign(evidenciaToUpdate, req.body.sanitizedInput)
    
    if (!evidenciaToUpdate.fechaRecoleccion || isNaN(evidenciaToUpdate.fechaRecoleccion.getTime())) {
      return res.status(400).json({error: "La fecha de recolección es requerida y debe ser una fecha válida"})
    }

    const limit = new Date()
    limit.setDate(limit.getDate() + 1)
    limit.setHours(0, 0, 0, 0)
    if (evidenciaToUpdate.fechaRecoleccion >= limit) {
      return res.status(400).json({error: "La fecha de recolección no puede ser futura"})
    }

    await em.flush();
    res.status(200).json({message:'Evidencia updated', data:evidenciaToUpdate})
  } catch (error : any) {
    console.error(error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

async function remove(req:Request, res:Response){
  try {
    const id = Number.parseInt(req.params.id)
    const evidenciaToDelete = em.getReference(Evidencia,  id )
    await em.removeAndFlush(evidenciaToDelete)
    res.status(200).json({message : 'Evidencia has been eliminated' })
  } catch (error : any) {
    console.error(error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}


export {sanitizeEvidenciaInput, findOne, findAll, update, remove, add}

  