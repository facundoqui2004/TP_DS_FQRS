import express from 'express'
import { register, login, logout, getCurrentUser, getAllUsers } from './usuario.controller.js'
import { get } from 'http'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', getCurrentUser)
router.get('/', getAllUsers)
export default router
