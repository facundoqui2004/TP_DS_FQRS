import express from 'express'
import { register, login, logout, getCurrentUser } from './usuario.controller.js'

const usuarioRouter = express.Router()

usuarioRouter.post('/register', register)
usuarioRouter.post('/login', login)
usuarioRouter.post('/logout', logout)
usuarioRouter.get('/me', getCurrentUser)

export default usuarioRouter;
