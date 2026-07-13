#!/bin/bash

# Script para verificar el estado del entorno de desarrollo

echo "🔍 Verificando estado del entorno..."
echo "===================================="

# Verificar si los contenedores están corriendo
echo "📦 Estado de los contenedores:"
docker-compose ps

echo ""
echo "🔗 Verificando conectividad:"

# Verificar MySQL
echo -n "🗄️  MySQL (puerto 3308): "
if nc -z localhost 3308; then
    echo "✅ Disponible"
else
    echo "❌ No disponible"
fi

# Verificar aplicación
echo -n "📱 Aplicación (puerto 3000): "
if nc -z localhost 3000; then
    echo "✅ Disponible"
else
    echo "❌ No disponible"
fi

echo ""
echo "🌐 Pruebas de conectividad:"

# Probar conexión a MySQL
echo -n "🔌 Conexión a MySQL: "
if docker-compose exec -T mysql mysql -u dsw -pdsw -e "SELECT 1" metahumano &> /dev/null; then
    echo "✅ Conectado"
else
    echo "❌ Error de conexión"
fi

# Probar aplicación web
echo -n "🌍 Aplicación web: "
if curl -s http://localhost:3000 &> /dev/null; then
    echo "✅ Respondiendo"
else
    echo "❌ No responde"
fi

echo ""
echo "📊 Uso de recursos:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "📋 Logs recientes:"
echo "--- MySQL ---"
docker-compose logs --tail=5 mysql
echo "--- Aplicación ---"
docker-compose logs --tail=5 app
