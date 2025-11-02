# Rebuild Docker Image Script
# Run this in a NEW PowerShell terminal and let it complete without interruption

Write-Host "🔨 Rebuilding Docker Image for Employee Frontend" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Stop any running containers
Write-Host "⏹  Stopping running containers..." -ForegroundColor Yellow
docker-compose down
Write-Host ""

# Clean up old build cache (optional - uncomment if needed)
# Write-Host "🧹 Cleaning Docker build cache..." -ForegroundColor Yellow
# docker builder prune -f
# Write-Host ""

# Build the image
Write-Host "🏗  Building Docker image (this may take 30-60 seconds)..." -ForegroundColor Yellow
Write-Host "⚠  Do NOT interrupt this process!" -ForegroundColor Red
Write-Host ""

$buildStart = Get-Date
docker build -t employee-frontend:latest .
$buildEnd = Get-Date
$buildDuration = ($buildEnd - $buildStart).TotalSeconds

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build completed successfully in $([math]::Round($buildDuration, 1)) seconds" -ForegroundColor Green
    Write-Host ""
    
    # Show image info
    Write-Host "📦 Image Information:" -ForegroundColor Cyan
    docker images employee-frontend:latest
    Write-Host ""
    
    # Ask to start container
    $response = Read-Host "Start container now? (Y/n)"
    if ($response -eq "" -or $response -eq "Y" -or $response -eq "y") {
        Write-Host ""
        Write-Host "🚀 Starting container..." -ForegroundColor Yellow
        docker-compose up -d
        Write-Host ""
        
        # Wait for container to be ready
        Write-Host "⏳ Waiting for container to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
        
        # Show container status
        Write-Host ""
        Write-Host "📊 Container Status:" -ForegroundColor Cyan
        docker-compose ps
        Write-Host ""
        
        # Show logs
        Write-Host "📝 Recent Logs:" -ForegroundColor Cyan
        docker-compose logs --tail=20
        Write-Host ""
        
        Write-Host "✅ Container is running!" -ForegroundColor Green
        Write-Host "🌐 Access the application at: http://localhost:3000" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "To view live logs: docker-compose logs -f" -ForegroundColor Gray
        Write-Host "To stop container: docker-compose down" -ForegroundColor Gray
    }
} else {
    Write-Host ""
    Write-Host "❌ Build failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "  1. Check that Docker Desktop is running" -ForegroundColor Gray
    Write-Host "  2. Ensure you have enough disk space" -ForegroundColor Gray
    Write-Host "  3. Try cleaning build cache: docker builder prune -f" -ForegroundColor Gray
    Write-Host "  4. Check the error messages above for specific issues" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Cyan
