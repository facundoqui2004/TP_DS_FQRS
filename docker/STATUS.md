# 🐳 Docker Compose - Proyecto Metahumano

## ✅ Estado actual: ¡FUNCIONANDO!

### 📊 Resumen de la prueba:
- ✅ MySQL corriendo en puerto 3308 (healthy)
- ✅ Aplicación corriendo en puerto 3000 
- ✅ API respondiendo correctamente
- ✅ Base de datos conectada y sincronizada
- ✅ Tablas creadas automáticamente por MikroORM

## 🚀 Comandos principales:

### Iniciar desarrollo:
```bash
# Método recomendado
./start-dev.sh

# O usando npm
npm run docker:dev
```

### Verificar estado:
```bash
# Verificación completa
./check-health.sh

# Probar API
./test-api.sh

# Estado de contenedores
docker-compose ps

# Ver logs
docker-compose logs -f
```

### Comandos útiles:
```bash
# Detener todo
./stop-dev.sh

# Solo logs de MySQL
docker-compose logs -f mysql

# Solo logs de la aplicación
docker-compose logs -f app

# Acceder a MySQL
docker-compose exec mysql mysql -u dsw -pdsw metahumano

# Reiniciar un servicio
docker-compose restart app
```

## 🔗 URLs importantes:
- **Aplicación**: http://localhost:3000
- **MySQL**: localhost:3308
- **API Base**: http://localhost:3000/api

## 📋 Endpoints probados:
- ✅ GET /api/metahumanos
- ✅ GET /api/poderes  
- ✅ GET /api/metapoderes
- ✅ GET /api/multas
- ✅ GET /api/burocratas

## 🔧 Para el equipo:
1. Clonar el repositorio
2. Ejecutar `./start-dev.sh`
3. Esperar a que aparezca "¡Entorno iniciado correctamente!"
4. Acceder a http://localhost:3000

## 📝 Datos de conexión:
- **Host**: localhost (o "mysql" desde contenedores)
- **Puerto**: 3308
- **Base de datos**: metahumano
- **Usuario**: dsw
- **Contraseña**: dsw

¡Todo listo para desarrollo colaborativo! 🎉
