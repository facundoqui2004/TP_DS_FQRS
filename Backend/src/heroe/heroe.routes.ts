import express from 'express'
import { solicitarEnemigo } from './heroe.controller.js'
import { requireAuth, requireRoles } from '../auth/auth.middleware.js'

const router = express.Router()

router.post('/solicitud-enemigos', requireAuth, requireRoles(['HEROE']), solicitarEnemigo)

export default router
