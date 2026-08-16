import { sanitizeEvidenciaInput, findAll, findOne, add, update, remove } from "./evidencia.controller.js";
import { Router } from 'express'
import { requireAuth, requireRoles } from '../auth/auth.middleware.js'

const evidenciaRouter = Router();

evidenciaRouter.get('/', requireAuth, findAll)
evidenciaRouter.get('/:id', requireAuth, findOne)
evidenciaRouter.post('/', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), sanitizeEvidenciaInput, add)
evidenciaRouter.put('/:id', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), sanitizeEvidenciaInput, update)
evidenciaRouter.patch('/:id', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), sanitizeEvidenciaInput, update)
evidenciaRouter.delete('/:id', requireAuth, requireRoles(['ADMIN']), remove)

export { evidenciaRouter }
