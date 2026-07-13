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
const router = express.Router()

router.get('/', findAll)
router.post('/', sanitizeMetaPoderInput, assignPoder)
router.get('/metahumano/:metahumanoId', findAllForMetahumano)
router.get('/usuario/:usuarioId', findAllForUsuario)
router.get('/:id', findOneOrAllForMetahumano)
router.post('/metahumano/:id', sanitizeMetaPoderInput, assignPoderToMetahumano)
router.put('/:id', sanitizeMetaPoderInput, updateMetaPoder)
router.delete('/:id', remove)

export default router
