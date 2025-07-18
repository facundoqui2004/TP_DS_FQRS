import { Request, Response, NextFunction } from 'express'
import { Metahumano } from './metahumano.entity.js'
import { Villano } from '../villano/villano.entity.js'
import { orm } from '../shared/db/orm.js'

const em = orm.em

function sanitizeMetahumanoInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    alias: req.body.alias,
    origen: req.body.origen,
    telefono: req.body.telefono,
    mail: req.body.mail,
  }

  // Eliminar claves undefined
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })

  next()
}

function sanitizeVillanoConversionInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    nivelPeligrosidad: req.body.nivelPeligrosidad,
    motivacion: req.body.motivacion,
    fechaCaptura: req.body.fechaCaptura ? new Date(req.body.fechaCaptura) : undefined,
    estado: req.body.estado || 'activo',
    recompensa: req.body.recompensa ? Number(req.body.recompensa) : undefined,
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
      populate: ['poderes.poder'], // si querés incluir también poderes
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
      populate: ['poderes.poder'],
    })
    res.status(200).json({ message: 'found metahumano', data: metahumano })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const metahumano = em.create(Metahumano, req.body.sanitizedInput)
    await em.persistAndFlush(metahumano)
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

async function convertToVillano(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    
    // Verificar que el metahumano existe
    const metahumano = await em.findOneOrFail(Metahumano, { id })
    
    // Verificar que no sea ya un villano (usando instanceof)
    if (metahumano instanceof Villano) {
      return res.status(400).json({ 
        message: 'Este metahumano ya es un villano' 
      })
    }
    
    // Crear un nuevo villano con los datos del metahumano + datos de villano
    const villanoData = {
      // Copiar datos del metahumano original
      nombre: metahumano.nombre,
      alias: metahumano.alias,
      origen: metahumano.origen,
      telefono: metahumano.telefono,
      mail: metahumano.mail,
      // Agregar datos específicos de villano
      ...req.body.sanitizedInput,
    }
    
    // Eliminar el metahumano original
    await em.removeAndFlush(metahumano)
    
    // Crear el nuevo villano
    const villano = em.create(Villano, villanoData)
    await em.persistAndFlush(villano)
    
    res.status(200).json({ 
      message: 'Metahumano convertido a villano exitosamente', 
      data: villano 
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export {
  sanitizeMetahumanoInput,
  sanitizeVillanoConversionInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  convertToVillano
}
