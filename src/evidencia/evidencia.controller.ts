import { Request, Response, NextFunction } from "express";
import { Evidencia } from "./evidencia.entity.js";
import { orm } from "../shared/db/orm.js";
import { Carpeta } from "../carpeta/carpeta.entity.js";

const em = orm.em
function sanitizeEvidenciaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    descripcion: req.body.descripcion,
    fechaRecoleccion: req.body.fechaRecoleccion ? new Date(req.body.fechaRecoleccion) : new Date(),
    carpetaId:req.body.carpetaId
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
    const evidencias = await em.find(Evidencia, {}, {populate :['carpeta', 'multas']})
    res.status(200).json({message : 'find All evidencias', data: evidencias})
    } catch (error : any) {
      res.status(500).json({error:error.message})  
    }
}

async function findOne(req:Request, res: Response){
  try {
    const id = Number.parseInt(req.params.id)
    const evidencia = await em.findOneOrFail(Evidencia, { id }, {populate :['multas']})
    res.status(200).json({message: 'find one evidencia', data : evidencia})
  } catch (error : any) {
    res.status(500).json({error:error.message})
  }
}


async function add(req:Request , res: Response){
  try { 
    const {carpetaId, ...sanitizedInput} = req.body.sanitizedInput
    const nuevaEvidencia = em.create(Evidencia, sanitizedInput)
    
    // Validar que la fecha de recolección no sea futura
    if (nuevaEvidencia.fechaRecoleccion && nuevaEvidencia.fechaRecoleccion > new Date()) {
      return res.status(400).json({error: "La fecha de recolección no puede ser futura"})
    }
    
    // Asociar carpeta si se proporciona carpetaId
    if(carpetaId){
      const carpeta = await em.findOneOrFail(Carpeta, {id : Number(carpetaId)});
      nuevaEvidencia.carpeta = carpeta;
    }
    
    await em.flush();
    res.status(201).json({message : 'Evidencia creada exitosamente', data : nuevaEvidencia})
    
  } catch (error : any) {
    res.status(500).json({error:error.message})
  } 
}

async function update(req:Request , res:Response){
  try {
    const id = Number.parseInt(req.params.id)
    const evidenciaToUpdate = await em.findOneOrFail(Evidencia, {id})
    
    if (evidenciaToUpdate.fechaRecoleccion > new Date()) {
      throw new Error("La fecha no puede ser futura");
    }

    em.assign(evidenciaToUpdate, req.body.sanitizedInput)
    await em.flush();
    res.status(200).json({message:'Evidencia updated', data:evidenciaToUpdate})
  } catch (error : any) {
    res.status(500).json({error : error.message})
  }
}

async function remove(req:Request, res:Response){
  try {
    const id = Number.parseInt(req.params.id)
    const evidenciaToDelete = em.getReference(Evidencia,  id )
    await em.removeAndFlush(evidenciaToDelete)
    res.status(200).json({message : 'Evidencia has been eliminated' })
  } catch (error : any) {
    res.status(500).json({error:error.message})
  }
}


export {sanitizeEvidenciaInput, findOne, findAll, update, remove, add}

  