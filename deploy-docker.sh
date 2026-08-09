#!/bin/bash
set -e

VPS_IP="163.61.58.26"
VPS_USER="root"
DEPLOY_DIR="/opt/vividev"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "ViviDev.id Docker Deployment"
echo "=========================================="
echo "VPS:    $VPS_IP"
echo "Source: $PROJECT_DIR"
echo ""

# ---------------------------------------------------------------------------
echo -e "${BLUE}[1/5] Preparing VPS...${NC}"
# ---------------------------------------------------------------------------
ssh "$VPS_USER@$VPS_IP" << 'ENDSSH'
set -e
# Stop PM2 if running
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
# Stop old nginx jika ada
systemctl stop nginx 2>/dev/null || true

# Install docker compose plugin jika belum ada
if ! docker compose version &>/dev/null; then
  apt-get install -y docker-compose-plugin
fi

mkdir -p /opt/vividev
echo "✓ VPS ready"
ENDSSH
echo -e "${GREEN}✓ Step 1 complete${NC}"

# ---------------------------------------------------------------------------
echo -e "${BLUE}[2/5] Syncing files to VPS...${NC}"
# ---------------------------------------------------------------------------
rsync -az --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='frontend/dist' \
  --exclude='backend/dist' \
  --exclude='backend/logs' \
  --exclude='backend/uploads' \
  "$PROJECT_DIR/" "$VPS_USER@$VPS_IP:$DEPLOY_DIR/"
echo -e "${GREEN}✓ Step 2 complete${NC}"

# ---------------------------------------------------------------------------
echo -e "${BLUE}[3/5] Configuring .env on VPS...${NC}"
# ---------------------------------------------------------------------------
ssh "$VPS_USER@$VPS_IP" << 'ENDSSH'
set -e
cd /opt/vividev

# Ambil DB credentials dari existing PostgreSQL deploy (jika ada)
EXISTING_DB_PASS=$(sudo -u postgres psql -tAc "SELECT passwd FROM pg_shadow WHERE usename='vividev'" 2>/dev/null | sed 's/md5//' || true)

# Generate secrets jika belum ada di .env
if [ ! -f .env.prod ]; then
  DB_PASS=$(openssl rand -hex 16)
  JWT_SECRET=$(openssl rand -hex 32)
  JWT_REFRESH_SECRET=$(openssl rand -hex 32)
  cat > .env.prod << EOF
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://vividev.id
DB_USER=vividev
DB_NAME=vividev
DB_PASS=${DB_PASS}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_REFRESH_EXPIRES_IN=7d
SMTP_HOST=mx3.mailspace.id
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=support@vividev.id
SMTP_PASS=your-smtp-password
CONTACT_EMAIL_TO=support@vividev.id
WA_NUMBER=6285798112370
MAX_FILE_SIZE_MB=5
EOF
  echo "✓ .env.prod created"
else
  echo "✓ .env.prod already exists, keeping"
fi
ENDSSH
echo -e "${GREEN}✓ Step 3 complete${NC}"

# ---------------------------------------------------------------------------
echo -e "${BLUE}[4/5] Building & starting Docker containers...${NC}"
# ---------------------------------------------------------------------------
ssh "$VPS_USER@$VPS_IP" << 'ENDSSH'
set -e
cd /opt/vividev

# Stop existing containers
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Build fresh
docker compose -f docker-compose.prod.yml --env-file .env.prod build --no-cache

# Start semua container
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Tunggu backend ready
echo "Waiting for backend..."
for i in $(seq 1 30); do
  if docker compose -f docker-compose.prod.yml exec -T backend wget -qO- http://localhost:5000/api/health &>/dev/null; then
    echo "✓ Backend healthy"
    break
  fi
  sleep 2
done

# Run migration di dalam container
docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T backend \
  sh -c "npx prisma migrate deploy && npx prisma db seed || true"

echo "✓ Containers up"
ENDSSH
echo -e "${GREEN}✓ Step 4 complete${NC}"

# ---------------------------------------------------------------------------
echo -e "${BLUE}[5/5] Verifying...${NC}"
# ---------------------------------------------------------------------------
ssh "$VPS_USER@$VPS_IP" << 'ENDSSH'
set -e
cd /opt/vividev
docker compose -f docker-compose.prod.yml ps
echo ""
echo "HTTP check:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost || true
ENDSSH
echo -e "${GREEN}✓ Step 5 complete${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}Docker Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Access:"
echo "- http://$VPS_IP"
echo "- https://vividev.id (setelah SSL aktif)"
echo ""
echo "Manage containers:"
echo "  ssh root@$VPS_IP"
echo "  cd /opt/vividev"
echo "  docker compose -f docker-compose.prod.yml ps"
echo "  docker compose -f docker-compose.prod.yml logs -f"
