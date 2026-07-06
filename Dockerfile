# ==========================================================
# Praça CEU — imagem Docker (Next.js 14 + Prisma + Postgres)
# ==========================================================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Prisma precisa do openssl
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Variáveis NEXT_PUBLIC_* são embutidas no build do front-end,
# por isso precisam existir já na etapa de build (via build args).
ARG NEXT_PUBLIC_WHATSAPP
ARG NEXT_PUBLIC_TELEFONE
ARG NEXT_PUBLIC_ENDERECO
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_WHATSAPP=$NEXT_PUBLIC_WHATSAPP \
    NEXT_PUBLIC_TELEFONE=$NEXT_PUBLIC_TELEFONE \
    NEXT_PUBLIC_ENDERECO=$NEXT_PUBLIC_ENDERECO \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# Instala dependências (inclui dev, necessárias para o build)
COPY package.json package-lock.json* ./
RUN npm ci

# Copia o restante e gera o build
COPY . .
RUN npx prisma generate && npm run build

# ==========================================================
# Imagem final
# ==========================================================
FROM node:20-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copia app já buildado + dependências
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

# O entrypoint aplica o schema (db push), roda o seed e sobe o servidor
ENTRYPOINT ["./docker-entrypoint.sh"]
