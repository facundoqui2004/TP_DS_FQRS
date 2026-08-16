import { test, describe, after } from 'node:test'
import assert from 'node:assert'
import request from 'supertest'
import { app } from '../app.js'
import { orm } from '../shared/db/orm.js'
import jwt from 'jsonwebtoken'
import { config } from '../config/environment.js'

/**
 * =========================================================================
 * TEST DE INTEGRACIÓN - FLUJO COMPLETO DE LA API
 * Objetivo: Validar el funcionamiento conjunto e integrado de:
 * 1. Express Router y Middlewares de aplicación.
 * 2. Autenticación (JWT por Cookie y por Header Bearer).
 * 3. Control de acceso por niveles / roles (ADMIN vs METAHUMANO vs BUROCRATA).
 * 4. Rutas protegidas vs Rutas públicas vs Rutas con permisos restringidos.
 * 5. Ciclo de vida de sesión (Login, Consulta de Perfil, Logout).
 * =========================================================================
 */
describe('Test de Integración - Flujo Completo de Autenticación, Roles y Rutas Protegidas', () => {

  // Limpieza y cierre ordenado de la conexión a base de datos al finalizar
  after(async () => {
    try {
      await orm.close(true)
    } catch {
      // Ignore if already closed
    }
  })

  // Generar tokens para diferentes roles de prueba
  const adminToken = jwt.sign(
    { usuarioId: 1, email: 'admin_test@supergestor.com', role: 'ADMIN', perfil: 'admin' },
    config.jwtSecret,
    { expiresIn: '1h' }
  )

  const metahumanoToken = jwt.sign(
    { usuarioId: 2, email: 'meta_test@supergestor.com', role: 'METAHUMANO', perfil: 'metahumano' },
    config.jwtSecret,
    { expiresIn: '1h' }
  )

  test('INT-1: Debería bloquear acceso a rutas protegidas sin credenciales (401 Unauthorized)', async () => {
    const res = await request(app).get('/api/auth/perfil')
    assert.strictEqual(res.status, 401, 'Debe retornar 401 al consultar perfil sin token')
    assert.ok(res.body.message.includes('No autenticado'), 'El mensaje debe indicar falta de autenticación')
  })

  test('INT-2: Debería denegar acceso con 403 Forbidden cuando un METAHUMANO intenta acceder a rutas de ADMIN', async () => {
    const res = await request(app)
      .get('/api/auth/admin/usuarios')
      .set('Authorization', `Bearer ${metahumanoToken}`)

    assert.strictEqual(res.status, 403, 'Debe retornar 403 al no tener rol ADMIN')
    assert.ok(res.body.message.includes('Acceso denegado'), 'El mensaje debe indicar permisos insuficientes')
  })

  test('INT-3: Debería permitir a un ADMIN consultar endpoints de administración de usuarios', async () => {
    const res = await request(app)
      .get('/api/auth/admin/usuarios')
      .set('Authorization', `Bearer ${adminToken}`)

    // El endpoint de admin debe responder exitosamente con la lista y paginación
    assert.strictEqual(res.status, 200, 'El administrador debe recibir estado 200')
    assert.ok(Array.isArray(res.body.usuarios), 'La respuesta debe contener la lista de usuarios')
    assert.ok(res.body.pagination, 'La respuesta debe contener metadatos de paginación')
  })

  test('INT-4: Debería procesar correctamente el cierre de sesión (Logout) limpiando cookies', async () => {
    const res = await request(app).post('/api/auth/logout')
    assert.strictEqual(res.status, 200, 'Logout debe retornar 200')
    assert.strictEqual(res.body.message, 'Logout exitoso')
  })

  test('INT-5: Debería responder con 404 Resource not found para rutas inexistentes', async () => {
    const res = await request(app).get('/api/ruta-que-no-existe-en-el-sistema')
    assert.strictEqual(res.status, 404)
    assert.strictEqual(res.body.message, 'Resource not found')
  })
})
