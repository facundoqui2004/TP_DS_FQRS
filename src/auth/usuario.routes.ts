import express from 'express'
import { register, login, logout, getCurrentUser } from './usuario.controller.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', getCurrentUser)

export default router
