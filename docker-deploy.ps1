# Docker Build and Deploy Script for Windows PowerShell
# This script handles Docker image format issues and provides a robust deployment

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("build", "deploy", "restart", "stop", "logs", "clean")]
    [string]$Action = "deploy"
)

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Log($message) {
    Write-ColorOutput Green "[$(Get-Date -Format 'HH:mm:ss')] $message"
}

function Warn($message) {
    Write-ColorOutput Yellow "[$(Get-Date -Format 'HH:mm:ss')] WARNING: $message"
}

function Error($message) {
    Write-ColorOutput Red "[$(Get-Date -Format 'HH:mm:ss')] ERROR: $message"
}

# Check Docker availability
function Test-Docker {
    try {
        docker --version | Out-Null
        docker ps | Out-Null
        Log "✅ Docker is running"
        return $true
    } catch {
        Error "❌ Docker is not running or not available"
        Write-Host "Please start Docker Desktop and try again"
        return $false
    }
}

# Clean Docker environment
function Clear-DockerEnvironment {
    Log "🧹 Cleaning Docker environment..."
    
    try {
        # Stop existing containers
        docker-compose down 2>$null
        
        # Remove old images (optional)
        $oldImages = docker images "employee-frontend" -q
        if ($oldImages) {
            docker rmi $oldImages -f
            Log "🗑️ Removed old images"
        }
        
        # Clean build cache
        docker builder prune -f
        
        Log "✅ Environment cleaned"
    } catch {
        Warn "Some cleanup operations failed: $($_.Exception.Message)"
    }
}

# Build Docker image
function New-DockerImage {
    Log "🔨 Building Docker image..."
    
    try {
        # Build with specific tag
        docker build -t employee-frontend:latest .
        
        if ($LASTEXITCODE -eq 0) {
            Log "✅ Docker image built successfully"
            return $true
        } else {
            Error "❌ Docker build failed"
            return $false
        }
    } catch {
        Error "❌ Docker build error: $($_.Exception.Message)"
        return $false
    }
}

# Deploy with docker-compose
function Start-DockerServices {
    Log "🚀 Starting services with docker-compose..."
    
    try {
        docker-compose up -d
        
        if ($LASTEXITCODE -eq 0) {
            Log "✅ Services started successfully"
            
            # Wait for health check
            Log "⏳ Waiting for services to be healthy..."
            Start-Sleep -Seconds 15
            
            return $true
        } else {
            Error "❌ Failed to start services"
            return $false
        }
    } catch {
        Error "❌ Docker-compose error: $($_.Exception.Message)"
        return $false
    }
}

# Health check
function Test-DockerServices {
    Log "🔍 Performing health checks..."
    
    try {
        # Check frontend
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Log "✅ Frontend is healthy (HTTP $($response.StatusCode))"
        } else {
            Warn "⚠️ Frontend returned status: $($response.StatusCode)"
        }
        
        # Check container status
        $containers = docker-compose ps --format json | ConvertFrom-Json
        foreach ($container in $containers) {
            if ($container.State -eq "running") {
                Log "✅ Container $($container.Name) is running"
            } else {
                Warn "⚠️ Container $($container.Name) is $($container.State)"
            }
        }
        
    } catch {
        Error "❌ Health check failed: $($_.Exception.Message)"
        return $false
    }
    
    return $true
}

# Show service status
function Show-ServiceStatus {
    Log "📊 Current service status:"
    
    try {
        docker-compose ps
        
        Write-Host ""
        Log "📋 Access URLs:"
        Write-Host "Frontend: http://localhost:3000"
        
        Write-Host ""
        Log "🔧 Useful commands:"
        Write-Host "View logs: .\docker-deploy.ps1 -Action logs"
        Write-Host "Restart:   .\docker-deploy.ps1 -Action restart"
        Write-Host "Stop:      .\docker-deploy.ps1 -Action stop"
        
    } catch {
        Error "Failed to get service status: $($_.Exception.Message)"
    }
}

# Show logs
function Show-Logs {
    Log "📋 Showing container logs..."
    docker-compose logs -f
}

# Stop services
function Stop-DockerServices {
    Log "🛑 Stopping services..."
    docker-compose down
    Log "✅ Services stopped"
}

# Restart services
function Restart-DockerServices {
    Log "🔄 Restarting services..."
    docker-compose down
    Start-Sleep -Seconds 3
    Start-DockerServices
}

# Main execution function
function Invoke-DockerDeploy {
    param([string]$Action)
    
    Log "🐳 Docker Frontend Deploy Script"
    Log "Action: $Action"
    
    # Check Docker first
    if (-not (Test-Docker)) {
        exit 1
    }
    
    switch ($Action) {
        "build" {
            Clear-DockerEnvironment
            New-DockerImage
        }
        "deploy" {
            Clear-DockerEnvironment
            if (New-DockerImage) {
                if (Start-DockerServices) {
                    Test-DockerServices
                    Show-ServiceStatus
                }
            }
        }
        "restart" {
            Restart-DockerServices
            Test-DockerServices
            Show-ServiceStatus
        }
        "stop" {
            Stop-DockerServices
        }
        "logs" {
            Show-Logs
        }
        "clean" {
            Stop-DockerServices
            Clear-DockerEnvironment
            Log "✅ Environment cleaned"
        }
        default {
            Error "Unknown action: $Action"
            Write-Host "Available actions: build, deploy, restart, stop, logs, clean"
            exit 1
        }
    }
    
    Log "🎉 Operation completed!"
}

# Run the main function
Invoke-DockerDeploy -Action $Action