import { sanitizeEvidenciaInput, findAll, findOne, add, update, remove, } from "./evidencia.controller.js";
import { Router } from 'express'

const evidenciaRouter = Router();

evidenciaRouter.get('/',findAll)
evidenciaRouter.get('/:id', findOne)
evidenciaRouter.post('/', sanitizeEvidenciaInput, add)
evidenciaRouter.put('/:id', sanitizeEvidenciaInput, update)
evidenciaRouter.patch('/:id',sanitizeEvidenciaInput,update)
evidenciaRouter.delete('/:id', remove)

export {evidenciaRouter}
