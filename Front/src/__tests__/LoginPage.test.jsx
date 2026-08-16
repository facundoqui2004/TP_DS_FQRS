import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../pages/general/LoginPage'
import { AuthContext } from '../context/AuthContext'

/**
 * =========================================================================
 * TEST UNITARIO DE COMPONENTE FRONTEND: LoginPage
 * Objetivo: Validar el renderizado de campos del formulario, validación de inputs,
 * alternancia de visibilidad de contraseñas y envío de credenciales al contexto.
 * =========================================================================
 */
describe('Componente LoginPage (Test Unitario de Componente)', () => {
  let mockLogin
  let mockGetHomeRouteByRole

  beforeEach(() => {
    mockLogin = vi.fn().mockResolvedValue({ success: true, data: { role: 'ADMIN' } })
    mockGetHomeRouteByRole = vi.fn().mockReturnValue('/admin')
  })

  const renderLoginPage = (authContextValue = {}) => {
    const defaultAuth = {
      isAuthenticated: false,
      user: null,
      login: mockLogin,
      getHomeRouteByRole: mockGetHomeRouteByRole,
      error: null,
      ...authContextValue
    }

    return render(
      <MemoryRouter>
        <AuthContext.Provider value={defaultAuth}>
          <LoginPage />
        </AuthContext.Provider>
      </MemoryRouter>
    )
  }

  it('1. Debería renderizar correctamente el título, inputs y botón de inicio de sesión', () => {
    renderLoginPage()

    // Encabezado
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument()

    // Inputs
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()

    // Botón de submit
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('2. Debería mostrar mensajes de error de validación cuando se envía el formulario vacío', async () => {
    renderLoginPage()

    const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/el correo electrónico es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument()
    })

    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('3. Debería alternar la visibilidad de la contraseña al presionar el botón de ojo', () => {
    renderLoginPage()

    const passwordInput = screen.getByLabelText(/contraseña/i)
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Botón de mostrar contraseña
    const toggleButtons = screen.getAllByRole('button')
    const toggleEye = toggleButtons.find(btn => btn.getAttribute('type') === 'button')

    if (toggleEye) {
      fireEvent.click(toggleEye)
      expect(passwordInput).toHaveAttribute('type', 'text')

      fireEvent.click(toggleEye)
      expect(passwordInput).toHaveAttribute('type', 'password')
    }
  })

  it('4. Debería llamar a la función login con los datos ingresados al enviar el formulario válido', async () => {
    renderLoginPage()

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i })

    fireEvent.change(emailInput, { target: { value: 'admin@supergestor.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'admin@supergestor.com',
        password: 'password123'
      })
    })
  })

  it('5. Debería mostrar mensaje de error si el contexto de autenticación contiene un error', () => {
    renderLoginPage({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' })

    expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument()
  })
})
