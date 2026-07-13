import { Router } from 'express'
import { sanitizeBurocrataInput, crearPerfilBurocrata, getCarpetas, findAll, findOne, add, update, remove } from './Burocrata.controller.js'
import { requireAuth, requireRoles } from '../auth/auth.middleware.js'

const burocratasRouter = Router()

burocratasRouter.get('/', requireAuth, requireRoles(['BUROCRATA', 'ADMIN', 'METAHUMANO']), findAll)
burocratasRouter.get('/:id', requireAuth, requireRoles(['BUROCRATA', 'ADMIN', 'METAHUMANO']), findOne)
burocratasRouter.post('/', requireAuth, requireRoles(['ADMIN']), crearPerfilBurocrata)  // Crear perfil solo Admin
burocratasRouter.get('/:id/carpetas', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), getCarpetas)
burocratasRouter.put('/:id', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), sanitizeBurocrataInput, update)
burocratasRouter.patch('/:id', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), sanitizeBurocrataInput, update)
burocratasRouter.delete('/:id', requireAuth, requireRoles(['ADMIN']), remove)

export { burocratasRouter }