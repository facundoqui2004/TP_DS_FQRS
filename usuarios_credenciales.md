# 🔐 Credenciales y Registro de Usuarios del Sistema

Este documento contiene las credenciales de acceso para el entorno de desarrollo y pruebas del **Super Gestor Metahumano**, tras la limpieza de la base de datos y la generación de los 10 nuevos usuarios requeridos.

---

## 🛠️ Usuario Administrador (Existente)

| Rol | Nombre | Email | Contraseña | Perfil / Alias |
|---|---|---|---|---|
| **ADMIN** | Admin Ejemplo | `admin123@ejemplo.com` | `supersegura` | Administrador General |

---

## 👨‍💼 1. Burócratas (5 Usuarios)

| # | Email | Contraseña | Nombre | Alias / Cargo | Teléfono |
|---|---|---|---|---|---|
| 1 | `buro.juan@supergestor.com` | `Buro12345` | Juan Pérez | Agente Juan | +549341111111 |
| 2 | `buro.maria@supergestor.com` | `Buro12345` | María Gómez | Inspectora María | +549341222222 |
| 3 | `buro.carlos@supergestor.com` | `Buro12345` | Carlos López | Analista Carlos | +549341333333 |
| 4 | `buro.ana@supergestor.com` | `Buro12345` | Ana Martínez | Supervisora Ana | +549341444444 |
| 5 | `buro.diego@supergestor.com` | `Buro12345` | Diego Rodríguez | Auditor Diego | +549341555555 |

---

## 🦸‍♂️ 2. Héroes (3 Usuarios Metahumanos)

| # | Email | Contraseña | Nombre Real | Alias Héroe | Poderes Aprobados | Nivel Fama | Victorias |
|---|---|---|---|---|---|---|---|
| 1 | `heroe.capitan@supergestor.com` | `Hero12345` | Capitán Justicia | Capitán | Súper Fuerza, Vuelo Atmosférico | Alto | 15 |
| 2 | `heroe.sombra@supergestor.com` | `Hero12345` | Sombra Blanca | Sombra | Invisibilidad Óptica, Sentido Arácnido | Medio | 8 |
| 3 | `heroe.fuego@supergestor.com` | `Hero12345` | Fuego Sagrado | Ignis | Control del Fuego, Vuelo Atmosférico | Alto | 20 |

---

## 🦹 3. Villanos (2 Usuarios Metahumanos)

| # | Email | Contraseña | Nombre Real | Alias Villano | Poderes Aprobados | Peligrosidad | Deuda Multas (Recompensa) | Estado Multas |
|---|---|---|---|---|---|---|---|---|
| 1 | `villano.caos@supergestor.com` | `Villano12345` | Señor del Caos | Lord Caos | Teletransporte Dimensional, Control del Fuego | Alta | **$40,000** | 2 Vencidas ($30k), 1 Al día ($10k), 2 Pagadas |
| 2 | `villano.sombra@supergestor.com` | `Villano12345` | Sombra Oscura | Nox | Telequinesis, Invisibilidad Óptica | Media | **$40,000** | 2 Vencidas ($30k), 1 Al día ($10k), 2 Pagadas |

---

## 📑 Resumen de Estructura de Datos Generada

- **Trámites / Solicitudes**: Cada uno de los 5 metahumanos cuenta con **5 trámites/carpetas oficiales** generados y vinculados por los burócratas (Total: **25 trámites y evidencias** en el sistema).
- **Asignación de Poderes**: Todos los poderes asignados a los metahumanos fueron debidamente **aprobados** (`estado: APROBADO`).
- **Estado de Multas de Villanos**:
  - **2 Multas Vencidas** por Villano: $15,000 c/u (Vencimiento acumulado en fecha anterior).
  - **1 Multa Al Día** por Villano: $10,000 (Vencimiento futuro vigente).
  - **2 Multas Pagadas** por Villano: $5,000 c/u (Con registro de forma de pago Mercado Pago / AstroPay).
  - **Recompensa Automática**: Calculada dinámicamente en **$40,000** acorde a la suma de multas no pagadas de cada villano.
