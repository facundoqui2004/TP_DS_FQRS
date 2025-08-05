import {findAll, findOne, add, remove, } from "./carpeta.controller.js";
import { Router } from 'express'

const carpetaRouter = Router();

carpetaRouter.get('/',findAll)
carpetaRouter.get('/:id', findOne)
carpetaRouter.post('/',add)
carpetaRouter.delete('/:id', remove)

export {carpetaRouter}
