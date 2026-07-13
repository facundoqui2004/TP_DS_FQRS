import {findAll, findOne, LinkCarpBuro, remove, updateEstado, getCarpetasByMetahumano} from "./carpeta.controller.js";
import { Router } from 'express'
import { sanitizeCarpetaInput } from "./carpeta.controller.js"


const carpetaRouter = Router();

carpetaRouter.patch('/:id/estado', sanitizeCarpetaInput, updateEstado);
carpetaRouter.get('/',findAll)
carpetaRouter.get('/idMetahumano/:idMetahumano', getCarpetasByMetahumano)
carpetaRouter.get('/metahumano/:idMetahumano', getCarpetasByMetahumano)
carpetaRouter.get('/:id', findOne)
carpetaRouter.post('/',sanitizeCarpetaInput,LinkCarpBuro)
carpetaRouter.delete('/:id', remove)



export {carpetaRouter}
