FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json pnpm-lock.yaml ./

# Instalar pnpm y dependencias
RUN npm install -g pnpm
RUN pnpm install

# Copiar el resto del código
COPY . .

# Crear directorio dist si no existe
RUN mkdir -p dist

# Exponer el puerto
EXPOSE 3000

# Comando por defecto (sin build, el comando se ejecuta en runtime)
CMD ["npm", "run", "start:dev"]
