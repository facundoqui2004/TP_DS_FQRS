#!/bin/bash

# Script para iniciar el entorno de desarrollo

echo "🐳 Iniciando MySQL en Docker..."
docker start mysql-metahumano || docker run --name mysql-metahumano -e MYSQL_ROOT_PASSWORD=dsw -e MYSQL_DATABASE=metahumano -e MYSQL_USER=dsw -e MYSQL_PASSWORD=dsw -p 3308:3306 -d mysql:8.0

echo "⏳ Esperando que MySQL se inicie..."
sleep 10

echo "🔨 Compilando proyecto..."
pnpm run build

echo "🚀 Iniciando servidor..."
pnpm run start:dev
echo "✅ Servidor iniciado correctamente. Puedes acceder a la aplicación en http://localhost:3000"
# ESTO SOLO ES UN SCRIPT, PARA TESTEAR QUE FUNCIONA EL PROGRAMA, NO AFECTA A LA BASE DE DATOS NI A LA APLICACIÓN,
# ES MAS QUE NADA PARA QUE TODOS TENGAMOS EL MISMO ENTORNO DE DESARROLLO
