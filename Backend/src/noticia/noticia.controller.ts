import { Request, Response, NextFunction } from 'express'
import { Noticia, ClasificacionNoticia, EstadoNoticia } from './noticia.entity.js'
import { Burocrata } from '../Burocratas/Burocrata.entity.js'
import { orm } from '../shared/db/orm.js'

const em = orm.em

// ── Clasificaciones y estados válidos ──────────────────────────────────────
const CLASIFICACIONES_VALIDAS: ClasificacionNoticia[] = [
  'ALERTA',
  'INFORMATIVA',
  'URGENTE',
  'OFICIAL',
  'GENERAL',
]

const ESTADOS_VALIDOS: EstadoNoticia[] = ['BORRADOR', 'PUBLICADA', 'ARCHIVADA']

// ── Sanitizador ────────────────────────────────────────────────────────────
function sanitizeNoticiaInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    titulo:           req.body.titulo,
    descripcion:      req.body.descripcion,
    autorId:          req.body.autorId,
    imagen:           req.body.imagen,
    fecha:            req.body.fecha ? new Date(req.body.fecha) : undefined,
    clasificacion:    req.body.clasificacion,
    estado:           req.body.estado,
    destacada:        req.body.destacada !== undefined
                        ? Boolean(req.body.destacada)
                        : undefined,
  }

  // Eliminar claves undefined
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })

  next()
}

// ── GET /api/noticias ──────────────────────────────────────────────────────
// Query params opcionales: fechaDesde (YYYY-MM-DD), fechaHasta (YYYY-MM-DD)
async function findAll(req: Request, res: Response) {
  try {
    const { fechaDesde, fechaHasta } = req.query

    const where: any = {}

    if (fechaDesde || fechaHasta) {
      where.fecha = {}

      if (fechaDesde) {
        const desde = new Date(fechaDesde as string)
        if (isNaN(desde.getTime())) {
          return res.status(400).json({ message: 'fechaDesde no es una fecha válida (formato esperado: YYYY-MM-DD)' })
        }
        desde.setHours(0, 0, 0, 0)
        where.fecha.$gte = desde
      }

      if (fechaHasta) {
        const hasta = new Date(fechaHasta as string)
        if (isNaN(hasta.getTime())) {
          return res.status(400).json({ message: 'fechaHasta no es una fecha válida (formato esperado: YYYY-MM-DD)' })
        }
        hasta.setHours(23, 59, 59, 999)
        where.fecha.$lte = hasta
      }
    }

    const noticias = await em.find(Noticia, where, { populate: ['autor'] })
    res.status(200).json({ message: 'Noticias encontradas', data: noticias })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// ── GET /api/noticias/:id ──────────────────────────────────────────────────
async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const noticia = await em.findOneOrFail(Noticia, { id }, { populate: ['autor'] })
    res.status(200).json({ message: 'Noticia encontrada', data: noticia })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// ── POST /api/noticias ─────────────────────────────────────────────────────
async function add(req: Request, res: Response) {
  try {
    const { titulo, descripcion, autorId, imagen, fecha, clasificacion, estado, destacada } =
      req.body.sanitizedInput

    // Validaciones obligatorias
    if (!titulo || !descripcion || !autorId || !fecha || !clasificacion) {
      return res.status(400).json({
        message:
          'Campos requeridos: titulo, descripcion, autorId, fecha, clasificacion',
      })
    }

    // Validar clasificación
    if (!CLASIFICACIONES_VALIDAS.includes(clasificacion)) {
      return res.status(400).json({
        message: `Clasificación inválida. Valores permitidos: ${CLASIFICACIONES_VALIDAS.join(', ')}`,
      })
    }

    // Validar estado si viene
    if (estado && !ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({
        message: `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`,
      })
    }

    // Verificar que el burócrata autor existe
    const autor = await em.findOne(Burocrata, { id: autorId })
    if (!autor) {
      return res.status(404).json({ message: 'Burócrata autor no encontrado' })
    }

    const noticia = em.create(Noticia, {
      titulo,
      descripcion,
      autor,
      imagen,
      fecha,
      clasificacion,
      estado:    estado    ?? 'BORRADOR',
      destacada: destacada ?? false,
    })

    await em.persistAndFlush(noticia)

    res.status(201).json({ message: 'Noticia creada exitosamente', data: noticia })
  } catch (error: any) {
    console.error('Error al crear noticia:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// ── PUT/PATCH /api/noticias/:id ────────────────────────────────────────────
async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const noticiaToUpdate = await em.findOneOrFail(Noticia, { id })

    const { autorId, clasificacion, estado, ...rest } = req.body.sanitizedInput

    // Validar clasificación si viene en la actualización
    if (clasificacion && !CLASIFICACIONES_VALIDAS.includes(clasificacion)) {
      return res.status(400).json({
        message: `Clasificación inválida. Valores permitidos: ${CLASIFICACIONES_VALIDAS.join(', ')}`,
      })
    }

    // Validar estado si viene en la actualización
    if (estado && !ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({
        message: `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`,
      })
    }

    // Resolver el burócrata si se cambia el autor
    let autor: Burocrata | undefined
    if (autorId) {
      const foundAutor = await em.findOne(Burocrata, { id: autorId })
      if (!foundAutor) {
        return res.status(404).json({ message: 'Burócrata autor no encontrado' })
      }
      autor = foundAutor
    }

    em.assign(noticiaToUpdate, {
      ...rest,
      ...(clasificacion && { clasificacion }),
      ...(estado        && { estado }),
      ...(autor         && { autor }),
      fechaActualizacion: new Date(),
    })

    await em.flush()

    res.status(200).json({ message: 'Noticia actualizada', data: noticiaToUpdate })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// ── DELETE /api/noticias/:id ───────────────────────────────────────────────
async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const noticia = em.getReference(Noticia, id)
    await em.removeAndFlush(noticia)
    res.status(200).json({ message: 'Noticia eliminada' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { sanitizeNoticiaInput, findAll, findOne, add, update, remove }
