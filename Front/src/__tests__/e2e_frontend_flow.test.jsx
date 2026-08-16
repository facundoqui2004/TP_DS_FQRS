import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import LoginPage from '../pages/general/LoginPage'
import * as authApi from '../api/auth'

/**
 * =========================================================================
 * TEST END-TO-END (E2E) DEL FRONTEND
 * Flujo completo: Intento de acceso no autenticado -> Redirección a Login ->
 * Ingreso de credenciales -> Autenticación exitosa -> Redirección a Dashboard
 * por Rol -> Navegación protegida -> Cierre de sesión (Logout).
 * =========================================================================
 */

// Componentes de prueba para el flujo E2E
const MockAdminHome = () => {
  const { user, logout } = useAuth()
  return (
    <div>
      <h1>Panel de Control de Administración</h1>
      <p>Bienvenido, {user?.email} (Rol: {user?.role})</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  )
}

const MockPublicHome = () => <div>Bienvenido a la Portada Pública de Supergestor</div>

const E2ETestApp = ({ initialEntry = '/admin' }) => {
  return (
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MockPublicHome />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <MockAdminHome />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('Test End-to-End (E2E) - Flujo Completo de Autenticación y Navegación Protegida', () => {

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('Flujo E2E Completo: Redirección por protección -> Login con credenciales -> Dashboard Admin -> Logout', async () => {
    // 1. Mock de la respuesta del servidor al hacer login
    const mockServerLoginResponse = {
      data: {
        message: 'Login exitoso',
        token: 'mock_jwt_token_for_testing',
        usuario: {
          id: 1,
          email: 'admin@supergestor.com',
          role: 'ADMIN',
          nombre: 'Super Admin'
        }
      }
    }

    vi.spyOn(authApi, 'loginRequest').mockResolvedValue(mockServerLoginResponse)
    vi.spyOn(authApi, 'logoutRequest').mockResolvedValue({ data: { message: 'Logout exitoso' } })

    // 2. Usuario no autenticado intenta ingresar directo a /admin
    render(<E2ETestApp initialEntry="/admin" />)

    // Debe ser interceptado y mostrar la pantalla de Iniciar Sesión
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument()

    // 3. Usuario completa el formulario de login
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i })

    fireEvent.change(emailInput, { target: { value: 'admin@supergestor.com' } })
    fireEvent.change(passwordInput, { target: { value: 'passwordSuper123' } })

    // 4. El usuario envía el formulario
    fireEvent.click(submitBtn)

    // 5. Esperar que la API responda y el contexto actualice el estado redirigiendo a /admin
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /panel de control de administración/i })).toBeInTheDocument()
    })

    expect(screen.getByText(/admin@supergestor.com/i)).toBeInTheDocument()
    expect(screen.getByText(/Rol: ADMIN/i)).toBeInTheDocument()

    // 6. Verificar que la sesión se sincronizó en localStorage
    const savedSession = JSON.parse(localStorage.getItem('user_info') || '{}')
    expect(savedSession.role).toBe('ADMIN')
    expect(savedSession.email).toBe('admin@supergestor.com')

    // 7. El usuario hace clic en "Cerrar Sesión"
    const logoutBtn = screen.getByRole('button', { name: /cerrar sesión/i })
    fireEvent.click(logoutBtn)

    // 8. El estado de sesión se destruye en el frontend
    await waitFor(() => {
      expect(localStorage.getItem('user_info')).toBeNull()
    })
  })
})
