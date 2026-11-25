import { describe, test } from 'node:test'
import assert from 'node:assert'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { EntityManager } from '@mikro-orm/core'
import { AuthServiceError, UsuarioService } from '../auth/usuario.service.js'
import { Usuario, UserRole } from '../auth/usuario.entity.js'
import { Metahumano } from '../metahumano/metahumano.entity.js'
import { Burocrata } from '../Burocratas/Burocrata.entity.js'
import { config } from '../config/environment.js'

interface FakeEmOptions {
  existingUser?: Usuario | null
}

function createFakeEm(options: FakeEmOptions = {}) {
  const persisted: unknown[] = []
  let transactionalCalls = 0
  let nextId = 1

  const txEm = {
    async findOne(_entity: unknown, where: { email?: string }) {
      if (options.existingUser && options.existingUser.email === where.email) {
        return options.existingUser
      }
      return null
    },
    async persistAndFlush(entityOrEntities: unknown) {
      const list = Array.isArray(entityOrEntities) ? entityOrEntities : [entityOrEntities]
      for (const item of list) {
        if (item && typeof item === 'object' && !('id' in item && (item as any).id)) {
          ;(item as any).id = nextId++
        }
        persisted.push(item)
      }
    },
  }

  const em = {
    async transactional<T>(cb: (em: any) => Promise<T>): Promise<T> {
      transactionalCalls++
      return await cb(txEm)
    },
  } as unknown as EntityManager

  return {
    em,
    persisted,
    getTransactionalCalls: () => transactionalCalls,
  }
}

describe('UsuarioService - Registro unificado y transaccional', () => {
  test('registra un usuario BASICO sin perfil ni token, con contraseña hasheada', async () => {
    const fake = createFakeEm()
    const service = new UsuarioService(fake.em)

    const result = await service.registrarUsuario({
      tipo: 'BASICO',
      email: 'basico@test.com',
      telefono: '123456789',
      password: 'Password123',
      role: UserRole.METAHUMANO,
    })

    assert.strictEqual(fake.getTransactionalCalls(), 1)
    assert.strictEqual(fake.persisted.length, 1)
    assert.ok(result.usuario instanceof Usuario)
    assert.strictEqual(result.usuario.email, 'basico@test.com')
    assert.strictEqual(result.usuario.role, UserRole.METAHUMANO)
    assert.strictEqual(result.usuario.verificado, false)
    assert.strictEqual(result.metahumano, undefined)
    assert.strictEqual(result.burocrata, undefined)
    assert.strictEqual(result.token, undefined)
    assert.strictEqual(await bcrypt.compare('Password123', result.usuario.passwordHash), true)
  })

  test('rechaza registrar rol ADMIN desde flujo BASICO con 403', async () => {
    const fake = createFakeEm()
    const service = new UsuarioService(fake.em)

    await assert.rejects(
      () =>
        service.registrarUsuario({
          tipo: 'BASICO',
          email: 'admin-basic@test.com',
          telefono: '123456789',
          password: 'Password123',
          role: UserRole.ADMIN,
        }),
      (err: unknown) =>
        err instanceof AuthServiceError &&
        err.statusCode === 403 &&
        err.message.includes('ADMIN')
    )
    assert.strictEqual(fake.getTransactionalCalls(), 0)
  })

  test('registra un METAHUMANO con perfil vinculado y token JWT válido', async () => {
    const fake = createFakeEm()
    const service = new UsuarioService(fake.em)

    const result = await service.registrarUsuario({
      tipo: 'METAHUMANO',
      email: 'meta@test.com',
      telefono: '555111222',
      password: 'Password123',
      nombre: 'Clark Kent',
      alias: 'Superman',
      origen: 'Krypton',
    })

    assert.strictEqual(fake.getTransactionalCalls(), 1)
    assert.strictEqual(fake.persisted.length, 2)
    assert.ok(result.usuario instanceof Usuario)
    assert.ok(result.metahumano instanceof Metahumano)
    assert.strictEqual(result.usuario.role, UserRole.METAHUMANO)
    assert.strictEqual(result.usuario.verificado, false)
    assert.strictEqual(result.usuario.metahumano, result.metahumano)
    assert.strictEqual(result.metahumano.usuario, result.usuario)
    assert.strictEqual(result.metahumano.alias, 'Superman')
    assert.strictEqual(await bcrypt.compare('Password123', result.usuario.passwordHash), true)

    assert.ok(result.token)
    const decoded = jwt.verify(result.token!, config.jwtSecret) as any
    assert.strictEqual(decoded.usuarioId, result.usuario.id)
    assert.strictEqual(decoded.email, 'meta@test.com')
    assert.strictEqual(decoded.role, UserRole.METAHUMANO)
    assert.strictEqual(decoded.perfilId, result.metahumano.id)
    assert.strictEqual(decoded.perfil, 'metahumano')
    assert.deepStrictEqual(result.userInfo, {
      id: result.usuario.id,
      role: UserRole.METAHUMANO,
      perfil: 'metahumano',
      perfilId: result.metahumano.id,
      alias: 'Superman',
    })
  })

  test('registra un BUROCRATA con perfil vinculado y token JWT válido', async () => {
    const fake = createFakeEm()
    const service = new UsuarioService(fake.em)

    const result = await service.registrarUsuario({
      tipo: 'BUROCRATA',
      email: 'buro@test.com',
      telefono: '555333444',
      password: 'Password123',
      nombre: 'Amanda Waller',
      alias: 'The Wall',
      origen: 'ARGUS',
    })

    assert.strictEqual(fake.getTransactionalCalls(), 1)
    assert.strictEqual(fake.persisted.length, 2)
    assert.ok(result.usuario instanceof Usuario)
    assert.ok(result.burocrata instanceof Burocrata)
    assert.strictEqual(result.usuario.role, UserRole.BUROCRATA)
    assert.strictEqual(result.usuario.verificado, false)
    assert.strictEqual(result.usuario.burocrata, result.burocrata)
    assert.strictEqual(result.burocrata.usuario, result.usuario)
    assert.strictEqual(result.burocrata.alias, 'The Wall')
    assert.strictEqual(await bcrypt.compare('Password123', result.usuario.passwordHash), true)

    assert.ok(result.token)
    const decoded = jwt.verify(result.token!, config.jwtSecret) as any
    assert.strictEqual(decoded.usuarioId, result.usuario.id)
    assert.strictEqual(decoded.email, 'buro@test.com')
    assert.strictEqual(decoded.role, UserRole.BUROCRATA)
    assert.strictEqual(decoded.perfilId, result.burocrata.id)
    assert.strictEqual(decoded.perfil, 'burocrata')
    assert.deepStrictEqual(result.userInfo, {
      id: result.usuario.id,
      role: UserRole.BUROCRATA,
      perfil: 'burocrata',
      perfilId: result.burocrata.id,
      alias: 'The Wall',
    })
  })

  test('registra un ADMIN verificado sin perfil y emite token JWT válido', async () => {
    const fake = createFakeEm()
    const service = new UsuarioService(fake.em)

    const result = await service.registrarUsuario({
      tipo: 'ADMIN',
      email: 'admin@test.com',
      telefono: '555999000',
      password: 'Password123',
      nombre: 'Nick Fury',
    })

    assert.strictEqual(fake.getTransactionalCalls(), 1)
    assert.strictEqual(fake.persisted.length, 1)
    assert.ok(result.usuario instanceof Usuario)
    assert.strictEqual(result.usuario.role, UserRole.ADMIN)
    assert.strictEqual(result.usuario.verificado, true)
    assert.strictEqual(result.metahumano, undefined)
    assert.strictEqual(result.burocrata, undefined)
    assert.strictEqual(await bcrypt.compare('Password123', result.usuario.passwordHash), true)

    assert.ok(result.token)
    const decoded = jwt.verify(result.token!, config.jwtSecret) as any
    assert.strictEqual(decoded.usuarioId, result.usuario.id)
    assert.strictEqual(decoded.email, 'admin@test.com')
    assert.strictEqual(decoded.role, UserRole.ADMIN)
    assert.strictEqual(decoded.nombre, 'Nick Fury')
    assert.deepStrictEqual(result.userInfo, {
      id: result.usuario.id,
      role: UserRole.ADMIN,
      nombre: 'Nick Fury',
      email: 'admin@test.com',
    })
  })

  test('rechaza contraseñas menores a 8 caracteres y campos faltantes', async () => {
    const fake = createFakeEm()
    const service = new UsuarioService(fake.em)

    await assert.rejects(
      () =>
        service.registrarUsuario({
          tipo: 'METAHUMANO',
          email: 'short@test.com',
          telefono: '123456',
          password: 'short',
          nombre: 'Bruce',
          alias: 'Batman',
          origen: 'Gotham',
        }),
      (err: unknown) => err instanceof AuthServiceError && err.statusCode === 400
    )

    await assert.rejects(
      () =>
        service.registrarUsuario({
          tipo: 'ADMIN',
          email: 'missing@test.com',
          telefono: '123456',
          password: 'Password123',
        }),
      (err: unknown) => err instanceof AuthServiceError && err.statusCode === 400
    )
    assert.strictEqual(fake.getTransactionalCalls(), 0)
  })

  test('rechaza email duplicado dentro de la transacción sin persistir', async () => {
    const existingUser = new Usuario()
    existingUser.email = 'duplicado@test.com'

    const fake = createFakeEm({ existingUser })
    const service = new UsuarioService(fake.em)

    await assert.rejects(
      () =>
        service.registrarUsuario({
          tipo: 'BUROCRATA',
          email: 'duplicado@test.com',
          telefono: '555000111',
          password: 'Password123',
          nombre: 'Juan',
          alias: 'Jefe',
          origen: 'Ministerio',
        }),
      (err: unknown) =>
        err instanceof AuthServiceError &&
        err.statusCode === 400 &&
        err.message === 'Ya existe un usuario con este email'
    )
    assert.strictEqual(fake.persisted.length, 0)
  })
})
