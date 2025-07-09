import { BurocrataRepository } from "./Burocrata.repository.js";
import { Request, Response, NextFunction } from "express";
import { Burocrata } from "./Burocrata.entity.js";
console.log('banana');

const repository = new BurocrataRepository();

function sanitizeBurocratasInput(req:Request , res:Response, next:NextFunction){
    req.body.sanitizedInput = {
        passwordHash: req.body.passwordHash,
        fechaRegistro:req.body.fechaRegistro,
        direccion:req.body.direccion
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
  const burocrata =  repository.findOne({id:req.params.id})
  if(!burocrata){
      return res.status(404).send({message: "Burocrata no encontrado"})
  }
  res.json({data:burocrata})
}

function add(req:Request,res:Response){
    const input = req.body.sanitizedInput
    const burocrataInput = new Burocrata(
        input.idUsuario=crypto.randomUUID(),
        input.passwordHash,
        input.fechaRegistro,
        input.direccion
    )

    const character = repository.add(burocrataInput)
    return res.status(201).send({message:'burocrata creado correctamente', data:burocrataInput})
}

function update(req:Request,res:Response){
  req.body.sanitizedInput.idUsuario = req.params.id
  const burocrata = repository.update(req.body.sanitizedInput)
  if(!burocrata){
      return res.status(404).send({message:'burocrata no encontrado'})
  }
  return res.status(200).send({message:'se modifico correctamente el burocrata'})
}


function remove(req:Request,res:Response){
  const id = req.params.id
  const burocrata = repository.delete({id})
  if (!burocrata){
      res.status(404).send({message:'burocrata no encontrado'})
  }else {
      res.status(200).send({message:'burocrata eliminado correctamente'}) 
  }
}


export{sanitizeBurocratasInput,findAll,findOne,add,update,remove}