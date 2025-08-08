import express from 'express'
import {
  sanitizeMetahumanoInput,
  crearPerfilMetahumano,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './metahumano.controller.js'
import {
  findAllForMetahumano,
  sanitizeMetaPoderInput,
  assignPoderToMetahumano
} from '../metaPoder/metaPoder.controller.js'

const router = express.Router()

// Metahumano CRUD
router.get('/', findAll)
router.get('/:id', findOne)
router.post('/', crearPerfilMetahumano)  // Nuevo endpoint para crear perfil
router.post('/', sanitizeMetahumanoInput, add)
router.put('/:id', sanitizeMetahumanoInput, update)
router.delete('/:id', remove)

// MetaPoder relacionado al metahumano
router.get('/:id/metapoder', findAllForMetahumano)
router.post('/:id/metapoder', sanitizeMetaPoderInput, assignPoderToMetahumano)

export default router
