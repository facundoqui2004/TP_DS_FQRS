@echo off
TITLE Iniciar Entornos - El Super Gestor
cls

echo =======================================================================
echo                INICIANDO ENTORNOS - EL SUPER GESTOR
echo =======================================================================
echo.

REM 1. Configurar variables de entorno
echo [1/4] Configurando variables de entorno...
if not exist "Backend\.env" (
    if exist ".env.txt" (
        echo [OK] Copiando variables desde .env.txt a Backend\.env
        copy ".env.txt" "Backend\.env" > nul
    ) else (
        echo [WARNING] No se encontro el archivo .env.txt en la raiz.
        echo [INFO] Creando un archivo .env basico para el Backend...
        echo PORT=3000 > Backend\.env
        echo NODE_ENV=development >> Backend\.env
        echo DB_HOST=127.0.0.1 >> Backend\.env
        echo DB_PORT=3309 >> Backend\.env
        echo DB_NAME=metahumano >> Backend\.env
        echo DB_USER=dsw >> Backend\.env
        echo DB_PASSWORD=dsw >> Backend\.env
        echo TOKEN_SECRET=dsw >> Backend\.env
    )
) else (
    echo [OK] El archivo Backend\.env ya existe.
)
echo.

REM 2. Intentar levantar base de datos en Docker
echo [2/4] Comprobando base de datos MySQL en Docker...
where docker >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] Docker esta instalado. Intentando iniciar base de datos...
    cd Backend\docker
    docker-compose up -d mysql >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        docker compose up -d mysql >nul 2>&1
    )
    if %ERRORLEVEL% equ 0 (
        echo [OK] MySQL contenedor en puerto 3309 iniciado correctamente.
    ) else (
        echo [WARNING] No se pudo levantar el contenedor de Docker automaticamente.
        echo           Por favor, asegurate de que Docker Desktop este abierto.
    )
    cd ..\..
) else (
    echo [WARNING] Docker no esta instalado o no se encuentra en el PATH.
    echo           Asegurate de tener un servidor MySQL corriendo localmente en el puerto 3309.
)
echo.

REM 3. Instalar dependencias e iniciar Backend
echo [3/4] Configurando Backend...
cd Backend
where pnpm >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] Detectado pnpm. Instalando/Actualizando dependencias de Backend...
    call pnpm install
) else (
    echo [INFO] Instalando/Actualizando dependencias de Backend con npm...
    call npm install
)
echo [INFO] Iniciando Backend en una nueva ventana...
start "Backend - API Server" cmd /k "npm run dev"
cd ..
echo.

REM 4. Instalar dependencias e iniciar Frontend
echo [4/4] Configurando Frontend...
cd Front
where pnpm >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] Detectado pnpm. Instalando/Actualizando dependencias de Frontend...
    call pnpm install
) else (
    echo [INFO] Instalando/Actualizando dependencias de Frontend con npm...
    call npm install
)
echo [INFO] Iniciando Frontend en una nueva ventana...
start "Frontend - Vite Web App" cmd /k "npm run dev"
cd ..
echo.

echo =======================================================================
echo              PROCESOS DE INICIO LANZADOS CON EXITO!
echo =======================================================================
echo.
echo Backend ejecutandose en:  http://localhost:3000
echo Frontend ejecutandose en: http://localhost:5173 o http://localhost:5174
echo.
echo Credenciales de prueba (usar formato email para el Login):
echo    - Admin:      Email: admin123@ejemplo.com    / Contrasena: supersegura
echo    - Metahumano: Email: testuser@ejemplo.com    / Contrasena: 123456
echo    - Burocrata:  Email: burocrata1@ejemplo.com  / Contrasena: tramite123
echo.
echo =======================================================================
echo Presiona cualquier tecla para finalizar esta ventana.
pause > nul
