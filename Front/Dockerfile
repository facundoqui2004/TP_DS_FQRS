FROM node:20-alpine

WORKDIR /app

# Copiar dependencias e instalarlas
COPY package*.json ./

RUN npm install

# Copiar el código del frontend
COPY . .

# Exponer el puerto del servidor de desarrollo de Vite
EXPOSE 5173

# Arrancar Vite accesible externamente (0.0.0.0)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
