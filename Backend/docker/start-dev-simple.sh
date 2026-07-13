#!/bin/bash

# Script simplificado para iniciar el entorno de desarrollo

set -e

echo "🐳 Iniciando entorno de desarrollo (modo simplificado)..."
echo "========================================"

# Función de limpieza
cleanup() {
    echo "🧹 Deteniendo servicios..."
    docker-compose down --remove-orphans
}

# Configurar trap para limpiar al salir
trap cleanup EXIT

# Limpiar contenedores y redes anteriores
echo "🧹 Limpiando contenedores anteriores..."
docker-compose down --remove-orphans --volumes || true

# Instalar dependencias localmente
echo "📦 Instalando dependencias..."
cd ..
pnpm install || npm install
cd docker

echo "🛠️  Iniciando servicios..."
docker-compose up --build
