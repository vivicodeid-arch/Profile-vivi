#!/bin/bash
set -e

VPS_IP="163.61.58.26"
VPS_USER="root"
DOMAIN="vividev.id"
DB_NAME="vividev"
DB_USER="vividev"

# Generate secrets locally once — reused consistently throughout this run.
DB_PASS=$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

# Prompt for sensitive values — never hardcode credentials in scripts
echo "=========================================="
echo "ViviDev.id Deployment Script"
echo "=========================================="
echo ""
echo "VPS:     $VPS_IP"
echo "Domain:  $DOMAIN"
echo ""

read -r -p "SMTP Password: " SMTP_PASS
read -r -p "Admin seed password (ADMIN_SEED_PASSWORD): " ADMIN_SEED_PASSWORD
echo ""

# Derive the absolute path to this project
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# ---------------------------------------------------------------------------
echo -e "${BLUE}[1/8] Connecting to VPS and installing dependencies...${NC}"
# ---------------------------------------------------------------------------
ssh "$VPS_USER@$VPS_IP" << 'ENDSSH'
set -e

apt-get update -qq
apt-get upgrade -y

# Node.js 20 LTS (more stable than 24.x on current Ubuntu LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

apt-get install -y postgresql postgresql-contrib
apt-get install -y redis-server
apt-get install -y nginx
apt-get install -y certbot python3-certbot-nginx
apt-get install -y git

npm install -g pm2

echo "✓ All dependencies installed"
ENDSSH

echo -e "${GREEN}✓ Step 1 complete${NC}"

# ---------------------------------------------------------------------------
echo -e "${BLUE}[2/8] Setting up PostgreSQL database...${NC}"
# ---------------------------------------------------------------------------
# Unquoted ENDSSH so $DB_NAME, $DB_USER, $DB_PASS expand from this shell.
ssh "$VPS_USER@$VPS_IP" << ENDSSH
set -e

# Idempotent: only create if the user doesn't already exist
USER_EXISTS=\$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'")
if [ "\$USER_EXISTS" != "1" ]; then
  sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';"
  echo "✓ DB user created"
else
  sudo -u postgres psql -c "ALTER USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';"
  echo "✓ DB user password updated"
fi

DB_EXISTS=\$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
if [ "\$DB_EXISTS" != "1" ]; then
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
fi

sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;"

echo "✓ Database ready"
ENDSSH

echo -e "${GREEN}✓ Step 2 complete${NC}"

# ---------------------------------------------------------------------------
echo -e "${BLUE}[3/8] Creating project directories...${NC}"
# ---------------------------------------------------------------------------
ssh "$VPS_USER@$VPS_IP" << 'ENDSSH'
mkdir -p /var/www/vividev-id
mkdir -p /var/www/vividev-id/logs
echo "✓ Directories created"
ENDSSH

echo -e "${GREEN}✓ Step 3 complete${NC}"

# ---------------------------------------------------------------------------
echo -e "${BLUE}[4/8] Uploading project files...${NC}"
# ---------------------------------------------------------------------------
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude 'frontend/dist' \
  --exclude 'backend/dist' \
  "$PROJECT_DIR/" "$VPS_USER@$VPS_IP:/var/www/vividev-id/"

echo -e "${GREEN}✓ Step 4 complete${NC}"

# ---------------------------------------------------------------------------
echo -e "${BLUE}[5/8] Creating .env file on VPS...${NC}"
# ---------------------------------------------------------------------------
# Unquoted ENDSSH so variables expand from this shell.
# Inner EOF is quoted ('EOF') so nginx-style $ variables inside are NOT
# expanded — but here we deliberately want expansion, so EOF is unquoted.
ssh "$VPS_USER@$VPS_IP" << ENDSSH
set -e

cat > /var/www/vividev-id/backend/.env << EOF
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://$DOMAIN

DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME

REDIS_URL=redis://localhost:6379

JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_REFRESH_EXPIRES_IN=7d

SMTP_HOST=mx3.mailspace.id
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=support@vividev.id
SMTP_PASS=$SMTP_PASS
CONTACT_EMAIL_TO=support@vividev.id

WA_NUMBER=6285798112370

MAX_FILE_SIZE_MB=5
UPLOAD_DIR=/var/www/vividev-id/backend/uploads
ADMIN_SEED_PASSWORD=$ADMIN_SEED_PASSWORD
EOF

mkdir -p /var/www/vividev-id/backend/uploads
mkdir -p /var/www/vividev-id/backend/logs
echo "✓ .env created"
ENDSSH

echo -e "${GREEN}✓ Step 5 complete${NC}"

# ---------------------------------------------------------------------------
echo -e "${BLUE}[6/8] Installing dependencies and building...${NC}"
# ---------------------------------------------------------------------------
ssh "$VPS_USER@$VPS_IP" << 'ENDSSH'
set -e
cd /var/www/vividev-id

# Backend
cd backend
npm install --legacy-peer-deps
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed.ts || echo "Seed already run or skipped"
npm run build

# Frontend
cd ../frontend
npm install --legacy-peer-deps
npm run build

echo "✓ Build complete"
ENDSSH

echo -e "${GREEN}✓ Step 6 complete${NC}"

# ---------------------------------------------------------------------------
echo -e "${BLUE}[7/8] Configuring Nginx...${NC}"
# ---------------------------------------------------------------------------
# Upload the hardened nginx.conf from the project's nginx/ directory,
# then symlink it into sites-enabled.
scp "$PROJECT_DIR/nginx/nginx.conf" "$VPS_USER@$VPS_IP:/etc/nginx/sites-available/$DOMAIN"

ssh "$VPS_USER@$VPS_IP" << ENDSSH
set -e

# Remove default site if present
rm -f /etc/nginx/sites-enabled/default

# Enable our site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN

nginx -t
systemctl reload nginx
echo "✓ Nginx configured"
ENDSSH

echo -e "${GREEN}✓ Step 7 complete${NC}"

# ---------------------------------------------------------------------------
echo -e "${BLUE}[8/8] Starting application with PM2...${NC}"
# ---------------------------------------------------------------------------
ssh "$VPS_USER@$VPS_IP" << 'ENDSSH'
set -e
cd /var/www/vividev-id

pm2 delete vividev-backend 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u root --hp /root
echo "✓ PM2 started"
ENDSSH

echo -e "${GREEN}✓ Step 8 complete${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Point your domain DNS to: $VPS_IP"
echo "2. Wait for DNS propagation (5-30 minutes)"
echo "3. Run SSL setup:"
echo "   ssh $VPS_USER@$VPS_IP"
echo "   certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "Access your site:"
echo "- Frontend: http://$VPS_IP (or https://$DOMAIN after SSL)"
echo "- Admin:    http://$VPS_IP/admin"
echo "- Login:    admin@vividev.id / [password yang kamu set di ADMIN_SEED_PASSWORD]"
echo ""
echo "Database credentials (save these!):"
echo "- DB Name: $DB_NAME"
echo "- DB User: $DB_USER"
echo "- DB Pass: $DB_PASS"
echo ""
