import { Request, Response } from 'express'
import { Villano } from './villano.entity.js'
import { orm } from '../shared/db/orm.js'
import { sanitizeMetahumanoInput } from '../metahumano/metahumano.controller.js'

const em = orm.em

function sanitizeVillanoInput(req: Request, res: Response, next: Function) {
  // Reutilizar la sanitización de metahumano
  sanitizeMetahumanoInput(req, res, () => {
    // Agregar campos específicos de villano
    req.body.sanitizedInput = {
      ...req.body.sanitizedInput,
      nivelPeligrosidad: req.body.nivelPeligrosidad,
      motivacion: req.body.motivacion,
      fechaCaptura: req.body.fechaCaptura ? new Date(req.body.fechaCaptura) : undefined,
      estado: req.body.estado || 'activo',
      recompensa: req.body.recompensa ? Number(req.body.recompensa) : undefined,
    }

    // Limpiar undefined
    Object.keys(req.body.sanitizedInput).forEach((key) => {
      if (req.body.sanitizedInput[key] === undefined) {
        delete req.body.sanitizedInput[key]
      }
    })
    
    next()
  })
}

async function findAll(req: Request, res: Response) {
  try {
    const villanos = await em.find(Villano, {}, {
      populate: ['poderes', 'carpetas']
    })
    res.status(200).json({ message: 'Villanos encontrados', data: villanos })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const villano = await em.findOneOrFail(Villano, { id }, {
      populate: ['poderes', 'carpetas']
    })
    res.status(200).json({ message: 'Villano encontrado', data: villano })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const villanoData = req.body.sanitizedInput
    const villano = em.create(Villano, villanoData)
    await em.persistAndFlush(villano)
    res.status(201).json({ message: 'Villano creado', data: villano })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const villanoToUpdate = await em.findOneOrFail(Villano, { id })
    em.assign(villanoToUpdate, req.body.sanitizedInput)
    await em.persistAndFlush(villanoToUpdate)
    res.status(200).json({ message: 'Villano actualizado', data: villanoToUpdate })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const villano = await em.findOneOrFail(Villano, { id })
    await em.removeAndFlush(villano)
    res.status(200).json({ message: 'Villano eliminado' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}




export {
  sanitizeVillanoInput,
  findAll,
  findOne,
  add,
  update,
  remove,
}
