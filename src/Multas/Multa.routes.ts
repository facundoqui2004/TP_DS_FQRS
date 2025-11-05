import { Router } from 'express'
import { sanitizeMultasInput,findAll,findOne,add,update,remove} from './Multa.controller.js'

const multasRouter = Router();
multasRouter.get('/',findAll)
multasRouter.get('/:id',findOne)
multasRouter.post('/',sanitizeMultasInput,add)
multasRouter.put('/:id',sanitizeMultasInput,update)
multasRouter.patch('/:id',sanitizeMultasInput,update)
multasRouter.delete('/:id',remove)

export {multasRouter}