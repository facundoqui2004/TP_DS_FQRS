# 🧪 Usuarios de Prueba

## Credenciales para Testing

### 👑 **Admin**
```json
{
  "nomUsuario": "admin123",
  "contrasena": "supersegura"
}
```
- **Rol**: admin
- **Redirección**: `/homeAdmin`

### 🦸‍♂️ **Metahumano** (Funcional)
```json
{
  "nomUsuario": "testuser",
  "contrasena": "123456"
}
```
- **Rol**: METAHUMANO
- **Redirección**: `/homeMeta`
- **Estado**: ✅ Creado y verificado

### 📋 **Burócrata** (Funcional)
```json
{
  "nomUsuario": "burocrata1",
  "contrasena": "tramite123"
}
```
- **Rol**: BUROCRATA
- **Redirección**: `/homeBurocrata`
- **Estado**: ✅ Creado y verificado

## 🔧 Cómo crear más usuarios

Si necesitas crear usuarios adicionales en el backend, usa este formato:

```bash
curl -X POST http://localhost:3000/api/usuarios/register \
  -H "Content-Type: application/json" \
  -d '{
    "nomUsuario": "nuevo_usuario",
    "mail": "nuevo@ejemplo.com",
    "contrasena": "contraseña123",
    "rol": "METAHUMANO"
  }'
```

Posibles roles:
- `admin`
- `METAHUMANO`
- `BUROCRATA`
