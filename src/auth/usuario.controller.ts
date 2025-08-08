import { Request, Response } from 'express'
import { Usuario, UserRole } from './usuario.entity.js'
import { Metahumano } from '../metahumano/metahumano.entity.js'
import { Burocrata } from '../Burocratas/Burocrata.entity.js'
import { orm } from '../shared/db/orm.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const em = orm.em
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_aqui' // usar .env en producción

/**
 * Crear usuario básico (solo datos comunes, sin perfil)
 */
export async function crearUsuarioBasico(req: Request, res: Response) {
  try {
    const { email, telefono, password, role } = req.body

    // Validaciones básicas
    if (!email || !telefono || !password || !role) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos: email, telefono, password, role' 
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' })
    }

    // Validar que el role sea válido
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: 'Role inválido. Debe ser METAHUMANO o BUROCRATA' })
    }

    // Verificar que el email sea único
    const existeUsuario = await em.findOne(Usuario, { email })
    if (existeUsuario) {
      return res.status(400).json({ message: 'Ya existe un usuario con este email' })
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    // Crear usuario
    const usuario = em.create(Usuario, {
      email,
      telefono,
      passwordHash,
      role,
      verificado: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await em.persistAndFlush(usuario)

    res.status(201).json({
      message: 'Usuario básico creado exitosamente',
      usuario: {
        id: usuario.id,
        email: usuario.email,
        telefono: usuario.telefono,
        role: usuario.role,
        verificado: usuario.verificado
      }
    })
  } catch (error: any) {
    console.error('Error al crear usuario básico:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

/**
 * Registro de nuevo usuario con perfil de metahumano
 */
export async function registrarMetahumano(req: Request, res: Response) {
  try {
    const { email, telefono, password, nombre, alias, origen } = req.body

    // Validaciones básicas
    if (!email || !telefono || !password || !nombre || !alias || !origen) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos: email, telefono, password, nombre, alias, origen' 
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' })
    }

    // Verificar que el email sea único
    const existeUsuario = await em.findOne(Usuario, { email })
    if (existeUsuario) {
      return res.status(400).json({ message: 'Ya existe un usuario con este email' })
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    // Crear usuario
    const usuario = new Usuario()
    usuario.email = email
    usuario.telefono = telefono
    usuario.passwordHash = passwordHash
    usuario.role = UserRole.METAHUMANO

    // Crear metahumano
    const metahumano = new Metahumano()
    metahumano.nombre = nombre
    metahumano.alias = alias
    metahumano.origen = origen
    metahumano.usuario = usuario

    // Establecer relación bidireccional
    usuario.metahumano = metahumano

    await em.persistAndFlush([usuario, metahumano])

    // Generar JWT
    const token = jwt.sign(
      { 
        usuarioId: usuario.id, 
        email: usuario.email, 
        role: usuario.role,
        perfilId: metahumano.id,
        perfil: 'metahumano'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Setear cookies (token httpOnly + info ligera no sensible)
    const isProd = process.env.NODE_ENV === 'production'
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 día
      path: '/'
    })
    res.cookie('user_info', JSON.stringify({
      id: usuario.id,
      role: usuario.role,
      perfil: 'metahumano',
      perfilId: metahumano.id,
      alias: metahumano.alias
    }), {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 1000 * 60 * 60 * 24,
      path: '/'
    })

    res.status(201).json({
      message: 'Metahumano registrado exitosamente',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role,
        metahumano: {
          id: metahumano.id,
          nombre: metahumano.nombre,
          alias: metahumano.alias,
          origen: metahumano.origen
        }
      }
    })

  } catch (error: any) {
    console.error('Error en registro de metahumano:', error)
    res.status(500).json({ message: 'Error interno del servidor', error: error.message })
  }
}

/**
 * Registro de nuevo usuario con perfil de burocrata
 */
export async function registrarBurocrata(req: Request, res: Response) {
  try {
    const { email, telefono, password, nombre, alias, origen } = req.body

    // Validaciones básicas
    if (!email || !telefono || !password || !nombre || !alias || !origen) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos: email, telefono, password, nombre, alias, origen' 
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' })
    }

    // Verificar que el email sea único
    const existeUsuario = await em.findOne(Usuario, { email })
    if (existeUsuario) {
      return res.status(400).json({ message: 'Ya existe un usuario con este email' })
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    // Crear usuario
    const usuario = new Usuario()
    usuario.email = email
    usuario.telefono = telefono
    usuario.passwordHash = passwordHash
    usuario.role = UserRole.BUROCRATA

    // Crear burocrata
    const burocrata = new Burocrata()
    burocrata.nombre = nombre
    burocrata.alias = alias
    burocrata.origen = origen
    burocrata.usuario = usuario

    // Establecer relación bidireccional
    usuario.burocrata = burocrata

    await em.persistAndFlush([usuario, burocrata])

    // Generar JWT
    const token = jwt.sign(
      { 
        usuarioId: usuario.id, 
        email: usuario.email, 
        role: usuario.role,
        perfilId: burocrata.id,
        perfil: 'burocrata'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    const isProd = process.env.NODE_ENV === 'production'
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 1000 * 60 * 60 * 24,
      path: '/'
    })
    res.cookie('user_info', JSON.stringify({
      id: usuario.id,
      role: usuario.role,
      perfil: 'burocrata',
      perfilId: burocrata.id,
      alias: burocrata.alias
    }), {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 1000 * 60 * 60 * 24,
      path: '/'
    })

    res.status(201).json({
      message: 'Burocrata registrado exitosamente',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role,
        burocrata: {
          id: burocrata.id,
          nombre: burocrata.nombre,
          alias: burocrata.alias,
          origen: burocrata.origen
        }
      }
    })

  } catch (error: any) {
    console.error('Error en registro de burocrata:', error)
    res.status(500).json({ message: 'Error interno del servidor', error: error.message })
  }
}

/**
 * Login de usuario
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' })
    }

    // Buscar usuario con sus perfiles
    const usuario = await em.findOne(Usuario, { email }, {
      populate: ['metahumano', 'burocrata']
    })

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.passwordHash)
    if (!passwordValida) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    // Determinar perfil y datos para JWT
    let perfil: string
    let perfilId: number | undefined
    let perfilData: any

    if (usuario.metahumano) {
      perfil = 'metahumano'
      perfilId = usuario.metahumano.id
      perfilData = {
        id: usuario.metahumano.id,
        nombre: usuario.metahumano.nombre,
        alias: usuario.metahumano.alias,
        origen: usuario.metahumano.origen
      }
    } else if (usuario.burocrata) {
      perfil = 'burocrata'
      perfilId = usuario.burocrata.id
      perfilData = {
        id: usuario.burocrata.id,
        nombre: usuario.burocrata.nombre,
        alias: usuario.burocrata.alias,
        origen: usuario.burocrata.origen
      }
    } else {
      return res.status(400).json({ message: 'Usuario sin perfil válido' })
    }

    // Generar JWT
    const token = jwt.sign(
      { 
        usuarioId: usuario.id, 
        email: usuario.email, 
        role: usuario.role,
        perfilId,
        perfil
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    const isProd = process.env.NODE_ENV === 'production'
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 1000 * 60 * 60 * 24,
      path: '/'
    })
    res.cookie('user_info', JSON.stringify({
      id: usuario.id,
      role: usuario.role,
      perfil,
      perfilId,
      alias: perfilData.alias
    }), {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 1000 * 60 * 60 * 24,
      path: '/'
    })

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        telefono: usuario.telefono,
        role: usuario.role,
        [perfil]: perfilData
      }
    })

  } catch (error: any) {
    console.error('Error en login:', error)
    res.status(500).json({ message: 'Error interno del servidor', error: error.message })
  }
}

/**
 * Obtener perfil del usuario autenticado
 */
export async function obtenerPerfil(req: Request, res: Response) {
  try {
    const usuarioId = (req as any).usuarioId // Asumiendo middleware de autenticación

    const usuario = await em.findOne(Usuario, { id: usuarioId }, {
      populate: ['metahumano', 'burocrata']
    })

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    const response: any = {
      id: usuario.id,
      email: usuario.email,
      telefono: usuario.telefono,
      role: usuario.role,
      verificado: usuario.verificado,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt
    }

    if (usuario.metahumano) {
      response.metahumano = {
        id: usuario.metahumano.id,
        nombre: usuario.metahumano.nombre,
        alias: usuario.metahumano.alias,
        origen: usuario.metahumano.origen
      }
    }

    if (usuario.burocrata) {
      response.burocrata = {
        id: usuario.burocrata.id,
        nombre: usuario.burocrata.nombre,
        alias: usuario.burocrata.alias,
        origen: usuario.burocrata.origen
      }
    }

    res.json(response)

  } catch (error: any) {
    console.error('Error al obtener perfil:', error)
    res.status(500).json({ message: 'Error interno del servidor', error: error.message })
  }
}

/**
 * Actualizar datos de contacto del usuario
 */
export async function actualizarContacto(req: Request, res: Response) {
  try {
    const usuarioId = (req as any).usuarioId // Asumiendo middleware de autenticación
    const { email, telefono } = req.body

    const usuario = await em.findOne(Usuario, { id: usuarioId })
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Verificar email único si se está cambiando
    if (email && email !== usuario.email) {
      const existeEmail = await em.findOne(Usuario, { email })
      if (existeEmail) {
        return res.status(400).json({ message: 'Este email ya está en uso' })
      }
      usuario.email = email
    }

    if (telefono) {
      usuario.telefono = telefono
    }

    await em.flush()

    res.json({
      message: 'Datos de contacto actualizados',
      usuario: {
        id: usuario.id,
        email: usuario.email,
        telefono: usuario.telefono
      }
    })

  } catch (error: any) {
    console.error('Error al actualizar contacto:', error)
    res.status(500).json({ message: 'Error interno del servidor', error: error.message })
  }
}

/**
 * Listar todos los usuarios (admin)
 */
export async function listarUsuarios(req: Request, res: Response) {
  try {
    const { page = 1, limit = 10, role } = req.query
    
    const where: any = {}
    if (role && (role === 'METAHUMANO' || role === 'BUROCRATA')) {
      where.role = role
    }

    const [usuarios, total] = await em.findAndCount(Usuario, where, {
      populate: ['metahumano', 'burocrata'],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      orderBy: { createdAt: 'DESC' }
    })

    const usuariosConPerfiles = usuarios.map(usuario => ({
      id: usuario.id,
      email: usuario.email,
      telefono: usuario.telefono,
      role: usuario.role,
      verificado: usuario.verificado,
      createdAt: usuario.createdAt,
      metahumano: usuario.metahumano ? {
        id: usuario.metahumano.id,
        nombre: usuario.metahumano.nombre,
        alias: usuario.metahumano.alias
      } : null,
      burocrata: usuario.burocrata ? {
        id: usuario.burocrata.id,
        nombre: usuario.burocrata.nombre,
        alias: usuario.burocrata.alias
      } : null
    }))

    res.json({
      usuarios: usuariosConPerfiles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })

  } catch (error: any) {
    console.error('Error al listar usuarios:', error)
    res.status(500).json({ message: 'Error interno del servidor', error: error.message })
  }
}

/**
 * Logout de usuario: limpia cookies de autenticación
 */
export async function logout(req: Request, res: Response) {
  try {
    res.clearCookie('auth_token')
    res.clearCookie('user_info')
    return res.json({ message: 'Logout exitoso' })
  } catch (error: any) {
    console.error('Error en logout:', error)
    res.status(500).json({ message: 'Error interno del servidor', error: error.message })
  }
}
