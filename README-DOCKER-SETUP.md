# 🐳 Docker Setup - Proyecto Metahumano

Este proyecto ahora tiene toda la configuración Docker organizada en la carpeta `docker/`.

## 🚀 Inicio rápido

### Opción 1: Scripts de acceso rápido (desde raíz)
```bash
# Iniciar entorno
./docker-start.sh

# Verificar estado
./docker-check.sh

# Probar API
./docker-test.sh

# Detener servicios
./docker-stop.sh
```

### Opción 2: Comandos npm
```bash
# Iniciar entorno
npm run docker:dev

# Verificar estado
npm run docker:check

# Probar API
npm run docker:test

# Ver logs
npm run docker:logs

# Acceder a MySQL
npm run docker:mysql
```

### Opción 3: Desde carpeta docker
```bash
cd docker

# Iniciar todo
./start-dev.sh

# Verificar estado
./check-health.sh

# Probar API
./test-api.sh

# Detener servicios
./stop-dev.sh
```

## 📁 Estructura Docker

```
docker/
├── docker-compose.yml    # Configuración de servicios
├── Dockerfile           # Imagen de la aplicación
├── .dockerignore        # Archivos a ignorar
├── init.sql            # Script de inicialización MySQL
├── .env.example        # Variables de entorno de ejemplo
├── start-dev.sh        # Script principal de inicio
├── stop-dev.sh         # Script para detener servicios
├── check-health.sh     # Script de verificación
├── test-api.sh         # Script de pruebas API
├── README-DOCKER.md    # Documentación detallada
└── STATUS.md           # Estado actual del proyecto
```

## 🔧 Configuración

- **MySQL**: Puerto 3308 (localhost)
- **Aplicación**: Puerto 3000 (localhost)
- **Variables de entorno**: `.env` en la raíz del proyecto

## 📖 Documentación completa

Ver `docker/README-DOCKER.md` para documentación detallada.

## 🚀 Para empezar

1. Clonar el repositorio
2. Ejecutar `./docker-start.sh` o `npm run docker:dev`
3. Acceder a http://localhost:3000

¡Listo para desarrollo colaborativo! 🎉
