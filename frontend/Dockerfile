# ── Stage 1: Build React/Vite ─────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ── Stage 2: Serve dengan Nginx ───────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Hapus default config nginx
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.docker.conf /etc/nginx/conf.d/app.conf

# Copy hasil build Vite
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
