#!/bin/bash

# Script para iniciar con configuración simple (sin redes custom)

set -e

echo "🐳 Iniciando entorno de desarrollo (sin redes custom)..."
echo "========================================"

# Función de limpieza
cleanup() {
    echo "🧹 Deteniendo servicios..."
    docker-compose -f docker-compose-simple.yml down --remove-orphans
}

# Configurar trap para limpiar al salir
trap cleanup EXIT

# Limpiar contenedores anteriores
echo "🧹 Limpiando contenedores anteriores..."
docker-compose -f docker-compose-simple.yml down --remove-orphans --volumes || true

# Instalar dependencias
echo "📦 Instalando dependencias..."
cd ..
pnpm install || npm install
cd docker

echo "🛠️  Iniciando servicios..."
docker-compose -f docker-compose-simple.yml up --build
