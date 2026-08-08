#!/bin/bash
set -e

VPS_IP="163.61.58.26"
VPS_USER="root"
DOMAIN="vividev.id"
DB_NAME="vividev"
DB_USER="vividev"
DB_PASS=$(openssl rand -base64 16)

echo "=========================================="
echo "ViviDev.id Deployment Script"
echo "=========================================="
echo ""
echo "VPS: $VPS_IP"
echo "Domain: $DOMAIN"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[1/8] Connecting to VPS and installing dependencies...${NC}"
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
set -e

# Update system
apt-get update
apt-get upgrade -y

# Install Node.js 24.x
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt-get install -y nodejs

# Install PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Install Redis
apt-get install -y redis-server

# Install Nginx
apt-get install -y nginx

# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Install PM2 globally
npm install -g pm2

# Install Git
apt-get install -y git

echo "✓ All dependencies installed"
ENDSSH

echo -e "${GREEN}✓ Step 1 complete${NC}"

echo -e "${BLUE}[2/8] Setting up PostgreSQL database...${NC}"
ssh $VPS_USER@$VPS_IP << ENDSSH
set -e

# Create database and user
sudo -u postgres psql << EOSQL
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
EOSQL

echo "✓ Database created"
ENDSSH

echo -e "${GREEN}✓ Step 2 complete${NC}"

echo -e "${BLUE}[3/8] Creating project directory...${NC}"
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
mkdir -p /var/www/vividev-id
cd /var/www/vividev-id
ENDSSH

echo -e "${GREEN}✓ Step 3 complete${NC}"

echo -e "${BLUE}[4/8] Uploading project files...${NC}"
cd /Users/mac/Vividev/vividev-id
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' --exclude 'frontend/dist' --exclude 'backend/dist' . $VPS_USER@$VPS_IP:/var/www/vividev-id/

echo -e "${GREEN}✓ Step 4 complete${NC}"

echo -e "${BLUE}[5/8] Creating .env file on VPS...${NC}"
ssh $VPS_USER@$VPS_IP << ENDSSH
cat > /var/www/vividev-id/backend/.env << EOF
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://$DOMAIN

DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME

REDIS_URL=redis://localhost:6379

JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_EXPIRES_IN=7d

SMTP_HOST=mx3.mailspace.id
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=support@vividev.id
SMTP_PASS=sdX_7Qx7jguVnme
CONTACT_EMAIL_TO=support@vividev.id

WA_NUMBER=6285798112370

MAX_FILE_SIZE_MB=5
UPLOAD_DIR=./uploads
EOF

mkdir -p /var/www/vividev-id/backend/uploads
mkdir -p /var/www/vividev-id/backend/logs
echo "✓ .env created"
ENDSSH

echo -e "${GREEN}✓ Step 5 complete${NC}"

echo -e "${BLUE}[6/8] Installing dependencies and building...${NC}"
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
set -e
cd /var/www/vividev-id

# Backend
cd backend
npm install --production=false --legacy-peer-deps
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed.ts || echo "Seed already run"
npm run build

# Frontend
cd ../frontend
npm install --production=false --legacy-peer-deps
npm run build

echo "✓ Build complete"
ENDSSH

echo -e "${GREEN}✓ Step 6 complete${NC}"

echo -e "${BLUE}[7/8] Configuring Nginx...${NC}"
ssh $VPS_USER@$VPS_IP << ENDSSH
cat > /etc/nginx/sites-available/$DOMAIN << 'EOF'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Frontend static files
    location / {
        root /var/www/vividev-id/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Uploads (UUID filenames are immutable → cache for a year)
    location /uploads/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Sitemap & robots
    location ~ ^/(sitemap\.xml|robots\.txt)$ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
    }

    client_max_body_size 10M;
}
EOF

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo "✓ Nginx configured"
ENDSSH

echo -e "${GREEN}✓ Step 7 complete${NC}"

echo -e "${BLUE}[8/8] Starting application with PM2...${NC}"
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
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
echo "- Frontend: http://$VPS_IP (or http://$DOMAIN after DNS)"
echo "- Admin: http://$VPS_IP/admin"
echo "- Login: admin@vividev.id / Admin@Vividev2026!"
echo ""
echo "Database credentials (save these!):"
echo "- DB Name: $DB_NAME"
echo "- DB User: $DB_USER"
echo "- DB Pass: $DB_PASS"
echo ""
