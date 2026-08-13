import { Request, Response, NextFunction } from 'express'
import { Metahumano } from './metahumano.entity.js'
import { Heroe } from '../heroe/heroe.entity.js'
import { Villano } from '../villano/villano.entity.js'
import { Usuario } from '../auth/usuario.entity.js'
import { orm } from '../shared/db/orm.js'
import { Carpeta } from '../carpeta/carpeta.entity.js'
import { MetaPoder } from '../metaPoder/metaPoder.entity.js'
import { Poder } from '../poder/poder.entity.js'
import { Multa } from '../Multas/Multa.entity.js'
import { AuthedRequest } from '../auth/auth.middleware.js'

const em = orm.em

function sanitizeMetahumanoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    alias: req.body.alias,
    origen: req.body.origen,
    tipoMeta: req.body.tipoMeta,
    usuarioId: req.body.usuarioId,
    latitud: req.body.latitud !== undefined && req.body.latitud !== null ? Number(req.body.latitud) : undefined,
    longitud: req.body.longitud !== undefined && req.body.longitud !== null ? Number(req.body.longitud) : undefined
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

    // Crear perfil de metahumano o subtipo Heroe / Villano
    let metahumano: Metahumano
    const tipo = (tipoMeta || '').toUpperCase()
    const lat = req.body.latitud !== undefined && req.body.latitud !== null ? Number(req.body.latitud) : undefined
    const lng = req.body.longitud !== undefined && req.body.longitud !== null ? Number(req.body.longitud) : undefined

    if (tipo === 'HEROE' || tipo === 'HERÓE') {
      metahumano = em.create(Heroe, {
        nombre,
        alias,
        origen,
        nivelFama: req.body.nivelFama || 'Bajo',
        estatus: req.body.estatus || 'activo',
        numeroVictorias: req.body.numeroVictorias || 0,
        usuario: usuario,
        latitud: lat,
        longitud: lng
      } as any)
    } else if (tipo === 'VILLANO') {
      metahumano = em.create(Villano, {
        nombre,
        alias,
        origen,
        nivelPeligrosidad: req.body.nivelPeligrosidad || 'Baja',
        estado: req.body.estado || 'activo',
        recompensa: req.body.recompensa || 0,
        usuario: usuario,
        latitud: lat,
        longitud: lng
      } as any)
    } else {
      metahumano = em.create(Metahumano, {
        nombre,
        alias,
        origen,
        usuario: usuario,
        latitud: lat,
        longitud: lng
      } as any)
    }

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

async function actualizarPoderesMetahumano(req: Request, res: Response) {
  try {
    const authedReq = req as AuthedRequest
    const metahumanoId = authedReq.perfilId

    if (!metahumanoId) {
      return res.status(400).json({ message: 'El usuario no tiene un perfil de metahumano asociado' })
    }

    const { poderId, dominio, nivelControl, estado, certificado } = req.body

    if (!poderId || !dominio) {
      return res.status(400).json({ message: 'Campos requeridos: poderId, dominio' })
    }

    // Verificar que el poder exista
    const poder = await em.findOne(Poder, { id: poderId })
    if (!poder) {
      return res.status(404).json({ message: 'Poder no encontrado' })
    }

    // Cargar metahumano
    const metahumano = await em.findOneOrFail(Metahumano, { id: metahumanoId }, { populate: ['poderes'] })

    // Verificar si ya tiene este metapoder asignado
    let metaPoder = await em.findOne(MetaPoder, { metahumano: metahumanoId, poder: poderId })

    if (metaPoder) {
      // Actualizar existente
      metaPoder.dominio = dominio
      if (nivelControl !== undefined) metaPoder.nivelControl = nivelControl
      if (estado !== undefined) metaPoder.estado = estado
      if (certificado !== undefined) metaPoder.certificado = certificado
    } else {
      // Crear nuevo metapoder
      metaPoder = em.create(MetaPoder, {
        metahumano,
        poder,
        dominio,
        nivelControl: nivelControl || 1,
        estado: estado || 'ACTIVO',
        certificado: certificado || '',
        fechaAdquisicion: new Date()
      })
      metahumano.poderes.add(metaPoder)
    }

    await em.flush()

    res.status(200).json({
      message: 'Habilidades/poderes del metahumano actualizados exitosamente',
      data: {
        id: metaPoder.id,
        poderId: poder.id,
        nomPoder: poder.nomPoder,
        dominio: metaPoder.dominio,
        nivelControl: metaPoder.nivelControl,
        estado: metaPoder.estado
      }
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function obtenerNotificacionesMetahumano(req: Request, res: Response) {
  try {
    const authedReq = req as AuthedRequest
    const metahumanoId = authedReq.perfilId

    if (!metahumanoId) {
      return res.status(400).json({ message: 'El usuario no tiene un perfil de metahumano asociado' })
    }

    // 1. Obtener carpetas (trámites y expedientes de este metahumano)
    const carpetas = await em.find(Carpeta, { metahumano: { id: metahumanoId } })

    // 2. Obtener multas a través del camino: Multa -> Evidencia -> Carpeta -> Metahumano
    const multas = await em.find(
      Multa,
      {
        evidencia: {
          carpeta: {
            metahumano: { id: metahumanoId }
          }
        }
      },
      { populate: ['evidencia.carpeta'] }
    )

    res.status(200).json({
      message: 'Notificaciones obtenidas correctamente',
      data: {
        tramitesPendientes: carpetas.map(c => ({
          id: c.id,
          descripcion: c.descripcion,
          estado: c.estado,
          tipo: c.tipo
        })),
        multasAlertas: multas.map(m => ({
          id: m.id,
          motivoMulta: m.motivoMulta,
          montoMulta: m.montoMulta,
          fechaVencimiento: m.fechaVencimiento,
          estado: m.estado
        }))
      }
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function definirEstiloVida(req: Request, res: Response) {
  try {
    const authedReq = req as AuthedRequest
    const metahumanoId = authedReq.perfilId

    if (!metahumanoId) {
      return res.status(400).json({ message: 'El usuario no tiene un perfil de metahumano asociado' })
    }

    const { tipoMeta } = req.body
    if (!tipoMeta) {
      return res.status(400).json({ message: 'El campo tipoMeta es requerido (HEROE o VILLANO)' })
    }

    const tipo = tipoMeta.toUpperCase()
    if (tipo !== 'HEROE' && tipo !== 'HERÓE' && tipo !== 'VILLANO') {
      return res.status(400).json({ message: 'tipoMeta inválido. Debe ser HEROE o VILLANO' })
    }

    // Buscar metahumano actual
    const metahumano = await em.findOne(Metahumano, { id: metahumanoId })
    if (!metahumano) {
      return res.status(404).json({ message: 'Perfil de metahumano no encontrado' })
    }

    // Si ya tiene un rol definido diferente de metahumano, no permitir cambiarlo (o permitirlo si es necesario)
    if (metahumano.tipoMeta !== 'metahumano') {
      return res.status(400).json({ 
        message: `Tu estilo de vida ya está definido como ${metahumano.tipoMeta.toUpperCase()}. No se puede cambiar.` 
      })
    }

    const connection = em.getConnection()

    if (tipo === 'HEROE' || tipo === 'HERÓE') {
      const nivelFama = req.body.nivelFama || 'Bajo'
      const estatus = req.body.estatus || 'activo'
      const numeroVictorias = req.body.numeroVictorias || 0
      const mision = req.body.mision || ''

      await connection.execute(
        'UPDATE metahumano SET tipo_meta = ?, nivel_fama = ?, estatus = ?, numero_victorias = ?, mision = ? WHERE id = ?',
        ['heroe', nivelFama, estatus, numeroVictorias, mision, metahumanoId]
      )
    } else {
      const nivelPeligrosidad = req.body.nivelPeligrosidad || 'Baja'
      const estado = req.body.estado || 'activo'
      const motivacion = req.body.motivacion || ''

      // Buscar todas las multas de este metahumano
      const multas = await em.find(Multa, {
        evidencia: {
          carpeta: {
            metahumano: { id: metahumanoId }
          }
        }
      })

      const unpaidMultas = multas.filter(m => m.estado !== 'PAGADA' && m.estado !== 'RECHAZADA')
      // La recompensa se establece por las deudas de multas no pagadas y no la elige el metahumano
      const recompensa = unpaidMultas.reduce((acc, m) => acc + (m.montoMulta || 0), 0)

      await connection.execute(
        'UPDATE metahumano SET tipo_meta = ?, nivel_peligrosidad = ?, estado = ?, recompensa = ?, motivacion = ? WHERE id = ?',
        ['villano', nivelPeligrosidad, estado, recompensa, motivacion, metahumanoId]
      )
    }

    // Limpiar el EntityManager para recargar la entidad con su nueva clase
    em.clear()

    // Cargar la nueva entidad
    const entityClass = (tipo === 'HEROE' || tipo === 'HERÓE') ? Heroe : Villano
    const updatedMeta = await em.findOneOrFail(entityClass as any, { id: metahumanoId } as any, { populate: ['usuario'] } as any)

    res.status(200).json({
      message: `Estilo de vida definido como ${tipo} exitosamente`,
      data: updatedMeta
    })
  } catch (error: any) {
    console.error('Error al definir estilo de vida:', error)
    res.status(500).json({ message: error.message || 'Error interno del servidor' })
  }
}

export { 
  sanitizeMetahumanoInput, 
  crearPerfilMetahumano, 
  actualizarPoderesMetahumano,
  obtenerNotificacionesMetahumano,
  definirEstiloVida,
  findAll, 
  findOne, 
  add, 
  update, 
  remove 
}
