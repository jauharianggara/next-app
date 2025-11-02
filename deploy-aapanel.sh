#!/bin/bash
# Deployment Script for aaPanel
# This script updates the configuration and restarts services

set -e

echo "🚀 Starting deployment to aaPanel..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APACHE_VHOST_DIR="/www/server/panel/vhost/apache"
APACHE_CONF="${APACHE_VHOST_DIR}/nextjs.synergyinfinity.id.conf"
DOCKER_COMPOSE_DIR="/www/wwwroot"
BACKUP_DIR="/www/backup/$(date +%Y%m%d_%H%M%S)"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Create backup directory
echo "📦 Creating backup..."
mkdir -p "$BACKUP_DIR"

# Backup Apache config
if [ -f "$APACHE_CONF" ]; then
    cp "$APACHE_CONF" "$BACKUP_DIR/apache-config.conf.bak"
    print_status "Apache config backed up"
else
    print_warning "No existing Apache config found"
fi

# Backup docker-compose
if [ -f "${DOCKER_COMPOSE_DIR}/docker-compose.yml" ]; then
    cp "${DOCKER_COMPOSE_DIR}/docker-compose.yml" "$BACKUP_DIR/docker-compose.yml.bak"
    print_status "Docker compose backed up"
fi

# Enable Apache modules
echo ""
echo "🔧 Enabling required Apache modules..."
a2enmod proxy 2>/dev/null || print_warning "proxy already enabled"
a2enmod proxy_http 2>/dev/null || print_warning "proxy_http already enabled"
a2enmod headers 2>/dev/null || print_warning "headers already enabled"
a2enmod rewrite 2>/dev/null || print_warning "rewrite already enabled"
a2enmod ssl 2>/dev/null || print_warning "ssl already enabled"
a2enmod proxy_wstunnel 2>/dev/null || print_warning "proxy_wstunnel already enabled"
print_status "Apache modules checked"

# Test Apache configuration
echo ""
echo "🧪 Testing Apache configuration..."
if apachectl configtest 2>&1 | grep -q "Syntax OK"; then
    print_status "Apache config syntax OK"
else
    print_error "Apache config has errors!"
    apachectl configtest
    exit 1
fi

# Stop Docker containers
echo ""
echo "🛑 Stopping Docker containers..."
cd "$DOCKER_COMPOSE_DIR"
docker-compose down
print_status "Containers stopped"

# Remove old containers
echo ""
echo "🧹 Cleaning up old containers..."
docker rm employee-frontend 2>/dev/null || print_warning "No old container to remove"

# Rebuild Docker image if Dockerfile exists
if [ -f "Dockerfile" ]; then
    echo ""
    echo "🔨 Rebuilding Docker image..."
    docker build --no-cache \
        --build-arg NEXT_PUBLIC_API_URL=http://axum.synergyinfinity.id/api \
        -t employee-frontend:latest .
    print_status "Image built successfully"
fi

# Start Docker containers
echo ""
echo "🚀 Starting Docker containers..."
docker-compose up -d
print_status "Containers started"

# Restart Apache
echo ""
echo "🔄 Restarting Apache..."
systemctl restart apache2
if systemctl is-active --quiet apache2; then
    print_status "Apache restarted successfully"
else
    print_error "Apache failed to start!"
    systemctl status apache2
    exit 1
fi

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Health checks
echo ""
echo "🏥 Running health checks..."

# Check if frontend is responding
if curl -f -s http://127.0.0.1:3000 > /dev/null; then
    print_status "Frontend is running on port 3000"
else
    print_error "Frontend is not responding!"
fi

# Check if site is accessible via HTTPS
if curl -f -s -k https://nextjs.synergyinfinity.id > /dev/null; then
    print_status "HTTPS site is accessible"
else
    print_warning "HTTPS site may not be accessible yet"
fi

# Check backend proxy
if curl -f -s -k https://nextjs.synergyinfinity.id/api/ > /dev/null 2>&1; then
    print_status "Backend proxy is working"
else
    print_warning "Backend proxy may not be working yet"
fi

# Show Docker logs
echo ""
echo "📋 Recent Docker logs:"
docker-compose logs --tail=20 frontend

# Final status
echo ""
echo "================================================"
echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo ""
echo "📍 Services:"
echo "   Frontend: https://nextjs.synergyinfinity.id"
echo "   Backend:  https://axum.synergyinfinity.id/api"
echo "   Proxied:  https://nextjs.synergyinfinity.id/api"
echo ""
echo "📁 Backup location: $BACKUP_DIR"
echo ""
echo "🔍 Check logs:"
echo "   Apache:  tail -f /www/wwwlogs/nextjs.synergyinfinity.id-error_log"
echo "   Docker:  docker-compose logs -f frontend"
echo ""
