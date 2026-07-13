import express from 'express'
import {
  sanitizeVillanoInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  solicitarRehabilitacion,
  solicitarPermisoDestruccion,
  obtenerSolicitudesEnemigo,
  responderSolicitudEnemigo,
} from './villano.controller.js'
import { requireAuth, requireRoles } from '../auth/auth.middleware.js'

const router = express.Router()

// Trámites de Villanos
router.post('/tramite-rehabilitacion', requireAuth, requireRoles(['VILLANO']), solicitarRehabilitacion)
router.post('/permisos-destruccion', requireAuth, requireRoles(['VILLANO']), solicitarPermisoDestruccion)
router.get('/solicitudes-enemigo', requireAuth, requireRoles(['VILLANO']), obtenerSolicitudesEnemigo)
router.post('/solicitudes-enemigo/:carpetaId/responder', requireAuth, requireRoles(['VILLANO']), responderSolicitudEnemigo)

// CRUD básico
router.get('/', findAll)
router.get('/:id', findOne)
router.post('/', sanitizeVillanoInput, add)
router.put('/:id', sanitizeVillanoInput, update)
router.delete('/:id', remove)

export default router
