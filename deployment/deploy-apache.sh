#!/bin/bash

# Employee Management System - Apache Deployment Script
# This script automates the complete Apache deployment process

set -e

# Configuration variables
DOMAIN="your-domain.com"
EMAIL="your-email@domain.com"
APP_DIR="/var/www/employee-management"
GITHUB_REPO="https://github.com/jauharianggara/next-app.git"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root. Please run as a regular user with sudo privileges."
    fi
}

# Check if user has sudo privileges
check_sudo() {
    if ! sudo -n true 2>/dev/null; then
        error "This script requires sudo privileges. Please run with a user that has sudo access."
    fi
}

# Detect OS
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        error "Cannot detect OS. This script supports Ubuntu/Debian and CentOS/RHEL."
    fi
    
    log "Detected OS: $OS $VER"
}

# Install Apache based on OS
install_apache() {
    log "Installing Apache and required modules..."
    
    case $OS in
        *"Ubuntu"*|*"Debian"*)
            sudo apt update
            sudo apt install -y apache2 apache2-utils certbot python3-certbot-apache
            
            # Enable required modules
            sudo a2enmod proxy
            sudo a2enmod proxy_http
            sudo a2enmod proxy_balancer
            sudo a2enmod lbmethod_byrequests
            sudo a2enmod ssl
            sudo a2enmod rewrite
            sudo a2enmod headers
            sudo a2enmod deflate
            sudo a2enmod expires
            ;;
        *"CentOS"*|*"Red Hat"*|*"Rocky"*|*"AlmaLinux"*)
            sudo dnf install -y httpd mod_ssl certbot python3-certbot-apache
            
            # Configure firewall
            sudo firewall-cmd --permanent --add-port=80/tcp
            sudo firewall-cmd --permanent --add-port=443/tcp
            sudo firewall-cmd --reload
            ;;
        *)
            error "Unsupported OS: $OS"
            ;;
    esac
    
    # Start and enable Apache
    sudo systemctl start apache2 2>/dev/null || sudo systemctl start httpd
    sudo systemctl enable apache2 2>/dev/null || sudo systemctl enable httpd
    
    log "Apache installed and started successfully"
}

# Install Docker
install_docker() {
    log "Installing Docker..."
    
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        
        # Install Docker Compose
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        
        log "Docker installed successfully"
        warn "Please log out and back in to use Docker without sudo"
    else
        log "Docker is already installed"
    fi
}

# Setup application
setup_application() {
    log "Setting up Employee Management System..."
    
    # Create application directory
    sudo mkdir -p $APP_DIR
    sudo chown $USER:$USER $APP_DIR
    
    # Clone repository
    if [[ -d "$APP_DIR/.git" ]]; then
        log "Repository already exists, updating..."
        cd $APP_DIR
        git pull origin master
    else
        log "Cloning repository..."
        git clone $GITHUB_REPO $APP_DIR
        cd $APP_DIR
    fi
    
    # Copy environment file
    if [[ ! -f .env.production ]]; then
        cp .env.example .env.production 2>/dev/null || echo "# Add your environment variables here" > .env.production
        warn "Please edit .env.production with your environment variables"
    fi
}

# Deploy with Docker
deploy_application() {
    log "Deploying application with Docker..."
    
    cd $APP_DIR
    
    # Build and start containers
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Wait for services to be ready
    log "Waiting for services to start..."
    sleep 30
    
    # Check if services are running
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        log "Application deployed successfully"
    else
        error "Failed to deploy application"
    fi
}

# Configure Apache
configure_apache() {
    log "Configuring Apache virtual host..."
    
    # Copy Apache configuration
    sudo cp $APP_DIR/deployment/apache.conf /etc/apache2/sites-available/employee-app.conf 2>/dev/null || \
    sudo cp $APP_DIR/deployment/apache.conf /etc/httpd/conf.d/employee-app.conf
    
    # Replace placeholder domain
    sudo sed -i "s/your-domain.com/$DOMAIN/g" /etc/apache2/sites-available/employee-app.conf 2>/dev/null || \
    sudo sed -i "s/your-domain.com/$DOMAIN/g" /etc/httpd/conf.d/employee-app.conf
    
    # Enable site (Ubuntu/Debian)
    if command -v a2ensite &> /dev/null; then
        sudo a2ensite employee-app.conf
        sudo a2dissite 000-default.conf 2>/dev/null || true
    fi
    
    # Test configuration
    sudo apache2ctl configtest 2>/dev/null || sudo httpd -t
    
    # Restart Apache
    sudo systemctl restart apache2 2>/dev/null || sudo systemctl restart httpd
    
    log "Apache configured successfully"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    log "Setting up SSL certificate with Let's Encrypt..."
    
    # Generate SSL certificate
    sudo certbot --apache -d $DOMAIN -m $EMAIL --agree-tos --non-interactive --redirect
    
    # Setup auto-renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    log "SSL certificate configured successfully"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    # Check Apache status
    if systemctl is-active --quiet apache2 2>/dev/null || systemctl is-active --quiet httpd; then
        log "✅ Apache is running"
    else
        error "❌ Apache is not running"
    fi
    
    # Check Docker containers
    cd $APP_DIR
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        log "✅ Application containers are running"
    else
        warn "❌ Some application containers are not running"
    fi
    
    # Check ports
    if ss -tlnp | grep -q ":80\|:443"; then
        log "✅ Apache is listening on ports 80/443"
    else
        warn "❌ Apache is not listening on expected ports"
    fi
    
    # Test HTTP response
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
        log "✅ HTTP response is working"
    else
        warn "❌ HTTP response test failed"
    fi
}

# Display final information
show_completion_info() {
    log "🎉 Deployment completed successfully!"
    echo ""
    echo -e "${BLUE}📋 Deployment Summary:${NC}"
    echo -e "${BLUE}Domain:${NC} https://$DOMAIN"
    echo -e "${BLUE}Application:${NC} Employee Management System"
    echo -e "${BLUE}Web Server:${NC} Apache"
    echo -e "${BLUE}SSL:${NC} Let's Encrypt"
    echo -e "${BLUE}Application Directory:${NC} $APP_DIR"
    echo ""
    echo -e "${BLUE}🔧 Useful Commands:${NC}"
    echo "Check Apache status: sudo systemctl status apache2"
    echo "View Apache logs: sudo tail -f /var/log/apache2/employee-app-ssl-error.log"
    echo "Restart application: cd $APP_DIR && docker-compose -f docker-compose.prod.yml restart"
    echo "Update application: cd $APP_DIR && git pull && docker-compose -f docker-compose.prod.yml up -d --build"
    echo ""
    echo -e "${GREEN}🌐 Your Employee Management System is now available at: https://$DOMAIN${NC}"
}

# Main execution
main() {
    log "🚀 Starting Employee Management System deployment with Apache..."
    
    # Read configuration if not set
    if [[ $DOMAIN == "your-domain.com" ]]; then
        read -p "Enter your domain name: " DOMAIN
        read -p "Enter your email for SSL certificate: " EMAIL
    fi
    
    # Pre-flight checks
    check_root
    check_sudo
    detect_os
    
    # Installation steps
    install_apache
    install_docker
    setup_application
    deploy_application
    configure_apache
    
    # SSL setup (optional)
    read -p "Do you want to setup SSL with Let's Encrypt? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_ssl
    fi
    
    # Final checks and information
    health_check
    show_completion_info
}

# Run main function
main "$@"