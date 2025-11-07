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
  logout
} from './usuario.controller.js'

const router = express.Router()

// Rutas de autenticación
router.post('/register/basic', crearUsuarioBasico)
router.post('/register/metahumano', registrarMetahumano)
router.post('/register/burocrata', registrarBurocrata)
router.post('/register/admin', registrarAdmin)
router.post('/login', login)
router.post('/logout', logout)

// Rutas protegidas (requieren autenticación)
router.get('/perfil', obtenerPerfil)
router.put('/contacto', actualizarContacto)
router.get('/admin/usuarios', listarUsuarios)

export default router
