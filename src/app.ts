import 'reflect-metadata'
import express from 'express'
import { RequestContext } from '@mikro-orm/core'
import { orm, syncSchema } from './shared/db/orm.js'

import metahumanosRoutes from './metahumano/metahumano.routes.js'
import poderesRoutes from './metahumano/poder.routes.js'

const app = express()
app.use(express.json())

// Contexto de EntityManager por request
app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})

// Rutas
app.use('/api/metahumanos', metahumanosRoutes)
app.use('/api/poderes', poderesRoutes)

// 404 handler
app.use((_, res) => {
  return res.status(404).send({ message: 'Resource not found' })
})

// Sincronizar base de datos (dev only)
await syncSchema()

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000/')
})
