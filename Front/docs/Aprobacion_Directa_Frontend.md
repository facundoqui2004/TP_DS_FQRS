# 🖥️ Supergestor - Frontend: Aprobación Directa y Requisitos Técnicos

Documentación técnica y registro de implementación de los requerimientos de Frontend para la aprobación directa / examen del proyecto **Supergestor** (Desarrollo de Software).

---

## 📋 Resumen de Requerimientos Cumplidos

| Requerimiento | Archivos Clave | Estado | Descripción |
| :--- | :--- | :--- | :--- |
| **Test Unitario de Componente** | `src/__tests__/LoginPage.test.jsx`<br>`src/__tests__/ProtectedRoute.test.jsx` | ✅ Cumplido (100%) | Pruebas unitarias sobre componentes clave con React Testing Library y Vitest (renderizado, validación de inputs, alternancia de visibilidad de password, disparo de handlers y control de acceso). |
| **Test de End-to-End (E2E)** | `src/__tests__/e2e_frontend_flow.test.jsx` | ✅ Cumplido (100%) | Simulación integral del flujo de usuario: Bloqueo de ruta no autenticada $\rightarrow$ Redirección a Login $\rightarrow$ Ingreso de credenciales $\rightarrow$ Autenticación API con JWT $\rightarrow$ Redirección por rol a Dashboard $\rightarrow$ Logout. |
| **Login y Protección de Rutas (RBAC)** | `src/components/ProtectedRoute.jsx`<br>`src/context/AuthContext.jsx`<br>`src/App.jsx` | ✅ Cumplido (100%) | Protección de rutas según roles del Backend (`ADMIN`, `BUROCRATA`, `METAHUMANO`). Redirección a `/login` si no está autenticado o a `/` si el rol es insuficiente. |
| **Definición de Ambientes** | `src/config/environment.js`<br>`.env`, `.env.development`<br>`.env.test`, `.env.production`<br>`.env.example` | ✅ Cumplido (100%) | Configuración centralizada de variables de entorno mediante Vite (`import.meta.env`) con tipado y helpers de detección de ambiente. |

---

## 🧪 1. Suite de Tests Automatizados del Frontend

Se configuró el entorno de testing con **Vitest + @testing-library/react + @testing-library/jest-dom + jsdom**:

### 1.1 Tests Unitarios de Componentes
* **`LoginPage.test.jsx`**:
  * Renderizado correcto de campos (Email, Contraseña, Botón "Iniciar Sesión").
  * Mensajes de error cuando se intenta enviar el formulario vacío.
  * Alternancia dinámica de tipo de input (`password` $\leftrightarrow$ `text`) con el botón de ojo.
  * Disparo del método `login` del contexto con los datos ingresados.
  * Renderizado condicional de mensajes de error devueltos por el servidor.
* **`ProtectedRoute.test.jsx`**:
  * Redirección a `/login` cuando `isAuthenticated: false`.
  * Redirección a `/` cuando el rol del usuario no está autorizado para la ruta.
  * Renderizado de componentes hijos cuando el usuario cuenta con el rol requerido (`ADMIN`, `BUROCRATA`, `METAHUMANO`).
  * Validación con arrays de múltiples roles permitidos.
* **`environment.test.js`**:
  * Validación de la URL base de API y métodos helpers de entorno (`isDevelopment`, `isProduction`, `isTest`).

### 1.2 Test End-to-End (E2E)
* **`e2e_frontend_flow.test.jsx`**:
  * Simula la experiencia completa de un usuario navegando por la Single Page Application (SPA):
    1. El usuario no autenticado intenta acceder a la ruta protegida `/admin`.
    2. El componente `ProtectedRoute` intercepta la solicitud y lo redirige a `/login`.
    3. El usuario completa los campos de correo y contraseña en el formulario y hace clic en "Iniciar Sesión".
    4. La API valida las credenciales y devuelve el usuario con rol `ADMIN` y token JWT.
    5. `AuthContext` actualiza el estado global, sincroniza `localStorage` y redirige reactivamente al panel de control de administración.
    6. Se renderiza la información del usuario en pantalla.
    7. Al presionar "Cerrar Sesión", la sesión se destruye localmente y en el servidor.

---

## 🔐 2. Login y Protección de Rutas por Niveles de Acceso

### 2.1 Componente `ProtectedRoute`
El componente normaliza y verifica los roles en base a los datos de sesión:

```jsx
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = [] }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const userRole = normalizeRole(user?.role);
    const allowedList = [
        ...(Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]),
        ...(requiredRole ? [requiredRole] : [])
    ].filter(Boolean).map(r => normalizeRole(r));

    if (allowedList.length > 0 && (!userRole || !allowedList.includes(userRole))) {
        return <Navigate to="/" replace />;
    }

    return children;
};
```

### 2.2 Blindaje de Rutas en `App.jsx`

| Sección de Rutas | Roles Permitidos | Comportamiento si no cumple |
| :--- | :--- | :--- |
| `/login`, `/register`, `/` | **Públicas** | Acceso libre para cualquier visitante |
| `/admin/*` (`/admin`, `/admin/usuarios`, `/admin/metahumanos`, `/admin/burocratas`, `/admin/tramites`, etc.) | **`ADMIN`** | Redirige a `/login` si no autenticado, a `/` si rol diferente |
| `/metahumano/*` (`/metahumano`, `/metahumano/tramites`, `/metahumano/carpetas`, `/metahumano/vigilar-mundo`, etc.) | **`METAHUMANO`**, **`ADMIN`** | Protegido para metahumanos registrados y administradores |
| `/burocrata/*` (`/burocrata`, `/burocrata/carpetas`, `/burocrata/carpeta/:id`, `/burocrata/noticias`, etc.) | **`BUROCRATA`**, **`ADMIN`** | Protegido para personal administrativo y administradores |

---

## ⚙️ 3. Configuración de Ambientes en Frontend (Vite)

Se implementó el módulo centralizado [`src/config/environment.js`](file:///home/quinio/Documentos/Proyecto%20Desarrollo/Front/src/config/environment.js) y se definieron los archivos de ambiente:

### Archivos de Entorno:
* `.env`: Variables por defecto.
* `.env.development`: Entorno de desarrollo local (`VITE_API_BASE=http://localhost:3000/api`).
* `.env.test`: Entorno de testing (`VITE_API_BASE=http://localhost:3001/api`).
* `.env.production`: Entorno para producción (`VITE_API_BASE=/api`).
* `.env.example`: Plantilla de configuración documentada.

### Cliente API Centralizado:
El cliente Axios [`src/api/client.js`](file:///home/quinio/Documentos/Proyecto%20Desarrollo/Front/src/api/client.js) consume automáticamente la URL base desde la configuración del ambiente y mantiene activada la opción `withCredentials: true` para el intercambio de cookies seguras con el Backend.

---

## 🚀 4. Comandos para Ejecutar el Frontend y los Tests

Todos los comandos se ejecutan dentro del directorio `Front/`:

```bash
cd "Documentos/Proyecto Desarrollo/Front"

# Ejecutar la suite completa de tests (Unitarios + E2E)
npm test

# Iniciar el servidor de desarrollo Vite
npm run dev

# Compilar para producción
npm run build
```

### Resultados de la Suite de Tests:
```
✓ src/__tests__/LoginPage.test.jsx (5 tests)
✓ src/__tests__/ProtectedRoute.test.jsx (4 tests)
✓ src/__tests__/environment.test.js (3 tests)
✓ src/__tests__/e2e_frontend_flow.test.jsx (1 test E2E completo)

Test Files  4 passed (4)
Tests       13 passed (13)
Duration    ~1.8 s
```
