# 🔧 Server Setup Script for Ubuntu/Debian

#!/bin/bash

# Employee Management System - Production Server Setup
# This script sets up a complete production environment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOMAIN="your-domain.com"
EMAIL="your-email@domain.com"
APP_USER="employee-app"
APP_DIR="/var/www/employee-management"

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

print_status "Starting Employee Management System server setup..."

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release

# Install Node.js 20
print_status "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
print_success "Node.js installed: $NODE_VERSION"

# Install Docker
print_status "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
print_status "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Nginx
print_status "Installing Nginx..."
apt install -y nginx

# Install PostgreSQL (optional)
print_status "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Install PM2 (for non-Docker deployment)
print_status "Installing PM2..."
npm install -g pm2

# Install Certbot for SSL
print_status "Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Create application user
print_status "Creating application user..."
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash $APP_USER
    usermod -aG docker $APP_USER
    print_success "User $APP_USER created"
else
    print_warning "User $APP_USER already exists"
fi

# Create application directory
print_status "Creating application directory..."
mkdir -p $APP_DIR
chown $APP_USER:$APP_USER $APP_DIR

# Setup firewall
print_status "Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow http
ufw allow https
ufw allow 3000  # Frontend
ufw allow 8080  # Backend
print_success "Firewall configured"

# Setup PostgreSQL
print_status "Configuring PostgreSQL..."
sudo -u postgres psql << EOF
CREATE DATABASE employee_db;
CREATE USER employee_user WITH ENCRYPTED PASSWORD 'employee_password_$(openssl rand -hex 8)';
GRANT ALL PRIVILEGES ON DATABASE employee_db TO employee_user;
\q
EOF

# Get the generated password
DB_PASSWORD=$(sudo -u postgres psql -t -c "SELECT rolpassword FROM pg_authid WHERE rolname='employee_user';" | tr -d ' ')

# Create environment file template
print_status "Creating environment template..."
cat > $APP_DIR/.env.template << EOF
# Production Environment Configuration
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://$DOMAIN

# Database Configuration
DATABASE_URL=postgresql://employee_user:GENERATED_PASSWORD@localhost:5432/employee_db
POSTGRES_USER=employee_user
POSTGRES_PASSWORD=GENERATED_PASSWORD
POSTGRES_DB=employee_db

# Security
JWT_SECRET=$(openssl rand -hex 32)
BCRYPT_ROUNDS=12

# Optional: Disable telemetry
NEXT_TELEMETRY_DISABLED=1
EOF

# Clone repository
print_status "Cloning application repository..."
cd $APP_DIR
if [ -d ".git" ]; then
    print_warning "Repository already exists, pulling latest changes..."
    sudo -u $APP_USER git pull
else
    sudo -u $APP_USER git clone https://github.com/jauharianggara/next-app.git .
fi

# Copy environment file
print_status "Setting up environment file..."
cp .env.template .env
sed -i "s/GENERATED_PASSWORD/$DB_PASSWORD/g" .env
chown $APP_USER:$APP_USER .env
chmod 600 .env

# Setup Nginx configuration
print_status "Configuring Nginx..."
cp deployment/nginx.conf /etc/nginx/sites-available/$APP_USER
sed -i "s/your-domain.com/$DOMAIN/g" /etc/nginx/sites-available/$APP_USER

# Create sites-enabled symlink
ln -sf /etc/nginx/sites-available/$APP_USER /etc/nginx/sites-enabled/

# Remove default Nginx site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t
if [ $? -eq 0 ]; then
    print_success "Nginx configuration is valid"
else
    print_error "Nginx configuration has errors"
    exit 1
fi

# Start and enable services
print_status "Starting services..."
systemctl start nginx
systemctl enable nginx
systemctl start postgresql
systemctl enable postgresql
systemctl start docker
systemctl enable docker

# Setup SSL certificate
if [ "$DOMAIN" != "your-domain.com" ]; then
    print_status "Setting up SSL certificate..."
    certbot --nginx -d $DOMAIN -m $EMAIL --agree-tos --non-interactive
    
    # Setup auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    print_success "SSL certificate installed and auto-renewal configured"
else
    print_warning "Default domain detected, skipping SSL setup"
    print_warning "Please update the domain in this script and re-run SSL setup"
fi

# Create deployment script
print_status "Creating deployment script..."
cat > $APP_DIR/deploy-production.sh << 'EOF'
#!/bin/bash
set -e

APP_DIR="/var/www/employee-management"
cd $APP_DIR

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin master

# Build and deploy with Docker
echo "📦 Building with Docker..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services..."
sleep 30

# Health check
echo "🏥 Running health checks..."
if curl -f http://localhost:8080/health; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    docker-compose logs backend
    exit 1
fi

if curl -f http://localhost:3000; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    docker-compose logs frontend
    exit 1
fi

echo "🎉 Deployment completed successfully!"
EOF

chmod +x $APP_DIR/deploy-production.sh
chown $APP_USER:$APP_USER $APP_DIR/deploy-production.sh

# Create systemd service for auto-start
print_status "Creating systemd service..."
cat > /etc/systemd/system/employee-app.service << EOF
[Unit]
Description=Employee Management System
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=$APP_USER
Group=$APP_USER

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable employee-app.service

# Create monitoring script
print_status "Creating monitoring script..."
cat > $APP_DIR/monitor.sh << 'EOF'
#!/bin/bash

echo "=== Employee Management System Status ==="
echo "Date: $(date)"
echo ""

echo "🐳 Docker Containers:"
docker-compose ps
echo ""

echo "🌐 Service Health:"
echo -n "Backend: "
if curl -sf http://localhost:8080/health > /dev/null; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy"
fi

echo -n "Frontend: "
if curl -sf http://localhost:3000 > /dev/null; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy"
fi
echo ""

echo "💽 System Resources:"
echo "Memory: $(free -h | awk '/^Mem/ {print $3 "/" $2}')"
echo "Disk: $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 " used)"}')"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo ""

echo "📊 Docker Stats:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
EOF

chmod +x $APP_DIR/monitor.sh
chown $APP_USER:$APP_USER $APP_DIR/monitor.sh

# Create backup script
print_status "Creating backup script..."
cat > $APP_DIR/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/employee-app"
DATE=$(date +"%Y%m%d_%H%M%S")

mkdir -p $BACKUP_DIR

echo "🗄️ Creating backup..."

# Database backup
echo "Backing up database..."
sudo -u postgres pg_dump employee_db > $BACKUP_DIR/db_backup_$DATE.sql

# Application backup
echo "Backing up application files..."
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C /var/www employee-management --exclude=node_modules --exclude=.git

# Docker volumes backup
echo "Backing up Docker volumes..."
docker run --rm -v employee-management_postgres_data:/volume -v $BACKUP_DIR:/backup alpine tar czf /backup/volumes_backup_$DATE.tar.gz -C /volume ./

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_DIR/backup_$DATE.*"
EOF

chmod +x $APP_DIR/backup.sh
chown $APP_USER:$APP_USER $APP_DIR/backup.sh

# Setup cron jobs
print_status "Setting up cron jobs..."
sudo -u $APP_USER crontab << EOF
# Daily backup at 2 AM
0 2 * * * $APP_DIR/backup.sh

# Health check every 5 minutes
*/5 * * * * $APP_DIR/monitor.sh > /dev/null

# SSL certificate renewal (already set up above)
EOF

# Final setup
print_status "Performing initial deployment..."
cd $APP_DIR
sudo -u $APP_USER $APP_DIR/deploy-production.sh

# Show final status
print_success "🎉 Server setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Update DNS records to point $DOMAIN to this server"
echo "2. Edit $APP_DIR/.env with your specific configuration"
echo "3. Test the application at https://$DOMAIN"
echo ""
echo "🔧 Management Commands:"
echo "  Deploy: sudo -u $APP_USER $APP_DIR/deploy-production.sh"
echo "  Monitor: sudo -u $APP_USER $APP_DIR/monitor.sh"
echo "  Backup: sudo -u $APP_USER $APP_DIR/backup.sh"
echo "  Logs: docker-compose -f $APP_DIR/docker-compose.yml logs -f"
echo ""
echo "🌐 Application URLs:"
echo "  Frontend: https://$DOMAIN"
echo "  Backend API: https://$DOMAIN/api"
echo "  Health Check: https://$DOMAIN/health"
echo ""
echo "📊 Monitoring:"
echo "  System: sudo -u $APP_USER $APP_DIR/monitor.sh"
echo "  Docker: docker-compose ps"
echo "  Nginx: systemctl status nginx"
echo ""

print_success "Setup completed! Your Employee Management System is ready for production."