import { describe, it, expect } from 'vitest'
import { config } from '../config/environment'

/**
 * =========================================================================
 * TEST DE CONFIGURACIÓN DE AMBIENTES FRONTEND
 * Objetivo: Validar la configuración centralizada de URLs base de API,
 * títulos y métodos helper de detección de ambiente.
 * =========================================================================
 */
describe('Configuración de Ambientes Frontend (Vite / .env)', () => {

  it('1. Debería exponer la URL base de API configurada', () => {
    expect(config.apiBaseUrl).toBeDefined()
    expect(typeof config.apiBaseUrl).toBe('string')
    expect(config.apiBaseUrl.length).toBeGreaterThan(0)
  })

  it('2. Debería exponer el título de la aplicación y ambiente', () => {
    expect(config.appTitle).toBeDefined()
    expect(typeof config.appTitle).toBe('string')
    expect(config.env).toBeDefined()
  })

  it('3. Debería proveer métodos helpers de ambiente booleanos', () => {
    expect(typeof config.isProduction).toBe('function')
    expect(typeof config.isDevelopment).toBe('function')
    expect(typeof config.isTest).toBe('function')

    expect(typeof config.isTest()).toBe('boolean')
  })
})
