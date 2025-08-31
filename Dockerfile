# --- Etapa 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos package.json + lockfile
COPY package*.json ./

# Instalamos dependencias
RUN npm ci

# Copiamos el resto del código
COPY . .

# Build de Next.js
RUN npm run build


# --- Etapa 2: Runtime ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Next.js necesita esta variable en runtime
ENV PORT=3000

# Copiamos dependencias de producción y el build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
