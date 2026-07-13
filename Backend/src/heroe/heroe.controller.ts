import { Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { Heroe } from './heroe.entity.js'
import { Villano } from '../villano/villano.entity.js'
import { Carpeta } from '../carpeta/carpeta.entity.js'
import { AuthedRequest } from '../auth/auth.middleware.js'

const em = orm.em

export async function solicitarEnemigo(req: Request, res: Response) {
  try {
    const authedReq = req as AuthedRequest
    const heroeId = authedReq.perfilId

    if (!heroeId) {
      return res.status(400).json({ message: 'El usuario no tiene un perfil asociado' })
    }

    // Verificar que el solicitante sea realmente un Héroe
    const heroe = await em.findOne(Heroe, { id: heroeId })
    if (!heroe) {
      return res.status(403).json({ message: 'Acceso denegado: solo los Héroes pueden solicitar enemigos' })
    }

    const { villanoId, descripcion } = req.body

    if (!villanoId) {
      return res.status(400).json({ message: 'El campo villanoId es requerido' })
    }

    // Verificar que el villano exista
    const villano = await em.findOne(Villano, { id: villanoId })
    if (!villano) {
      return res.status(404).json({ message: 'Villano no encontrado' })
    }

    // Crear un trámite (Carpeta) para registrar la solicitud de asignación de enemigo
    const carpeta = em.create(Carpeta, {
      estado: 'PENDIENTE_VILLANO',
      descripcion: descripcion || `El Héroe ${heroe.alias} solicita la asignación oficial del Villano ${villano.alias} como su archienemigo.`,
      tipo: 'SOLICITUD_ENEMIGO',
      metahumano: heroe,
      targetVillanoId: villano.id
    } as any)

    await em.persistAndFlush(carpeta)

    res.status(201).json({
      message: 'Solicitud de asignación de enemigo enviada exitosamente',
      data: {
        id: carpeta.id,
        heroe: {
          id: heroe.id,
          alias: heroe.alias,
          nivelFama: heroe.nivelFama
        },
        villano: {
          id: villano.id,
          alias: villano.alias,
          nivelPeligrosidad: villano.nivelPeligrosidad
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
