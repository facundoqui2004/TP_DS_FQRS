#!/bin/bash

# Script para probar las funcionalidades básicas de la API

echo "🧪 Probando API del proyecto Metahumano..."
echo "=========================================="

BASE_URL="http://localhost:3000"

# Función para hacer peticiones HTTP
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    echo -n "🔗 $method $endpoint: "
    
    if [ -n "$data" ]; then
        response=$(curl -s -X $method -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    else
        response=$(curl -s -X $method "$BASE_URL$endpoint")
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ OK"
        echo "   Respuesta: $response" | head -c 100
        if [ ${#response} -gt 100 ]; then
            echo "..."
        fi
        echo ""
    else
        echo "❌ Error"
    fi
}

# Verificar que la aplicación esté corriendo
if ! curl -s http://localhost:3000 &> /dev/null; then
    echo "❌ La aplicación no está corriendo en http://localhost:3000"
    echo "   Ejecuta primero: ./start-dev.sh"
    exit 1
fi

echo "🚀 Aplicación detectada, iniciando pruebas..."
echo ""

# Pruebas básicas de endpoints
echo "📝 Probando endpoints principales:"

# Probar metahumanos
make_request "GET" "/api/metahumanos"

# Probar poderes
make_request "GET" "/api/poderes"

# Probar metapoderes
make_request "GET" "/api/metapoderes"

# Probar multas
make_request "GET" "/api/multas"

# Probar burócratas
make_request "GET" "/api/burocratas"

echo ""
echo "🔐 Probando autenticación:"

# Probar registro (ejemplo)
make_request "POST" "/api/auth/register" '{"username":"test","password":"123456"}'

# Probar login
make_request "POST" "/api/auth/login" '{"username":"test","password":"123456"}'

echo ""
echo "✅ Pruebas completadas!"
echo "📖 Para más detalles, revisa los logs: docker-compose logs -f"
