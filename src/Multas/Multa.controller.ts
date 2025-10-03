import { orm } from "../shared/db/orm.js";
import { Request, Response, NextFunction } from "express";
import { Multa } from "./Multa.entity.js";
import { Evidencia } from "../evidencia/evidencia.entity.js";

const em = orm.em

function sanitizeMultasInput(req:Request , res:Response, next:NextFunction){
    req.body.sanitizedInput = {
        motivoMulta:req.body.motivoMulta,
        montoMulta:req.body.montoMulta,
        lugarDePago:req.body.lugarDePago,
        fechaEmision:req.body.fechaEmision,
        estado:req.body.estado,
        fechaVencimiento:req.body.fechaVencimiento,
        evidenciaId : req.body.evidenciaId
    }

    Object.keys(req.body.sanitizedInput).forEach(key=>{
        if(req.body.sanitizedInput[key]===undefined){
            delete req.body.sanitizedInput[key]
        }
        })
        next()
}

async function findAll(req:Request, res:Response){
    try {
        const multas = await em.find(Multa , {})
        res.status(500).json({message : "find all multas" , data : multas})
    } catch(error : any){
        res.status(500).json({message : error.message})
    }
}


async function findOne(req:Request,res:Response){
    try {
        const id = Number.parseInt(req.params.id)
        const multa = await em.findOneOrFail(Multa, { id })
        res.status(200).json({ message: 'find one multa', data: multa })
      } catch (error: any) {
        res.status(500).json({ message: error.message })
      }
}

async function add(req:Request,res:Response){
    try{
        const { evidenciaId, ...sanitizedInput} = req.body
        const nuevaMulta = em.create(Multa, sanitizedInput)
        if(!evidenciaId){
            return res.status(400).json({message : "Evidencia id is required"})
        }else{
            const evidencia = await em.findOneOrFail(Evidencia, { id : evidenciaId})
            if(!evidencia){
                return res.status(404).json({message: "evidencia not found"})
            }else {
                nuevaMulta.evidencia = evidencia;
                await em.flush();
            }
        }
        res.status(201).json({ message: 'multa created', data: nuevaMulta })
    } catch (error: any) {
     res.status(500).json({ message: error.message })
}
}

async function update(req:Request,res:Response){
    try {
        const id = Number.parseInt(req.params.id)
        const multaToUpdate = await em.findOneOrFail(Multa, { id })
        em.assign(multaToUpdate, req.body.sanitizedInput)
        await em.flush()
        res.status(200).json({ message: 'multa updated', data: multaToUpdate })
      } catch (error: any) {
        res.status(500).json({ message: error.message })
      }
}



async function remove(req:Request,res:Response){
     try {
        const id = Number.parseInt(req.params.id)
        const multa = em.getReference(Multa, id)
        await em.removeAndFlush(multa)
        res.status(200).json({ message: 'multa deleted' })
      } catch (error: any) {
        res.status(500).json({ message: error.message })
      }
}


export{sanitizeMultasInput,findAll,findOne,add,update,remove}