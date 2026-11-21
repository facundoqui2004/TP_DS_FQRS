import { describe, it, expect } from 'vitest'
import { escapeHtml } from '../utils/escapeHtml'

/**
 * =========================================================================
 * TEST DE ESCAPE DE HTML (Issue #48 - XSS en popups de Leaflet)
 * Objetivo: que un alias o descripción con HTML se muestre como texto.
 * =========================================================================
 */
describe('escapeHtml', () => {
  it('convierte una etiqueta con handler en texto inofensivo', () => {
    const alias = '<img src=x onerror="alert(1)">'
    expect(escapeHtml(alias)).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;')
  })

  it('escapa & y comillas simples', () => {
    expect(escapeHtml("Tom & Jerry's")).toBe('Tom &amp; Jerry&#39;s')
  })

  it('devuelve string vacío para null o undefined y acepta números', () => {
    expect(escapeHtml(null)).toBe('')
    expect(escapeHtml(undefined)).toBe('')
    expect(escapeHtml(500)).toBe('500')
  })
})
