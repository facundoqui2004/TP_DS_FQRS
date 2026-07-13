# Modelo de Usuario, Metahumano y Burocrata en MikroORM

Este documento explica el diseño y uso del modelo de relaciones entre Usuario, Metahumano y Burocrata implementado con MikroORM.

## Arquitectura del Modelo

### Entidades Principales

1. **Usuario** (`src/auth/usuario.entity.ts`)
   - Entidad central que contiene los datos de contacto y autenticación
   - Campos: `email`, `telefono`, `passwordHash`, `role`, `verificado`, `createdAt`, `updatedAt`
   - Enum `UserRole`: `METAHUMANO` | `BUROCRATA`

2. **Metahumano** (`src/metahumano/metahumano.entity.ts`)
   - Perfil para usuarios metahumanos
   - Campos: `nombre`, `alias`, `origen`
   - Relación OneToOne con Usuario (owner side)

3. **Burocrata** (`src/Burocratas/Burocrata.entity.ts`)
   - Perfil para usuarios burócratas
   - Campos: `nombre`, `alias`, `origen`
   - Relación OneToOne con Usuario (owner side)

### Relaciones

```
Usuario (1) ←→ (0..1) Metahumano
Usuario (1) ←→ (0..1) Burocrata
```

- **OneToOne único**: Un usuario puede tener máximo un perfil (Metahumano O Burocrata, nunca ambos)
- **Campos de contacto**: `email` y `telefono` viven únicamente en Usuario
- **Acceso a contacto**: Metahumano y Burocrata exponen métodos `getEmail()` y `getTelefono()`

## Reglas de Integridad

### 1. Exclusividad de Perfiles
Un usuario no puede tener ambos perfiles simultáneamente.

```typescript
// ❌ Esto fallará
usuario.metahumano = metahumano
usuario.burocrata = burocrata // Error: "Un usuario no puede tener ambos perfiles"
```

### 2. Consistencia de Role
El `role` del usuario debe coincidir con el perfil existente.

```typescript
// ❌ Esto fallará
usuario.role = UserRole.METAHUMANO
usuario.burocrata = burocrata // Error: "Usuario con role METAHUMANO no puede tener perfil de burocrata"
```

### 3. Validaciones Automáticas
Las validaciones se ejecutan automáticamente en `@BeforeCreate()` y `@BeforeUpdate()`.

## Uso Básico

### Crear un Metahumano

```typescript
import { Usuario, UserRole } from './auth/usuario.entity.js'
import { Metahumano } from './metahumano/metahumano.entity.js'

// 1. Crear usuario
const usuario = new Usuario()
usuario.email = 'clark.kent@ejemplo.com'
usuario.telefono = '+1234567890'
usuario.passwordHash = 'hash_seguro'
usuario.role = UserRole.METAHUMANO

// 2. Crear perfil metahumano
const metahumano = new Metahumano()
metahumano.nombre = 'Clark Kent'
metahumano.alias = 'Superman'
metahumano.origen = 'Krypton'
metahumano.usuario = usuario

// 3. Establecer relación bidireccional
usuario.metahumano = metahumano

// 4. Persistir
await em.persistAndFlush([usuario, metahumano])

// 5. Acceder a datos de contacto
console.log(metahumano.getEmail())    // clark.kent@ejemplo.com
console.log(metahumano.getTelefono()) // +1234567890
```

### Crear un Burocrata

```typescript
import { Usuario, UserRole } from './auth/usuario.entity.js'
import { Burocrata } from './Burocratas/Burocrata.entity.js'

// 1. Crear usuario
const usuario = new Usuario()
usuario.email = 'amanda.waller@gobierno.com'
usuario.telefono = '+0987654321'
usuario.passwordHash = 'hash_seguro'
usuario.role = UserRole.BUROCRATA

// 2. Crear perfil burocrata
const burocrata = new Burocrata()
burocrata.nombre = 'Amanda Waller'
burocrata.alias = 'La Directora'
burocrata.origen = 'Gobierno Federal'
burocrata.usuario = usuario

// 3. Establecer relación bidireccional
usuario.burocrata = burocrata

// 4. Persistir
await em.persistAndFlush([usuario, burocrata])

// 5. Acceder a datos de contacto
console.log(burocrata.getEmail())    // amanda.waller@gobierno.com
console.log(burocrata.getTelefono()) // +0987654321
```

### Consultar con Populate

```typescript
// Obtener usuario con su perfil
const usuario = await em.findOne(Usuario, { email: 'clark.kent@ejemplo.com' }, {
  populate: ['metahumano', 'burocrata']
})

if (usuario?.metahumano) {
  console.log('Es metahumano:', usuario.metahumano.nombre)
}

if (usuario?.burocrata) {
  console.log('Es burocrata:', usuario.burocrata.nombre)
}

// Obtener metahumano con datos de usuario
const metahumano = await em.findOne(Metahumano, { id: 1 }, {
  populate: ['usuario']
})

console.log('Email del metahumano:', metahumano?.getEmail())
```

## Casos de Uso Avanzados

### Conversión de Perfil

```typescript
// Convertir metahumano en burocrata
async function convertirABurocrata(metahumanoId: number) {
  const metahumano = await em.findOne(Metahumano, { id: metahumanoId }, {
    populate: ['usuario']
  })
  
  if (!metahumano) throw new Error('Metahumano no encontrado')
  
  const usuario = metahumano.usuario
  
  // 1. Eliminar perfil metahumano
  em.remove(metahumano)
  usuario.metahumano = undefined
  
  // 2. Cambiar role
  usuario.role = UserRole.BUROCRATA
  
  // 3. Crear perfil burocrata
  const burocrata = new Burocrata()
  burocrata.nombre = metahumano.nombre + ' (Ex-Metahumano)'
  burocrata.alias = 'Agente ' + metahumano.alias
  burocrata.origen = 'Conversión gubernamental'
  burocrata.usuario = usuario
  
  usuario.burocrata = burocrata
  
  await em.flush()
  
  return { usuario, burocrata }
}
```

### Validación de Integridad

```typescript
// Verificar consistencia de datos
async function validarIntegridad() {
  // Usuarios con role pero sin perfil correspondiente
  const usuariosMetaSinPerfil = await em.find(Usuario, {
    role: UserRole.METAHUMANO,
    metahumano: null
  })
  
  const usuariosBuroSinPerfil = await em.find(Usuario, {
    role: UserRole.BUROCRATA,
    burocrata: null
  })
  
  // Reportar inconsistencias
  if (usuariosMetaSinPerfil.length > 0) {
    console.warn(`${usuariosMetaSinPerfil.length} usuarios METAHUMANO sin perfil`)
  }
  
  if (usuariosBuroSinPerfil.length > 0) {
    console.warn(`${usuariosBuroSinPerfil.length} usuarios BUROCRATA sin perfil`)
  }
}
```

## Integración con Autenticación

### En el sistema de auth

```typescript
// En usuario.controller.ts o auth.ts
export async function autenticar(email: string, password: string) {
  const usuario = await em.findOne(Usuario, { email }, {
    populate: ['metahumano', 'burocrata']
  })
  
  if (!usuario || !verificarPassword(password, usuario.passwordHash)) {
    throw new Error('Credenciales inválidas')
  }
  
  // Determinar tipo de perfil para JWT payload
  const perfil = usuario.metahumano ? 'metahumano' : 'burocrata'
  const perfilId = usuario.metahumano?.id || usuario.burocrata?.id
  
  const token = crearJWT({
    usuarioId: usuario.id,
    email: usuario.email,
    role: usuario.role,
    perfil,
    perfilId
  })
  
  return { usuario, token }
}
```

## Consideraciones Importantes

### 1. Evitar Duplicación de Datos
- ❌ No almacenar `email` y `telefono` en Metahumano/Burocrata
- ✅ Usar métodos `getEmail()` y `getTelefono()` para acceder desde Usuario

### 2. Consistencia de Estado
- Las validaciones automáticas previenen estados inconsistentes
- Siempre usar transacciones para operaciones que afecten múltiples entidades

### 3. Performance
- Usar `populate` para cargar relaciones necesarias
- Evitar N+1 queries cargando relaciones de forma explícita

### 4. Migrations
- Las relaciones OneToOne requieren foreign keys únicos
- Considerar índices en campos de búsqueda frecuente

## Archivos de Ejemplo

- `src/auth/ejemplos-uso.ts` - Ejemplos completos de uso
- `src/auth/usuario.service.ts` - Servicio con lógica de negocio
- Ver tests unitarios para casos de uso específicos

## Errores Comunes

1. **"Un usuario no puede tener ambos perfiles"**
   - Causa: Intentar asignar tanto `metahumano` como `burocrata` al mismo usuario
   - Solución: Eliminar uno antes de asignar el otro

2. **"Usuario con role X no puede tener perfil de Y"**
   - Causa: Inconsistencia entre `role` y perfil asignado
   - Solución: Cambiar el `role` antes de asignar el nuevo perfil

3. **Foreign key constraint error**
   - Causa: Intentar eliminar Usuario sin eliminar perfiles asociados
   - Solución: Eliminar perfiles primero o usar cascade delete
