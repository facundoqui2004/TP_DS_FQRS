import express from 'express'
import {
  sanitizeVillanoInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './villano.controller.js'

const router = express.Router()

// CRUD básico
router.get('/', findAll)
router.get('/:id', findOne)
router.post('/', sanitizeVillanoInput, add)
router.put('/:id', sanitizeVillanoInput, update)
router.delete('/:id', remove)

export default router
