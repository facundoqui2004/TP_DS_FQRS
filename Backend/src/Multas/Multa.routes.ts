import { Router } from 'express'
import { sanitizeMultasInput, findAll, findOne, add, update, remove, pagarMulta, crearPreferenciaMPAdmin } from './Multa.controller.js'
import { requireAuth, requireRoles } from '../auth/auth.middleware.js'

const multasRouter = Router();

multasRouter.get('/', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), findAll)
multasRouter.get('/:id', requireAuth, findOne)
multasRouter.post('/', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), sanitizeMultasInput, add)
multasRouter.post('/:id/pagar', requireAuth, pagarMulta) // Permitir pagar multa
multasRouter.post('/:id/crear-preferencia-mp', requireAuth, crearPreferenciaMPAdmin) // Preferencia MP Admin

multasRouter.put('/:id', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), sanitizeMultasInput, update)
multasRouter.patch('/:id', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), sanitizeMultasInput, update)
multasRouter.delete('/:id', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), remove)

export { multasRouter }