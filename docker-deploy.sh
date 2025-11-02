#!/bin/bash
# Docker Build and Deploy Script for Linux/Mac
# This script handles Docker image format issues and provides robust deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR: $1${NC}"
}

# Check Docker availability
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "❌ Docker is not installed"
        exit 1
    fi
    
    if ! docker ps &> /dev/null; then
        error "❌ Docker is not running"
        exit 1
    fi
    
    log "✅ Docker is running"
}

# Clean Docker environment
clean_environment() {
    log "🧹 Cleaning Docker environment..."
    
    # Stop existing containers
    docker-compose down 2>/dev/null || true
    
    # Remove old images
    OLD_IMAGES=$(docker images "employee-frontend" -q)
    if [ ! -z "$OLD_IMAGES" ]; then
        docker rmi $OLD_IMAGES -f || true
        log "🗑️ Removed old images"
    fi
    
    # Clean build cache
    docker builder prune -f || true
    
    log "✅ Environment cleaned"
}

# Build Docker image
build_image() {
    log "🔨 Building Docker image..."
    
    if docker build -t employee-frontend:latest .; then
        log "✅ Docker image built successfully"
        return 0
    else
        error "❌ Docker build failed"
        return 1
    fi
}

# Deploy with docker-compose
start_services() {
    log "🚀 Starting services with docker-compose..."
    
    if docker-compose up -d; then
        log "✅ Services started successfully"
        
        # Wait for health check
        log "⏳ Waiting for services to be healthy..."
        sleep 15
        
        return 0
    else
        error "❌ Failed to start services"
        return 1
    fi
}

# Health check
test_services() {
    log "🔍 Performing health checks..."
    
    # Check frontend
    if curl -f -s http://localhost:3000 > /dev/null; then
        log "✅ Frontend is healthy"
    else
        warn "⚠️ Frontend health check failed"
        return 1
    fi
    
    # Check container status
    docker-compose ps
    
    return 0
}

# Show service status
show_status() {
    log "📊 Current service status:"
    docker-compose ps
    
    echo ""
    log "📋 Access URLs:"
    echo "Frontend: http://localhost:3000"
    
    echo ""
    log "🔧 Useful commands:"
    echo "View logs: ./docker-deploy.sh logs"
    echo "Restart:   ./docker-deploy.sh restart"
    echo "Stop:      ./docker-deploy.sh stop"
}

# Show logs
show_logs() {
    log "📋 Showing container logs..."
    docker-compose logs -f
}

# Stop services
stop_services() {
    log "🛑 Stopping services..."
    docker-compose down
    log "✅ Services stopped"
}

# Restart services
restart_services() {
    log "🔄 Restarting services..."
    docker-compose down
    sleep 3
    start_services
}

# Main function
main() {
    local action=${1:-deploy}
    
    log "🐳 Docker Frontend Deploy Script"
    log "Action: $action"
    
    # Check Docker first
    check_docker
    
    case $action in
        "build")
            clean_environment
            build_image
            ;;
        "deploy")
            clean_environment
            if build_image; then
                if start_services; then
                    test_services
                    show_status
                fi
            fi
            ;;
        "restart")
            restart_services
            test_services
            show_status
            ;;
        "stop")
            stop_services
            ;;
        "logs")
            show_logs
            ;;
        "clean")
            stop_services
            clean_environment
            log "✅ Environment cleaned"
            ;;
        *)
            error "Unknown action: $action"
            echo "Available actions: build, deploy, restart, stop, logs, clean"
            exit 1
            ;;
    esac
    
    log "🎉 Operation completed!"
}

# Run main function with all arguments
main "$@"