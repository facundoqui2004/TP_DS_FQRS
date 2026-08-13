import 'dotenv/config'
import 'reflect-metadata'
import express from 'express'
import { RequestContext } from '@mikro-orm/core'
import { orm } from './shared/db/orm.js'

import metahumanosRoutes from './metahumano/metahumano.routes.js'
import poderesRoutes from './poder/poder.routes.js'
import metaPoderesRoutes from './metaPoder/metaPoder.routes.js'
import { burocratasRouter } from './Burocratas/Burocrata.routes.js'
import { evidenciaRouter } from './evidencia/evidencia.routes.js'
import { multasRouter } from './Multas/Multa.routes.js'
import { carpetaRouter } from './carpeta/carpeta.routes.js'
import usuarioRouter from './auth/usuario.routes.js'
import villanoRoutes from './villano/villano.routes.js'
import heroeRoutes from './heroe/heroe.routes.js'
import { noticiaRouter } from './noticia/noticia.routes.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { requireAuth } from './auth/auth.middleware.js';

// Importar controladores para rutas de usuarios legacy
import { 
  crearUsuarioBasico as registrarUsuario, 
  login as loginUsuario, 
  obtenerPerfil as obtenerUsuarioActual, 
  logout as logoutUsuario,
  listarUsuarios as obtenerTodosLosUsuarios,
  obtenerUsuarioPorId
} from './auth/usuario.controller.js'

const app = express()
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/
    ];
    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser()) 

// Contexto de EntityManager por request
app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})

const usuariosLegacyRouter = express.Router()
usuariosLegacyRouter.get('/', obtenerTodosLosUsuarios)
usuariosLegacyRouter.get('/me', requireAuth, obtenerUsuarioActual);
usuariosLegacyRouter.get('/:id(\\d+)', obtenerUsuarioPorId);
usuariosLegacyRouter.post('/register', registrarUsuario)
usuariosLegacyRouter.post('/login', loginUsuario)
usuariosLegacyRouter.post('/logout', logoutUsuario)

// Rutas principales
app.use('/api/usuarios', usuariosLegacyRouter)
app.use('/api/metahumanos', metahumanosRoutes)
app.use('/api/poderes', poderesRoutes)
app.use('/api/metapoderes', metaPoderesRoutes)
app.use('/api/burocratas', burocratasRouter)
app.use('/api/multas', multasRouter)
app.use('/api/evidencias', evidenciaRouter)
app.use('/api/carpetas', carpetaRouter)
app.use('/api/auth', usuarioRouter) 
app.use('/api/villanos', villanoRoutes)
app.use('/api/heroes', heroeRoutes)
app.use('/api/noticias', noticiaRouter)

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' })
})

// Middleware centralizado de errores
import { errorHandler } from './shared/middlewares/error.middleware.js'
app.use(errorHandler)

export { app }
export default app
