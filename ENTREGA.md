# Guia de Entrega y Evaluacion - Trabajo Practico DSW

**Catedra:** Desarrollo de Software / Programacion Web  
**Proyecto:** El Super Gestor - Sistema de Gestion Metahumana  

### Integrantes del Grupo
* **52875** - Quiñonez, Facundo
* **53251** - Ferrari, Enzo
* **52322** - Ruiz, Ignacio
* **53021** - Szalich, Tomás

**Repositorio:** [https://github.com/facundoqui2004/TP_DS_FQRS.git](https://github.com/facundoqui2004/TP_DS_FQRS.git)

---

## Estimado/a Profesor/a:

Para facilitar la correccion y evaluacion de nuestro Trabajo Practico, se ha preparado la totalidad del ecosistema del proyecto (Frontend, Backend, Base de Datos MySQL y Gestor Visual Adminer) debidamente estructurado en contenedores Docker.

No se requiere la instalacion manual de dependencias de Node, librerias del sistema ni la configuracion previa de servidores de bases de datos locales. Todo el entorno se inicializa y sincroniza de forma automatica a traves de un unico comando.

---

## 1. Instrucciones de Ejecucion

### Levantar el Entorno Completo
Abra una terminal en el directorio raiz del proyecto y ejecute:

```bash
docker compose up --build -d
```

> **Nota sobre inicializacion:** Al ejecutarse por primera vez, el backend ejecuta la sincronizacion del esquema de datos mediante el ORM (`syncSchema`) e invoca el *seeder* inicial, el cual inserta los registros y usuarios de prueba requeridos para las pruebas funcionales.

### Detener el Entorno
Para finalizar la ejecucion de los contenedores:

```bash
docker compose down
```

Si se desea apagar los contenedores y remover los volumenes de datos para reiniciar el estado desde cero:
```bash
docker compose down -v
```

---

## 2. Accesos a los Servicios y Puertos

| Servicio | URL / Host | Puerto | Descripcion |
| :--- | :--- | :--- | :--- |
| **Frontend (Aplicacion Web)** | [http://localhost:5173](http://localhost:5173) | `5173` | Interfaz grafica de usuario (SPA) |
| **Backend (API REST)** | [http://localhost:3000](http://localhost:3000) | `3000` | Endpoints de la API (`/api/...`) |
| **Adminer (Gestor Visual BD)** | [http://localhost:8080](http://localhost:8080) | `8080` | Interfaz web para consulta directa de tablas y registros |
| **MySQL (Base de Datos)** | `localhost:3309` | `3309` | Conexion directa para clientes externos (DBeaver, MySQL Workbench) |

---

## 3. Cuentas y Credenciales de Prueba Precargadas

Para evaluar los distintos flujos y niveles de autorizacion de la aplicacion segun el rol, se encuentran precargados los siguientes usuarios con la contraseña unificada: **`123456`**

### Tabla de Usuarios

| Rol | Correo Electronico | Contraseña | Perfil Precargado | Funcionalidades a Evaluar |
| :--- | :--- | :--- | :--- | :--- |
| **Administrador** | `admin@tp.com` | `123456` | Administrador General | Administracion global del sistema, gestion y visualizacion integral de usuarios y configuraciones. |
| **Burocrata** | `burocrata@tp.com` | `123456` | Burocrata Central (*Inspector DSW*) | Emision, revision y gestion de multas, resolucion de tramites, revision de expedientes y supervision. |
| **Metahumano (Heroe)** | `heroe@tp.com` | `123456` | Clark Kent (*Superman*) | Solicitud de expedientes, declaracion/modificacion de poderes y consulta de estado de tramites. |
| **Metahumano (Villano)** | `villano@tp.com` | `123456` | Lex Luthor (*Lex*) | Solicitud de tramites de rehabilitacion, visualizacion de sanciones, multas y expedientes asociados. |

---

## 4. Acceso a la Base de Datos mediante Adminer

Para realizar consultas o validar el estado de las tablas desde el navegador:

1. Acceda a [http://localhost:8080](http://localhost:8080).
2. Complete los campos de conexion con los siguientes valores:
   * **Sistema de base de datos:** `MySQL`
   * **Servidor:** `mysql`
   * **Usuario:** `dsw` *(o alternativamente `root`)*
   * **Contraseña:** `dsw` *(o alternativamente `root`)*
   * **Base de datos:** `metahumano`

---

## 5. Arquitectura y Tecnologias Utilizadas

* **Frontend:** React 19, Vite 7, TailwindCSS 4, React Router DOM 7, Axios, Lucide Icons.
* **Backend:** Node.js, Express, TypeScript, MikroORM 5, JSON Web Tokens (JWT), Bcryptjs.
* **Base de Datos:** MySQL 8.0.
* **Infraestructura y Despliegue:** Docker & Docker Compose.

Ante cualquier consulta durante el proceso de correccion, quedamos a disposicion.
