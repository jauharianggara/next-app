# Docker Setup - Employee Management System

This directory contains Docker configuration for the Employee Management System, providing both development and production environments.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Docker Compose v2.0 or higher

### Development Environment
```bash
# Start development environment
npm run docker:dev
# or
docker-compose -f docker-compose.dev.yml up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Database: localhost:5433
```

### Production Environment
```bash
# Start production environment
npm run docker:prod
# or
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Database: localhost:5432
```

## 📋 Available Scripts

### NPM Scripts
```bash
npm run docker:dev      # Start development environment
npm run docker:prod     # Start production environment
npm run docker:build    # Build production images
npm run docker:stop     # Stop all containers
npm run docker:clean    # Clean up containers and images
```

### PowerShell Helper (Windows)
```powershell
.\docker.ps1 dev         # Start development
.\docker.ps1 prod        # Start production
.\docker.ps1 build       # Build images
.\docker.ps1 stop        # Stop containers
.\docker.ps1 clean       # Clean up
.\docker.ps1 logs        # Show all logs
.\docker.ps1 shell       # Open container shell
.\docker.ps1 test        # Run tests
```

### Bash Helper (Linux/Mac)
```bash
./docker.sh dev          # Start development
./docker.sh prod         # Start production
./docker.sh build        # Build images
./docker.sh stop         # Stop containers
./docker.sh clean        # Clean up
./docker.sh logs         # Show all logs
./docker.sh shell        # Open container shell
./docker.sh test         # Run tests
```

## 🏗️ Architecture

### Development Environment (`docker-compose.dev.yml`)
- **Frontend**: Next.js with hot reloading
- **Backend**: Mock Express.js server with nodemon
- **Database**: PostgreSQL for development
- **Volumes**: Source code mounted for live editing

### Production Environment (`docker-compose.yml`)
- **Frontend**: Optimized Next.js standalone build
- **Backend**: Mock Express.js server
- **Database**: PostgreSQL for production
- **Security**: Non-root user, minimal attack surface

## 📁 File Structure

```
├── Dockerfile              # Production frontend image
├── Dockerfile.dev          # Development frontend image
├── docker-compose.yml      # Production environment
├── docker-compose.dev.yml  # Development environment
├── docker.ps1             # PowerShell helper script
├── docker.sh              # Bash helper script
├── .dockerignore           # Docker ignore file
└── mock-backend/           # Mock backend server
    ├── package.json
    └── server.js
```

## 🔧 Configuration

### Environment Variables

**Frontend Container:**
- `NODE_ENV`: Environment mode (development/production)
- `NEXT_PUBLIC_API_BASE_URL`: API base URL for client-side
- `NEXT_PUBLIC_API_URL`: API URL for server-side

**Backend Container:**
- `NODE_ENV`: Environment mode
- `PORT`: Server port (default: 8080)

**Database Container:**
- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password

### Ports
- **3000**: Frontend application
- **8080**: Backend API
- **5432**: Production database
- **5433**: Development database

## 🧪 Testing

### Run Tests in Container
```bash
# Using helper scripts
.\docker.ps1 test           # PowerShell
./docker.sh test           # Bash

# Direct docker-compose
docker-compose -f docker-compose.dev.yml exec frontend-dev npm run test
```

### Test Different Scenarios
```bash
# Run specific test suites
docker-compose -f docker-compose.dev.yml exec frontend-dev npm run test:register-complete
docker-compose -f docker-compose.dev.yml exec frontend-dev npm run test:auth
```

## 🗄️ Database Management

### Access Database Shell
```bash
# Development database
docker-compose exec database-dev psql -U postgres -d employee_management_dev

# Production database
docker-compose exec database psql -U postgres -d employee_management
```

### Database Backup/Restore
```bash
# Backup
docker-compose exec database-dev pg_dump -U postgres employee_management_dev > backup.sql

# Restore
docker-compose exec -T database-dev psql -U postgres employee_management_dev < backup.sql
```

## 🔍 Debugging

### View Logs
```bash
# All containers
docker-compose logs -f

# Specific container
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f database
```

### Access Container Shell
```bash
# Frontend container
docker-compose exec frontend sh
docker-compose -f docker-compose.dev.yml exec frontend-dev sh

# Backend container
docker-compose exec backend sh
```

### Monitor Resources
```bash
# Container stats
docker stats

# System usage
docker system df
```

## 🧹 Maintenance

### Clean Up
```bash
# Stop and remove containers
npm run docker:stop

# Full cleanup (containers, volumes, images)
npm run docker:clean

# Remove unused Docker resources
docker system prune -a
```

### Update Images
```bash
# Rebuild images with no cache
docker-compose build --no-cache

# Pull latest base images
docker-compose pull
```

## 🔐 Security Considerations

### Production Security
- Non-root user in containers
- Minimal base images (Alpine Linux)
- No sensitive data in images
- Environment variables for configuration
- Network isolation between services

### Development Security
- Source code volumes (read-only where possible)
- Separate development database
- Debug ports not exposed in production

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Find process using port
netstat -ano | findstr :3000
# Kill process
taskkill /PID <PID> /F
```

**Permission Denied:**
```bash
# Fix file permissions (Linux/Mac)
chmod +x docker.sh
sudo chown -R $USER:$USER .
```

**Build Failures:**
```bash
# Clear Docker cache
docker builder prune -a

# Rebuild without cache
docker-compose build --no-cache
```

**Container Won't Start:**
```bash
# Check logs
docker-compose logs [service-name]

# Check container status
docker-compose ps

# Restart services
docker-compose restart
```

## 📊 Performance Optimization

### Production Optimizations
- Multi-stage Docker builds
- Standalone Next.js output
- Alpine Linux base images
- Minimal layer count
- Efficient caching strategy

### Development Optimizations
- Volume mounts for hot reloading
- Separate dev dependencies
- Fast rebuild times
- Efficient resource usage

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Docker Build
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker-compose build
      - name: Run tests
        run: docker-compose -f docker-compose.dev.yml run frontend-dev npm test
```

### Automated Deployment
```bash
# Build and push to registry
docker-compose build
docker tag myapp_frontend:latest registry.example.com/myapp:latest
docker push registry.example.com/myapp:latest
```

## 📞 Support

For issues related to Docker setup:
1. Check logs: `docker-compose logs`
2. Verify Docker installation: `docker --version`
3. Check system resources: `docker system df`
4. Review configuration files
5. Create issue with logs and system info