import { test, describe } from 'node:test'
import assert from 'node:assert'
import { Usuario, UserRole } from '../auth/usuario.entity.js'

/**
 * =========================================================================
 * TEST AUTOMATIZADO - INTEGRANTE 3
 * Responsable: Integrante 3 (Lógica de Dominio y Validación de Entidades)
 * Objetivo: Validar la integridad de los modelos de dominio, asegurando
 * que las reglas de negocio (incompatibilidad de perfiles múltiples, consistencia
 * entre rol y perfil asignado) se cumplan estrictamente antes de persistir.
 * =========================================================================
 */
describe('Integrante 3 - Reglas de Negocio e Integridad del Modelo de Dominio', () => {

  test('3.1 Debería instanciar correctamente un Usuario con valores válidos y valores por defecto', () => {
    const user = new Usuario()
    user.email = 'admin@supergestor.com'
    user.telefono = '+543411234567'
    user.passwordHash = '$2b$10$hashedpasswordstring'
    user.role = UserRole.ADMIN

    assert.strictEqual(user.email, 'admin@supergestor.com')
    assert.strictEqual(user.role, UserRole.ADMIN)
    assert.strictEqual(user.verificado, false)
    assert.ok(user.createdAt instanceof Date)
    assert.ok(user.updatedAt instanceof Date)
  })

  test('3.2 Debería lanzar error si un usuario intenta tener perfiles de Metahumano y Burócrata a la vez', () => {
    const user = new Usuario()
    user.email = 'doble_perfil@supergestor.com'
    user.role = UserRole.METAHUMANO
    user.metahumano = { id: 1 } as any
    user.burocrata = { id: 2 } as any

    assert.throws(
      () => {
        user.validateRoleConsistency()
      },
      /Un usuario no puede tener ambos perfiles/,
      'Debe impedir que un usuario tenga ambos perfiles simultáneamente'
    )
  })

  test('3.3 Debería lanzar error si el rol es METAHUMANO pero se le asigna perfil de burocrata', () => {
    const user = new Usuario()
    user.email = 'inconsistente1@supergestor.com'
    user.role = UserRole.METAHUMANO
    user.burocrata = { id: 5 } as any

    assert.throws(
      () => {
        user.validateRoleConsistency()
      },
      /Usuario con role METAHUMANO no puede tener perfil de burocrata/,
      'Debe validar consistencia de rol METAHUMANO'
    )
  })

  test('3.4 Debería lanzar error si el rol es BUROCRATA pero se le asigna perfil de metahumano', () => {
    const user = new Usuario()
    user.email = 'inconsistente2@supergestor.com'
    user.role = UserRole.BUROCRATA
    user.metahumano = { id: 8 } as any

    assert.throws(
      () => {
        user.validateRoleConsistency()
      },
      /Usuario con role BUROCRATA no puede tener perfil de metahumano/,
      'Debe validar consistencia de rol BUROCRATA'
    )
  })

  test('3.5 Debería pasar la validación sin errores cuando el perfil coincide con el rol asignado', () => {
    const metahumanoUser = new Usuario()
    metahumanoUser.role = UserRole.METAHUMANO
    metahumanoUser.metahumano = { id: 10 } as any

    // No debe arrojar ninguna excepción
    assert.doesNotThrow(() => {
      metahumanoUser.validateRoleConsistency()
    })

    const burocrataUser = new Usuario()
    burocrataUser.role = UserRole.BUROCRATA
    burocrataUser.burocrata = { id: 12 } as any

    assert.doesNotThrow(() => {
      burocrataUser.validateRoleConsistency()
    })

    const adminUser = new Usuario()
    adminUser.role = UserRole.ADMIN

    assert.doesNotThrow(() => {
      adminUser.validateRoleConsistency()
    })
  })
})
