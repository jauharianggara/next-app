#!/bin/bash

# 🚀 Employee Management System - Auto Deployment Script
# Usage: ./deploy.sh [environment] [platform]
# Example: ./deploy.sh production docker
#          ./deploy.sh staging vercel

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="employee-management"
REPO_URL="https://github.com/jauharianggara/next-app.git"
DEFAULT_ENV="production"
DEFAULT_PLATFORM="docker"

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "=========================================="
    echo "🚀 Employee Management System Deployment"
    echo "=========================================="
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_requirements() {
    print_info "Checking requirements..."
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install git first."
        exit 1
    fi
    
    # Check if docker is installed (for docker deployment)
    if [ "$PLATFORM" = "docker" ]; then
        if ! command -v docker &> /dev/null; then
            print_error "Docker is not installed. Please install Docker first."
            exit 1
        fi
        
        if ! command -v docker-compose &> /dev/null; then
            print_error "Docker Compose is not installed. Please install Docker Compose first."
            exit 1
        fi
    fi
    
    # Check if node is installed (for manual deployment)
    if [ "$PLATFORM" = "manual" ] || [ "$PLATFORM" = "pm2" ]; then
        if ! command -v node &> /dev/null; then
            print_error "Node.js is not installed. Please install Node.js 20+ first."
            exit 1
        fi
        
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            print_error "Node.js version 18+ is required. Current version: $(node --version)"
            exit 1
        fi
    fi
    
    print_success "All requirements met!"
}

setup_environment() {
    print_info "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_warning "Created .env from .env.example. Please edit .env file with your configuration."
        else
            cat > .env << EOF
NODE_ENV=$ENVIRONMENT
NEXT_PUBLIC_API_URL=http://localhost:8080

# Database Configuration
DATABASE_URL=postgresql://employee_user:employee_password@localhost:5432/employee_db
POSTGRES_USER=employee_user
POSTGRES_PASSWORD=employee_password
POSTGRES_DB=employee_db

# Security
JWT_SECRET=your-super-secret-jwt-key-here
BCRYPT_ROUNDS=12

# Optional: Disable telemetry
NEXT_TELEMETRY_DISABLED=1
EOF
            print_warning "Created basic .env file. Please edit it with your configuration."
        fi
        
        read -p "Do you want to edit .env file now? (y/n): " edit_env
        if [ "$edit_env" = "y" ] || [ "$edit_env" = "Y" ]; then
            ${EDITOR:-nano} .env
        fi
    else
        print_success "Environment file already exists."
    fi
}

deploy_docker() {
    print_info "Deploying with Docker..."
    
    # Choose Docker Compose file based on environment
    if [ "$ENVIRONMENT" = "development" ] || [ "$ENVIRONMENT" = "dev" ]; then
        COMPOSE_FILE="docker-compose.dev.yml"
        print_info "Using development configuration"
    else
        COMPOSE_FILE="docker-compose.yml"
        print_info "Using production configuration"
    fi
    
    # Stop existing containers
    print_info "Stopping existing containers..."
    docker-compose -f $COMPOSE_FILE down || true
    
    # Build and start containers
    print_info "Building and starting containers..."
    docker-compose -f $COMPOSE_FILE up -d --build
    
    # Wait for services to be ready
    print_info "Waiting for services to be ready..."
    sleep 10
    
    # Health check
    print_info "Performing health checks..."
    
    # Check backend
    for i in {1..30}; do
        if curl -f http://localhost:8080/health &>/dev/null; then
            print_success "Backend is healthy"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Backend health check failed"
            docker-compose -f $COMPOSE_FILE logs backend
            exit 1
        fi
        sleep 2
    done
    
    # Check frontend
    for i in {1..30}; do
        if curl -f http://localhost:3000 &>/dev/null; then
            print_success "Frontend is healthy"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Frontend health check failed"
            docker-compose -f $COMPOSE_FILE logs frontend
            exit 1
        fi
        sleep 2
    done
    
    print_success "Docker deployment completed successfully!"
    print_info "Frontend: http://localhost:3000"
    print_info "Backend API: http://localhost:8080"
    print_info "API Documentation: http://localhost:8080/"
}

deploy_pm2() {
    print_info "Deploying with PM2..."
    
    # Install PM2 if not exists
    if ! command -v pm2 &> /dev/null; then
        print_info "Installing PM2..."
        npm install -g pm2
    fi
    
    # Install dependencies and build
    print_info "Installing dependencies..."
    npm ci
    
    print_info "Building application..."
    npm run build
    
    # Setup backend
    print_info "Setting up backend..."
    cd mock-backend
    npm install
    
    # Stop existing processes
    pm2 delete $APP_NAME-frontend 2>/dev/null || true
    pm2 delete $APP_NAME-backend 2>/dev/null || true
    
    # Start backend
    print_info "Starting backend with PM2..."
    pm2 start server.js --name "$APP_NAME-backend"
    
    # Start frontend
    cd ..
    print_info "Starting frontend with PM2..."
    pm2 start npm --name "$APP_NAME-frontend" -- start
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup (ask user)
    read -p "Do you want to setup PM2 auto-startup? (y/n): " setup_startup
    if [ "$setup_startup" = "y" ] || [ "$setup_startup" = "Y" ]; then
        pm2 startup
    fi
    
    print_success "PM2 deployment completed successfully!"
    print_info "Use 'pm2 status' to check application status"
    print_info "Use 'pm2 logs' to view application logs"
}

deploy_vercel() {
    print_info "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_info "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    print_info "Deploying to Vercel..."
    if [ "$ENVIRONMENT" = "production" ]; then
        vercel --prod
    else
        vercel
    fi
    
    print_success "Vercel deployment completed!"
    print_warning "Note: You'll need to deploy the backend separately to a platform like Railway, Heroku, or your own server."
}

deploy_manual() {
    print_info "Manual deployment..."
    
    # Install dependencies and build
    print_info "Installing dependencies..."
    npm ci
    
    print_info "Building application..."
    npm run build
    
    # Setup backend
    print_info "Setting up backend..."
    cd mock-backend
    npm install
    
    print_info "Starting backend..."
    npm start &
    BACKEND_PID=$!
    
    # Start frontend
    cd ..
    print_info "Starting frontend..."
    npm start &
    FRONTEND_PID=$!
    
    print_success "Manual deployment started!"
    print_info "Frontend: http://localhost:3000"
    print_info "Backend: http://localhost:8080"
    print_warning "Backend PID: $BACKEND_PID"
    print_warning "Frontend PID: $FRONTEND_PID"
    print_warning "Use 'kill $BACKEND_PID $FRONTEND_PID' to stop the services"
}

show_post_deployment_info() {
    print_header
    print_success "Deployment completed successfully!"
    echo
    print_info "Application URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:8080"
    echo "  API Documentation: http://localhost:8080/"
    echo "  Health Check: http://localhost:8080/health"
    echo
    print_info "API Endpoints:"
    echo "  Authentication: POST /api/auth/register, /api/auth/login"
    echo "  Employees: GET/POST/PUT/DELETE /api/karyawans"
    echo "  Positions: GET/POST /api/jabatans"
    echo "  Offices: GET/POST /api/kantors"
    echo
    print_info "Management Commands:"
    if [ "$PLATFORM" = "docker" ]; then
        echo "  View logs: docker-compose logs -f"
        echo "  Stop services: docker-compose down"
        echo "  Restart: docker-compose restart"
    elif [ "$PLATFORM" = "pm2" ]; then
        echo "  View status: pm2 status"
        echo "  View logs: pm2 logs"
        echo "  Restart: pm2 restart all"
        echo "  Stop: pm2 stop all"
    fi
    echo
    print_warning "Don't forget to:"
    echo "  - Setup Nginx reverse proxy for production"
    echo "  - Configure SSL certificates"
    echo "  - Setup proper database for production"
    echo "  - Configure monitoring and backup"
}

# Main script
main() {
    # Parse arguments
    ENVIRONMENT=${1:-$DEFAULT_ENV}
    PLATFORM=${2:-$DEFAULT_PLATFORM}
    
    print_header
    print_info "Environment: $ENVIRONMENT"
    print_info "Platform: $PLATFORM"
    echo
    
    # Validate arguments
    if [[ ! "$ENVIRONMENT" =~ ^(development|dev|staging|production|prod)$ ]]; then
        print_error "Invalid environment. Use: development, staging, or production"
        exit 1
    fi
    
    if [[ ! "$PLATFORM" =~ ^(docker|pm2|manual|vercel)$ ]]; then
        print_error "Invalid platform. Use: docker, pm2, manual, or vercel"
        exit 1
    fi
    
    # Check requirements
    check_requirements
    
    # Setup environment
    setup_environment
    
    # Deploy based on platform
    case $PLATFORM in
        docker)
            deploy_docker
            ;;
        pm2)
            deploy_pm2
            ;;
        vercel)
            deploy_vercel
            ;;
        manual)
            deploy_manual
            ;;
        *)
            print_error "Unknown platform: $PLATFORM"
            exit 1
            ;;
    esac
    
    # Show post-deployment information
    show_post_deployment_info
}

# Show usage if help is requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    print_header
    echo "Usage: $0 [environment] [platform]"
    echo
    echo "Environments:"
    echo "  development, dev    - Development environment"
    echo "  staging            - Staging environment"
    echo "  production, prod   - Production environment (default)"
    echo
    echo "Platforms:"
    echo "  docker            - Deploy with Docker Compose (default)"
    echo "  pm2               - Deploy with PM2 process manager"
    echo "  manual            - Manual deployment (development only)"
    echo "  vercel            - Deploy to Vercel platform"
    echo
    echo "Examples:"
    echo "  $0                          # Production with Docker"
    echo "  $0 development docker       # Development with Docker"
    echo "  $0 production pm2           # Production with PM2"
    echo "  $0 staging vercel           # Staging to Vercel"
    echo
    exit 0
fi

# Run main function
main "$@"