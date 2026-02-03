FROM node:20-slim

# Instalar dependências necessárias para o Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar arquivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci

# Gerar cliente Prisma
RUN npx prisma generate

# Copiar codigo fonte
COPY . .

# Build
RUN npm run build

# Expor porta
EXPOSE 3001

# Comando de inicio
CMD ["npm", "start"]
