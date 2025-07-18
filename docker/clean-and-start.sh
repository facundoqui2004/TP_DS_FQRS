#!/bin/bash

# Script para limpiar Docker completamente y reiniciar

echo "🧹 Limpiando Docker completamente..."
echo "========================================"

# Detener todos los contenedores
echo "🛑 Deteniendo todos los contenedores..."
docker stop $(docker ps -aq) 2>/dev/null || true

# Eliminar todos los contenedores
echo "🗑️  Eliminando contenedores..."
docker rm $(docker ps -aq) 2>/dev/null || true

# Eliminar redes no utilizadas
echo "🌐 Eliminando redes..."
docker network prune -f 2>/dev/null || true

# Eliminar imágenes no utilizadas
echo "🖼️  Eliminando imágenes no utilizadas..."
docker image prune -f 2>/dev/null || true

# Eliminar volúmenes no utilizados
echo "💾 Eliminando volúmenes..."
docker volume prune -f 2>/dev/null || true

echo "✅ Limpieza completada"
echo ""
echo "🚀 Iniciando proyecto limpio..."

# Cambiar al directorio del proyecto
cd /home/enzo/TP_DS_FQRS_BACKEND

# Instalar dependencias
echo "📦 Instalando dependencias..."
pnpm install || npm install

# Compilar TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

# Cambiar al directorio docker
cd docker

# Iniciar con docker-compose simple
echo "🐳 Iniciando con Docker Compose..."
docker-compose -f docker-compose-simple.yml up --build
