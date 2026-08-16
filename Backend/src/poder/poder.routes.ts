import express from 'express'
import {
  sanitizePoderInput,
  findAll,
  findOne,
  add,
  update,
  remove
} from './poder.controller.js'
import { requireAuth, requireRoles } from '../auth/auth.middleware.js'

const router = express.Router()

router.get('/', findAll)
router.get('/:id', findOne)
router.post('/', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), sanitizePoderInput, add)
router.put('/:id', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), sanitizePoderInput, update)
router.delete('/:id', requireAuth, requireRoles(['ADMIN']), remove)

export default router