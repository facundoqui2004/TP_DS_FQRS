import { test, describe } from 'node:test'
import assert from 'node:assert'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config/environment.js'

/**
 * =========================================================================
 * TEST AUTOMATIZADO - INTEGRANTE 1
 * Responsable: Integrante 1 (Módulo de Autenticación y Criptografía)
 * Objetivo: Validar el algoritmo de hashing seguro de contraseñas (bcrypt),
 * la emisión de JSON Web Tokens (JWT) con claims requeridos, y el rechazo
 * estricto de tokens manipulados o inválidos.
 * =========================================================================
 */
describe('Integrante 1 - Módulo de Autenticación, Hashing y Tokens JWT', () => {

  test('1.1 Debería hashear contraseñas de forma segura y verificar la coincidencia', async () => {
    const rawPassword = 'PasswordSeguro123!'
    const saltRounds = 10

    // Generar hash
    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds)

    // El hash debe ser diferente al texto plano y no estar vacío
    assert.notStrictEqual(hashedPassword, rawPassword)
    assert.ok(hashedPassword.startsWith('$2'), 'El hash debe tener formato bcrypt ($2a$ / $2b$)')

    // Verificación correcta
    const isValid = await bcrypt.compare(rawPassword, hashedPassword)
    assert.strictEqual(isValid, true, 'La contraseña correcta debe validar como verdadera')

    // Verificación con contraseña incorrecta
    const isInvalid = await bcrypt.compare('PasswordEquivocado999', hashedPassword)
    assert.strictEqual(isInvalid, false, 'Una contraseña errónea debe ser rechazada')
  })

  test('1.2 Debería firmar un JWT con los claims necesarios y permitir su decodificación válida', () => {
    const payload = {
      usuarioId: 101,
      email: 'integrante1@test.com',
      role: 'ADMIN',
      perfil: 'admin',
    }

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' })
    assert.ok(typeof token === 'string' && token.length > 20, 'El token debe ser un string JWT no vacío')

    const decoded = jwt.verify(token, config.jwtSecret) as any
    assert.strictEqual(decoded.usuarioId, 101)
    assert.strictEqual(decoded.email, 'integrante1@test.com')
    assert.strictEqual(decoded.role, 'ADMIN')
    assert.strictEqual(decoded.perfil, 'admin')
    assert.ok(decoded.exp > decoded.iat, 'La fecha de expiración debe ser posterior a la de emisión')
  })

  test('1.3 Debería rechazar tokens firmados con una clave secreta incorrecta o manipulados', () => {
    const payload = { usuarioId: 102, role: 'BUROCRATA' }
    const fakeSecret = 'clave_falsa_no_autorizada'
    const tokenInvalido = jwt.sign(payload, fakeSecret, { expiresIn: '1h' })

    assert.throws(
      () => {
        jwt.verify(tokenInvalido, config.jwtSecret)
      },
      (err: any) => {
        return err.name === 'JsonWebTokenError'
      },
      'Debe lanzar error JsonWebTokenError al verificar con clave incorrecta'
    )
  })

  test('1.4 Debería rechazar strings que no correspondan a un JWT válido', () => {
    const malformedTokens = ['', 'token.invalido', '12345', 'Bearer xyz']

    for (const malformed of malformedTokens) {
      assert.throws(
        () => {
          jwt.verify(malformed, config.jwtSecret)
        },
        /jwt malformed|jwt must be provided/,
        `El token malformado "${malformed}" debe ser rechazado`
      )
    }
  })
})
