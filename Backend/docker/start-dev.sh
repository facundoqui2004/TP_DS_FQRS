#!/bin/bash

# Script para iniciar el entorno de desarrollo con Docker Compose

set -e # Salir si hay algún error

echo "🐳 Iniciando entorno de desarrollo..."
echo "========================================"

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f ../.env ]; then
    echo "📄 Creando archivo .env desde .env.example..."
    cp .env.example ../.env
fi

# Función para verificar la salud de MySQL
check_mysql_health() {
    echo "🔍 Verificando estado de MySQL..."
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose exec -T mysql mysqladmin ping -h localhost -u dsw -pdsw &> /dev/null; then
            echo "✅ MySQL está funcionando correctamente"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo "⏳ Esperando MySQL... (intento $attempt/$max_attempts)"
        sleep 2
    done
    
    echo "❌ MySQL no responde después de $max_attempts intentos"
    return 1
}

# Función para verificar la aplicación
check_app_health() {
    echo "🔍 Verificando estado de la aplicación..."
    max_attempts=15
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:3000 &> /dev/null; then
            echo "✅ Aplicación está funcionando correctamente"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo "⏳ Esperando aplicación... (intento $attempt/$max_attempts)"
        sleep 2
    done
    
    echo "❌ Aplicación no responde después de $max_attempts intentos"
    return 1
}

# Función para mostrar logs útiles
show_logs() {
    echo "📋 Mostrando logs recientes..."
    echo "--- Logs de MySQL ---"
    docker-compose logs --tail=10 mysql
    echo "--- Logs de la aplicación ---"
    docker-compose logs --tail=10 app
}

# Función de limpieza
cleanup() {
    echo "🧹 Deteniendo servicios..."
    docker-compose down
}

# Configurar trap para limpiar al salir
trap cleanup EXIT

echo "🛠️  Instalando dependencias..."
cd ..
pnpm install
cd docker

echo "� Iniciando servicios con Docker Compose..."
docker-compose up -d --build

echo "⏳ Esperando que los servicios se inicien..."
sleep 5

# Verificar MySQL
if check_mysql_health; then
    echo "✅ MySQL iniciado correctamente"
else
    echo "❌ Error al iniciar MySQL"
    show_logs
    exit 1
fi

# Verificar aplicación
if check_app_health; then
    echo "✅ Aplicación iniciada correctamente"
else
    echo "❌ Error al iniciar la aplicación"
    show_logs
    exit 1
fi

echo ""
echo "🎉 ¡Entorno de desarrollo iniciado correctamente!"
echo "========================================"
echo "📱 Aplicación: http://localhost:3000"
echo "🗄️  Base de datos: localhost:3308"
echo "👀 Ver logs: docker-compose logs -f"
echo "🛑 Detener: docker-compose down"
echo ""
echo "Presiona Ctrl+C para detener los servicios..."

# Mostrar logs en tiempo real
docker-compose logs -f
