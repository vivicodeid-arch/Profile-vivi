# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install openssl so prisma generate works correctly in builder
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# Install dumb-init for proper signal handling + openssl for Prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    openssl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

# Copy prisma schema then regenerate client for this exact runtime environment
COPY prisma ./prisma
RUN npx prisma generate

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Persistent volumes
RUN mkdir -p uploads logs

EXPOSE 5000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/app.js"]
