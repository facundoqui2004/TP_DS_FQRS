import { Request, Response } from 'express'
import { MetaPoder } from './metaPoder.entity.js'
import { Metahumano } from '../metahumano/metahumano.entity.js'
import { Poder } from '../poder/poder.entity.js'
import { orm } from '../shared/db/orm.js'

const em = orm.em

function sanitizeMetaPoderInput(req: Request, res: Response, next: Function) {
  req.body.sanitizedInput = {
    estado: req.body.estado,
    fechaSolicitud: new Date(req.body.fechaSolicitud),
    fechaRespuesta: new Date(req.body.fechaRespuesta),
    certificado: req.body.certificado || null,
    metahumanoId: req.body.metahumanoId,
    poderId: req.body.poderId,
  }

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })

  next()
}

async function assignPoder(req: Request, res: Response) {
  try {
    const {
      estado,
      fechaSolicitud,
      fechaRespuesta,
      certificado,
      metahumanoId,
      poderId,
    } = req.body.sanitizedInput

    const metahumano = await em.findOneOrFail(Metahumano, { id: metahumanoId })
    const poder = await em.findOneOrFail(Poder, { id: poderId })

    const metaPoder = em.create(MetaPoder, {
      estado,
      fechaSolicitud,
      fechaRespuesta,
      certificado,
      metahumano,
      poder,
    })

    await em.persistAndFlush(metaPoder)

    res.status(201).json({ message: 'Poder asignado a metahumano', data: metaPoder })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findAll(req: Request, res: Response) {
  try {
    const registros = await em.find(MetaPoder, {}, {
      populate: ['metahumano', 'poder'],
    })
    res.status(200).json({ message: 'found all metapoder', data: registros })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const metaPoder = em.getReference(MetaPoder, id)
    await em.removeAndFlush(metaPoder)
    res.status(200).json({ message: 'registro MetaPoder eliminado' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// busca todos los MetaPoder de un metahumano
async function findAllForMetahumano(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const registros = await em.find(MetaPoder, {
      metahumano: id,
    }, {
      populate: ['poder'],
    })

    res.status(200).json({ message: 'found metapoder for metahumano', data: registros })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// asignar poder al metahumano desde ruta anidada
async function assignPoderToMetahumano(req: Request, res: Response) {
  try {
    const metahumanoId = Number.parseInt(req.params.id)
    const { estado, fechaSolicitud, fechaRespuesta, certificado, poderId } = req.body.sanitizedInput

    const metahumano = await em.findOneOrFail(Metahumano, { id: metahumanoId })
    const poder = await em.findOneOrFail(Poder, { id: poderId })

    const metaPoder = em.create(MetaPoder, {
      estado,
      fechaSolicitud,
      fechaRespuesta,
      certificado,
      metahumano,
      poder
    })

    await em.persistAndFlush(metaPoder)

    res.status(201).json({ message: 'Poder asignado', data: metaPoder })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export {
  sanitizeMetaPoderInput,
  assignPoder,
  assignPoderToMetahumano,
  findAll,
  findAllForMetahumano,
  remove
}
