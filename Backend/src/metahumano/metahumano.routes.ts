import express from 'express'
import {
  sanitizeMetahumanoInput,
  crearPerfilMetahumano,
  actualizarPoderesMetahumano,
  obtenerNotificacionesMetahumano,
  definirEstiloVida,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './metahumano.controller.js'
import {
  findAllForMetahumano,
  sanitizeMetaPoderInput,
  assignPoderToMetahumano
} from '../metaPoder/metaPoder.controller.js'
// TODO: Determinar como responde estas Functions
import { requireAuth, requireRoles } from '../auth/auth.middleware.js'

const router = express.Router()

// Metahumano CRUD
router.get('/', requireAuth, findAll)
router.get('/notificaciones', requireAuth, obtenerNotificacionesMetahumano) // Obtener notificaciones del usuario logueado
router.get('/:id', requireAuth, findOne)
router.post('/registro', requireAuth, crearPerfilMetahumano)  // Mapeado a /registro
router.post('/estilo-vida', requireAuth, definirEstiloVida) // Definir si es HEROE o VILLANO
router.post('/', requireAuth, requireRoles(['ADMIN']), sanitizeMetahumanoInput, add)
router.put('/poderes', requireAuth, actualizarPoderesMetahumano) // Agregar/modificar habilidades
router.put('/:id', requireAuth, sanitizeMetahumanoInput, update)
router.delete('/:id', requireAuth, requireRoles(['ADMIN']), remove)

// MetaPoder relacionado al metahumano
router.get('/:id/metapoder', requireAuth, findAllForMetahumano)
router.post('/:id/metapoder', requireAuth, requireRoles(['ADMIN', 'BUROCRATA']), sanitizeMetaPoderInput, assignPoderToMetahumano)

export default router
