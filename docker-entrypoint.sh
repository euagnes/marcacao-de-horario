#!/bin/sh
set -e

echo "==> Aguardando banco e aplicando o schema (prisma db push)..."
npx prisma db push

echo "==> Populando dados iniciais (seed) — idempotente..."
npx prisma db seed || echo "(seed pulado ou já aplicado)"

echo "==> Iniciando o servidor Next.js..."
exec npm run start
