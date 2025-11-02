# Simple Docker Deploy Script for Windows PowerShell
param(
    [string]$Action = "deploy"
)

Write-Host "Docker Frontend Deploy Script" -ForegroundColor Green
Write-Host "Action: $Action" -ForegroundColor Cyan

# Check Docker
try {
    docker --version | Out-Null
    Write-Host "[OK] Docker is available" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker is not available" -ForegroundColor Red
    exit 1
}

switch ($Action) {
    "clean" {
        Write-Host "[INFO] Cleaning environment..." -ForegroundColor Yellow
        docker-compose down 2>$null
        docker rmi employee-frontend:latest -f 2>$null
        docker builder prune -f 2>$null
        Write-Host "[OK] Environment cleaned" -ForegroundColor Green
    }
    "build" {
        Write-Host "[INFO] Building Docker image..." -ForegroundColor Yellow
        docker build -t employee-frontend:latest .
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Build successful" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Build failed" -ForegroundColor Red
            exit 1
        }
    }
    "deploy" {
        Write-Host "[INFO] Cleaning environment..." -ForegroundColor Yellow
        docker-compose down 2>$null
        docker rmi employee-frontend:latest -f 2>$null
        docker builder prune -f 2>$null
        
        Write-Host "[INFO] Building Docker image..." -ForegroundColor Yellow
        docker build -t employee-frontend:latest .
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Build successful" -ForegroundColor Green
            
            Write-Host "[INFO] Starting services..." -ForegroundColor Yellow
            docker-compose up -d
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[OK] Services started" -ForegroundColor Green
                Write-Host "[INFO] Waiting for health check..." -ForegroundColor Yellow
                Start-Sleep -Seconds 10
                
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
                    Write-Host "[OK] Frontend is healthy (HTTP $($response.StatusCode))" -ForegroundColor Green
                } catch {
                    Write-Host "[WARN] Health check failed, but container might still be starting..." -ForegroundColor Yellow
                }
                
                Write-Host ""
                Write-Host "Access URL: http://localhost:3000" -ForegroundColor Cyan
                Write-Host "Container status:" -ForegroundColor Cyan
                docker-compose ps
            } else {
                Write-Host "[ERROR] Failed to start services" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "[ERROR] Build failed" -ForegroundColor Red
            exit 1
        }
    }
    "stop" {
        Write-Host "[INFO] Stopping services..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "[OK] Services stopped" -ForegroundColor Green
    }
    "restart" {
        Write-Host "[INFO] Restarting services..." -ForegroundColor Yellow
        docker-compose down
        Start-Sleep -Seconds 3
        docker-compose up -d
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Services restarted" -ForegroundColor Green
            docker-compose ps
        }
    }
    "logs" {
        Write-Host "Container logs:" -ForegroundColor Cyan
        docker-compose logs -f
    }
    "status" {
        Write-Host "Current status:" -ForegroundColor Cyan
        docker-compose ps
        Write-Host ""
        Write-Host "Access URL: http://localhost:3000" -ForegroundColor Cyan
    }
    default {
        Write-Host "[ERROR] Unknown action: $Action" -ForegroundColor Red
        Write-Host "Available actions: deploy, build, clean, stop, restart, logs, status" -ForegroundColor Cyan
        exit 1
    }
}

Write-Host "[OK] Operation completed!" -ForegroundColor Green