import { Router } from 'express'
import {
  sanitizeNoticiaInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './noticia.controller.js'
import { requireAuth, requireRoles } from '../auth/auth.middleware.js'

const noticiaRouter = Router()

// Cualquier usuario autenticado puede leer noticias
noticiaRouter.get(
  '/',
  requireAuth,
  requireRoles(['BUROCRATA', 'ADMIN', 'METAHUMANO']),
  findAll
)

noticiaRouter.get(
  '/:id',
  requireAuth,
  requireRoles(['BUROCRATA', 'ADMIN', 'METAHUMANO']),
  findOne
)

// Solo burócratas y admins pueden crear/editar/eliminar noticias
noticiaRouter.post(
  '/',
  requireAuth,
  requireRoles(['BUROCRATA', 'ADMIN']),
  sanitizeNoticiaInput,
  add
)

noticiaRouter.put(
  '/:id',
  requireAuth,
  requireRoles(['BUROCRATA', 'ADMIN']),
  sanitizeNoticiaInput,
  update
)

noticiaRouter.patch(
  '/:id',
  requireAuth,
  requireRoles(['BUROCRATA', 'ADMIN']),
  sanitizeNoticiaInput,
  update
)

noticiaRouter.delete(
  '/:id',
  requireAuth,
  requireRoles(['ADMIN']),
  remove
)

export { noticiaRouter }
