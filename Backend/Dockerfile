FROM node:20-alpine

WORKDIR /deps

COPY package*.json ./

RUN npm ci

WORKDIR /app

COPY . .

ENV NODE_PATH=/deps/node_modules
ENV PATH="/deps/node_modules/.bin:${PATH}"

EXPOSE 3000

CMD ["npm", "run", "dev"]
