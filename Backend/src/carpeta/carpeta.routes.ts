import { findAll, findOne, LinkCarpBuro, remove, updateEstado, getCarpetasByMetahumano } from "./carpeta.controller.js";
import { Router } from 'express'
import { sanitizeCarpetaInput } from "./carpeta.controller.js"
import { requireAuth, requireRoles } from "../auth/auth.middleware.js"

const carpetaRouter = Router();

carpetaRouter.get('/', requireAuth, findAll)
carpetaRouter.get('/idMetahumano/:idMetahumano', requireAuth, getCarpetasByMetahumano)
carpetaRouter.get('/metahumano/:idMetahumano', requireAuth, getCarpetasByMetahumano)
carpetaRouter.get('/:id', requireAuth, findOne)
carpetaRouter.post('/', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), sanitizeCarpetaInput, LinkCarpBuro)
carpetaRouter.patch('/:id/estado', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), sanitizeCarpetaInput, updateEstado)
carpetaRouter.delete('/:id', requireAuth, requireRoles(['ADMIN']), remove)

export { carpetaRouter }
