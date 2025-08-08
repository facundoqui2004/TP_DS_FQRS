import { Router } from 'express'
import { sanitizeBurocrataInput, crearPerfilBurocrata, findAll, findOne, add, update, remove } from './Burocrata.controller.js'

const burocratasRouter = Router()
burocratasRouter.get('/', findAll)
burocratasRouter.get('/:id', findOne)
burocratasRouter.post('/', crearPerfilBurocrata)  // Nuevo endpoint para crear perfil
burocratasRouter.put('/:id', sanitizeBurocrataInput, update)
burocratasRouter.patch('/:id', sanitizeBurocrataInput, update)
burocratasRouter.delete('/:id', remove)

export { burocratasRouter }