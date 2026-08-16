import { test, describe } from 'node:test'
import assert from 'node:assert'
import { config, AppConfig } from '../config/environment.js'

/**
 * =========================================================================
 * TEST AUTOMATIZADO - INTEGRANTE 4
 * Responsable: Integrante 4 (Configuración de Ambientes y Variables de Entorno)
 * Objetivo: Validar la correcta definición, tipado y carga de variables de entorno
 * según el ambiente activo (development, test, production), asegurando configuraciones
 * seguras de base de datos, puertos de red y tokens.
 * =========================================================================
 */
describe('Integrante 4 - Configuración Centralizada de Ambientes (.env / Environment)', () => {

  test('4.1 Debería exponer el objeto de configuración tipado con todos sus módulos', () => {
    assert.ok(config !== null && typeof config === 'object', 'Config debe ser un objeto válido')
    assert.ok(typeof config.port === 'number' && config.port > 0, 'El puerto debe ser un número positivo')
    assert.ok(typeof config.env === 'string', 'El ambiente debe ser un string definido')
    assert.ok(typeof config.jwtSecret === 'string' && config.jwtSecret.length > 8, 'El secreto JWT debe tener longitud adecuada')
    assert.ok(typeof config.frontendUrl === 'string', 'frontendUrl debe estar definido')
  })

  test('4.2 Debería poseer una estructura completa para los parámetros de Base de Datos', () => {
    const { db } = config
    assert.ok(db, 'El bloque db debe existir')
    assert.ok(typeof db.host === 'string' && db.host.length > 0, 'db.host debe ser string')
    assert.ok(typeof db.port === 'number' && db.port > 0, 'db.port debe ser número válido')
    assert.ok(typeof db.dbName === 'string' && db.dbName.length > 0, 'db.dbName debe estar definido')
    assert.ok(typeof db.user === 'string' && db.user.length > 0, 'db.user debe estar definido')
    assert.ok(typeof db.password === 'string', 'db.password debe estar definido')
  })

  test('4.3 Debería proveer métodos utilitarios de verificación de ambiente consistentes', () => {
    assert.strictEqual(typeof config.isProduction, 'function')
    assert.strictEqual(typeof config.isDevelopment, 'function')
    assert.strictEqual(typeof config.isTest, 'function')

    const isProd = config.isProduction()
    const isDev = config.isDevelopment()
    const isTest = config.isTest()

    // Solo uno de los estados primarios debe ser consistente con process.env.NODE_ENV
    const currentEnv = process.env.NODE_ENV || 'development'
    if (currentEnv === 'production') {
      assert.strictEqual(isProd, true)
    } else if (currentEnv === 'test') {
      assert.strictEqual(isTest, true)
    } else {
      assert.strictEqual(isDev, true)
    }
  })

  test('4.4 Debería configurar valores por defecto seguros cuando faltan variables opcionales', () => {
    assert.strictEqual(config.jwtExpiresIn, '24h')
    assert.ok(config.mercadopago !== undefined, 'Bloque mercadopago debe existir aunque esté vacío')
  })
})
