import { multaRepository } from "./Multa.repository.js";
import { Request, Response, NextFunction } from "express";
import { Multa } from "./Multa.entity.js";

export const repository = new multaRepository();

function sanitizeMultasInput(req:Request , res:Response, next:NextFunction){
    req.body.sanitizedInput = {
        motivoMulta:req.body.motivoMulta,
        lugarDePago:req.body.lugarDePago,
        fechaEmision:req.body.fechaEmision,
        estado:req.body.estado,
        fechaVencimiento:req.body.fechaVencimiento
    }

    Object.keys(req.body.sanitizedInput).forEach(key=>{
        if(req.body.sanitizedInput[key]===undefined){
            delete req.body.sanitizedInput[key]
        }
        })
        next()
}

function findAll(req:Request, res:Response){
  res.json({data : repository.findAll()})
}

function findOne(req:Request,res:Response){
  const multa =  repository.findOne({id:req.params.id})
  if(!multa){
      return res.status(404).send({message: "Multa no encontrada"})
  }
  res.json({data:multa})
}

function add(req:Request,res:Response){
    const input = req.body.sanitizedInput
    const multaInput = new Multa(
        input.id=crypto.randomUUID(),
        input.motivoMulta,
        input.lugarDePago,
        input.fechaEmision,
        input.estado,
        input.fechaVencimiento
    )

    const character = repository.add(multaInput)
    return res.status(201).send({message:'multa creada correctamente', data:multaInput})
}

function update(req:Request,res:Response){
  req.body.sanitizedInput.id = req.params.id
  const multa = repository.update(req.body.sanitizedInput)
  if(!multa){
      return res.status(404).send({message:'multa no encontrada'})
  }
  return res.status(200).send({message:'se modifico correctamente la multa'})
}


function remove(req:Request,res:Response){
  const id = req.params.id
  const multa = repository.delete({id})
  if (!multa){
      res.status(404).send({message:'multa no encontrada'})
  }else {
      res.status(200).send({message:'multa eliminada correctamente'}) 
  }
}


export{sanitizeMultasInput,findAll,findOne,add,update,remove}