import { Request, Response, NextFunction } from 'express'
import { Burocrata } from './Burocrata.entity.js'
import { orm } from '../shared/db/orm.js'

const em = orm.em

function sanitizeBurocrataInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    alias: req.body.alias,
    origen: req.body.origen,
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
    const burocratas = await em.find(Burocrata, {}, {
      populate: ['usuario'], 
    })
    res.status(200).json({ message: 'found all burocratas', data: burocratas })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const burocrata = await em.findOneOrFail(Burocrata, { id }, {
      populate: ['usuario'],
    })
    res.status(200).json({ message: 'found burocrata', data: burocrata })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const burocrata = em.create(Burocrata, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'burocrata created', data: burocrata })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
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

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const burocrata = em.getReference(Burocrata, id)
    await em.removeAndFlush(burocrata)
    res.status(200).json({ message: 'burocrata deleted' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { sanitizeBurocrataInput, findAll, findOne, add, update, remove }
