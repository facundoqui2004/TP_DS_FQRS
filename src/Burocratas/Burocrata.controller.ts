import { Request, Response, NextFunction } from 'express'
import { Burocrata } from './Burocrata.entity.js'
import { Usuario } from '../auth/usuario.entity.js'
import { orm } from '../shared/db/orm.js'

const em = orm.em

function sanitizeBurocrataInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    alias: req.body.alias,
    origen: req.body.origen,
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

async function crearPerfilBurocrata(req: Request, res: Response) {
  try {
    const { usuarioId, nombre, alias, origen } = req.body

    // Validaciones básicas
    if (!usuarioId || !nombre || !alias || !origen) {
      return res.status(400).json({ 
        message: 'Campos requeridos: usuarioId, nombre, alias, origen' 
      })
    }

    // Verificar que el usuario existe y no tiene ya un perfil
    const usuario = await em.findOne(Usuario, { id: usuarioId }, { populate: ['metahumano', 'burocrata'] })
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    if (usuario.burocrata) {
      return res.status(400).json({ message: 'El usuario ya tiene un perfil de burócrata' })
    }

    if (usuario.metahumano) {
      return res.status(400).json({ message: 'El usuario ya tiene un perfil de metahumano' })
    }

    if (usuario.role !== 'BUROCRATA') {
      return res.status(400).json({ message: 'El usuario debe tener role BUROCRATA' })
    }

    // Crear perfil de burócrata
    const burocrata = em.create(Burocrata, {
      nombre,
      alias,
      origen,
      usuario: usuario
    })

    await em.persistAndFlush(burocrata)

    res.status(201).json({
      message: 'Perfil de burócrata creado exitosamente',
      data: {
        id: burocrata.id,
        nombre: burocrata.nombre,
        alias: burocrata.alias,
        origen: burocrata.origen,
        usuarioId: usuario.id,
        email: usuario.email,
        telefono: usuario.telefono
      }
    })
  } catch (error: any) {
    console.error('Error al crear perfil de burócrata:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

async function getCarpetas(req: Request, res: Response){
  try {
    const burocrataId = Number.parseInt(req.params.id)
    const burocrata = await em.findOneOrFail(Burocrata, {id : burocrataId}, {populate : ['carpetas.evidencias.multas']})
    if(!burocrata){
      return res.status(404).json({message : "Burocrata not found"})
    }
  res.status(200).json({message: 'Carpetas found', data: burocrata.carpetas})
  }catch(error : any){
    res.status(500).json({message : error.message})
  } 
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

export { sanitizeBurocrataInput, crearPerfilBurocrata, getCarpetas,  findAll, findOne, add, update, remove }
