# Cómo correr el proyecto

Para iniciar el proyecto "El Súper Gestor", sigue estos pasos:

## 1. Base de Datos
1. Copia el archivo `.env.txt` a la carpeta `Backend` y renómbralo a `.env`.
2. En una terminal, navega a `Backend/docker`.
3. Ejecuta `docker-compose up -d mysql` para levantar la base de datos.

## 2. Backend
1. Abre una terminal en la carpeta `Backend`.
2. Instala las dependencias con `npm install`.
3. Inicia el servidor con `npm run dev`.

## 3. Frontend
1. Abre una terminal en la carpeta `Front`.
2. Instala las dependencias con `npm install`.
3. Inicia la aplicación con `npm run dev`.

---
**Nota:** El proyecto también incluye un archivo `iniciar_entornos.bat` en Windows que automatiza este proceso haciendo doble clic sobre él.
