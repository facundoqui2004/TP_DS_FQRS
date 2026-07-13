import { orm } from './orm.js'
import { Usuario, UserRole } from '../../auth/usuario.entity.js'
import { Metahumano } from '../../metahumano/metahumano.entity.js'
import { Burocrata } from '../../Burocratas/Burocrata.entity.js'
import { Poder } from '../../poder/poder.entity.js'
import bcrypt from 'bcryptjs'

export async function seedDatabase() {
  const em = orm.em.fork() // fork EM for safety in background context / startup
  
  console.log('--- Database Seeder Started ---')
  
  // 1. ADMIN USER
  const admins = [
    { email: 'admin123@ejemplo.com', password: 'supersegura', phone: '+1234567890', name: 'Admin Ejemplo' },
    { email: 'admin123@gmail.com', password: 'supersegura', phone: '+1234567890', name: 'Admin Gmail' },
    { email: 'admin.prueba@example.com', password: 'admin123456', phone: '+1-555-ADMIN', name: 'Admin de Prueba' }
  ]
  
  for (const adminData of admins) {
    const existing = await em.findOne(Usuario, { email: adminData.email })
    if (!existing) {
      console.log(`Creating Admin: ${adminData.email}`)
      const passwordHash = await bcrypt.hash(adminData.password, 10)
      const user = new Usuario()
      user.email = adminData.email
      user.telefono = adminData.phone
      user.passwordHash = passwordHash
      user.role = UserRole.ADMIN
      user.verificado = true
      user.createdAt = new Date()
      user.updatedAt = new Date()
      
      em.persist(user)
    }
  }

  // 2. METAHUMANO USER
  const metahumanos = [
    { email: 'testuser@ejemplo.com', password: '123456', phone: '+1234567890', nombre: 'Test Metahumano', alias: 'testuser', origen: 'Laboratorio', latitud: -32.9450, longitud: -60.6400 },
    { email: 'testuser@gmail.com', password: '123456', phone: '+1234567890', nombre: 'Test Metahumano', alias: 'testuser', origen: 'Laboratorio', latitud: -32.9455, longitud: -60.6405 },
    { email: 'test.prueba@example.com', password: 'test123456', phone: '+1-555-TEST', nombre: 'Usuario de Prueba', alias: 'Tester', origen: 'Laboratorio de Testing', latitud: -32.9460, longitud: -60.6380 },
    { email: 'peter.parker@ejemplo.com', password: 'spidersecret', phone: '+9876543210', nombre: 'Peter Parker', alias: 'Spiderman', origen: 'Picadura araña', latitud: -32.9475, longitud: -60.6300 }
  ]

  for (const metaData of metahumanos) {
    const existing = await em.findOne(Usuario, { email: metaData.email }, { populate: ['metahumano'] })
    if (!existing) {
      console.log(`Creating Metahumano: ${metaData.email}`)
      const passwordHash = await bcrypt.hash(metaData.password, 10)
      
      const user = new Usuario()
      user.email = metaData.email
      user.telefono = metaData.phone
      user.passwordHash = passwordHash
      user.role = UserRole.METAHUMANO
      user.verificado = true
      user.createdAt = new Date()
      user.updatedAt = new Date()
      
      const metahumano = new Metahumano()
      metahumano.nombre = metaData.nombre
      metahumano.alias = metaData.alias
      metahumano.origen = metaData.origen
      metahumano.latitud = metaData.latitud
      metahumano.longitud = metaData.longitud
      metahumano.usuario = user
      
      user.metahumano = metahumano
      
      em.persist(user)
      em.persist(metahumano)
    } else if (existing.metahumano && (existing.metahumano.latitud === undefined || existing.metahumano.latitud === null)) {
      console.log(`Updating Metahumano coordinates for: ${metaData.email}`)
      existing.metahumano.latitud = metaData.latitud
      existing.metahumano.longitud = metaData.longitud
      em.persist(existing.metahumano)
    }
  }

  // 3. BUROCRATA USER
  const burocratas = [
    { email: 'burocrata1@ejemplo.com', password: 'tramite123', phone: '+1234567890', nombre: 'Test Burocrata', alias: 'burocrata1', origen: 'Gobierno', latitud: -32.9430, longitud: -60.6420 },
    { email: 'burocrata1@gmail.com', password: 'tramite123', phone: '+1234567890', nombre: 'Test Burocrata', alias: 'burocrata1', origen: 'Gobierno', latitud: -32.9435, longitud: -60.6425 },
    { email: 'burocrata@gobierno.com', password: 'supersegura', phone: '+5555551234', nombre: 'Burocrata Oficial', alias: 'El Tramitador', origen: 'Ministerio de Asuntos Meta', latitud: -32.9480, longitud: -60.6350 }
  ]

  for (const buroData of burocratas) {
    const existing = await em.findOne(Usuario, { email: buroData.email }, { populate: ['burocrata'] })
    if (!existing) {
      console.log(`Creating Burocrata: ${buroData.email}`)
      const passwordHash = await bcrypt.hash(buroData.password, 10)
      
      const user = new Usuario()
      user.email = buroData.email
      user.telefono = buroData.phone
      user.passwordHash = passwordHash
      user.role = UserRole.BUROCRATA
      user.verificado = true
      user.createdAt = new Date()
      user.updatedAt = new Date()
      
      const burocrata = new Burocrata()
      burocrata.nombre = buroData.nombre
      burocrata.alias = buroData.alias
      burocrata.origen = buroData.origen
      burocrata.latitud = buroData.latitud
      burocrata.longitud = buroData.longitud
      burocrata.usuario = user
      
      user.burocrata = burocrata
      
      em.persist(user)
      em.persist(burocrata)
    } else if (existing.burocrata && (existing.burocrata.latitud === undefined || existing.burocrata.latitud === null)) {
      console.log(`Updating Burocrata coordinates for: ${buroData.email}`)
      existing.burocrata.latitud = buroData.latitud
      existing.burocrata.longitud = buroData.longitud
      em.persist(existing.burocrata)
    }
  }

  // 4. PODERES GENERALES
  const poderes = [
    {
      nomPoder: 'Sentido Arácnido',
      debilidad: 'Sobrecarga sensorial en ambientes ruidosos',
      descPoder: 'Capacidad de detectar peligro inminente mediante sentidos aumentados',
      descDebilidad: 'El exceso de estímulos puede causar dolor de cabeza severo',
      categoria: 'SENSORIAL',
      costoMulta: 5000
    },
    {
      nomPoder: 'Súper Fuerza',
      debilidad: 'Pérdida de control en situaciones emocionales',
      descPoder: 'Fuerza física sobrehumana capaz de levantar hasta 50 toneladas',
      descDebilidad: 'La ira intensa puede causar daños colaterales incontrolables',
      categoria: 'FISICO',
      costoMulta: 15000
    },
    {
      nomPoder: 'Vuelo Atmosférico',
      debilidad: 'Limitado por condiciones climáticas extremas',
      descPoder: 'Capacidad de volar sin asistencia mecánica hasta 10,000 metros',
      descDebilidad: 'Tormentas eléctricas y vientos huracanados impiden el vuelo',
      categoria: 'FISICO',
      costoMulta: 8000
    },
    {
      nomPoder: 'Teletransporte Dimensional',
      debilidad: 'Desorientación espacial tras múltiples saltos',
      descPoder: 'Capacidad de transportarse instantáneamente a cualquier ubicación conocida',
      descDebilidad: 'Más de 5 teletransportes seguidos causan náuseas y pérdida temporal de orientación',
      categoria: 'DIMENSIONAL',
      costoMulta: 25000
    },
    {
      nomPoder: 'Invisibilidad Óptica',
      debilidad: 'Detectable por sensores térmicos',
      descPoder: 'Capacidad de volverse invisible al espectro visible durante 30 minutos',
      descDebilidad: 'La temperatura corporal sigue siendo detectable por equipos especializados',
      categoria: 'OPTICO',
      costoMulta: 12000
    },
    {
      nomPoder: 'Dominio Psíquico',
      debilidad: 'Agotamiento mental severo',
      descPoder: 'Capacidad de influir y controlar la mente de otros seres conscientes',
      descDebilidad: 'El uso prolongado causa migrañas severas y posible daño cerebral',
      categoria: 'PSIQUICO',
      costoMulta: 50000
    },
    {
      nomPoder: 'Regeneración Celular',
      debilidad: 'Requiere alto consumo calórico',
      descPoder: 'Capacidad de curar heridas y regenerar tejidos a velocidad acelerada',
      descDebilidad: 'Necesita consumir 10 veces más calorías para mantener la regeneración activa',
      categoria: 'BIOLOGICO',
      costoMulta: 18000
    },
    {
      nomPoder: 'Control del Fuego',
      debilidad: 'Vulnerable al agua y frío extremo',
      descPoder: 'Capacidad de generar y manipular llamas hasta 1200°C',
      descDebilidad: 'El contacto con agua fría o temperaturas bajo cero anula temporalmente el poder',
      categoria: 'ELEMENTAL',
      costoMulta: 30000
    },
    {
      nomPoder: 'Cronocinesis (Control del Tiempo)',
      debilidad: 'Paradojas temporales y cansancio',
      descPoder: 'Capacidad de desacelerar, acelerar o pausar el flujo del tiempo por breves períodos (máx. 10s)',
      descDebilidad: 'El uso continuo altera el ritmo biológico del usuario provocando cansancio crónico',
      categoria: 'DIMENSIONAL',
      costoMulta: 45000
    },
    {
      nomPoder: 'Telequinesis',
      debilidad: 'Dependencia de la línea de visión y peso',
      descPoder: 'Capacidad de mover objetos físicos con la mente a una distancia máxima de 50 metros',
      descDebilidad: 'Mover objetos que superen el peso corporal del usuario causa fatiga muscular y sangrado nasal',
      categoria: 'PSIQUICO',
      costoMulta: 20000
    },
    {
      nomPoder: 'Criocinesis (Control del Hielo)',
      debilidad: 'Deshidratación rápida',
      descPoder: 'Capacidad de congelar la humedad del aire y proyectar ráfagas de frío extremo',
      descDebilidad: 'Requiere niveles extremadamente altos de agua en el cuerpo, provocando sed intensa',
      categoria: 'ELEMENTAL',
      costoMulta: 25000
    },
    {
      nomPoder: 'Elasticidad Corporal',
      debilidad: 'Vulnerabilidad a temperaturas extremas',
      descPoder: 'Capacidad de estirar, contraer y moldear el cuerpo en cualquier forma imaginable',
      descDebilidad: 'El frío extremo rigidiza el cuerpo, el calor extremo lo vuelve inestable',
      categoria: 'BIOLOGICO',
      costoMulta: 10000
    },
    {
      nomPoder: 'Visión de Rayos X',
      debilidad: 'Ineficacia ante el plomo y fatiga ocular',
      descPoder: 'Capacidad de ver a través de objetos sólidos y estructuras físicas',
      descDebilidad: 'El plomo bloquea la visión y el uso prolongado causa irritación severa',
      categoria: 'SENSORIAL',
      costoMulta: 7000
    },
    {
      nomPoder: 'Hiper-intelecto',
      debilidad: 'Apatía social y parálisis por análisis',
      descPoder: 'Capacidad de procesar información, realizar cálculos y aprender a velocidad de supercomputadora',
      descDebilidad: 'El análisis de variables dificulta decisiones rápidas y genera desconexión emocional',
      categoria: 'PSIQUICO',
      costoMulta: 15000
    },
    {
      nomPoder: 'Electroquinesis (Electricidad)',
      debilidad: 'Cortocircuito al contacto con conductores',
      descPoder: 'Capacidad de absorber, almacenar y proyectar descargas de energía eléctrica',
      descDebilidad: 'Si el cuerpo cargado entra en contacto con agua, la energía se descarga dañando al usuario',
      categoria: 'ELEMENTAL',
      costoMulta: 35000
    },
    {
      nomPoder: 'Mimetismo Metálico',
      debilidad: 'Pérdida de flexibilidad y magnetismo',
      descPoder: 'Capacidad de transformar la piel y tejidos en metal sólido orgánico para resistencia extrema',
      descDebilidad: 'El peso aumenta un 500% y campos magnéticos fuertes pueden paralizar al usuario',
      categoria: 'FISICO',
      costoMulta: 22000
    }
  ]

  for (const poderData of poderes) {
    const existing = await em.findOne(Poder, { nomPoder: poderData.nomPoder })
    if (!existing) {
      console.log(`Creating Poder: ${poderData.nomPoder}`)
      const poder = em.create(Poder, poderData)
      em.persist(poder)
    }
  }

  await em.flush()
  console.log('--- Database Seeder Completed ---')
}
