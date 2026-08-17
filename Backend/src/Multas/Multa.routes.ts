import { Router } from 'express'
import { sanitizeMultasInput, findAll, findOne, add, update, remove, pagarMulta, crearPreferenciaMPAdmin, verificarPagoMP } from './Multa.controller.js'
import { requireAuth, requireRoles } from '../auth/auth.middleware.js'

const multasRouter = Router();

multasRouter.get('/', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), findAll)
multasRouter.get('/:id', requireAuth, findOne)
multasRouter.post('/', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), sanitizeMultasInput, add)
multasRouter.post('/:id/pagar', requireAuth, pagarMulta)
multasRouter.post('/:id/crear-preferencia-mp', requireAuth, crearPreferenciaMPAdmin)
multasRouter.post('/:id/verificar-pago-mp', requireAuth, verificarPagoMP)

multasRouter.put('/:id', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), sanitizeMultasInput, update)
multasRouter.patch('/:id', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), sanitizeMultasInput, update)
multasRouter.delete('/:id', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), remove)

export { multasRouter }