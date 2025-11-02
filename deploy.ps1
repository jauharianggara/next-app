# 🚀 Employee Management System - Auto Deployment Script (Windows)
# Usage: .\deploy.ps1 [environment] [platform]
# Example: .\deploy.ps1 production docker
#          .\deploy.ps1 staging vercel

param(
    [string]$Environment = "production",
    [string]$Platform = "docker"
)

# Configuration
$AppName = "employee-management"
$RepoUrl = "https://github.com/jauharianggara/next-app.git"

# Functions
function Write-Header {
    Write-Host "==========================================" -ForegroundColor Blue
    Write-Host "🚀 Employee Management System Deployment" -ForegroundColor Blue
    Write-Host "==========================================" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

function Test-Requirements {
    Write-Info "Checking requirements..."
    
    # Check if git is installed
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Error "Git is not installed. Please install git first."
        exit 1
    }
    
    # Check if docker is installed (for docker deployment)
    if ($Platform -eq "docker") {
        if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
            Write-Error "Docker is not installed. Please install Docker Desktop first."
            exit 1
        }
        
        if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
            Write-Error "Docker Compose is not installed. Please install Docker Desktop first."
            exit 1
        }
    }
    
    # Check if node is installed (for manual deployment)
    if ($Platform -eq "manual" -or $Platform -eq "pm2") {
        if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
            Write-Error "Node.js is not installed. Please install Node.js 20+ first."
            exit 1
        }
        
        $nodeVersion = (node --version).Substring(1).Split('.')[0]
        if ([int]$nodeVersion -lt 18) {
            Write-Error "Node.js version 18+ is required. Current version: $(node --version)"
            exit 1
        }
    }
    
    Write-Success "All requirements met!"
}

function Set-Environment {
    Write-Info "Setting up environment variables..."
    
    if (-not (Test-Path .env)) {
        if (Test-Path .env.example) {
            Copy-Item .env.example .env
            Write-Warning "Created .env from .env.example. Please edit .env file with your configuration."
        } else {
            $envContent = @"
NODE_ENV=$Environment
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
"@
            $envContent | Out-File -FilePath .env -Encoding UTF8
            Write-Warning "Created basic .env file. Please edit it with your configuration."
        }
        
        $editEnv = Read-Host "Do you want to edit .env file now? (y/n)"
        if ($editEnv -eq "y" -or $editEnv -eq "Y") {
            notepad .env
        }
    } else {
        Write-Success "Environment file already exists."
    }
}

function Deploy-Docker {
    Write-Info "Deploying with Docker..."
    
    # Choose Docker Compose file based on environment
    if ($Environment -eq "development" -or $Environment -eq "dev") {
        $composeFile = "docker-compose.dev.yml"
        Write-Info "Using development configuration"
    } else {
        $composeFile = "docker-compose.yml"
        Write-Info "Using production configuration"
    }
    
    # Stop existing containers
    Write-Info "Stopping existing containers..."
    try {
        docker-compose -f $composeFile down
    } catch {
        # Ignore errors if containers don't exist
    }
    
    # Build and start containers
    Write-Info "Building and starting containers..."
    docker-compose -f $composeFile up -d --build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker deployment failed!"
        exit 1
    }
    
    # Wait for services to be ready
    Write-Info "Waiting for services to be ready..."
    Start-Sleep 10
    
    # Health check
    Write-Info "Performing health checks..."
    
    # Check backend
    $backendReady = $false
    for ($i = 1; $i -le 30; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -TimeoutSec 2
            if ($response.StatusCode -eq 200) {
                Write-Success "Backend is healthy"
                $backendReady = $true
                break
            }
        } catch {
            if ($i -eq 30) {
                Write-Error "Backend health check failed"
                docker-compose -f $composeFile logs backend
                exit 1
            }
            Start-Sleep 2
        }
    }
    
    # Check frontend
    $frontendReady = $false
    for ($i = 1; $i -le 30; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2
            if ($response.StatusCode -eq 200) {
                Write-Success "Frontend is healthy"
                $frontendReady = $true
                break
            }
        } catch {
            if ($i -eq 30) {
                Write-Error "Frontend health check failed"
                docker-compose -f $composeFile logs frontend
                exit 1
            }
            Start-Sleep 2
        }
    }
    
    Write-Success "Docker deployment completed successfully!"
    Write-Info "Frontend: http://localhost:3000"
    Write-Info "Backend API: http://localhost:8080"
    Write-Info "API Documentation: http://localhost:8080/"
}

function Deploy-PM2 {
    Write-Info "Deploying with PM2..."
    
    # Install PM2 if not exists
    if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
        Write-Info "Installing PM2..."
        npm install -g pm2
    }
    
    # Install dependencies and build
    Write-Info "Installing dependencies..."
    npm ci
    
    Write-Info "Building application..."
    npm run build
    
    # Setup backend
    Write-Info "Setting up backend..."
    Set-Location mock-backend
    npm install
    
    # Stop existing processes
    try { pm2 delete "$AppName-frontend" } catch { }
    try { pm2 delete "$AppName-backend" } catch { }
    
    # Start backend
    Write-Info "Starting backend with PM2..."
    pm2 start server.js --name "$AppName-backend"
    
    # Start frontend
    Set-Location ..
    Write-Info "Starting frontend with PM2..."
    pm2 start npm --name "$AppName-frontend" -- start
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup (ask user)
    $setupStartup = Read-Host "Do you want to setup PM2 auto-startup? (y/n)"
    if ($setupStartup -eq "y" -or $setupStartup -eq "Y") {
        pm2 startup
    }
    
    Write-Success "PM2 deployment completed successfully!"
    Write-Info "Use 'pm2 status' to check application status"
    Write-Info "Use 'pm2 logs' to view application logs"
}

function Deploy-Vercel {
    Write-Info "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
        Write-Info "Installing Vercel CLI..."
        npm install -g vercel
    }
    
    # Deploy to Vercel
    Write-Info "Deploying to Vercel..."
    if ($Environment -eq "production") {
        vercel --prod
    } else {
        vercel
    }
    
    Write-Success "Vercel deployment completed!"
    Write-Warning "Note: You'll need to deploy the backend separately to a platform like Railway, Heroku, or your own server."
}

function Deploy-Manual {
    Write-Info "Manual deployment..."
    
    # Install dependencies and build
    Write-Info "Installing dependencies..."
    npm ci
    
    Write-Info "Building application..."
    npm run build
    
    # Setup backend
    Write-Info "Setting up backend..."
    Set-Location mock-backend
    npm install
    
    Write-Info "Starting backend..."
    $backendJob = Start-Job -ScriptBlock { Set-Location $using:PWD; npm start }
    
    # Start frontend
    Set-Location ..
    Write-Info "Starting frontend..."
    $frontendJob = Start-Job -ScriptBlock { Set-Location $using:PWD; npm start }
    
    Write-Success "Manual deployment started!"
    Write-Info "Frontend: http://localhost:3000"
    Write-Info "Backend: http://localhost:8080"
    Write-Warning "Backend Job ID: $($backendJob.Id)"
    Write-Warning "Frontend Job ID: $($frontendJob.Id)"
    Write-Warning "Use 'Stop-Job $($backendJob.Id), $($frontendJob.Id)' to stop the services"
}

function Show-PostDeploymentInfo {
    Write-Header
    Write-Success "Deployment completed successfully!"
    Write-Host ""
    Write-Info "Application URLs:"
    Write-Host "  Frontend: http://localhost:3000"
    Write-Host "  Backend API: http://localhost:8080"
    Write-Host "  API Documentation: http://localhost:8080/"
    Write-Host "  Health Check: http://localhost:8080/health"
    Write-Host ""
    Write-Info "API Endpoints:"
    Write-Host "  Authentication: POST /api/auth/register, /api/auth/login"
    Write-Host "  Employees: GET/POST/PUT/DELETE /api/karyawans"
    Write-Host "  Positions: GET/POST /api/jabatans"
    Write-Host "  Offices: GET/POST /api/kantors"
    Write-Host ""
    Write-Info "Management Commands:"
    if ($Platform -eq "docker") {
        Write-Host "  View logs: docker-compose logs -f"
        Write-Host "  Stop services: docker-compose down"
        Write-Host "  Restart: docker-compose restart"
    } elseif ($Platform -eq "pm2") {
        Write-Host "  View status: pm2 status"
        Write-Host "  View logs: pm2 logs"
        Write-Host "  Restart: pm2 restart all"
        Write-Host "  Stop: pm2 stop all"
    }
    Write-Host ""
    Write-Warning "Don't forget to:"
    Write-Host "  - Setup reverse proxy for production"
    Write-Host "  - Configure SSL certificates"
    Write-Host "  - Setup proper database for production"
    Write-Host "  - Configure monitoring and backup"
}

# Main script
function Main {
    Write-Header
    Write-Info "Environment: $Environment"
    Write-Info "Platform: $Platform"
    Write-Host ""
    
    # Validate arguments
    if ($Environment -notmatch '^(development|dev|staging|production|prod)$') {
        Write-Error "Invalid environment. Use: development, staging, or production"
        exit 1
    }
    
    if ($Platform -notmatch '^(docker|pm2|manual|vercel)$') {
        Write-Error "Invalid platform. Use: docker, pm2, manual, or vercel"
        exit 1
    }
    
    # Check requirements
    Test-Requirements
    
    # Setup environment
    Set-Environment
    
    # Deploy based on platform
    switch ($Platform) {
        "docker" { Deploy-Docker }
        "pm2" { Deploy-PM2 }
        "vercel" { Deploy-Vercel }
        "manual" { Deploy-Manual }
        default {
            Write-Error "Unknown platform: $Platform"
            exit 1
        }
    }
    
    # Show post-deployment information
    Show-PostDeploymentInfo
}

# Show usage if help is requested
if ($args -contains "--help" -or $args -contains "-h") {
    Write-Header
    Write-Host "Usage: .\deploy.ps1 [environment] [platform]"
    Write-Host ""
    Write-Host "Environments:"
    Write-Host "  development, dev    - Development environment"
    Write-Host "  staging            - Staging environment"
    Write-Host "  production, prod   - Production environment (default)"
    Write-Host ""
    Write-Host "Platforms:"
    Write-Host "  docker            - Deploy with Docker Compose (default)"
    Write-Host "  pm2               - Deploy with PM2 process manager"
    Write-Host "  manual            - Manual deployment (development only)"
    Write-Host "  vercel            - Deploy to Vercel platform"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\deploy.ps1                          # Production with Docker"
    Write-Host "  .\deploy.ps1 development docker       # Development with Docker"
    Write-Host "  .\deploy.ps1 production pm2           # Production with PM2"
    Write-Host "  .\deploy.ps1 staging vercel           # Staging to Vercel"
    Write-Host ""
    exit 0
}

# Run main function
Main