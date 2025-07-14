import express from 'express'
import {
  sanitizeMetaPoderInput,
  findAll,
  assignPoder,
  assignPoderToMetahumano,
  findAllForMetahumano,
  remove
} from './metaPoder.controller.js'
const router = express.Router()

router.get('/', findAll)
router.get('/:metahumanoId', findAllForMetahumano)
router.post('/', sanitizeMetaPoderInput, assignPoder)
router.post('/:metahumanoId/:poderId', assignPoderToMetahumano)
router.delete('/:id', remove)

export default router
