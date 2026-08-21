FROM node:20-alpine AS base

# Dependencias
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# sharp: SEM ele o otimizador de imagem do Next nao roda e a imagem sai do tamanho
# original mesmo quando a pagina pede miniatura. Medido em 21/08/2026: uma miniatura
# pedida com w=256 voltava com 617 KB. O log entregava
# "Error: 'sharp' is required ... image optimization".
# Precisa ser instalado no estagio FINAL: o build standalone nao carrega binario
# nativo junto, e a arquitetura do binario tem que bater com a do runner (alpine).
RUN npm install --no-save --omit=dev sharp@0.33.5

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
