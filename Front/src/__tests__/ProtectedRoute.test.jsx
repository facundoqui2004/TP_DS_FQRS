import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import { AuthContext } from '../context/AuthContext'

/**
 * =========================================================================
 * TEST UNITARIO DE COMPONENTE FRONTEND: ProtectedRoute
 * Objetivo: Validar la protección y control de acceso en las rutas de la SPA,
 * garantizando redirección al login cuando no hay sesión o redirección al inicio
 * cuando el rol no cumple con las restricciones requeridas.
 * =========================================================================
 */
describe('Componente ProtectedRoute (Test Unitario de Control de Acceso Frontend)', () => {

  const renderWithRouter = (authValue, initialPath = '/admin-secret', allowedRoles = ['ADMIN']) => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthContext.Provider value={authValue}>
          <Routes>
            <Route path="/" element={<div>Página de Inicio Pública</div>} />
            <Route path="/login" element={<div>Página de Login</div>} />
            <Route
              path="/admin-secret"
              element={
                <ProtectedRoute allowedRoles={allowedRoles}>
                  <div>Contenido Secreto de Administración</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/burocrata-panel"
              element={
                <ProtectedRoute allowedRoles={['BUROCRATA', 'ADMIN']}>
                  <div>Panel de Gestión para Burócratas</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    )
  }

  it('1. Debería redirigir a /login cuando el usuario NO está autenticado', () => {
    const authState = {
      isAuthenticated: false,
      user: null
    }

    renderWithRouter(authState, '/admin-secret')

    expect(screen.getByText('Página de Login')).toBeInTheDocument()
    expect(screen.queryByText('Contenido Secreto de Administración')).not.toBeInTheDocument()
  })

  it('2. Debería redirigir a / cuando el usuario autenticado NO tiene el rol requerido', () => {
    const authState = {
      isAuthenticated: true,
      user: { id: 10, email: 'meta@test.com', role: 'METAHUMANO' }
    }

    renderWithRouter(authState, '/admin-secret', ['ADMIN'])

    // No tiene rol ADMIN -> debe redirigir al home "/"
    expect(screen.getByText('Página de Inicio Pública')).toBeInTheDocument()
    expect(screen.queryByText('Contenido Secreto de Administración')).not.toBeInTheDocument()
  })

  it('3. Debería permitir el acceso y renderizar los children cuando el usuario tiene el rol permitido', () => {
    const authState = {
      isAuthenticated: true,
      user: { id: 1, email: 'admin@supergestor.com', role: 'ADMIN' }
    }

    renderWithRouter(authState, '/admin-secret', ['ADMIN'])

    expect(screen.getByText('Contenido Secreto de Administración')).toBeInTheDocument()
  })

  it('4. Debería autorizar el acceso si el rol del usuario está en una lista con múltiples roles permitidos', () => {
    const authStateBuro = {
      isAuthenticated: true,
      user: { id: 5, email: 'buro@supergestor.com', role: 'BUROCRATA' }
    }

    renderWithRouter(authStateBuro, '/burocrata-panel')

    expect(screen.getByText('Panel de Gestión para Burócratas')).toBeInTheDocument()
  })
})
