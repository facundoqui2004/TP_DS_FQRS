# El Super Gestor - Sistema de Gestion de Metahumanos

Trabajo Practico para la catedra de Desarrollo de Software / Programacion Web.

Este proyecto cuenta con un entorno contenerizado completo mediante Docker y Docker Compose para permitir su evaluacion y ejecucion con un unico comando, sin requerir la instalacion manual de dependencias ni configuraciones locales de base de datos.

---

## Videos Explicativos

Los videos de explicacion de la pagina se encuentran en el siguiente enlace: (Recomendado si busca verlo en mejor calidad)

**[Ver videos en Google Drive](https://drive.google.com/drive/folders/15m0pv096UL4-odjoIXvw6AN-_cbcTaE_?usp=sharing)**

---
## Video 1 - Funcionamiento del supergestor


https://github.com/user-attachments/assets/6310ebf8-d34a-4ec5-92a7-798e44d58cd9

## Video 2 - Funcionamiento del supergestor



https://github.com/user-attachments/assets/f0cffe15-b4c2-4caa-9f7a-e326faff94bc



## Inicio Rapido con Docker


https://github.com/user-attachments/assets/d41d65d5-b7db-4e69-8f81-4145fca0a67d



### Requisitos previos
- Tener instalado [Docker](https://www.docker.com/) y Docker Compose.

### 1. Levantar el proyecto
En el directorio raiz del repositorio, ejecute:

```bash
docker compose up --build -d
```

> **Nota:** Al iniciar por primera vez, el backend ejecuta la sincronizacion del esquema de datos con la base de datos (MikroORM) e inserta automaticamente los datos y usuarios iniciales de prueba.

### 2. Detener los servicios
Para apagar los contenedores:

```bash
docker compose down
```

Para apagar los contenedores y remover los volumenes de datos persistidos:

```bash
docker compose down -v
```

---

## URLs de Acceso y Servicios

| Servicio | URL / Host | Puerto | Descripcion |
| :--- | :--- | :--- | :--- |
| **Frontend** | [http://localhost:5173](http://localhost:5173) | `5173` | Aplicacion SPA (React + Vite + TailwindCSS) |
| **Backend API** | [http://localhost:3000](http://localhost:3000) | `3000` | API REST (Node.js + Express + TypeScript) |
| **Adminer** | [http://localhost:8080](http://localhost:8080) | `8080` | Interfaz web para visualizar y gestionar la Base de Datos |
| **MySQL DB** | `localhost:3309` | `3309` | Servidor MySQL 8.0 (conexion desde clientes externos) |

---

## Credenciales de Acceso

### Usuarios de Prueba (Plataforma Web)

Todos los usuarios de prueba han sido precargados con la contraseña: **`123456`**

| Rol | Correo Electronico | Contraseña | Perfil / Nombre | Descripcion |
| :--- | :--- | :--- | :--- | :--- |
| **Administrador** | `admin@tp.com` | `123456` | Administrador | Acceso total al panel de administracion |
| **Burocrata** | `burocrata@tp.com` | `123456` | Burocrata Central (*Inspector DSW*) | Gestion de tramites, multas y expedientes |
| **Metahumano (Heroe)** | `heroe@tp.com` | `123456` | Clark Kent (*Superman*) | Perfil de heroe con poderes, misiones y tramites |
| **Metahumano (Villano)** | `villano@tp.com` | `123456` | Lex Luthor (*Lex*) | Perfil de villano con nivel de peligrosidad y multas |

---

### Credenciales de Base de Datos y Adminer

Para ingresar a **Adminer** en [http://localhost:8080](http://localhost:8080):

- **Sistema:** `MySQL`
- **Servidor:** `mysql`
- **Usuario:** `dsw` (o `root`)
- **Contraseña:** `dsw` (o `root`)
- **Base de datos:** `metahumano`

---

## Estructura del Repositorio

```text
.
├── docker-compose.yml       # Orquestacion de MySQL, Adminer, Backend y Frontend
├── README.md                # Instrucciones de instalacion y uso
├── ENTREGA.md               # Guia formal para la correccion del docente
├── Backend/                 # Servidor de API REST
│   ├── src/                 # Codigo fuente TypeScript
│   │   ├── auth/            # Modulo de Autenticacion y Usuarios
│   │   ├── shared/db/       # Configuracion MikroORM y Seeder
│   │   └── ...              # Entidades y controladores de dominio
│   └── package.json
└── Front/                   # Cliente Web SPA
    ├── src/                 # Componentes React, Paginas y Rutas
    ├── vite.config.js       # Configuracion de Vite
    └── package.json
```

---

## Comandos Utiles

- **Ver logs en tiempo real:**
  ```bash
  docker compose logs -f
  ```
- **Ver logs unicamente del backend:**
  ```bash
  docker compose logs -f backend
  ```
- **Reiniciar contenedores:**
  ```bash
  docker compose restart
  ```

---

## Ejecucion de Tests

### Backend con Docker

```bash
docker exec -it metahumano-backend npm test
docker exec -it metahumano-backend npm run test:1
docker exec -it metahumano-backend npm run test:2
docker exec -it metahumano-backend npm run test:3
docker exec -it metahumano-backend npm run test:4
docker exec -it metahumano-backend npm run test:app
docker exec -it metahumano-backend npm run test:api
```

### Frontend con Docker

```bash
docker exec -it metahumano-frontend npm test
docker exec -it metahumano-frontend npx vitest run src/__tests__/LoginPage.test.jsx
docker exec -it metahumano-frontend npx vitest run src/__tests__/ProtectedRoute.test.jsx
docker exec -it metahumano-frontend npx vitest run src/__tests__/e2e_frontend_flow.test.jsx
docker exec -it metahumano-frontend npx vitest run src/__tests__/environment.test.js
```

### Backend en Local (sin Docker)

```bash
npm --prefix Backend test
npm --prefix Backend run test:1
npm --prefix Backend run test:2
npm --prefix Backend run test:3
npm --prefix Backend run test:4
npm --prefix Backend run test:app
npm --prefix Backend run test:api
```

### Frontend en Local (sin Docker)

```bash
npm --prefix Front test
npm --prefix Front run test:watch
```

# **Recomendaciones para Windows**

Si vas a ejecutar las pruebas test en un entorno Windows, asegúrate de cumplir con los siguientes pasos previos:

1. **Instalar Docker Desktop**: Es indispensable contar con [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución antes de lanzar las suites de prueba.
2. **Habilitar permisos de ejecución de scripts**: Por defecto, Windows restringe la ejecución de scripts en PowerShell. Para permitirlo en tu usuario actual sin requerir privilegios globales de sistema, abre **PowerShell** y ejecuta:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

```

3. **Ejecutar los comandos recomendados**: Para probar dentro de este contexto se recomienda usar los comandos que empiezan con :

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
docker exec -it contener-correspondiente-a-el-test-a-realizar 
```
Luego se puede seguir la estructura como se plantea en la sección de arriba
