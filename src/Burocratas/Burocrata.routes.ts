import { Router } from 'express'
import { sanitizeBurocratasInput,findAll,findOne,add,update,remove} from './Burocrata.controller.js'

const burocratasRouter = Router();
burocratasRouter.get('/',findAll)
burocratasRouter.get('/:id',findOne)
burocratasRouter.post('/',sanitizeBurocratasInput,add)
burocratasRouter.put('/:id',sanitizeBurocratasInput,update)
burocratasRouter.patch('/:id',sanitizeBurocratasInput,update)
burocratasRouter.delete('/:id',remove)

export{burocratasRouter}