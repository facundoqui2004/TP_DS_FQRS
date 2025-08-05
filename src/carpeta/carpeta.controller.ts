import { Request, Response, } from "express";
import { Carpeta } from "./carpeta.entity.js";
import { orm } from "../shared/db/orm.js";

const em = orm.em



async function findAll(req:Request, res:Response){
    try {
    const carpetas = await em.find(Carpeta, {}, {populate :['evidencias']})
    res.status(200).json({message : 'find All carpetas', data: carpetas})
    } catch (error : any) {
      res.status(500).json({error:error.message})  
    }
}

async function findOne(req:Request, res: Response){
  try {
    const id = Number.parseInt(req.params.id)
    const carpeta = await em.findOneOrFail(Carpeta, { id }, {populate :['evidencias']})
    res.status(200).json({message: 'find one carpeta', data : carpeta})
  } catch (error : any) {
    res.status(500).json({error:error.message})
  }
}


async function add(req:Request , res: Response){
  try {
    console.log()
    const nuevaCarpeta = em.create(Carpeta, req.body)
    await em.flush()
    res.status(200).json({message : 'Carpeta has been created', data : nuevaCarpeta})
  } catch (error : any) {
    res.status(500).json({error:error.message})
  }
}




async function remove(req:Request, res:Response){
  try {
    const id = Number.parseInt(req.params.id)
    const carpetaToDelete = em.getReference(Carpeta,  id )
    await em.removeAndFlush(carpetaToDelete)
    res.status(200).json({message : 'Carpeta has been eliminated' })
  } catch (error : any) {
    res.status(500).json({error:error.message})
  }
}


export {findOne, findAll, remove, add}

  