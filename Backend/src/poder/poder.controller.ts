import { Request, Response } from 'express'
import { Poder } from './poder.entity.js'
import { orm } from '../shared/db/orm.js'

const em = orm.em

function sanitizePoderInput(req: Request, res: Response, next: Function) {
  req.body.sanitizedInput = {
    nomPoder: req.body.nomPoder,
    debilidad: req.body.debilidad,
    descPoder: req.body.descPoder,
    descDebilidad: req.body.descDebilidad,
    categoria: req.body.categoria,
    costoMulta: req.body.costoMulta,
  }

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })

  next()
}

async function findAll(req: Request, res: Response) {
  try {
    const poderes = await em.find(Poder, {})
    res.status(200).json({ message: 'found all poderes', data: poderes })
  } catch (error: any) {
    console.error(error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const poder = await em.findOneOrFail(Poder, { id })
    res.status(200).json({ message: 'found poder', data: poder })
  } catch (error: any) {
    console.error(error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

async function add(req: Request, res: Response) {
  try {
    const poder = em.create(Poder, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'poder created', data: poder })
  } catch (error: any) {
    console.error(error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const poderToUpdate = await em.findOneOrFail(Poder, { id })
    em.assign(poderToUpdate, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({ message: 'poder updated', data: poderToUpdate })
  } catch (error: any) {
    console.error(error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const poder = em.getReference(Poder, id)
    await em.removeAndFlush(poder)
    res.status(200).json({ message: 'poder deleted' })
  } catch (error: any) {
    console.error(error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

export {
  sanitizePoderInput,
  findAll,
  findOne,
  add,
  update,
  remove
}
