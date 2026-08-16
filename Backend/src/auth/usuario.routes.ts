import express from 'express'
import { 
  crearUsuarioBasico,
  registrarMetahumano, 
  registrarBurocrata,
  registrarAdmin,
  login, 
  obtenerPerfil,
  actualizarContacto,
  listarUsuarios,
  logout,
  eliminarUsuario
} from './usuario.controller.js'

import { requireAuth, requireRoles } from './auth.middleware.js'

const router = express.Router()

// Rutas públicas de autenticación y registro
router.post('/register/basic', crearUsuarioBasico)
router.post('/register/metahumano', registrarMetahumano)
router.post('/register/burocrata', registrarBurocrata)
router.post('/register/admin', registrarAdmin)
router.post('/login', login)
router.post('/logout', logout)

// Rutas protegidas (requieren autenticación)
router.get('/perfil', requireAuth, obtenerPerfil)
router.put('/contacto', requireAuth, actualizarContacto)

// Rutas de administración (requieren rol ADMIN)
router.get('/admin/usuarios', requireAuth, requireRoles(['ADMIN']), listarUsuarios)
router.delete('/admin/usuarios/:id', requireAuth, requireRoles(['ADMIN']), eliminarUsuario)

export default router
