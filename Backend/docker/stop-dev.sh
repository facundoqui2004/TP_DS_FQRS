#!/bin/bash

# Script para detener y limpiar el entorno de desarrollo

echo "🛑 Deteniendo entorno de desarrollo..."
echo "====================================="

# Detener servicios
echo "📦 Deteniendo contenedores..."
docker-compose down

# Mostrar opciones adicionales
echo ""
echo "🧹 Opciones de limpieza adicionales:"
echo "1. Limpiar solo contenedores: docker-compose down"
echo "2. Limpiar con volúmenes (¡BORRA DATOS!): docker-compose down -v"
echo "3. Limpiar todo + imágenes: docker-compose down -v --rmi all"
echo ""

read -p "¿Quieres limpiar también los volúmenes? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Limpiando volúmenes..."
    docker-compose down -v
    echo "⚠️  Datos de la base de datos eliminados"
else
    echo "💾 Datos de la base de datos conservados"
fi

echo "✅ Entorno detenido correctamente"
