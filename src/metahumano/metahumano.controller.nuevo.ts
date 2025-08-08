import { Request, Response, NextFunction } from 'express'
import { Metahumano } from './metahumano.entity.js'
import { orm } from '../shared/db/orm.js'

const em = orm.em

function sanitizeMetahumanoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    alias: req.body.alias,
    origen: req.body.origen,
    tipoMeta: req.body.tipoMeta,
  }

  // Eliminar claves undefined
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })

  next()
}

async function findAll(req: Request, res: Response) {
  try {
    const metahumanos = await em.find(Metahumano, {}, {
      populate: ['usuario', 'poderes.poder'], 
    })
    res.status(200).json({ message: 'found all metahumanos', data: metahumanos })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const metahumano = await em.findOneOrFail(Metahumano, { id }, {
      populate: ['usuario', 'poderes.poder'],
    })
    res.status(200).json({ message: 'found metahumano', data: metahumano })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const metahumano = em.create(Metahumano, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'metahumano created', data: metahumano })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const metahumanoToUpdate = await em.findOneOrFail(Metahumano, { id })
    em.assign(metahumanoToUpdate, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({ message: 'metahumano updated', data: metahumanoToUpdate })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const metahumano = em.getReference(Metahumano, id)
    await em.removeAndFlush(metahumano)
    res.status(200).json({ message: 'metahumano deleted' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { sanitizeMetahumanoInput, findAll, findOne, add, update, remove }
