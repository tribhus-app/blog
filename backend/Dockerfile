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

# ALTO-015: rodar como user não-root (UID 1001).
# node:20-slim já vem com user 'node' (uid 1000) — criamos 'nodejs' 1001 para
# alinhar com padrão do resto da stack (uid 1001 consistente entre services).
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -s /bin/sh -m nodejs \
    && mkdir -p /app/uploads \
    && chown -R nodejs:nodejs /app

USER nodejs

# Expor porta
EXPOSE 3001

# Comando de inicio
CMD ["npm", "start"]
