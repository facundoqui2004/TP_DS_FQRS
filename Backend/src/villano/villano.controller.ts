import { Request, Response } from 'express'
import { Villano } from './villano.entity.js'
import { orm } from '../shared/db/orm.js'
import { sanitizeMetahumanoInput } from '../metahumano/metahumano.controller.js'
import { Carpeta } from '../carpeta/carpeta.entity.js'
import { AuthedRequest } from '../auth/auth.middleware.js'

const em = orm.em

function sanitizeVillanoInput(req: Request, res: Response, next: Function) {
  
  sanitizeMetahumanoInput(req, res, () => {
  
    req.body.sanitizedInput = {
      ...req.body.sanitizedInput,
      nivelPeligrosidad: req.body.nivelPeligrosidad,
      motivacion: req.body.motivacion,
      fechaCaptura: req.body.fechaCaptura ? new Date(req.body.fechaCaptura) : undefined,
      estado: req.body.estado || 'activo',
      recompensa: req.body.recompensa ? Number(req.body.recompensa) : undefined,
    }

   
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




async function solicitarRehabilitacion(req: Request, res: Response) {
  try {
    const authedReq = req as AuthedRequest
    const villanoId = authedReq.perfilId

    if (!villanoId) {
      return res.status(400).json({ message: 'El usuario no tiene un perfil asociado' })
    }

    const villano = await em.findOne(Villano, { id: villanoId })
    if (!villano) {
      return res.status(403).json({ message: 'Acceso denegado: solo los Villanos pueden solicitar rehabilitación' })
    }

    if (villano.estado === 'rehabilitado') {
      return res.status(400).json({ message: 'El villano ya está rehabilitado' })
    }

    // Cambiar estado a 'rehabilitando'
    villano.estado = 'rehabilitando'

    // Crear trámite de rehabilitación
    const carpeta = em.create(Carpeta, {
      estado: 'PENDIENTE',
      descripcion: `Trámite de transición: El Villano ${villano.alias} solicita iniciar el proceso oficial de rehabilitación para convertirse en Héroe.`,
      tipo: 'TRAMITE_REHABILITACION',
      metahumano: villano
    })

    await em.persistAndFlush([villano, carpeta])

    res.status(201).json({
      message: 'Trámite de rehabilitación iniciado correctamente',
      data: {
        villano: {
          id: villano.id,
          alias: villano.alias,
          estadoActual: villano.estado
        },
        tramite: {
          id: carpeta.id,
          tipo: carpeta.tipo,
          estado: carpeta.estado,
          descripcion: carpeta.descripcion
        }
      }
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function solicitarPermisoDestruccion(req: Request, res: Response) {
  try {
    const authedReq = req as AuthedRequest
    const villanoId = authedReq.perfilId

    if (!villanoId) {
      return res.status(400).json({ message: 'El usuario no tiene un perfil asociado' })
    }

    const villano = await em.findOne(Villano, { id: villanoId })
    if (!villano) {
      return res.status(403).json({ message: 'Acceso denegado: solo los Villanos pueden solicitar permisos de destrucción' })
    }

    const { motivo, zonaAfectada, descripcionDanos, latitud, longitud, radio } = req.body

    if (!motivo || !zonaAfectada || !descripcionDanos) {
      return res.status(400).json({ message: 'Campos requeridos: motivo, zonaAfectada, descripcionDanos' })
    }

    // Crear trámite de daños colaterales/destrucción
    const carpeta = em.create(Carpeta, {
      estado: 'PENDIENTE',
      descripcion: `Solicitud de Daños Colaterales por ${villano.alias}. Zona afectada: ${zonaAfectada}. Motivo: ${motivo}. Descripción de daños estimados: ${descripcionDanos}`,
      tipo: 'PERMISO_DESTRUCCION',
      metahumano: villano,
      latitud: latitud !== undefined && latitud !== null ? Number(latitud) : undefined,
      longitud: longitud !== undefined && longitud !== null ? Number(longitud) : undefined,
      radio: radio !== undefined && radio !== null ? Number(radio) : undefined
    } as any)

    await em.persistAndFlush(carpeta)

    res.status(201).json({
      message: 'Solicitud de permiso de destrucción registrada correctamente',
      data: {
        villano: {
          id: villano.id,
          alias: villano.alias
        },
        tramite: {
          id: carpeta.id,
          tipo: carpeta.tipo,
          estado: carpeta.estado,
          descripcion: carpeta.descripcion
        }
      }
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function obtenerSolicitudesEnemigo(req: Request, res: Response) {
  try {
    const authedReq = req as AuthedRequest
    const villanoId = authedReq.perfilId

    if (!villanoId) {
      return res.status(400).json({ message: 'El usuario no tiene un perfil asociado' })
    }

    const solicitudes = await em.find(Carpeta, {
      tipo: 'SOLICITUD_ENEMIGO',
      estado: 'PENDIENTE_VILLANO',
      targetVillanoId: villanoId
    }, {
      populate: ['metahumano']
    })

    res.status(200).json({ message: 'Solicitudes de enemigo obtenidas', data: solicitudes })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function responderSolicitudEnemigo(req: Request, res: Response) {
  try {
    const authedReq = req as AuthedRequest
    const villanoId = authedReq.perfilId
    const carpetaId = Number(req.params.carpetaId)

    if (!villanoId) {
      return res.status(400).json({ message: 'El usuario no tiene un perfil asociado' })
    }

    const { respuesta } = req.body
    if (respuesta !== 'ACEPTAR' && respuesta !== 'RECHAZAR') {
      return res.status(400).json({ message: 'Respuesta inválida. Debe ser ACEPTAR o RECHAZAR' })
    }

    const carpeta = await em.findOne(Carpeta, {
      id: carpetaId,
      tipo: 'SOLICITUD_ENEMIGO',
      estado: 'PENDIENTE_VILLANO',
      targetVillanoId: villanoId
    })

    if (!carpeta) {
      return res.status(404).json({ message: 'Solicitud de enemigo no encontrada' })
    }

    if (respuesta === 'ACEPTAR') {
      carpeta.estado = 'APROBADA'
    } else {
      carpeta.estado = 'RECHAZADA'
    }

    await em.flush()

    res.status(200).json({ message: `Solicitud de enemigo ${respuesta === 'ACEPTAR' ? 'aceptada' : 'rechazada'} exitosamente`, data: carpeta })
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
  solicitarRehabilitacion,
  solicitarPermisoDestruccion,
  obtenerSolicitudesEnemigo,
  responderSolicitudEnemigo
}
