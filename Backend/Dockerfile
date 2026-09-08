FROM node:20-alpine

WORKDIR /app

# Instalar dependencias necesarias para compilar si hiciera falta
COPY package*.json ./

RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto de la API
EXPOSE 3000

# Iniciar en modo desarrollo
CMD ["npm", "run", "dev"]
