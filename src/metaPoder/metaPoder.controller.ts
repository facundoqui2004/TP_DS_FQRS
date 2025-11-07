import { Request, Response } from 'express'
import { MetaPoder } from './metaPoder.entity.js'
import { Metahumano } from '../metahumano/metahumano.entity.js'
import { Poder } from '../poder/poder.entity.js'
import { Usuario } from '../auth/usuario.entity.js'
import { orm } from '../shared/db/orm.js'

const em = orm.em

function sanitizeMetaPoderInput(req: Request, res: Response, next: Function) {
  req.body.sanitizedInput = {
    dominio: req.body.dominio,
    fechaAdquisicion: req.body.fechaAdquisicion ? new Date(req.body.fechaAdquisicion) : new Date(),
    nivelControl: req.body.nivelControl || 50,
    estado: req.body.estado || 'ACTIVO',
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
      dominio,
      fechaAdquisicion,
      nivelControl,
      estado,
      certificado,
      metahumanoId,
      poderId,
    } = req.body.sanitizedInput

    // Validar que el dominio sea válido
    const dominiosValidos = ['NOVATO', 'INTERMEDIO', 'AVANZADO', 'EXPERTO', 'MAESTRO']
    if (!dominiosValidos.includes(dominio)) {
      return res.status(400).json({ 
        message: 'Dominio inválido', 
        validos: dominiosValidos 
      })
    }

    const metahumano = await em.findOneOrFail(Metahumano, { id: metahumanoId })
    const poder = await em.findOneOrFail(Poder, { id: poderId })

    // Verificar si ya existe la relación
    const existente = await em.findOne(MetaPoder, {
      metahumano: metahumanoId,
      poder: poderId
    })

    if (existente) {
      return res.status(400).json({ 
        message: 'El metahumano ya tiene asignado este poder' 
      })
    }

    const metaPoder = em.create(MetaPoder, {
      dominio,
      fechaAdquisicion,
      nivelControl,
      estado,
      certificado,
      metahumano,
      poder,
    })

    await em.persistAndFlush(metaPoder)

    res.status(201).json({ 
      message: 'Poder asignado a metahumano exitosamente', 
      data: {
        id: metaPoder.id,
        dominio: metaPoder.dominio,
        nivelControl: metaPoder.nivelControl,
        estado: metaPoder.estado,
        metahumano: {
          id: metahumano.id,
          nombre: metahumano.nombre,
          alias: metahumano.alias
        },
        poder: {
          id: poder.id,
          nomPoder: poder.nomPoder,
          categoria: poder.categoria
        }
      }
    })
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
    const metahumanoId = Number.parseInt(req.params.metahumanoId)
    const registros = await em.find(MetaPoder, {
      metahumano: metahumanoId,
    }, {
      populate: ['poder', 'metahumano'],
    })

    const result = registros.map(mp => ({
      id: mp.id,
      dominio: mp.dominio,
      nivelControl: mp.nivelControl,
      estado: mp.estado,
      fechaAdquisicion: mp.fechaAdquisicion,
      certificado: mp.certificado,
      poder: {
        id: mp.poder.id,
        nomPoder: mp.poder.nomPoder,
        categoria: mp.poder.categoria,
        debilidad: mp.poder.debilidad
      }
    }))

    res.status(200).json({ 
      message: 'Poderes del metahumano encontrados', 
      data: result 
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Actualizar relación MetaPoder
async function updateMetaPoder(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const {
      dominio,
      nivelControl,
      estado,
      certificado
    } = req.body.sanitizedInput

    const metaPoder = await em.findOneOrFail(MetaPoder, { id }, {
      populate: ['metahumano', 'poder']
    })

    if (dominio) {
      const dominiosValidos = ['NOVATO', 'INTERMEDIO', 'AVANZADO', 'EXPERTO', 'MAESTRO']
      if (!dominiosValidos.includes(dominio)) {
        return res.status(400).json({ 
          message: 'Dominio inválido', 
          validos: dominiosValidos 
        })
      }
      metaPoder.dominio = dominio
    }

    if (nivelControl !== undefined) {
      if (nivelControl < 0 || nivelControl > 100) {
        return res.status(400).json({ 
          message: 'Nivel de control debe estar entre 0 y 100' 
        })
      }
      metaPoder.nivelControl = nivelControl
    }

    if (estado) metaPoder.estado = estado
    if (certificado !== undefined) metaPoder.certificado = certificado

    await em.flush()

    res.status(200).json({ 
      message: 'Relación MetaPoder actualizada', 
      data: {
        id: metaPoder.id,
        dominio: metaPoder.dominio,
        nivelControl: metaPoder.nivelControl,
        estado: metaPoder.estado,
        certificado: metaPoder.certificado
      }
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// asignar poder al metahumano desde ruta anidada
async function assignPoderToMetahumano(req: Request, res: Response) {
  try {
    const metahumanoId = Number.parseInt(req.params.id)
    const { dominio, nivelControl, estado, certificado, poderId } = req.body.sanitizedInput

    // Validar que el dominio sea válido
    const dominiosValidos = ['NOVATO', 'INTERMEDIO', 'AVANZADO', 'EXPERTO', 'MAESTRO']
    if (!dominiosValidos.includes(dominio)) {
      return res.status(400).json({ 
        message: 'Dominio inválido', 
        validos: dominiosValidos 
      })
    }

    const metahumano = await em.findOneOrFail(Metahumano, { id: metahumanoId })
    const poder = await em.findOneOrFail(Poder, { id: poderId })

    // Verificar si ya existe la relación
    const existente = await em.findOne(MetaPoder, {
      metahumano: metahumanoId,
      poder: poderId
    })

    if (existente) {
      return res.status(400).json({ 
        message: 'El metahumano ya tiene asignado este poder' 
      })
    }

    const metaPoder = em.create(MetaPoder, {
      dominio,
      fechaAdquisicion: new Date(),
      nivelControl: nivelControl || 50,
      estado: estado || 'ACTIVO',
      certificado,
      metahumano,
      poder
    })

    await em.persistAndFlush(metaPoder)

    res.status(201).json({ 
      message: 'Poder asignado exitosamente', 
      data: {
        id: metaPoder.id,
        dominio: metaPoder.dominio,
        nivelControl: metaPoder.nivelControl,
        estado: metaPoder.estado,
        poder: {
          id: poder.id,
          nomPoder: poder.nomPoder,
          categoria: poder.categoria
        }
      }
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// busca todos los MetaPoder de un usuario
async function findAllForUsuario(req: Request, res: Response) {
  try {
    const usuarioId = Number.parseInt(req.params.usuarioId)
    
    // Buscar el usuario con su metahumano
    const usuario = await em.findOne(Usuario, { id: usuarioId }, {
      populate: ['metahumano']
    })

    if (!usuario) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      })
    }

    if (!usuario.metahumano) {
      return res.status(404).json({ 
        message: 'No se encontró un metahumano para este usuario',
        usuario: {
          id: usuario.id,
          metahumano: null
        }
      })
    }

    
    const registros = await em.find(MetaPoder, {
      metahumano: usuario.metahumano.id,
    }, {
      populate: ['poder', 'metahumano'],
    })

    const result = registros.map(mp => ({
      id: mp.id,
      dominio: mp.dominio,
      nivelControl: mp.nivelControl,
      estado: mp.estado,
      fechaAdquisicion: mp.fechaAdquisicion,
      certificado: mp.certificado,
      poder: {
        id: mp.poder.id,
        nomPoder: mp.poder.nomPoder,
        categoria: mp.poder.categoria,
        debilidad: mp.poder.debilidad
      }
    }))

   
    res.status(200).json({ 
      message: `Poderes encontrados para el usuario ${usuarioId}`,
      usuario: {
        id: usuario.id,
        metahumano: {
          id: usuario.metahumano.id,
          nombre: usuario.metahumano.nombre,
          alias: usuario.metahumano.alias
        }
      },
      totalPoderes: result.length,
      data: result 
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}


async function findOneOrAllForMetahumano(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    
    // Intentar como metahumanoId
    const registrosPorMetahumano = await em.find(MetaPoder, {
      metahumano: id,
    }, {
      populate: ['poder', 'metahumano'],
    })

    if (registrosPorMetahumano.length > 0) {
      const result = registrosPorMetahumano.map(mp => ({
        id: mp.id,
        dominio: mp.dominio,
        nivelControl: mp.nivelControl,
        estado: mp.estado,
        fechaAdquisicion: mp.fechaAdquisicion,
        certificado: mp.certificado,
        poder: {
          id: mp.poder.id,
          nomPoder: mp.poder.nomPoder,
          categoria: mp.poder.categoria,
          debilidad: mp.poder.debilidad
        }
      }))

      return res.status(200).json({ 
        message: 'Poderes del metahumano encontrados', 
        data: result 
      })
    } else {
 
      const metaPoder = await em.findOne(MetaPoder, { id }, {
        populate: ['metahumano', 'poder']
      })

      if (metaPoder) {
        return res.status(200).json({ 
          message: 'MetaPoder encontrado', 
          data: {
            id: metaPoder.id,
            dominio: metaPoder.dominio,
            nivelControl: metaPoder.nivelControl,
            estado: metaPoder.estado,
            fechaAdquisicion: metaPoder.fechaAdquisicion,
            certificado: metaPoder.certificado,
            poder: {
              id: metaPoder.poder.id,
              nomPoder: metaPoder.poder.nomPoder,
              categoria: metaPoder.poder.categoria,
              debilidad: metaPoder.poder.debilidad
            },
            metahumano: {
              id: metaPoder.metahumano.id,
              nombre: metaPoder.metahumano.nombre,
              alias: metaPoder.metahumano.alias
            }
          }
        })
      } else {
        return res.status(404).json({ 
          message: 'No se encontraron resultados para el ID proporcionado' 
        })
      }
    }
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
  findAllForUsuario,
  updateMetaPoder,
  remove,
  findOneOrAllForMetahumano
}
