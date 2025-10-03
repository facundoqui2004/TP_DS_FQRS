import { Router } from 'express'
import { sanitizeBurocrataInput, crearPerfilBurocrata, getCarpetas, findAll, findOne, add, update, remove } from './Burocrata.controller.js'


const burocratasRouter = Router()
burocratasRouter.get('/', findAll)
burocratasRouter.get('/:id', findOne)
burocratasRouter.post('/', crearPerfilBurocrata)  // Nuevo endpoint para crear perfil
burocratasRouter.get('/:id/carpetas', getCarpetas)
burocratasRouter.put('/:id', sanitizeBurocrataInput, update)
burocratasRouter.patch('/:id', sanitizeBurocrataInput, update)
burocratasRouter.delete('/:id', remove)

export { burocratasRouter }