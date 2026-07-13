# Docker Compose para el proyecto Metahumano

Este proyecto incluye un Docker Compose que facilita el desarrollo colaborativo al proporcionar un entorno de base de datos consistente para todos los miembros del equipo.

## Servicios incluidos

- **MySQL 8.0**: Base de datos principal
- **Node.js App**: Aplicación backend con TypeScript

## 🚀 Inicio rápido

### 1. Preparación inicial

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd TP_DS_FQRS_BACKEND

# Hacer ejecutables los scripts
chmod +x *.sh
```

### 2. Iniciar el entorno completo

```bash
# Opción 1: Usando el script (RECOMENDADO)
./start-dev.sh

# Opción 2: Usando npm
npm run docker:dev

# Opción 3: Usando Docker Compose directamente
docker-compose up --build
```

## 🔍 Verificación del entorno

### Scripts de verificación

```bash
# Verificar estado general
./check-health.sh
# o
npm run docker:check

# Probar la API
./test-api.sh
# o
npm run docker:test

# Ver logs en tiempo real
npm run docker:logs
```

### Verificación manual

1. **Verificar contenedores**:
   ```bash
   docker-compose ps
   ```

2. **Verificar conectividad**:
   ```bash
   # MySQL
   nc -z localhost 3308
   
   # Aplicación
   curl http://localhost:3000
   ```

3. **Probar conexión a MySQL**:
   ```bash
   # Usando el script npm
   npm run docker:mysql
   
   # O directamente
   docker-compose exec mysql mysql -u dsw -pdsw metahumano
   ```

4. **Probar endpoints de la API**:
   ```bash
   # Metahumanos
   curl http://localhost:3000/api/metahumanos
   
   # Poderes
   curl http://localhost:3000/api/poderes
   
   # Metapoderes
   curl http://localhost:3000/api/metapoderes
   ```

## 📋 Comandos disponibles

### Scripts npm

```bash
npm run docker:dev     # Iniciar entorno completo
npm run docker:stop    # Detener entorno
npm run docker:check   # Verificar estado
npm run docker:test    # Probar API
npm run docker:logs    # Ver logs
npm run docker:mysql   # Acceder a MySQL
```

### Scripts directos

```bash
./start-dev.sh         # Iniciar con verificaciones
./stop-dev.sh          # Detener con opciones de limpieza
./check-health.sh      # Verificar estado del sistema
./test-api.sh          # Probar funcionalidades de la API
```

## 🛠️ Desarrollo

### Solo base de datos

Si prefieres ejecutar solo la base de datos en Docker:

```bash
# Ejecutar solo MySQL
docker-compose up mysql -d

# Luego ejecutar la aplicación localmente
npm install
npm run start:dev
```

### Variables de entorno

El archivo `.env.example` se copia automáticamente a `.env` al ejecutar `start-dev.sh`.

Variables disponibles:
- `NODE_ENV`: Entorno de ejecución
- `DB_HOST`: Host de la base de datos
- `DB_PORT`: Puerto de la base de datos
- `DB_NAME`: Nombre de la base de datos
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos

## 📊 Puertos

- **MySQL**: 3308 (mapeado al 3306 del contenedor)
- **Aplicación**: 3000

## 🔧 Troubleshooting

### Problemas comunes

1. **Error "Docker no está instalado"**:
   ```bash
   # En Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install docker.io docker-compose
   
   # En macOS
   brew install docker docker-compose
   ```

2. **Error de permisos de Docker**:
   ```bash
   sudo usermod -aG docker $USER
   # Reiniciar sesión
   ```

3. **Puerto ocupado**:
   - Cambia los puertos en `docker-compose.yml`
   - O detén el proceso que usa el puerto

4. **MySQL no responde**:
   ```bash
   # Ver logs de MySQL
   docker-compose logs mysql
   
   # Reiniciar MySQL
   docker-compose restart mysql
   ```

5. **Aplicación no responde**:
   ```bash
   # Ver logs de la aplicación
   docker-compose logs app
   
   # Reconstruir la aplicación
   docker-compose build app
   docker-compose up app
   ```

### Logs útiles

```bash
# Ver todos los logs
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs mysql
docker-compose logs app

# Seguir logs en tiempo real
docker-compose logs -f

# Ver logs con timestamps
docker-compose logs -t
```

### Limpieza

```bash
# Detener servicios
docker-compose down

# Limpiar volúmenes (¡BORRA DATOS!)
docker-compose down -v

# Limpiar todo + imágenes
docker-compose down -v --rmi all

# Limpiar sistema Docker completo
docker system prune -a
```

## 📈 Monitoreo

### Estado de contenedores

```bash
# Estado básico
docker-compose ps

# Uso de recursos
docker stats

# Logs específicos
docker-compose logs --tail=50 mysql
```

### Verificación de salud

El script `check-health.sh` verifica:
- ✅ Estado de contenedores
- ✅ Conectividad de puertos
- ✅ Conexión a MySQL
- ✅ Respuesta de la aplicación
- ✅ Uso de recursos

## 🤝 Colaboración

Para que todo el equipo tenga el mismo entorno:

1. **Clonar el repositorio**
2. **Ejecutar `./start-dev.sh`**
3. **Verificar con `./check-health.sh`**
4. **¡Listo para desarrollar!**

Todos tendrán:
- La misma versión de MySQL
- Las mismas dependencias
- El mismo entorno de desarrollo
