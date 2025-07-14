import { Request, Response } from 'express'
import { Usuario } from './usuario.entity.js'
import { orm } from '../shared/db/orm.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const em = orm.em
const JWT_SECRET = 'tu_secreto' // usar .env en producción

export async function register(req: Request, res: Response) {
  try {
    const { nomUsuario, mail, contrasena, rol, idMeta, idBurocrata } = req.body

    // Validar que los campos requeridos estén presentes
    if (!nomUsuario || !mail || !contrasena) {
      return res.status(400).json({ message: 'Nombre de usuario, mail y contraseña son requeridos' })
    }

    // Validar longitud de contraseña
    if (contrasena.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' })
    }

    // Verificar que el nombre de usuario sea único
    const existeUsuario = await em.findOne(Usuario, { nomUsuario })
    if (existeUsuario) {
      return res.status(400).json({ message: 'El nombre de usuario ya existe' })
    }

    // Verificar que el mail sea único
    const existeMail = await em.findOne(Usuario, { mail })
    if (existeMail) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' })
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10)
    const usuario = em.create(Usuario, {
      nomUsuario,
      mail,
      contrasena: hashedPassword,
      rol,
      idMeta,
      idBurocrata,
      verificado: false,
    })
    await em.flush()

    // Crear token JWT con los datos del usuario
    const token = jwt.sign(
      { 
        id: usuario.id!, 
        nomUsuario: usuario.nomUsuario, 
        mail: usuario.mail,
        rol: usuario.rol 
      }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    )

    // Guardar token en cookie httpOnly
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // true en producción con HTTPS
      sameSite: 'lax',
      maxAge: 3600000 // 1 hora en milisegundos
    })

    // Guardar datos del usuario en cookies separadas para el frontend
    res.cookie('userId', usuario.id!.toString(), {
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000
    })
    res.cookie('userName', usuario.nomUsuario, {
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000
    })
    res.cookie('userEmail', usuario.mail, {
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000
    })
    res.cookie('userRole', usuario.rol, {
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000
    })

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente', 
      data: { 
        id: usuario.id!, 
        nomUsuario: usuario.nomUsuario, 
        mail: usuario.mail,
        rol: usuario.rol 
      } 
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { nomUsuario, contrasena } = req.body
    const usuario = await em.findOneOrFail(Usuario, { nomUsuario })

    const isValid = await bcrypt.compare(contrasena, usuario.contrasena)
    if (!isValid) return res.status(401).json({ message: 'Credenciales inválidas' })

    // Crear token JWT con los datos del usuario incluyendo email
    const token = jwt.sign(
      { 
        id: usuario.id, 
        nomUsuario: usuario.nomUsuario, 
        mail: usuario.mail,
        rol: usuario.rol 
      }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    )

    // Guardar token en cookie httpOnly
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // true en producción con HTTPS
      sameSite: 'lax',
      maxAge: 3600000 // 1 hora en milisegundos
    })

    // Guardar datos del usuario en cookies separadas para el frontend
    res.cookie('userId', usuario.id!.toString(), {
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000
    })
    res.cookie('userName', usuario.nomUsuario, {
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000
    })
    res.cookie('userEmail', usuario.mail, {
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000
    })
    res.cookie('userRole', usuario.rol, {
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000
    })

    res.status(200).json({ 
      message: 'Login exitoso', 
      data: { 
        id: usuario.id, 
        nomUsuario: usuario.nomUsuario, 
        mail: usuario.mail,
        rol: usuario.rol 
      } 
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export async function logout(req: Request, res: Response) {
  // Limpiar todas las cookies relacionadas con el usuario
  res.clearCookie('token')
  res.clearCookie('userId')
  res.clearCookie('userName')
  res.clearCookie('userEmail')
  res.clearCookie('userRole')
  
  res.status(200).json({ message: 'Sesión cerrada' })
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    const token = req.cookies.token
    if (!token) return res.status(401).json({ message: 'No autenticado' })

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const usuario = await em.findOneOrFail(Usuario, { id: decoded.id })
    res.status(200).json({ data: usuario })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

