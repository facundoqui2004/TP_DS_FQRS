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
import { requireAuth, requireRoles } from '../auth/auth.middleware.js'

const router = express.Router()

// Metahumano CRUD
router.get('/', findAll)
router.get('/notificaciones', requireAuth, obtenerNotificacionesMetahumano) // Obtener notificaciones del usuario logueado
router.get('/:id', findOne)
router.post('/registro', crearPerfilMetahumano)  // Mapeado a /registro
router.post('/estilo-vida', requireAuth, definirEstiloVida) // Definir si es HEROE o VILLANO
router.post('/', sanitizeMetahumanoInput, add)
router.put('/poderes', requireAuth, actualizarPoderesMetahumano) // Agregar/modificar habilidades
router.put('/:id', sanitizeMetahumanoInput, update)
router.delete('/:id', requireAuth, requireRoles(['ADMIN']), remove)

// MetaPoder relacionado al metahumano
router.get('/:id/metapoder', findAllForMetahumano)
router.post('/:id/metapoder', sanitizeMetaPoderInput, assignPoderToMetahumano)

export default router
