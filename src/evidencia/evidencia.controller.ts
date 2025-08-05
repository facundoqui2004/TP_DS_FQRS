import { Request, Response, NextFunction } from "express";
import { Evidencia } from "./evidencia.entity.js";
import { orm } from "../shared/db/orm.js";

const em = orm.em
function sanitizeEvidenciaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    descripcion: req.body.descripcion,
    fechaRecoleccion: req.body.fechaRecoleccion,
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
    const evidencias = await em.find(Evidencia, {}, {populate :['multas']})
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
    console.log()
    const nuevaEvidencia = em.create(Evidencia, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({message : 'Evidencia has been created', data : nuevaEvidencia})
  } catch (error : any) {
    res.status(500).json({error:error.message})
  }
}

async function update(req:Request , res:Response){
  try {
    const id = Number.parseInt(req.params.id)
    const evidenciaToUpdate = await em.findOneOrFail(Evidencia, {id})
    const input = req.body.sanitizedInput
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

  