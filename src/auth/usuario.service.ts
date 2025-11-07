import { EntityManager } from '@mikro-orm/core'
import { Usuario, UserRole } from '../auth/usuario.entity.js'
import { Metahumano } from '../metahumano/metahumano.entity.js'
import { Burocrata } from '../Burocratas/Burocrata.entity.js'

export class UsuarioService {
  constructor(private em: EntityManager) {}

  /**
   * Crea un usuario con perfil de metahumano
   */
  async crearMetahumano(datos: {
    email: string
    telefono: string
    passwordHash: string
    nombre: string
    alias: string
    origen: string
    tipoMeta?: string
  }): Promise<{ usuario: Usuario; metahumano: Metahumano }> {
    // Verificar que el email no exista
    const usuarioExistente = await this.em.findOne(Usuario, { email: datos.email })
    if (usuarioExistente) {
      throw new Error('Ya existe un usuario con este email')
    }

    // Crear usuario
    const usuario = this.em.create(Usuario, {
      email: datos.email,
      telefono: datos.telefono,
      passwordHash: datos.passwordHash,
      role: UserRole.METAHUMANO,
      verificado: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Crear metahumano asociado
    const metahumano = this.em.create(Metahumano, {
      nombre: datos.nombre,
      alias: datos.alias,
      origen: datos.origen,
      tipoMeta: datos.tipoMeta || 'NORMAL', // Valor por defecto
      usuario: usuario,
    })

    // Establecer la relación bidireccional
    usuario.metahumano = metahumano

    await this.em.persistAndFlush([usuario, metahumano])

    return { usuario, metahumano }
  }

  /**
   * Crea un usuario con perfil de burocrata
   */
  async crearBurocrata(datos: {
    email: string
    telefono: string
    passwordHash: string
    nombre: string
    alias: string
    origen: string
  }): Promise<{ usuario: Usuario; burocrata: Burocrata }> {
    // Verificar que el email no exista
    const usuarioExistente = await this.em.findOne(Usuario, { email: datos.email })
    if (usuarioExistente) {
      throw new Error('Ya existe un usuario con este email')
    }

    // Crear usuario
    const usuario = this.em.create(Usuario, {
      email: datos.email,
      telefono: datos.telefono,
      passwordHash: datos.passwordHash,
      role: UserRole.BUROCRATA,
      verificado: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Crear burocrata asociado
    const burocrata = this.em.create(Burocrata, {
      nombre: datos.nombre,
      alias: datos.alias,
      origen: datos.origen,
      usuario: usuario,
    })

    // Establecer la relación bidireccional
    usuario.burocrata = burocrata

    await this.em.persistAndFlush([usuario, burocrata])

    return { usuario, burocrata }
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
}
