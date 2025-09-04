#!/bin/bash

# HTTPS Setup Script for SDG Project
# This script sets up Let's Encrypt SSL certificates

set -e

DOMAIN="sdg.unswzoo.com"
EMAIL="contactus@sdg.unswzoo.com"

echo "=== HTTPS Setup for $DOMAIN ==="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run this script with sudo"
    exit 1
fi

# Check if domain resolves to this server
echo "Checking DNS resolution..."
CURRENT_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)

if [ "$CURRENT_IP" != "$DOMAIN_IP" ]; then
    echo "WARNING: Domain $DOMAIN resolves to $DOMAIN_IP but server IP is $CURRENT_IP"
    echo "Please update DNS records first!"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create directories
echo "Creating certificate directories..."
mkdir -p ./certbot/conf
mkdir -p ./certbot/www
chmod -R 755 ./certbot/

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Create temporary nginx config for certificate validation
echo "Creating temporary nginx configuration..."
cat > ./frontend/nginx-temp.conf << 'EOF'
server {
    listen 80;
    server_name sdg.unswzoo.com 149.28.177.238;
    root /usr/share/nginx/html;
    index index.html;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
    }

    # Serve React app for other requests
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy - temporary HTTP only
    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Backup original files
echo "Backing up original files..."
cp ./docker-compose.yml ./docker-compose.yml.backup
cp ./frontend/nginx.conf ./frontend/nginx.conf.backup
cp ./frontend/Dockerfile ./frontend/Dockerfile.backup

# Create temporary docker-compose for certificate generation
echo "Creating temporary docker-compose file..."
cat > ./docker-compose-temp.yml << 'EOF'
version: '3.8'
services:
  db:
    image: mysql:8.0
    container_name: sdg_hub_db_temp
    environment:
      MYSQL_ROOT_PASSWORD: SDG_Root@2025
      MYSQL_DATABASE: sdg_database
      MYSQL_USER: sdg_admin
      MYSQL_PASSWORD: SDG_Admin@2025
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  redis:
    image: redis:alpine
    container_name: sdg_hub_redis_temp
    volumes:
      - redis_data:/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      timeout: 10s
      retries: 5
    command: redis-server --appendonly yes

  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: sdg_hub_backend_temp
    environment:
      - DATABASE_HOST=db
      - DATABASE_PORT=3306
      - DATABASE_NAME=sdg_database
      - DATABASE_USER=sdg_admin
      - DATABASE_PASSWORD=SDG_Admin@2025
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_DB=0
      - DEBUG=False
      - ALLOWED_HOSTS=localhost,127.0.0.1,frontend,sdg_backend,149.28.177.238,sdg.unswzoo.com
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app-network

  frontend-temp:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: sdg_hub_frontend_temp
    ports:
      - "80:80"
    volumes:
      - ./certbot/www:/var/www/certbot:rw
    depends_on:
      - backend
    networks:
      - app-network
    command: |
      sh -c "cp /nginx-temp.conf /etc/nginx/conf.d/default.conf && 
             mkdir -p /var/www/certbot && 
             nginx -t && 
             nginx -g 'daemon off;'"

volumes:
  mysql_data:
  redis_data:

networks:
  app-network:
    driver: bridge
EOF

# Update frontend Dockerfile temporarily
cat > ./frontend/Dockerfile << 'EOF'
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx-temp.conf /nginx-temp.conf
RUN mkdir -p /var/www/certbot && chmod -R 755 /var/www/certbot
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

echo "Building and starting temporary containers..."
docker-compose -f docker-compose-temp.yml up -d --build

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Check if service is responding
echo "Checking service status..."
if ! curl -f http://localhost/.well-known/acme-challenge/ >/dev/null 2>&1; then
    echo "Service doesn't seem to be responding correctly, checking container status..."
    docker-compose -f docker-compose-temp.yml ps
    docker-compose -f docker-compose-temp.yml logs frontend-temp
fi

# Request SSL certificate
echo "Requesting SSL certificate..."
docker run --rm \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    -v $(pwd)/certbot/www:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN

if [ $? -eq 0 ]; then
    echo "✓ SSL certificate request successful!"
else
    echo "✗ SSL certificate request failed"
    echo "Cleaning up temporary files..."
    docker-compose -f docker-compose-temp.yml down
    mv ./docker-compose.yml.backup ./docker-compose.yml
    mv ./frontend/nginx.conf.backup ./frontend/nginx.conf
    mv ./frontend/Dockerfile.backup ./frontend/Dockerfile
    rm -f ./frontend/nginx-temp.conf ./docker-compose-temp.yml
    exit 1
fi

# Stop temporary containers
echo "Stopping temporary containers..."
docker-compose -f docker-compose-temp.yml down

# Restore and update configuration files
echo "Updating configuration files..."
mv ./docker-compose.yml.backup ./docker-compose.yml
mv ./frontend/nginx.conf.backup ./frontend/nginx.conf
mv ./frontend/Dockerfile.backup ./frontend/Dockerfile
rm -f ./frontend/nginx-temp.conf ./docker-compose-temp.yml

# Set proper permissions
echo "Setting certificate permissions..."
chown -R $USER:$USER ./certbot/conf
chmod -R 755 ./certbot/conf

echo ""
echo "=== SSL certificate setup complete! ==="
echo ""
