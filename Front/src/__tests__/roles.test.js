import { describe, it, expect } from 'vitest'
import { normalizeRole } from '../utils/roles'

/**
 * =========================================================================
 * TEST DE NORMALIZACIÓN DE ROLES (Issue #51)
 * Objetivo: que mayúsculas, minúsculas y alias den siempre el mismo rol.
 * =========================================================================
 */
describe('normalizeRole', () => {
  it('acepta roles en mayúscula y en minúscula', () => {
    expect(normalizeRole('BUROCRATA')).toBe('BUROCRATA')
    expect(normalizeRole('burocrata')).toBe('BUROCRATA')
    expect(normalizeRole('admin')).toBe('ADMIN')
    expect(normalizeRole(' Metahumano ')).toBe('METAHUMANO')
  })

  it('traduce los alias cortos', () => {
    expect(normalizeRole('meta')).toBe('METAHUMANO')
    expect(normalizeRole('buro')).toBe('BUROCRATA')
  })

  it('devuelve en mayúsculas un rol desconocido y null si no hay rol', () => {
    expect(normalizeRole('invitado')).toBe('INVITADO')
    expect(normalizeRole(undefined)).toBe(null)
  })
})
