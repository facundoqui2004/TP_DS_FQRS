import { test, describe, after } from 'node:test'
import assert from 'node:assert'
import jwt from 'jsonwebtoken'
import express from 'express'
import request from 'supertest'
import cookieParser from 'cookie-parser'
import { requireAuth, requireRoles } from '../auth/auth.middleware.js'
import { config } from '../config/environment.js'
import { orm } from '../shared/db/orm.js'

/**
 * =========================================================================
 * TEST AUTOMATIZADO - INTEGRANTE 2
 * Responsable: Integrante 2 (Control de Acceso y Middlewares de Protección)
 * Objetivo: Validar la interceptación de solicitudes en base a roles (RBAC),
 * garantizando que requests sin token o con rol insuficiente sean bloqueadas
 * con 401 y 403 respectivamente, y permitiendo el paso ante credenciales válidas.
 * =========================================================================
 */
describe('Integrante 2 - Middlewares de Autenticación y Control de Acceso por Roles (RBAC)', () => {

  after(async () => {
    try {
      await orm.close(true)
    } catch {}
  })

  // Construir una mini-aplicación Express aislada para probar los middlewares
  const createTestApp = () => {
    const testApp = express()
    testApp.use(express.json())
    testApp.use(cookieParser())

    // Ruta protegida únicamente por autenticación
    testApp.get('/test/protected', requireAuth, (req, res) => {
      res.json({ message: 'Acceso autorizado', user: (req as any).tokenPayload })
    })

    // Ruta exclusiva para Administradores
    testApp.get('/test/admin-only', requireAuth, requireRoles(['ADMIN']), (req, res) => {
      res.json({ message: 'Panel de administración' })
    })

    // Ruta para Burócratas y Administradores
    testApp.get('/test/staff-only', requireAuth, requireRoles(['BUROCRATA', 'ADMIN']), (req, res) => {
      res.json({ message: 'Área de gestión y trámites' })
    })

    return testApp
  }

  const app = createTestApp()

  test('2.1 Debería rechazar con 401 si no se envía ningún token', async () => {
    const res = await request(app).get('/test/protected')
    assert.strictEqual(res.status, 401)
    assert.ok(res.body.message.includes('No autenticado'))
  })

  test('2.2 Debería permitir acceso mediante Cookie httpOnly con token JWT válido', async () => {
    const token = jwt.sign({ usuarioId: 1, role: 'METAHUMANO' }, config.jwtSecret, { expiresIn: '1h' })
    
    const res = await request(app)
      .get('/test/protected')
      .set('Cookie', [`auth_token=${token}`])

    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.body.message, 'Acceso autorizado')
    assert.strictEqual(res.body.user.usuarioId, 1)
  })

  test('2.3 Debería permitir acceso mediante Header Authorization Bearer', async () => {
    const token = jwt.sign({ usuarioId: 2, role: 'BUROCRATA' }, config.jwtSecret, { expiresIn: '1h' })

    const res = await request(app)
      .get('/test/protected')
      .set('Authorization', `Bearer ${token}`)

    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.body.message, 'Acceso autorizado')
    assert.strictEqual(res.body.user.usuarioId, 2)
  })

  test('2.4 Debería rechazar con 403 Forbidden cuando el rol no tiene permisos para la ruta', async () => {
    // Usuario con rol METAHUMANO intentando acceder a ruta solo ADMIN
    const token = jwt.sign({ usuarioId: 3, role: 'METAHUMANO' }, config.jwtSecret, { expiresIn: '1h' })

    const res = await request(app)
      .get('/test/admin-only')
      .set('Authorization', `Bearer ${token}`)

    assert.strictEqual(res.status, 403)
    assert.ok(res.body.message.includes('Acceso denegado'))
  })

  test('2.5 Debería permitir acceso cuando el rol coincide con los roles permitidos', async () => {
    // Usuario con rol BUROCRATA accediendo a ruta para BUROCRATA o ADMIN
    const tokenBurocrata = jwt.sign({ usuarioId: 4, role: 'BUROCRATA' }, config.jwtSecret, { expiresIn: '1h' })
    const resBuro = await request(app)
      .get('/test/staff-only')
      .set('Authorization', `Bearer ${tokenBurocrata}`)

    assert.strictEqual(resBuro.status, 200)
    assert.strictEqual(resBuro.body.message, 'Área de gestión y trámites')

    // Usuario con rol ADMIN accediendo a ruta de staff
    const tokenAdmin = jwt.sign({ usuarioId: 5, role: 'ADMIN' }, config.jwtSecret, { expiresIn: '1h' })
    const resAdmin = await request(app)
      .get('/test/staff-only')
      .set('Authorization', `Bearer ${tokenAdmin}`)

    assert.strictEqual(resAdmin.status, 200)
  })
})
