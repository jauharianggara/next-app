# Docker Management Script for Employee Management System (PowerShell)

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

# Functions
function Print-Help {
    Write-Host "Employee Management System - Docker Helper" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Usage: .\docker.ps1 [command]"
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  dev              Start development environment"
    Write-Host "  prod             Start production environment"
    Write-Host "  build            Build production images"
    Write-Host "  stop             Stop all containers"
    Write-Host "  clean            Clean up containers and images"
    Write-Host "  logs             Show logs from all containers"
    Write-Host "  logs-frontend    Show frontend logs"
    Write-Host "  logs-backend     Show backend logs"
    Write-Host "  test             Run tests in container"
    Write-Host "  shell            Open shell in frontend container"
    Write-Host "  db               Open database shell"
    Write-Host "  help             Show this help message"
    Write-Host ""
}

function Start-Dev {
    Write-Host "🚀 Starting development environment..." -ForegroundColor Green
    docker-compose -f docker-compose.dev.yml up --build -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Development environment started!" -ForegroundColor Green
        Write-Host "📋 Services:" -ForegroundColor Yellow
        Write-Host "  - Frontend: http://localhost:3000"
        Write-Host "  - Backend API: http://localhost:8080"
        Write-Host "  - Database: localhost:5433"
    }
}

function Start-Prod {
    Write-Host "🚀 Starting production environment..." -ForegroundColor Green
    docker-compose up --build -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Production environment started!" -ForegroundColor Green
        Write-Host "📋 Services:" -ForegroundColor Yellow
        Write-Host "  - Frontend: http://localhost:3000"
        Write-Host "  - Backend API: http://localhost:8080"
        Write-Host "  - Database: localhost:5432"
    }
}

function Build-Images {
    Write-Host "🔨 Building production images..." -ForegroundColor Green
    docker-compose build --no-cache
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Images built successfully!" -ForegroundColor Green
    }
}

function Stop-Containers {
    Write-Host "🛑 Stopping all containers..." -ForegroundColor Yellow
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    Write-Host "✅ All containers stopped!" -ForegroundColor Green
}

function Clean-Docker {
    Write-Host "🧹 Cleaning up Docker resources..." -ForegroundColor Yellow
    docker-compose down -v --rmi all
    docker-compose -f docker-compose.dev.yml down -v --rmi all
    docker system prune -f
    Write-Host "✅ Cleanup completed!" -ForegroundColor Green
}

function Show-Logs {
    Write-Host "📋 Showing logs from all containers..." -ForegroundColor Blue
    docker-compose logs -f
}

function Show-FrontendLogs {
    Write-Host "📋 Showing frontend logs..." -ForegroundColor Blue
    try {
        docker-compose logs -f frontend
    } catch {
        docker-compose -f docker-compose.dev.yml logs -f frontend-dev
    }
}

function Show-BackendLogs {
    Write-Host "📋 Showing backend logs..." -ForegroundColor Blue
    try {
        docker-compose logs -f backend
    } catch {
        docker-compose -f docker-compose.dev.yml logs -f backend-dev
    }
}

function Run-Tests {
    Write-Host "🧪 Running tests in container..." -ForegroundColor Green
    docker-compose -f docker-compose.dev.yml exec frontend-dev npm run test
}

function Open-Shell {
    Write-Host "🐚 Opening shell in frontend container..." -ForegroundColor Blue
    try {
        docker-compose -f docker-compose.dev.yml exec frontend-dev sh
    } catch {
        docker-compose exec frontend sh
    }
}

function Open-DbShell {
    Write-Host "🗄️ Opening database shell..." -ForegroundColor Blue
    try {
        docker-compose exec database-dev psql -U postgres -d employee_management_dev
    } catch {
        docker-compose exec database psql -U postgres -d employee_management
    }
}

# Main script logic
switch ($Command) {
    "dev" { Start-Dev }
    "prod" { Start-Prod }
    "build" { Build-Images }
    "stop" { Stop-Containers }
    "clean" { Clean-Docker }
    "logs" { Show-Logs }
    "logs-frontend" { Show-FrontendLogs }
    "logs-backend" { Show-BackendLogs }
    "test" { Run-Tests }
    "shell" { Open-Shell }
    "db" { Open-DbShell }
    default { Print-Help }
}