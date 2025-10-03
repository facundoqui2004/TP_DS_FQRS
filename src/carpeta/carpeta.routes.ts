import {findAll, findOne, LinkCarpBuro, remove, } from "./carpeta.controller.js";
import { Router } from 'express'
import { sanitizeCarpetaInput } from "./carpeta.controller.js"

const carpetaRouter = Router();

carpetaRouter.get('/',findAll)
carpetaRouter.get('/:id', findOne)
carpetaRouter.post('/',sanitizeCarpetaInput,LinkCarpBuro)
carpetaRouter.delete('/:id', remove)

export {carpetaRouter}
