import bcrypt from 'bcryptjs'
import { orm } from './orm.js'
import { Usuario, UserRole } from '../../auth/usuario.entity.js'
import { Burocrata } from '../../Burocratas/Burocrata.entity.js'
import { Heroe } from '../../heroe/heroe.entity.js'
import { Villano } from '../../villano/villano.entity.js'
import { Poder } from '../../poder/poder.entity.js'

export async function seedDatabase() {
  const em = orm.em.fork()
  try {
    const adminExist = await em.findOne(Usuario, { email: 'admin@tp.com' })
    if (adminExist) {
      console.log('[Seeder] Base de datos ya inicializada con usuarios de prueba.')
      return
    }

    console.log('[Seeder] Inicializando datos de prueba...')
    const defaultPasswordHash = await bcrypt.hash('123456', 10)

    // 1. Poderes base
    const poderVuelo = new Poder()
    poderVuelo.nomPoder = 'Vuelo'
    poderVuelo.debilidad = 'Gravedad aumentada'
    poderVuelo.descPoder = 'Capacidad de volar a velocidades sónicas'
    poderVuelo.descDebilidad = 'Afectado por campos gravitatorios intensos'
    poderVuelo.categoria = 'Físico'
    poderVuelo.costoMulta = 1500

    const poderFuerza = new Poder()
    poderFuerza.nomPoder = 'Superfuerza'
    poderFuerza.debilidad = 'Kryptonita'
    poderFuerza.descPoder = 'Fuerza sobrehumana capaz de levantar toneladas'
    poderFuerza.descDebilidad = 'Vulnerable a radiación específica'
    poderFuerza.categoria = 'Físico'
    poderFuerza.costoMulta = 3000

    const poderMente = new Poder()
    poderMente.nomPoder = 'Telepatía'
    poderMente.debilidad = 'Casco de magnetismo'
    poderMente.descPoder = 'Lectura y control de pensamientos a distancia'
    poderMente.descDebilidad = 'Bloqueado por aleaciones especiales'
    poderMente.categoria = 'Mental'
    poderMente.costoMulta = 2000

    await em.persistAndFlush([poderVuelo, poderFuerza, poderMente])

    // 2. Usuario Administrador
    const adminUser = new Usuario()
    adminUser.email = 'admin@tp.com'
    adminUser.telefono = '1122334455'
    adminUser.passwordHash = defaultPasswordHash
    adminUser.role = UserRole.ADMIN
    adminUser.verificado = true
    adminUser.createdAt = new Date()
    adminUser.updatedAt = new Date()

    // 3. Usuario Burócrata
    const burocrataUser = new Usuario()
    burocrataUser.email = 'burocrata@tp.com'
    burocrataUser.telefono = '1199887766'
    burocrataUser.passwordHash = defaultPasswordHash
    burocrataUser.role = UserRole.BUROCRATA
    burocrataUser.verificado = true
    burocrataUser.createdAt = new Date()
    burocrataUser.updatedAt = new Date()

    const burocrataProfile = new Burocrata()
    burocrataProfile.nombre = 'Burócrata Central'
    burocrataProfile.alias = 'Inspector DSW'
    burocrataProfile.origen = 'Metrópolis'
    burocrataProfile.usuario = burocrataUser
    burocrataUser.burocrata = burocrataProfile

    // 4. Usuario Héroe (Metahumano)
    const heroeUser = new Usuario()
    heroeUser.email = 'heroe@tp.com'
    heroeUser.telefono = '1144556677'
    heroeUser.passwordHash = defaultPasswordHash
    heroeUser.role = UserRole.METAHUMANO
    heroeUser.verificado = true
    heroeUser.createdAt = new Date()
    heroeUser.updatedAt = new Date()

    const heroeProfile = new Heroe()
    heroeProfile.nombre = 'Clark Kent'
    heroeProfile.alias = 'Superman'
    heroeProfile.origen = 'Krypton'
    heroeProfile.nivelFama = 'Alto'
    heroeProfile.mision = 'Salvar Metrópolis'
    heroeProfile.estatus = 'activo'
    heroeProfile.numeroVictorias = 42
    heroeProfile.usuario = heroeUser
    heroeUser.metahumano = heroeProfile

    // 5. Usuario Villano (Metahumano)
    const villanoUser = new Usuario()
    villanoUser.email = 'villano@tp.com'
    villanoUser.telefono = '1155667788'
    villanoUser.passwordHash = defaultPasswordHash
    villanoUser.role = UserRole.METAHUMANO
    villanoUser.verificado = true
    villanoUser.createdAt = new Date()
    villanoUser.updatedAt = new Date()

    const villanoProfile = new Villano()
    villanoProfile.nombre = 'Lex Luthor'
    villanoProfile.alias = 'Lex'
    villanoProfile.origen = 'Metrópolis'
    villanoProfile.nivelPeligrosidad = 'Alto'
    villanoProfile.estado = 'activo'
    villanoProfile.recompensa = 500000
    villanoProfile.usuario = villanoUser
    villanoUser.metahumano = villanoProfile

    await em.persistAndFlush([
      adminUser,
      burocrataUser,
      burocrataProfile,
      heroeUser,
      heroeProfile,
      villanoUser,
      villanoProfile,
    ])

    console.log('[Seeder] Datos de prueba inicializados exitosamente (Admin, Burócrata, Héroe, Villano, Poderes).')
  } catch (error) {
    console.error('[Seeder] Error inicializando datos de prueba:', error)
  }
}
