
import { Request, Response, NextFunction } from "express";
import { Burocrata } from "./Burocrata.entity.js";
import { orm } from "../shared/db/orm.js";



const em = orm.em


function sanitizeBurocratasInput(req:Request , res:Response, next:NextFunction){
    req.body.sanitizedInput = {
       nombreBuro:req.body.nombreBuro,
       aliasBuro:req.body.aliasBuro,
       origenBuro:req.body.origenBuro,
       telefono:req.body.telefono,
       mailBuro:req.body.mailBuro
    }

    Object.keys(req.body.sanitizedInput).forEach(key=>{
        if(req.body.sanitizedInput[key]===undefined){
            delete req.body.sanitizedInput[key]
        }
        })
        next()
}

async function findAll(req:Request, res:Response){
  try{
    const burocratas = await em.find(Burocrata, {})//cuando se agregue carpetas , { populate : ['carpetas']}
    res.status(200).send({message : "find all burocratas",data : burocratas })
  } catch(error : any){
    res.status(500).json({message : error.message})
  }
}

async function findOne(req:Request,res:Response){
    try {
        const id = Number.parseInt(req.params.id)
        const burocrata = await em.findOneOrFail(Burocrata, { id })//cuando se cree Carpeta , {populate: ['carpetas'],}
        res.status(200).json({ message: 'find one burocrata', data: burocrata })
      } catch (error: any) {
        res.status(500).json({ message: error.message })
      }
}

async function add(req:Request,res:Response){
    try{
        const burocrata = em.create(Burocrata, req.body.sanitizedInput)
        await em.flush()
        res.status(201).json({ message: 'burocrata created', data: burocrata })
    } catch (error: any) {
     res.status(500).json({ message: error.message })
}
}

async function update(req:Request,res:Response){
    try {
        const id = Number.parseInt(req.params.id)
        const burocrataToUpdate = await em.findOneOrFail(Burocrata, { id })
        em.assign(burocrataToUpdate, req.body.sanitizedInput)
        await em.flush()
        res.status(200).json({ message: 'burocrata updated', data: burocrataToUpdate })
      } catch (error: any) {
        res.status(500).json({ message: error.message })
      }
}



async function remove(req:Request,res:Response){
     try {
        const id = Number.parseInt(req.params.id)
        const burocatra = em.getReference(Burocrata, id)
        await em.removeAndFlush(burocatra)
        res.status(200).json({ message: 'burocrata deleted' })
      } catch (error: any) {
        res.status(500).json({ message: error.message })
      }
}


export{sanitizeBurocratasInput,findAll,findOne,add,update,remove}