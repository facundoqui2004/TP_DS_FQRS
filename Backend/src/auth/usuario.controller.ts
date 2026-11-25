import { Request, Response } from 'express'
import { Usuario, UserRole } from './usuario.entity.js'
import { orm } from '../shared/db/orm.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AuthServiceError, UsuarioService } from './usuario.service.js'
import { config } from '../config/environment.js'

const em = orm.em
const JWT_SECRET = config.jwtSecret
const usuarioService = new UsuarioService(em)

function setAuthCookies(res: Response, token: string, userInfo: Record<string, unknown>) {
  const isProd = process.env.NODE_ENV === 'production'
  const cookieOptions = {
    secure: isProd,
    sameSite: (isProd ? 'strict' : 'lax') as 'strict' | 'lax',
    maxAge: 1000 * 60 * 60 * 24,
    path: '/',
  }

  res.cookie('auth_token', token, { ...cookieOptions, httpOnly: true })
  res.cookie('user_info', JSON.stringify(userInfo), { ...cookieOptions, httpOnly: false })
}

function handleRegistroError(res: Response, error: unknown, context: string) {
  if (error instanceof AuthServiceError) {
    return res.status(error.statusCode).json({ message: error.message })
  }
  console.error(context, error)
  return res.status(500).json({ message: 'Error interno del servidor' })
}

/**
 * Crear usuario básico (solo datos comunes, sin perfil)
 */
export async function crearUsuarioBasico(req: Request, res: Response) {
  try {
    const { email, telefono, password, role } = req.body
    const { usuario } = await usuarioService.registrarUsuario({
      tipo: 'BASICO',
      email,
      telefono,
      password,
      role,
    })

    return res.status(201).json({
      message: 'Usuario básico creado exitosamente',
      usuario: {
        id: usuario.id,
        email: usuario.email,
        telefono: usuario.telefono,
        role: usuario.role,
        verificado: usuario.verificado,
      },
    })
  } catch (error) {
    return handleRegistroError(res, error, 'Error al crear usuario básico:')
  }
}

/**
 * Registro de nuevo usuario con perfil de metahumano
 */
export async function registrarMetahumano(req: Request, res: Response) {
  try {
    const { email, telefono, password, nombre, alias, origen } = req.body
    const { usuario, metahumano, token, userInfo } = await usuarioService.registrarUsuario({
      tipo: 'METAHUMANO',
      email,
      telefono,
      password,
      nombre,
      alias,
      origen,
    })

    setAuthCookies(res, token!, userInfo!)

    return res.status(201).json({
      message: 'Metahumano registrado exitosamente',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role,
        metahumano: {
          id: metahumano!.id,
          nombre: metahumano!.nombre,
          alias: metahumano!.alias,
          origen: metahumano!.origen,
        },
      },
    })
  } catch (error) {
    return handleRegistroError(res, error, 'Error en registro de metahumano:')
  }
}

/**
 * Registro de nuevo usuario con perfil de burocrata
 */
export async function registrarBurocrata(req: Request, res: Response) {
  try {
    const { email, telefono, password, nombre, alias, origen } = req.body
    const { usuario, burocrata, token, userInfo } = await usuarioService.registrarUsuario({
      tipo: 'BUROCRATA',
      email,
      telefono,
      password,
      nombre,
      alias,
      origen,
    })

    setAuthCookies(res, token!, userInfo!)

    return res.status(201).json({
      message: 'Burocrata registrado exitosamente',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role,
        burocrata: {
          id: burocrata!.id,
          nombre: burocrata!.nombre,
          alias: burocrata!.alias,
          origen: burocrata!.origen,
        },
      },
    })
  } catch (error) {
    return handleRegistroError(res, error, 'Error en registro de burocrata:')
  }
}

/**
 * Registro de usuario con rol ADMIN (sin perfil de metahumano o burócrata)
 */
export async function registrarAdmin(req: Request, res: Response) {
  try {
    const { email, telefono, password, nombre } = req.body
    const { usuario, token, userInfo } = await usuarioService.registrarUsuario({
      tipo: 'ADMIN',
      email,
      telefono,
      password,
      nombre,
    })

    setAuthCookies(res, token!, userInfo!)

    return res.status(201).json({
      message: 'Administrador registrado exitosamente',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role,
        nombre,
      },
    })
  } catch (error) {
    return handleRegistroError(res, error, 'Error en registro de admin:')
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

    if (usuario.role === UserRole.ADMIN) {
      // Usuario admin no tiene perfil de metahumano o burócrata
      perfil = 'admin'
      perfilId = usuario.id
      perfilData = {
        id: usuario.id,
        nombre: 'Administrador',
        email: usuario.email
      }
    } else if (usuario.metahumano) {
      perfil = 'metahumano'
      perfilId = usuario.metahumano.id
      perfilData = {
        id: usuario.metahumano.id,
        nombre: usuario.metahumano.nombre,
        alias: usuario.metahumano.alias,
        origen: usuario.metahumano.origen,
        tipoMeta: usuario.metahumano.tipoMeta,
        nivelFama: (usuario.metahumano as any).nivelFama,
        mision: (usuario.metahumano as any).mision,
        estatus: (usuario.metahumano as any).estatus,
        nivelPeligrosidad: (usuario.metahumano as any).nivelPeligrosidad,
        estado: (usuario.metahumano as any).estado,
        recompensa: (usuario.metahumano as any).recompensa,
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
      alias: perfilData.alias || perfilData.nombre || 'Admin'
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
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

/**
 * Obtener perfil del usuario autenticado
 */
export async function obtenerPerfil(req: Request, res: Response) {
  try {
    const usuarioId = (req as any).usuarioId;
    const usuario = await em.findOne(Usuario, { id: usuarioId }, {
      populate: ['metahumano', 'burocrata']
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const response: any = {
      id: usuario.id,
      email: usuario.email,
      telefono: usuario.telefono,
      role: usuario.role,
      verificado: usuario.verificado,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt,
    };

    if (usuario.metahumano) {
      response.perfilId = usuario.metahumano.id;
      response.perfil = 'METAHUMANO';
      response.tipoMeta = usuario.metahumano.tipoMeta;
      response.metahumano = {
        id: usuario.metahumano.id,
        nombre: usuario.metahumano.nombre,
        alias: usuario.metahumano.alias,
        origen: usuario.metahumano.origen,
        tipoMeta: usuario.metahumano.tipoMeta,
        nivelFama: (usuario.metahumano as any).nivelFama,
        mision: (usuario.metahumano as any).mision,
        estatus: (usuario.metahumano as any).estatus,
        nivelPeligrosidad: (usuario.metahumano as any).nivelPeligrosidad,
        estado: (usuario.metahumano as any).estado,
        recompensa: (usuario.metahumano as any).recompensa,
      };
    }

    if (usuario.burocrata) {
      response.perfilId = usuario.burocrata.id;
      response.perfil = 'BUROCRATA';
    }

    return res.json({
      message: 'Perfil obtenido correctamente',
      data: response,
    });

  } catch (error: any) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * Actualizar datos de contacto del usuario
 */
export async function actualizarContacto(req: Request, res: Response) {
  try {
    const usuarioId = (req as any).usuarioId
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
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

interface UsuarioListadoDTO {
  id: number | undefined
  email: string
  role: UserRole
  createdAt: Date
  metahumano: { id: number | undefined; nombre: string; alias: string } | null
  burocrata: { id: number | undefined; nombre: string; alias: string } | null
}

function toUsuarioListadoDTO(usuario: Usuario): UsuarioListadoDTO {
  return {
    id: usuario.id,
    email: usuario.email,
    role: usuario.role,
    createdAt: usuario.createdAt,
    metahumano: usuario.metahumano
      ? {
          id: usuario.metahumano.id,
          nombre: usuario.metahumano.nombre,
          alias: usuario.metahumano.alias,
        }
      : null,
    burocrata: usuario.burocrata
      ? {
          id: usuario.burocrata.id,
          nombre: usuario.burocrata.nombre,
          alias: usuario.burocrata.alias,
        }
      : null,
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

    const usuariosConPerfiles = usuarios.map(toUsuarioListadoDTO)

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
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

/**
 * limpia cookies de autenticación
 */
export async function logout(req: Request, res: Response) {
  try {
    res.clearCookie('auth_token')
    res.clearCookie('user_info')
    return res.json({ message: 'Logout exitoso' })
  } catch (error: any) {
    console.error('Error en logout:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

/**
 * Obtener usuario por ID
 */
export async function obtenerUsuarioPorId(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' })
    }

    // Solo el propio usuario o un ADMIN pueden ver estos datos
    if ((req as any).role !== 'ADMIN' && (req as any).usuarioId !== id) {
      return res.status(403).json({ message: 'No tenés permiso para ver este usuario' })
    }

    const usuario = await em.findOne(Usuario, { id }, {
      populate: ['metahumano', 'burocrata']
    })

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Respuesta sin datos sensibles
    const response: any = {
      id: usuario.id,
      email: usuario.email,
      telefono: usuario.telefono,
      role: usuario.role,
      verificado: usuario.verificado,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt
    }

    // Añadir perfil según el tipo
    if (usuario.metahumano) {
      response.metahumano = {
        id: usuario.metahumano.id,
        nombre: usuario.metahumano.nombre,
        alias: usuario.metahumano.alias,
        origen: usuario.metahumano.origen,
        tipoMeta: usuario.metahumano.tipoMeta,
        nivelFama: (usuario.metahumano as any).nivelFama,
        mision: (usuario.metahumano as any).mision,
        estatus: (usuario.metahumano as any).estatus,
        nivelPeligrosidad: (usuario.metahumano as any).nivelPeligrosidad,
        estado: (usuario.metahumano as any).estado,
        recompensa: (usuario.metahumano as any).recompensa,
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

    res.json({
      message: 'Usuario encontrado',
      usuario: response
    })

  } catch (error: any) {
    console.error('Error al obtener usuario:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

/**
 * Eliminar usuario (admin)
 */
export async function eliminarUsuario(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' })
    }

    // Verificar que no se esté eliminando a sí mismo
    const usuarioId = (req as any).usuarioId
    if (usuarioId === id) {
      return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' })
    }

    const usuarioService = new UsuarioService(em)
    const eliminado = await usuarioService.eliminarUsuario(id)

    if (!eliminado) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    res.json({ message: 'Usuario eliminado correctamente' })

  } catch (error: any) {
    console.error('Error al eliminar usuario:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}
