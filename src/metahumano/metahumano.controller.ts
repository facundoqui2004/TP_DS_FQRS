import { Request, Response, NextFunction } from 'express'
import { Metahumano } from './metahumano.entity.js'
import { Usuario } from '../auth/usuario.entity.js'
import { orm } from '../shared/db/orm.js'
import { Carpeta } from '../carpeta/carpeta.entity.js'

const em = orm.em

function sanitizeMetahumanoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    alias: req.body.alias,
    origen: req.body.origen,
    tipoMeta: req.body.tipoMeta,
    usuarioId: req.body.usuarioId
  }

  // Eliminar claves undefined
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })

  next()
}

async function crearPerfilMetahumano(req: Request, res: Response) {
  try {
    const { usuarioId, nombre, alias, origen, tipoMeta } = req.body

    // Validaciones básicas
    if (!usuarioId || !nombre || !alias || !origen) {
      return res.status(400).json({ 
        message: 'Campos requeridos: usuarioId, nombre, alias, origen' 
      })
    }

    // Verificar que el usuario existe y no tiene ya un perfil de metahumano
    const usuario = await em.findOne(Usuario, { id: usuarioId }, { populate: ['metahumano', 'burocrata'] })
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    if (usuario.metahumano) {
      return res.status(400).json({ message: 'El usuario ya tiene un perfil de metahumano' })
    }

    if (usuario.burocrata) {
      return res.status(400).json({ message: 'El usuario ya tiene un perfil de burócrata' })
    }

    if (usuario.role !== 'METAHUMANO') {
      return res.status(400).json({ message: 'El usuario debe tener role METAHUMANO' })
    }

    // Crear perfil de metahumano
    const metahumano = em.create(Metahumano, {
      nombre,
      alias,
      origen,
      tipoMeta: tipoMeta || 'NORMAL',
      usuario: usuario
    })

    await em.persistAndFlush(metahumano)

    res.status(201).json({
      message: 'Perfil de metahumano creado exitosamente',
      data: {
        id: metahumano.id,
        nombre: metahumano.nombre,
        alias: metahumano.alias,
        origen: metahumano.origen,
        tipoMeta: metahumano.tipoMeta,
        usuarioId: usuario.id,
        email: usuario.email,
        telefono: usuario.telefono
      }
    })
  } catch (error: any) {
    console.error('Error al crear perfil de metahumano:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
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

export { sanitizeMetahumanoInput, crearPerfilMetahumano, findAll, findOne, add, update, remove }
