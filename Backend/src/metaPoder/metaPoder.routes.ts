import express from 'express'
import {
  sanitizeMetaPoderInput,
  findAll,
  assignPoder,
  assignPoderToMetahumano,
  findAllForMetahumano,
  findAllForUsuario,
  findOneOrAllForMetahumano,
  updateMetaPoder,
  remove
} from './metaPoder.controller.js'
import { requireAuth, requireRoles } from '../auth/auth.middleware.js'
const router = express.Router()

router.get('/', requireAuth, findAll)
router.post('/', requireAuth, sanitizeMetaPoderInput, assignPoder)
router.get('/metahumano/:metahumanoId', requireAuth, findAllForMetahumano)
router.get('/usuario/:usuarioId', requireAuth, findAllForUsuario)
router.get('/:id', requireAuth, findOneOrAllForMetahumano)
router.post('/metahumano/:id', requireAuth, requireRoles(['ADMIN', 'BUROCRATA']), sanitizeMetaPoderInput, assignPoderToMetahumano)
router.put('/:id', requireAuth, sanitizeMetaPoderInput, updateMetaPoder)
router.delete('/:id', requireAuth, requireRoles(['ADMIN', 'BUROCRATA']), remove)

export default router
