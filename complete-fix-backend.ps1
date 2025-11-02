# Complete Backend URL Fix Script
# filepath: c:\Users\jauha\next-app\complete-fix-backend.ps1

$backendURL = "http://103.167.113.116:8080/api"

Write-Host "🚀 COMPLETE BACKEND URL FIX" -ForegroundColor Green
Write-Host "Target: $backendURL" -ForegroundColor Yellow

# 1. Stop all containers
Write-Host "🛑 Stopping containers..." -ForegroundColor Red
docker-compose down 2>$null

# 2. Remove all caches
Write-Host "🧹 Cleaning caches..." -ForegroundColor Blue
docker system prune -f 2>$null
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
if (Test-Path "node_modules/.cache") { Remove-Item -Recurse -Force "node_modules/.cache" }

# 3. Force update ALL files
$files = @(
    ".env",
    ".env.local", 
    ".env.production",
    "docker-compose.yml"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        # Replace any localhost references
        $content = $content -replace "http://localhost:8080/api", $backendURL
        $content = $content -replace "NEXT_PUBLIC_API_URL=.*", "NEXT_PUBLIC_API_URL=$backendURL"
        $content | Set-Content $file -NoNewline
        Write-Host "✅ Updated: $file" -ForegroundColor Green
    }
}

# 4. Create debug environment file
@"
NODE_ENV=production
NEXT_PUBLIC_API_URL=$backendURL
NEXT_PUBLIC_APP_NAME=Employee Management System
NEXT_PUBLIC_APP_VERSION=1.0.0
PORT=3000
HOSTNAME=0.0.0.0
NEXT_PUBLIC_USE_PROXY=false
NEXT_PUBLIC_DEBUG=true
NEXT_TELEMETRY_DISABLED=1
"@ | Set-Content ".env.production" -NoNewline

# 5. Start with updated environment
Write-Host "🚀 Starting container..." -ForegroundColor Green
docker-compose up -d --force-recreate

# 6. Wait and test
Write-Host "⏳ Waiting for startup..." -ForegroundColor Blue
Start-Sleep -Seconds 20

# 7. Test connections
Write-Host "🧪 Testing connections..." -ForegroundColor Blue

# Test frontend
try {
    $frontendTest = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10
    Write-Host "✅ Frontend: WORKING" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test backend
try {
    $backendTest = Invoke-WebRequest -Uri $backendURL -TimeoutSec 10
    Write-Host "✅ Backend: WORKING" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 COMPLETE FIX FINISHED!" -ForegroundColor Green
Write-Host "📋 Next Steps:" -ForegroundColor White
Write-Host "1. Open: http://localhost:3000" -ForegroundColor Cyan
Write-Host "2. Check browser console for debug info" -ForegroundColor Cyan
Write-Host "3. Try login to test API connection" -ForegroundColor Cyan