import { EntityManager } from '@mikro-orm/core'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Usuario, UserRole } from '../auth/usuario.entity.js'
import { Metahumano } from '../metahumano/metahumano.entity.js'
import { Burocrata } from '../Burocratas/Burocrata.entity.js'
import { config } from '../config/environment.js'

export class AuthServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'AuthServiceError'
  }
}

export type RegistroInput =
  | {
      tipo: 'BASICO'
      email?: string
      telefono?: string
      password?: string
      role?: UserRole | string
    }
  | {
      tipo: 'METAHUMANO'
      email?: string
      telefono?: string
      password?: string
      nombre?: string
      alias?: string
      origen?: string
    }
  | {
      tipo: 'BUROCRATA'
      email?: string
      telefono?: string
      password?: string
      nombre?: string
      alias?: string
      origen?: string
    }
  | {
      tipo: 'ADMIN'
      email?: string
      telefono?: string
      password?: string
      nombre?: string
    }

export interface RegistroResult {
  usuario: Usuario
  metahumano?: Metahumano
  burocrata?: Burocrata
  token?: string
  userInfo?: Record<string, unknown>
}

const MIN_PASSWORD_LENGTH = 8
const BCRYPT_SALT_ROUNDS = 10

export class UsuarioService {
  constructor(private em: EntityManager) {}

  /**
   * Flujo unificado y transaccional de alta de usuarios para todos los roles:
   * valida datos, verifica unicidad de email, hashea contraseña una sola vez,
   * persiste usuario (y perfil si corresponde) y emite token JWT.
   */
  async registrarUsuario(input: RegistroInput): Promise<RegistroResult> {
    const role = this.validarDatosRegistro(input)

    const { usuario, metahumano, burocrata } = await this.em.transactional(async (txEm) => {
      const existeUsuario = await txEm.findOne(Usuario, { email: input.email! })
      if (existeUsuario) {
        throw new AuthServiceError(400, 'Ya existe un usuario con este email')
      }

      const passwordHash = await bcrypt.hash(input.password!, BCRYPT_SALT_ROUNDS)

      const now = new Date()
      const nuevoUsuario = new Usuario()
      nuevoUsuario.email = input.email!
      nuevoUsuario.telefono = input.telefono!
      nuevoUsuario.passwordHash = passwordHash
      nuevoUsuario.role = role
      nuevoUsuario.verificado = input.tipo === 'ADMIN'
      nuevoUsuario.createdAt = now
      nuevoUsuario.updatedAt = now

      if (input.tipo === 'METAHUMANO') {
        const nuevoMetahumano = new Metahumano()
        nuevoMetahumano.nombre = input.nombre!
        nuevoMetahumano.alias = input.alias!
        nuevoMetahumano.origen = input.origen!
        nuevoMetahumano.usuario = nuevoUsuario
        nuevoUsuario.metahumano = nuevoMetahumano

        await txEm.persistAndFlush([nuevoUsuario, nuevoMetahumano])
        return { usuario: nuevoUsuario, metahumano: nuevoMetahumano }
      }

      if (input.tipo === 'BUROCRATA') {
        const nuevoBurocrata = new Burocrata()
        nuevoBurocrata.nombre = input.nombre!
        nuevoBurocrata.alias = input.alias!
        nuevoBurocrata.origen = input.origen!
        nuevoBurocrata.usuario = nuevoUsuario
        nuevoUsuario.burocrata = nuevoBurocrata

        await txEm.persistAndFlush([nuevoUsuario, nuevoBurocrata])
        return { usuario: nuevoUsuario, burocrata: nuevoBurocrata }
      }

      await txEm.persistAndFlush(nuevoUsuario)
      return { usuario: nuevoUsuario }
    })

    if (input.tipo === 'BASICO') {
      return { usuario }
    }

    const { token, userInfo } = this.emitirTokenYUserInfo(input, usuario, metahumano, burocrata)

    return {
      usuario,
      metahumano,
      burocrata,
      token,
      userInfo,
    }
  }

  private validarDatosRegistro(input: RegistroInput): UserRole {
    switch (input.tipo) {
      case 'BASICO': {
        if (!input.email || !input.telefono || !input.password || !input.role) {
          throw new AuthServiceError(
            400,
            'Todos los campos son requeridos: email, telefono, password, role'
          )
        }
        if (input.password.length < MIN_PASSWORD_LENGTH) {
          throw new AuthServiceError(400, 'La contraseña debe tener al menos 8 caracteres')
        }
        if (!Object.values(UserRole).includes(input.role as UserRole)) {
          throw new AuthServiceError(400, 'Role inválido. Debe ser METAHUMANO o BUROCRATA')
        }
        if (input.role === UserRole.ADMIN) {
          throw new AuthServiceError(403, 'No se puede registrar un ADMIN desde esta ruta')
        }
        return input.role as UserRole
      }

      case 'METAHUMANO':
      case 'BUROCRATA': {
        if (
          !input.email ||
          !input.telefono ||
          !input.password ||
          !input.nombre ||
          !input.alias ||
          !input.origen
        ) {
          throw new AuthServiceError(
            400,
            'Todos los campos son requeridos: email, telefono, password, nombre, alias, origen'
          )
        }
        if (input.password.length < MIN_PASSWORD_LENGTH) {
          throw new AuthServiceError(400, 'La contraseña debe tener al menos 8 caracteres')
        }
        return input.tipo === 'METAHUMANO' ? UserRole.METAHUMANO : UserRole.BUROCRATA
      }

      case 'ADMIN': {
        if (!input.email || !input.telefono || !input.password || !input.nombre) {
          throw new AuthServiceError(
            400,
            'Todos los campos son requeridos: email, telefono, password, nombre'
          )
        }
        if (input.password.length < MIN_PASSWORD_LENGTH) {
          throw new AuthServiceError(400, 'La contraseña debe tener al menos 8 caracteres')
        }
        return UserRole.ADMIN
      }
    }
  }

  private emitirTokenYUserInfo(
    input: Exclude<RegistroInput, { tipo: 'BASICO' }>,
    usuario: Usuario,
    metahumano?: Metahumano,
    burocrata?: Burocrata
  ): { token: string; userInfo: Record<string, unknown> } {
    if (input.tipo === 'METAHUMANO' && metahumano) {
      const token = jwt.sign(
        {
          usuarioId: usuario.id,
          email: usuario.email,
          role: usuario.role,
          perfilId: metahumano.id,
          perfil: 'metahumano',
        },
        config.jwtSecret,
        { expiresIn: '24h' }
      )
      return {
        token,
        userInfo: {
          id: usuario.id,
          role: usuario.role,
          perfil: 'metahumano',
          perfilId: metahumano.id,
          alias: metahumano.alias,
        },
      }
    }

    if (input.tipo === 'BUROCRATA' && burocrata) {
      const token = jwt.sign(
        {
          usuarioId: usuario.id,
          email: usuario.email,
          role: usuario.role,
          perfilId: burocrata.id,
          perfil: 'burocrata',
        },
        config.jwtSecret,
        { expiresIn: '24h' }
      )
      return {
        token,
        userInfo: {
          id: usuario.id,
          role: usuario.role,
          perfil: 'burocrata',
          perfilId: burocrata.id,
          alias: burocrata.alias,
        },
      }
    }

    const token = jwt.sign(
      {
        usuarioId: usuario.id,
        email: usuario.email,
        role: usuario.role,
        nombre: input.nombre,
      },
      config.jwtSecret,
      { expiresIn: '24h' }
    )
    return {
      token,
      userInfo: {
        id: usuario.id,
        role: usuario.role,
        nombre: input.nombre,
        email: usuario.email,
      },
    }
  }

  /**
   * Obtiene un usuario con su perfil asociado
   */
  async obtenerUsuarioConPerfil(id: number): Promise<Usuario | null> {
    return await this.em.findOne(Usuario, { id }, {
      populate: ['metahumano', 'burocrata']
    })
  }

  /**
   * Obtiene un metahumano con acceso a datos de contacto
   */
  async obtenerMetahumano(id: number): Promise<Metahumano | null> {
    const metahumano = await this.em.findOne(Metahumano, { id }, {
      populate: ['usuario']
    })

    return metahumano
  }

  /**
   * Obtiene un burocrata con acceso a datos de contacto
   */
  async obtenerBurocrata(id: number): Promise<Burocrata | null> {
    const burocrata = await this.em.findOne(Burocrata, { id }, {
      populate: ['usuario']
    })

    return burocrata
  }

  /**
   * Convierte un metahumano en burocrata (cambio de perfil)
   */
  async convertirMetahumanoABurocrata(metahumanoId: number, datosBurocrata: {
    nombre: string
    alias: string
    origen: string
  }): Promise<{ usuario: Usuario; burocrata: Burocrata }> {
    const metahumano = await this.em.findOne(Metahumano, { id: metahumanoId }, {
      populate: ['usuario']
    })

    if (!metahumano) {
      throw new Error('Metahumano no encontrado')
    }

    const usuario = metahumano.usuario

    // Eliminar el perfil de metahumano
    this.em.remove(metahumano)

    // Cambiar el role del usuario
    usuario.role = UserRole.BUROCRATA
    usuario.metahumano = undefined

    // Crear nuevo perfil de burocrata
    const burocrata = this.em.create(Burocrata, {
      nombre: datosBurocrata.nombre,
      alias: datosBurocrata.alias,
      origen: datosBurocrata.origen,
      usuario: usuario,
    })

    usuario.burocrata = burocrata

    await this.em.flush()

    return { usuario, burocrata }
  }

  /**
   * Valida la integridad de los datos
   */
  async validarIntegridad(): Promise<string[]> {
    const errores: string[] = []

    // Verificar usuarios con role METAHUMANO pero sin perfil de metahumano
    const usuariosMetaSinPerfil = await this.em.find(Usuario, {
      role: UserRole.METAHUMANO,
      metahumano: null
    })

    usuariosMetaSinPerfil.forEach(usuario => {
      errores.push(`Usuario ${usuario.id} tiene role METAHUMANO pero no tiene perfil de metahumano`)
    })

    // Verificar usuarios con role BUROCRATA pero sin perfil de burocrata
    const usuariosBuroSinPerfil = await this.em.find(Usuario, {
      role: UserRole.BUROCRATA,
      burocrata: null
    })

    usuariosBuroSinPerfil.forEach(usuario => {
      errores.push(`Usuario ${usuario.id} tiene role BUROCRATA pero no tiene perfil de burocrata`)
    })

    // Verificar metahumanos sin usuario asociado
    const metahumanosSinUsuario = await this.em.find(Metahumano, {
      usuario: null
    })

    metahumanosSinUsuario.forEach(meta => {
      errores.push(`Metahumano ${meta.id} no tiene usuario asociado`)
    })

    // Verificar burócratas sin usuario asociado
    const burocatasSinUsuario = await this.em.find(Burocrata, {
      usuario: null
    })

    burocatasSinUsuario.forEach(buro => {
      errores.push(`Burocrata ${buro.id} no tiene usuario asociado`)
    })

    return errores
  }

  /**
   * Elimina un usuario y sus perfiles asociados
   */
  async eliminarUsuario(id: number): Promise<boolean> {
    const usuario = await this.em.findOne(Usuario, { id }, {
      populate: ['metahumano', 'metahumano.poderes', 'metahumano.carpetas', 'burocrata', 'burocrata.carpetas']
    })

    if (!usuario) {
      return false
    }

    if (usuario.metahumano) {
      this.em.remove(usuario.metahumano)
    }

    if (usuario.burocrata) {
      this.em.remove(usuario.burocrata)
    }

    this.em.remove(usuario)
    await this.em.flush()

    return true
  }
}
