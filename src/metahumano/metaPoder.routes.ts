import express from 'express'
import {
  sanitizePoderInput,
  findAll,
  findOne,
  add,
  update,
  remove
} from './poder.controller.js'

const router = express.Router()

router.get('/', findAll)
router.get('/:id', findOne)
router.post('/', sanitizePoderInput, add)
router.put('/:id', sanitizePoderInput, update)
router.delete('/:id', remove)

export default router
