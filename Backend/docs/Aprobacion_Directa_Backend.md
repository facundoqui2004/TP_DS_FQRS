# 🛡️ Supergestor - Backend: Aprobación Directa y Requisitos Técnicos

Documentación técnica y registro de implementación de los requerimientos de backend para la aprobación directa / examen del proyecto **Supergestor** (Desarrollo de Software).

---

## 👥 Resumen del Equipo (4 Integrantes) y Asignación de Tests

Para cumplir con el requerimiento de **1 test automatizado por integrante** más el **test de integración general**, se organizó la suite de testing en 5 archivos modulares bajo `src/__tests__/`:

| Integrante | Módulo / Responsabilidad | Archivo de Test | Tipo de Test | Casos de Prueba Implementados |
| :--- | :--- | :--- | :--- | :--- |
| **Integrante 1** | Autenticación, Hashing y Criptografía JWT | `src/__tests__/integrante1_auth.test.ts` | Unitario / Funcional | • Hashing seguro con Bcrypt (salt rounds 10)<br>• Validación de coincidencia de password<br>• Emisión y verificación de tokens JWT<br>• Detección y rechazo de tokens manipulados/inválidos |
| **Integrante 2** | Control de Acceso por Roles (RBAC) y Middlewares | `src/__tests__/integrante2_roles_middleware.test.ts` | Unitario / Middleware | • `requireAuth` (401 si falta token)<br>• Soporte de token vía Cookie `auth_token` y Header `Bearer`<br>• `requireRoles` (403 si el rol no tiene permisos)<br>• Autorización exitosa para roles permitidos (ADMIN, BUROCRATA) |
| **Integrante 3** | Reglas de Dominio e Integridad de Entidades | `src/__tests__/integrante3_domain_rules.test.ts` | Unitario / Dominio | • Instanciación de `Usuario` y valores por defecto<br>• Incompatibilidad de perfiles múltiples (Metahumano + Burócrata)<br>• Consistencia estricta entre `UserRole` y entidad asociada<br>• Validación previa a persistencia (`validateRoleConsistency`) |
| **Integrante 4** | Gestión de Ambientes y Variables de Entorno | `src/__tests__/integrante4_environment.test.ts` | Unitario / Config | • Carga tipada de configuración según `NODE_ENV`<br>• Mapeo seguro de parámetros de Base de Datos MySQL<br>• Métodos helpers `isProduction()`, `isDevelopment()`, `isTest()`<br>• Fallbacks y valores por defecto seguros para JWT y puertos |
| **Equipo (Todos)** | **Test de Integración End-to-End** (API HTTP) | `src/__tests__/integracion_api.test.ts` | Integración (Supertest) | • Flujo E2E completo: Solicitud no autenticada (401)<br>• Acceso a perfil con JWT válido (200)<br>• Control de permisos denegado a Metahumano en ruta Admin (403)<br>• Acceso concedido a Administrador en `/api/auth/admin/usuarios` (200)<br>• Ciclo de Logout con limpieza de cookies (200)<br>• Manejo de rutas inexistentes (404) |

---

## 🔐 1. Autenticación y Niveles de Acceso Implementados

El sistema cuenta con un esquema de autenticación propio robusto basado en **JSON Web Tokens (JWT)** y hashing con **Bcrypt**:

### Niveles de Acceso / Roles:
1. **`ADMIN`** (Administrador General): Acceso total al sistema, gestión de usuarios, eliminación de registros, configuración administrativa.
2. **`BUROCRATA`** (Personal Administrativo): Gestión de expedientes/carpetas, emisión y control de multas, publicación de noticias, vinculación de evidencias.
3. **`METAHUMANO`** (Usuario Final):
   - Subtipo **`HEROE`**: Solicitud de enemigos, consulta de estilo de vida y ranking.
   - Subtipo **`VILLANO`**: Trámites de rehabilitación, solicitud de permisos de destrucción, respuesta a solicitudes de enemigos.

### Métodos de Envío de Credenciales Soportados:
- **HttpOnly Cookie** (`auth_token`): Para máxima seguridad contra ataques XSS en navegadores web.
- **Authorization Header** (`Bearer <token>`): Para clientes móviles, APIs REST, pruebas automatizadas y herramientas como Postman.

---

## 🛡️ 2. Matriz de Protección de Rutas (RBAC)

Todas las rutas críticas están blindadas mediante los middlewares `requireAuth` y `requireRoles`:

| Endpoint | Método | Roles Permitidos | Middleware Aplicado | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Público | - | Inicio de sesión y entrega de JWT |
| `/api/auth/register/*` | `POST` | Público | - | Registro de Metahumanos, Burócratas y Administradores |
| `/api/auth/perfil` | `GET` | Autenticado | `requireAuth` | Consulta de datos y perfil del usuario en sesión |
| `/api/auth/contacto` | `PUT` | Autenticado | `requireAuth` | Actualización de email y teléfono del usuario |
| `/api/auth/admin/usuarios` | `GET` | `ADMIN` | `requireAuth`, `requireRoles(['ADMIN'])` | Listado y administración de todos los usuarios |
| `/api/auth/admin/usuarios/:id` | `DELETE` | `ADMIN` | `requireAuth`, `requireRoles(['ADMIN'])` | Eliminación de cuentas de usuario |
| `/api/carpetas` | `GET` | `BUROCRATA`, `ADMIN`, `METAHUMANO` | `requireAuth` | Consulta de carpetas/expedientes |
| `/api/carpetas` | `POST` | `BUROCRATA`, `ADMIN` | `requireAuth`, `requireRoles(['BUROCRATA', 'ADMIN'])` | Creación y vinculación de expedientes |
| `/api/carpetas/:id/estado` | `PATCH` | `BUROCRATA`, `ADMIN` | `requireAuth`, `requireRoles(['BUROCRATA', 'ADMIN'])` | Aprobación/Rechazo de expedientes y trámites |
| `/api/multas` | `GET`, `POST`, `PUT` | `BUROCRATA`, `ADMIN` | `requireAuth`, `requireRoles(['BUROCRATA', 'ADMIN'])` | Gestión de multas e infracciones |
| `/api/multas/:id/pagar` | `POST` | Autenticado | `requireAuth` | Procesamiento y pago de multas |
| `/api/evidencias` | `POST`, `PUT`, `PATCH` | `BUROCRATA`, `ADMIN` | `requireAuth`, `requireRoles(['BUROCRATA', 'ADMIN'])` | Registro y edición de evidencias |
| `/api/villanos/tramite-rehabilitacion` | `POST` | `VILLANO` | `requireAuth`, `requireRoles(['VILLANO'])` | Inicio de expediente de rehabilitación |
| `/api/villanos/permisos-destruccion` | `POST` | `VILLANO` | `requireAuth`, `requireRoles(['VILLANO'])` | Solicitud de autorización de destrucción |
| `/api/heroes/solicitud-enemigos` | `POST` | `HEROE` | `requireAuth`, `requireRoles(['HEROE'])` | Solicitud de rival metahumano |
| `/api/noticias` | `POST`, `PUT`, `PATCH` | `BUROCRATA`, `ADMIN` | `requireAuth`, `requireRoles(['BUROCRATA', 'ADMIN'])` | Publicación y edición de comunicados |

---

## ⚙️ 3. Definición y Gestión de Ambientes (.env / Config Centralizada)

Se implementó el módulo centralizado [`src/config/environment.ts`](file:///home/quinio/Documentos/Proyecto%20Desarrollo/Backend/src/config/environment.ts) que gestiona la configuración de la aplicación de manera tipada:

### Archivos de Entorno Soportados:
- `.env`: Variables base locales.
- `.env.development`: Entorno de desarrollo local con logs detallados.
- `.env.test`: Entorno de pruebas automatizadas con claves de testeo y aislamiento.
- `.env.production`: Entorno productivo con cookies `Secure` y `SameSite=Strict`.
- `.env.example`: Plantilla documentada para nuevos despliegues.

### Variables Principales:
```bash
# Ambiente
NODE_ENV=development # development | test | production
PORT=3000
FRONTEND_URL=http://localhost:5173

# Seguridad
JWT_SECRET=supergestor_secret_key_jwt_token_2026
JWT_EXPIRES_IN=24h

# Base de Datos MySQL
DB_HOST=127.0.0.1
DB_PORT=3309
DB_NAME=metahumano
DB_USER=dsw
DB_PASSWORD=dsw
```

---

## 🧪 4. Ejecución de Tests y Verificación

Para ejecutar la suite completa de tests automatizados:

```bash
cd "Documentos/Proyecto Desarrollo/Backend"

# Ejecutar todos los tests (Compilación + Tests Unitarios + Test de Integración)
npm test
```

### Resultados de la Ejecución:
- **Total de Tests**: **25 pruebas superadas exitosamente (100% pass)**.
- **Suites Ejecutadas**: **6 suites** (4 de integrantes + 1 integración + 1 arquitectura base).
- **Tiempo de Ejecución**: **~880 ms**.

---

## 🚀 Comandos Rápidos del Backend

```bash
# Iniciar base de datos MySQL en Docker
cd "Documentos/Proyecto Desarrollo/Backend"
npm run docker:dev

# Iniciar servidor backend en modo desarrollo
npm run dev

# Ejecutar suite de pruebas
npm test
```
