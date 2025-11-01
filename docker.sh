#!/bin/bash

# Docker Management Script for Employee Management System

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_help() {
    echo -e "${BLUE}Employee Management System - Docker Helper${NC}"
    echo ""
    echo "Usage: ./docker.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev              Start development environment"
    echo "  prod             Start production environment"
    echo "  build            Build production images"
    echo "  stop             Stop all containers"
    echo "  clean            Clean up containers and images"
    echo "  logs             Show logs from all containers"
    echo "  logs-frontend    Show frontend logs"
    echo "  logs-backend     Show backend logs"
    echo "  test             Run tests in container"
    echo "  shell            Open shell in frontend container"
    echo "  db               Open database shell"
    echo "  help             Show this help message"
    echo ""
}

start_dev() {
    echo -e "${GREEN}🚀 Starting development environment...${NC}"
    docker-compose -f docker-compose.dev.yml up --build -d
    echo -e "${GREEN}✅ Development environment started!${NC}"
    echo -e "${YELLOW}📋 Services:${NC}"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend API: http://localhost:8080"
    echo "  - Database: localhost:5433"
}

start_prod() {
    echo -e "${GREEN}🚀 Starting production environment...${NC}"
    docker-compose up --build -d
    echo -e "${GREEN}✅ Production environment started!${NC}"
    echo -e "${YELLOW}📋 Services:${NC}"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend API: http://localhost:8080"
    echo "  - Database: localhost:5432"
}

build_images() {
    echo -e "${GREEN}🔨 Building production images...${NC}"
    docker-compose build --no-cache
    echo -e "${GREEN}✅ Images built successfully!${NC}"
}

stop_containers() {
    echo -e "${YELLOW}🛑 Stopping all containers...${NC}"
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    echo -e "${GREEN}✅ All containers stopped!${NC}"
}

clean_docker() {
    echo -e "${YELLOW}🧹 Cleaning up Docker resources...${NC}"
    docker-compose down -v --rmi all
    docker-compose -f docker-compose.dev.yml down -v --rmi all
    docker system prune -f
    echo -e "${GREEN}✅ Cleanup completed!${NC}"
}

show_logs() {
    echo -e "${BLUE}📋 Showing logs from all containers...${NC}"
    docker-compose logs -f
}

show_frontend_logs() {
    echo -e "${BLUE}📋 Showing frontend logs...${NC}"
    docker-compose logs -f frontend || docker-compose -f docker-compose.dev.yml logs -f frontend-dev
}

show_backend_logs() {
    echo -e "${BLUE}📋 Showing backend logs...${NC}"
    docker-compose logs -f backend || docker-compose -f docker-compose.dev.yml logs -f backend-dev
}

run_tests() {
    echo -e "${GREEN}🧪 Running tests in container...${NC}"
    docker-compose -f docker-compose.dev.yml exec frontend-dev npm run test
}

open_shell() {
    echo -e "${BLUE}🐚 Opening shell in frontend container...${NC}"
    docker-compose -f docker-compose.dev.yml exec frontend-dev sh || docker-compose exec frontend sh
}

open_db_shell() {
    echo -e "${BLUE}🗄️ Opening database shell...${NC}"
    docker-compose exec database-dev psql -U postgres -d employee_management_dev || \
    docker-compose exec database psql -U postgres -d employee_management
}

# Main script logic
case "${1:-help}" in
    "dev")
        start_dev
        ;;
    "prod")
        start_prod
        ;;
    "build")
        build_images
        ;;
    "stop")
        stop_containers
        ;;
    "clean")
        clean_docker
        ;;
    "logs")
        show_logs
        ;;
    "logs-frontend")
        show_frontend_logs
        ;;
    "logs-backend")
        show_backend_logs
        ;;
    "test")
        run_tests
        ;;
    "shell")
        open_shell
        ;;
    "db")
        open_db_shell
        ;;
    "help"|*)
        print_help
        ;;
esac