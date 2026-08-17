import { orm } from './orm.js'
import { Usuario, UserRole } from '../../auth/usuario.entity.js'
import { Metahumano } from '../../metahumano/metahumano.entity.js'
import { Heroe } from '../../heroe/heroe.entity.js'
import { Villano } from '../../villano/villano.entity.js'
import { Burocrata } from '../../Burocratas/Burocrata.entity.js'
import { Poder } from '../../poder/poder.entity.js'
import { MetaPoder } from '../../metaPoder/metaPoder.entity.js'
import { Carpeta } from '../../carpeta/carpeta.entity.js'
import { Evidencia } from '../../evidencia/evidencia.entity.js'
import { Multa } from '../../Multas/Multa.entity.js'
import bcrypt from 'bcryptjs'

export async function seedDatabase() {
  const em = orm.em.fork()

  console.log('--- Database Seeder & Cleanup Started ---')

  // Guard: si ya existen usuarios no-admin, la DB ya fue inicializada → no hacer nada
  const conn = em.getConnection()
  const [existingUsers] = await conn.execute("SELECT COUNT(*) as count FROM `usuario` WHERE role != 'admin'") as any[]
  if (existingUsers.count > 0) {
    console.log(`--- Seeder omitido: ya existen ${existingUsers.count} usuarios en la DB ---`)
    return
  }

  console.log('--- DB vacía detectada, ejecutando seed completo ---')

  // 0. CLEANUP: Delete all non-admin users and associated data
  await conn.execute('SET FOREIGN_KEY_CHECKS = 0;')
  await conn.execute('DELETE FROM `multa`;')
  await conn.execute('DELETE FROM `evidencia`;')
  await conn.execute('DELETE FROM `carpeta`;')
  await conn.execute('DELETE FROM `meta_poder`;')
  await conn.execute('DELETE FROM `metahumano`;')
  await conn.execute('DELETE FROM `burocrata`;')
  await conn.execute("DELETE FROM `usuario` WHERE role != 'admin';")
  await conn.execute('SET FOREIGN_KEY_CHECKS = 1;')

  // 1. Ensure Admin User exists
  const adminEmail = 'admin123@ejemplo.com'
  let adminUser = await em.findOne(Usuario, { email: adminEmail })
  if (!adminUser) {
    const passwordHash = await bcrypt.hash('supersegura', 10)
    adminUser = new Usuario()
    adminUser.email = adminEmail
    adminUser.telefono = '+1234567890'
    adminUser.passwordHash = passwordHash
    adminUser.role = UserRole.ADMIN
    adminUser.verificado = true
    adminUser.createdAt = new Date()
    adminUser.updatedAt = new Date()
    em.persist(adminUser)
    await em.flush()
  }

  // 2. Ensure Poderes exist
  const poderesData = [
    { nomPoder: 'Sentido Arácnido', debilidad: 'Sobrecarga sensorial en ambientes ruidosos', descPoder: 'Capacidad de detectar peligro inminente mediante sentidos aumentados', descDebilidad: 'El exceso de estímulos puede causar dolor de cabeza severo', categoria: 'SENSORIAL', costoMulta: 5000 },
    { nomPoder: 'Súper Fuerza', debilidad: 'Pérdida de control en situaciones emocionales', descPoder: 'Fuerza física sobrehumana capaz de levantar hasta 50 toneladas', descDebilidad: 'La ira intensa puede causar daños colaterales incontrolables', categoria: 'FISICO', costoMulta: 15000 },
    { nomPoder: 'Vuelo Atmosférico', debilidad: 'Limitado por condiciones climáticas extremas', descPoder: 'Capacidad de volar sin asistencia mecánica hasta 10,000 metros', descDebilidad: 'Tormentas eléctricas y vientos huracanados impiden el vuelo', categoria: 'FISICO', costoMulta: 8000 },
    { nomPoder: 'Teletransporte Dimensional', debilidad: 'Desorientación espacial tras múltiples saltos', descPoder: 'Capacidad de transportarse instantáneamente a cualquier ubicación conocida', descDebilidad: 'Más de 5 teletransportes seguidos causan náuseas y pérdida temporal de orientación', categoria: 'DIMENSIONAL', costoMulta: 25000 },
    { nomPoder: 'Invisibilidad Óptica', debilidad: 'Detectable por sensores térmicos', descPoder: 'Capacidad de volverse invisible al espectro visible durante 30 minutos', descDebilidad: 'La temperatura corporal sigue siendo detectable por equipos especializados', categoria: 'OPTICO', costoMulta: 12000 },
    { nomPoder: 'Control del Fuego', debilidad: 'Vulnerable al agua y frío extremo', descPoder: 'Capacidad de generar y manipular llamas hasta 1200°C', descDebilidad: 'El contacto con agua fría o temperaturas bajo cero anula temporalmente el poder', categoria: 'ELEMENTAL', costoMulta: 30000 },
    { nomPoder: 'Telequinesis', debilidad: 'Dependencia de la línea de visión y peso', descPoder: 'Capacidad de mover objetos físicos con la mente a una distancia máxima de 50 metros', descDebilidad: 'Mover objetos que superen el peso corporal del usuario causa fatiga muscular y sangrado nasal', categoria: 'PSIQUICO', costoMulta: 20000 }
  ]

  const poderesMap: Map<string, Poder> = new Map()
  for (const pd of poderesData) {
    let p = await em.findOne(Poder, { nomPoder: pd.nomPoder })
    if (!p) {
      p = em.create(Poder, pd)
      em.persist(p)
      await em.flush()
    }
    poderesMap.set(pd.nomPoder, p)
  }

  // 3. Create 5 Burócratas
  const burocratasData = [
    { email: 'buro.juan@supergestor.com', pass: 'Buro12345', nombre: 'Juan Pérez', alias: 'Agente Juan', phone: '+549341111111', lat: -32.9430, lng: -60.6420 },
    { email: 'buro.maria@supergestor.com', pass: 'Buro12345', nombre: 'María Gómez', alias: 'Inspectora María', phone: '+549341222222', lat: -32.9435, lng: -60.6425 },
    { email: 'buro.carlos@supergestor.com', pass: 'Buro12345', nombre: 'Carlos López', alias: 'Analista Carlos', phone: '+549341333333', lat: -32.9480, lng: -60.6350 },
    { email: 'buro.ana@supergestor.com', pass: 'Buro12345', nombre: 'Ana Martínez', alias: 'Supervisora Ana', phone: '+549341444444', lat: -32.9460, lng: -60.6370 },
    { email: 'buro.diego@supergestor.com', pass: 'Buro12345', nombre: 'Diego Rodríguez', alias: 'Auditor Diego', phone: '+549341555555', lat: -32.9440, lng: -60.6390 }
  ]

  const createdBurocratas: Burocrata[] = []
  for (const bd of burocratasData) {
    const hash = await bcrypt.hash(bd.pass, 10)
    const u = new Usuario()
    u.email = bd.email
    u.passwordHash = hash
    u.telefono = bd.phone
    u.role = UserRole.BUROCRATA
    u.verificado = true
    u.createdAt = new Date()
    u.updatedAt = new Date()

    const b = new Burocrata()
    b.nombre = bd.nombre
    b.alias = bd.alias
    b.origen = 'Ministerio de Regulaciones'
    b.latitud = bd.lat
    b.longitud = bd.lng
    b.usuario = u
    u.burocrata = b

    em.persist(u)
    em.persist(b)
    createdBurocratas.push(b)
  }
  await em.flush()

  // 4. Create 5 Metahumanos (3 Héroes, 2 Villanos)
  const heroesData = [
    { email: 'heroe.capitan@supergestor.com', pass: 'Hero12345', nombre: 'Capitán Justicia', alias: 'Capitán', phone: '+549341666666', lat: -32.9450, lng: -60.6400, poderes: ['Súper Fuerza', 'Vuelo Atmosférico'], fama: 'Alto', victorias: 15 },
    { email: 'heroe.sombra@supergestor.com', pass: 'Hero12345', nombre: 'Sombra Blanca', alias: 'Sombra', phone: '+549341777777', lat: -32.9455, lng: -60.6405, poderes: ['Invisibilidad Óptica', 'Sentido Arácnido'], fama: 'Medio', victorias: 8 },
    { email: 'heroe.fuego@supergestor.com', pass: 'Hero12345', nombre: 'Fuego Sagrado', alias: 'Ignis', phone: '+549341888888', lat: -32.9460, lng: -60.6380, poderes: ['Control del Fuego', 'Vuelo Atmosférico'], fama: 'Alto', victorias: 20 }
  ]

  const villanosData = [
    { email: 'villano.caos@supergestor.com', pass: 'Villano12345', nombre: 'Señor del Caos', alias: 'Lord Caos', phone: '+549341999999', lat: -32.9475, lng: -60.6300, poderes: ['Teletransporte Dimensional', 'Control del Fuego'], peligrosidad: 'Alta', motivacion: 'Dominio absoluto de la ciudad' },
    { email: 'villano.sombra@supergestor.com', pass: 'Villano12345', nombre: 'Sombra Oscura', alias: 'Nox', phone: '+549341000000', lat: -32.9490, lng: -60.6320, poderes: ['Telequinesis', 'Invisibilidad Óptica'], peligrosidad: 'Media', motivacion: 'Venganza contra las autoridades' }
  ]

  const createdHeroes: Heroe[] = []
  for (const hd of heroesData) {
    const hash = await bcrypt.hash(hd.pass, 10)
    const u = new Usuario()
    u.email = hd.email
    u.passwordHash = hash
    u.telefono = hd.phone
    u.role = UserRole.METAHUMANO
    u.verificado = true
    u.createdAt = new Date()
    u.updatedAt = new Date()

    const h = new Heroe()
    h.nombre = hd.nombre
    h.alias = hd.alias
    h.origen = 'Entrenamiento de Élite'
    h.latitud = hd.lat
    h.longitud = hd.lng
    h.nivelFama = hd.fama
    h.estatus = 'activo'
    h.numeroVictorias = hd.victorias
    h.mision = 'Proteger la ciudad y mantener la paz'
    h.usuario = u
    u.metahumano = h

    em.persist(u)
    em.persist(h)
    createdHeroes.push(h)
  }

  const createdVillanos: Villano[] = []
  for (const vd of villanosData) {
    const hash = await bcrypt.hash(vd.pass, 10)
    const u = new Usuario()
    u.email = vd.email
    u.passwordHash = hash
    u.telefono = vd.phone
    u.role = UserRole.METAHUMANO
    u.verificado = true
    u.createdAt = new Date()
    u.updatedAt = new Date()

    const v = new Villano()
    v.nombre = vd.nombre
    v.alias = vd.alias
    v.origen = 'Experimento clandestino'
    v.latitud = vd.lat
    v.longitud = vd.lng
    v.nivelPeligrosidad = vd.peligrosidad
    v.estado = 'activo'
    v.motivacion = vd.motivacion
    v.recompensa = 0
    v.usuario = u
    u.metahumano = v

    em.persist(u)
    em.persist(v)
    createdVillanos.push(v)
  }
  await em.flush()

  // 5. Asignación y Aprobación de Poderes
  const allMetas = [...createdHeroes, ...createdVillanos]
  for (let i = 0; i < allMetas.length; i++) {
    const meta = allMetas[i]
    const pNames = i < 3 ? heroesData[i].poderes : villanosData[i - 3].poderes
    for (const pName of pNames) {
      const p = poderesMap.get(pName)
      if (p) {
        const mp = em.create(MetaPoder, {
          dominio: 'AVANZADO',
          nivelControl: 85,
          estado: 'APROBADO',
          fechaAdquisicion: new Date(),
          metahumano: meta,
          poder: p
        })
        em.persist(mp)
      }
    }
  }
  await em.flush()

  // 6. Gestión de 5 Trámites/Solicitudes por cada Metahumano (Total: 25)
  // Héroes (3 héroes * 5 trámites = 15 carpetas)
  for (let i = 0; i < createdHeroes.length; i++) {
    const heroe = createdHeroes[i]
    for (let j = 1; j <= 5; j++) {
      const buro = createdBurocratas[(i + j) % createdBurocratas.length]
      const carpeta = em.create(Carpeta, {
        estado: 'APROBADA',
        descripcion: `Trámite #${j} de supervisión para el Héroe ${heroe.alias}`,
        tipo: j === 1 ? 'REGISTRO_PODER' : j === 2 ? 'PERMISO_DESTRUCCION' : 'INFORME_ACCION',
        metahumano: heroe,
        burocrata: buro,
        latitud: heroe.latitud ? heroe.latitud + (j * 0.001) : -32.9450,
        longitud: heroe.longitud ? heroe.longitud + (j * 0.001) : -60.6400,
        radio: j === 2 ? 150 : undefined
      })
      em.persist(carpeta)

      const evidencia = em.create(Evidencia, {
        descripcion: `Evidencia del trámite #${j} de ${heroe.alias}`,
        fechaRecoleccion: new Date(),
        latitud: carpeta.latitud,
        longitud: carpeta.longitud,
        carpeta: carpeta
      })
      em.persist(evidencia)

      const multa = em.create(Multa, {
        motivoMulta: `Multa de tasa administrativa #${j}`,
        montoMulta: 5000,
        lugarDePago: 'Banco de la Ciudad / Mercado Pago',
        fechaEmision: new Date(Date.now() - 10 * 86400000),
        fechaVencimiento: new Date(Date.now() + 30 * 86400000),
        estado: 'PAGADA',
        formaPago: 'Mercado Pago',
        evidencia: evidencia
      })
      em.persist(multa)
    }
  }

  // Villanos (2 villanos * 5 trámites = 10 carpetas)
  // Requisito específico: 2 multas VENCIDAS y 1 AL DÍA por villano.
  for (let i = 0; i < createdVillanos.length; i++) {
    const villano = createdVillanos[i]
    let totalDeudaVillano = 0

    for (let j = 1; j <= 5; j++) {
      const buro = createdBurocratas[(i + j) % createdBurocratas.length]
      const carpeta = em.create(Carpeta, {
        estado: 'APROBADA',
        descripcion: `Trámite de infracción #${j} para el Villano ${villano.alias}`,
        tipo: j === 2 ? 'PERMISO_DESTRUCCION' : 'INFRACCION_REGULATORIA',
        metahumano: villano,
        burocrata: buro,
        latitud: villano.latitud ? villano.latitud + (j * 0.001) : -32.9470,
        longitud: villano.longitud ? villano.longitud + (j * 0.001) : -60.6300,
        radio: j === 2 ? 300 : undefined
      })
      em.persist(carpeta)

      const evidencia = em.create(Evidencia, {
        descripcion: `Evidencia recolectada por ${buro.alias} sobre el Villano ${villano.alias}`,
        fechaRecoleccion: new Date(),
        latitud: carpeta.latitud,
        longitud: carpeta.longitud,
        carpeta: carpeta
      })
      em.persist(evidencia)

      let estadoMulta = 'PAGADA'
      let fechaEmision = new Date(Date.now() - 30 * 86400000)
      let fechaVencimiento = new Date(Date.now() + 30 * 86400000)
      let monto = 5000
      let formaPago: string | undefined = 'AstroPay'

      if (j === 1 || j === 2) {
        // MULTA VENCIDA
        estadoMulta = 'APROBADA'
        fechaEmision = new Date('2026-05-10T10:00:00Z')
        fechaVencimiento = new Date('2026-06-15T10:00:00Z') // Fecha pasada -> VENCIDA!
        monto = 15000
        formaPago = undefined
        totalDeudaVillano += monto
      } else if (j === 3) {
        // MULTA AL DÍA
        estadoMulta = 'APROBADA'
        fechaEmision = new Date('2026-08-01T10:00:00Z')
        fechaVencimiento = new Date('2026-09-30T10:00:00Z') // Fecha futura -> AL DÍA!
        monto = 10000
        formaPago = undefined
        totalDeudaVillano += monto
      } else {
        // MULTA PAGADA
        estadoMulta = 'PAGADA'
        formaPago = j === 4 ? 'Mercado Pago' : 'AstroPay'
      }

      const multa = em.create(Multa, {
        motivoMulta: j === 1 ? 'Daño colateral a propiedad pública' : j === 2 ? 'Uso no autorizado de metapoder en zona residencial' : j === 3 ? 'Exceso de velocidad metahumana' : `Tasa administrativa #${j}`,
        montoMulta: monto,
        lugarDePago: 'Tribunal Regulatorio / Plataforma Web',
        fechaEmision: fechaEmision,
        fechaVencimiento: fechaVencimiento,
        estado: estadoMulta,
        formaPago: formaPago,
        evidencia: evidencia
      })
      em.persist(multa)
    }

    // Actualizar recompensa del villano con su deuda total ($40,000 = 15000 + 15000 + 10000)
    villano.recompensa = totalDeudaVillano
    em.persist(villano)
  }

  await em.flush()
  console.log('--- Database Seeder & Cleanup Completed Successfully ---')
}
