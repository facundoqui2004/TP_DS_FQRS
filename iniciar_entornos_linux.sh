#!/bin/bash

# Obtener el directorio donde está el script para ejecutarlo desde cualquier lugar
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

clear
echo "======================================================================="
echo "               INICIANDO ENTORNOS - EL SUPER GESTOR"
echo "======================================================================="
echo ""

# 1. Configurar variables de entorno
echo "[1/4] Configurando variables de entorno..."
if [ ! -f "Backend/.env" ]; then
    if [ -f ".env.txt" ]; then
        cp ".env.txt" "Backend/.env"
        echo "[OK] Variables copiadas desde .env.txt a Backend/.env"
    else
        echo "[WARNING] No se encontro el archivo .env.txt en la raiz."
        echo "[INFO] Creando un archivo .env basico para el Backend..."
        cat > Backend/.env <<EOF
PORT=3000
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=3309
DB_NAME=metahumano
DB_USER=dsw
DB_PASSWORD=dsw
TOKEN_SECRET=dsw
EOF
        echo "[OK] Archivo Backend/.env creado con valores por defecto."
    fi
else
    echo "[OK] El archivo Backend/.env ya existe."
fi
echo ""

# 2. Intentar levantar base de datos en Docker
echo "[2/4] Comprobando base de datos MySQL en Docker..."
if command -v docker &> /dev/null; then
    echo "[INFO] Docker esta instalado. Intentando iniciar base de datos..."
    cd Backend/docker
    docker compose up -d mysql > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "[OK] MySQL contenedor en puerto 3309 iniciado correctamente."
    else
        echo "[WARNING] No se pudo levantar el contenedor de Docker automaticamente."
        echo "          Asegurate de que Docker este corriendo."
    fi
    cd "$SCRIPT_DIR"
else
    echo "[WARNING] Docker no esta instalado o no se encuentra en el PATH."
    echo "          Asegurate de tener un servidor MySQL corriendo en el puerto 3309."
fi
echo ""

# 3. Instalar dependencias e iniciar Backend
echo "[3/4] Configurando Backend..."
cd "$SCRIPT_DIR/Backend"
if command -v pnpm &> /dev/null; then
    echo "[INFO] Detectado pnpm. Instalando/Actualizando dependencias de Backend..."
    pnpm install
else
    echo "[INFO] Instalando/Actualizando dependencias de Backend con npm..."
    npm install
fi
echo "[INFO] Iniciando Backend en una nueva terminal..."
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal --title="Backend - API Server" -- bash -c "cd '$SCRIPT_DIR/Backend' && npm run dev; exec bash"
elif command -v xterm &> /dev/null; then
    xterm -title "Backend - API Server" -e "cd '$SCRIPT_DIR/Backend' && npm run dev; exec bash" &
elif command -v konsole &> /dev/null; then
    konsole --title "Backend - API Server" -e bash -c "cd '$SCRIPT_DIR/Backend' && npm run dev; exec bash" &
else
    echo "[INFO] No se encontro terminal grafica. Iniciando Backend en background..."
    nohup npm run dev > "$SCRIPT_DIR/backend.log" 2>&1 &
    echo "[OK] Backend corriendo en background. Logs en: $SCRIPT_DIR/backend.log"
fi
cd "$SCRIPT_DIR"
echo ""

# 4. Instalar dependencias e iniciar Frontend
echo "[4/4] Configurando Frontend..."
cd "$SCRIPT_DIR/Front"
if command -v pnpm &> /dev/null; then
    echo "[INFO] Detectado pnpm. Instalando/Actualizando dependencias de Frontend..."
    pnpm install
else
    echo "[INFO] Instalando/Actualizando dependencias de Frontend con npm..."
    npm install
fi
echo "[INFO] Iniciando Frontend en una nueva terminal..."
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal --title="Frontend - Vite Web App" -- bash -c "cd '$SCRIPT_DIR/Front' && npm run dev; exec bash"
elif command -v xterm &> /dev/null; then
    xterm -title "Frontend - Vite Web App" -e "cd '$SCRIPT_DIR/Front' && npm run dev; exec bash" &
elif command -v konsole &> /dev/null; then
    konsole --title "Frontend - Vite Web App" -e bash -c "cd '$SCRIPT_DIR/Front' && npm run dev; exec bash" &
else
    echo "[INFO] No se encontro terminal grafica. Iniciando Frontend en background..."
    nohup npm run dev > "$SCRIPT_DIR/frontend.log" 2>&1 &
    echo "[OK] Frontend corriendo en background. Logs en: $SCRIPT_DIR/frontend.log"
fi
cd "$SCRIPT_DIR"
echo ""

echo "======================================================================="
echo "             PROCESOS DE INICIO LANZADOS CON EXITO!"
echo "======================================================================="
echo ""
echo "Backend ejecutandose en:  http://localhost:3000"
echo "Frontend ejecutandose en: http://localhost:5173 o http://localhost:5174"
echo ""
echo "Credenciales de prueba (usar formato email para el Login):"
echo "   - Admin:      Email: admin123@ejemplo.com    / Contrasena: supersegura"
echo "   - Metahumano: Email: testuser@ejemplo.com    / Contrasena: 123456"
echo "   - Burocrata:  Email: burocrata1@ejemplo.com  / Contrasena: tramite123"
echo ""
echo "======================================================================="
echo "Presiona Enter para cerrar esta ventana."
read
