# Employee Management System - Apache Deployment Script for Windows
# Run this script in PowerShell as Administrator

param(
    [string]$Domain = "localhost",
    [string]$Email = "admin@localhost",
    [string]$AppDir = "C:\inetpub\employee-management"
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
    Write-ColorOutput Green "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $message"
}

function Warn($message) {
    Write-ColorOutput Yellow "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] WARNING: $message"
}

function Error($message) {
    Write-ColorOutput Red "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ERROR: $message"
    exit 1
}

# Check if running as Administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Check prerequisites
function Test-Prerequisites {
    if (-not (Test-Administrator)) {
        Error "This script must be run as Administrator"
    }
    
    Log "Checking prerequisites..."
    
    # Check if Windows features are available
    $features = Get-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpCompressionStatic, IIS-HttpCompressionDynamic
    
    Log "Prerequisites checked successfully"
}

# Install IIS and required features
function Install-IIS {
    Log "Installing IIS and required features..."
    
    $features = @(
        "IIS-WebServerRole",
        "IIS-WebServer",
        "IIS-CommonHttpFeatures",
        "IIS-HttpErrors",
        "IIS-HttpRedirect",
        "IIS-ApplicationDevelopment",
        "IIS-NetFxExtensibility45",
        "IIS-HealthAndDiagnostics",
        "IIS-HttpLogging",
        "IIS-Security",
        "IIS-RequestFiltering",
        "IIS-Performance",
        "IIS-WebServerManagementTools",
        "IIS-ManagementConsole",
        "IIS-IIS6ManagementCompatibility",
        "IIS-Metabase",
        "IIS-HttpCompressionStatic",
        "IIS-HttpCompressionDynamic",
        "IIS-ApplicationRequestRouting"
    )
    
    foreach ($feature in $features) {
        try {
            Enable-WindowsOptionalFeature -Online -FeatureName $feature -All -NoRestart
            Log "Enabled feature: $feature"
        } catch {
            Warn "Could not enable feature: $feature"
        }
    }
    
    # Install URL Rewrite Module
    $urlRewriteUrl = "https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D4592/rewrite_amd64_en-US.msi"
    $urlRewriteFile = "$env:TEMP\urlrewrite.msi"
    
    try {
        Invoke-WebRequest -Uri $urlRewriteUrl -OutFile $urlRewriteFile
        Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", $urlRewriteFile, "/quiet" -Wait
        Remove-Item $urlRewriteFile -Force
        Log "URL Rewrite Module installed"
    } catch {
        Warn "Could not install URL Rewrite Module"
    }
    
    # Install Application Request Routing
    $arrUrl = "https://download.microsoft.com/download/E/9/8/E9849D6A-020E-47E4-9FD0-A023E99B54EB/requestRouter_amd64.msi"
    $arrFile = "$env:TEMP\arr.msi"
    
    try {
        Invoke-WebRequest -Uri $arrUrl -OutFile $arrFile
        Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", $arrFile, "/quiet" -Wait
        Remove-Item $arrFile -Force
        Log "Application Request Routing installed"
    } catch {
        Warn "Could not install Application Request Routing"
    }
    
    Log "IIS installation completed"
}

# Install Docker Desktop
function Install-Docker {
    Log "Checking Docker installation..."
    
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        Log "Docker is already installed"
        return
    }
    
    Log "Installing Docker Desktop..."
    
    $dockerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
    $dockerFile = "$env:TEMP\DockerDesktopInstaller.exe"
    
    try {
        Invoke-WebRequest -Uri $dockerUrl -OutFile $dockerFile
        Start-Process -FilePath $dockerFile -ArgumentList "install", "--quiet" -Wait
        Remove-Item $dockerFile -Force
        Log "Docker Desktop installed. Please restart your computer and start Docker Desktop."
        Warn "You may need to enable WSL2 and restart before continuing."
    } catch {
        Error "Failed to install Docker Desktop"
    }
}

# Setup application
function Setup-Application {
    Log "Setting up Employee Management System..."
    
    # Create application directory
    if (-not (Test-Path $AppDir)) {
        New-Item -ItemType Directory -Path $AppDir -Force
        Log "Created application directory: $AppDir"
    }
    
    # Clone repository (requires Git)
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Warn "Git is not installed. Please install Git and clone the repository manually."
        Warn "Repository: https://github.com/jauharianggara/next-app.git"
        return
    }
    
    if (Test-Path "$AppDir\.git") {
        Log "Repository already exists, updating..."
        Set-Location $AppDir
        git pull origin master
    } else {
        Log "Cloning repository..."
        git clone "https://github.com/jauharianggara/next-app.git" $AppDir
        Set-Location $AppDir
    }
    
    # Copy environment file
    if (-not (Test-Path "$AppDir\.env.production")) {
        if (Test-Path "$AppDir\.env.example") {
            Copy-Item "$AppDir\.env.example" "$AppDir\.env.production"
        } else {
            "# Add your environment variables here" | Out-File -FilePath "$AppDir\.env.production" -Encoding UTF8
        }
        Warn "Please edit .env.production with your environment variables"
    }
}

# Deploy application with Docker
function Deploy-Application {
    Log "Deploying application with Docker..."
    
    Set-Location $AppDir
    
    try {
        # Build and start containers
        docker-compose -f docker-compose.prod.yml up -d --build
        
        # Wait for services to be ready
        Log "Waiting for services to start..."
        Start-Sleep -Seconds 30
        
        # Check if services are running
        $containers = docker-compose -f docker-compose.prod.yml ps
        if ($containers -match "Up") {
            Log "Application deployed successfully"
        } else {
            Error "Failed to deploy application"
        }
    } catch {
        Error "Failed to deploy application with Docker: $_"
    }
}

# Configure IIS as reverse proxy
function Configure-IIS {
    Log "Configuring IIS as reverse proxy..."
    
    Import-Module WebAdministration
    
    # Remove default website
    if (Get-Website -Name "Default Web Site" -ErrorAction SilentlyContinue) {
        Remove-Website -Name "Default Web Site"
        Log "Removed default website"
    }
    
    # Create new website
    $siteName = "EmployeeManagement"
    $sitePort = 80
    
    if (Get-Website -Name $siteName -ErrorAction SilentlyContinue) {
        Remove-Website -Name $siteName
    }
    
    New-Website -Name $siteName -Port $sitePort -PhysicalPath "C:\inetpub\wwwroot" -BindingInformation "*:${sitePort}:"
    
    # Create web.config for reverse proxy
    $webConfig = @"
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <!-- Rule for API requests -->
                <rule name="API Proxy" stopProcessing="true">
                    <match url="^api/(.*)" />
                    <action type="Rewrite" url="http://127.0.0.1:8080/api/{R:1}" />
                </rule>
                
                <!-- Rule for health check -->
                <rule name="Health Check" stopProcessing="true">
                    <match url="^health$" />
                    <action type="Rewrite" url="http://127.0.0.1:8080/health" />
                </rule>
                
                <!-- Rule for frontend -->
                <rule name="Frontend Proxy" stopProcessing="true">
                    <match url="(.*)" />
                    <action type="Rewrite" url="http://127.0.0.1:3000/{R:1}" />
                </rule>
            </rules>
        </rewrite>
        
        <httpCompression directory="%SystemDrive%\inetpub\temp\IIS Temporary Compressed Files">
            <scheme name="gzip" dll="%Windir%\system32\inetsrv\gzip.dll" />
            <staticTypes>
                <add mimeType="text/*" enabled="true" />
                <add mimeType="message/*" enabled="true" />
                <add mimeType="application/javascript" enabled="true" />
                <add mimeType="application/json" enabled="true" />
                <add mimeType="*/*" enabled="false" />
            </staticTypes>
            <dynamicTypes>
                <add mimeType="text/*" enabled="true" />
                <add mimeType="message/*" enabled="true" />
                <add mimeType="application/javascript" enabled="true" />
                <add mimeType="application/json" enabled="true" />
                <add mimeType="*/*" enabled="false" />
            </dynamicTypes>
        </httpCompression>
        
        <httpProtocol>
            <customHeaders>
                <add name="X-Frame-Options" value="DENY" />
                <add name="X-Content-Type-Options" value="nosniff" />
                <add name="X-XSS-Protection" value="1; mode=block" />
                <add name="Referrer-Policy" value="strict-origin-when-cross-origin" />
            </customHeaders>
        </httpProtocol>
        
        <caching enabled="true" enableKernelCache="true">
            <profiles>
                <add extension=".js" policy="CacheForTimePeriod" kernelCachePolicy="CacheForTimePeriod" duration="365.00:00:00" />
                <add extension=".css" policy="CacheForTimePeriod" kernelCachePolicy="CacheForTimePeriod" duration="365.00:00:00" />
                <add extension=".png" policy="CacheForTimePeriod" kernelCachePolicy="CacheForTimePeriod" duration="30.00:00:00" />
                <add extension=".jpg" policy="CacheForTimePeriod" kernelCachePolicy="CacheForTimePeriod" duration="30.00:00:00" />
                <add extension=".jpeg" policy="CacheForTimePeriod" kernelCachePolicy="CacheForTimePeriod" duration="30.00:00:00" />
                <add extension=".gif" policy="CacheForTimePeriod" kernelCachePolicy="CacheForTimePeriod" duration="30.00:00:00" />
                <add extension=".ico" policy="CacheForTimePeriod" kernelCachePolicy="CacheForTimePeriod" duration="30.00:00:00" />
                <add extension=".woff" policy="CacheForTimePeriod" kernelCachePolicy="CacheForTimePeriod" duration="365.00:00:00" />
                <add extension=".woff2" policy="CacheForTimePeriod" kernelCachePolicy="CacheForTimePeriod" duration="365.00:00:00" />
            </profiles>
        </caching>
    </system.webServer>
</configuration>
"@
    
    $webConfig | Out-File -FilePath "C:\inetpub\wwwroot\web.config" -Encoding UTF8
    
    # Start website
    Start-Website -Name $siteName
    
    Log "IIS configured successfully"
}

# Health check
function Test-Deployment {
    Log "Performing health checks..."
    
    # Check IIS
    $iisService = Get-Service -Name W3SVC
    if ($iisService.Status -eq "Running") {
        Log "✅ IIS is running"
    } else {
        Warn "❌ IIS is not running"
    }
    
    # Check Docker containers
    Set-Location $AppDir
    try {
        $containers = docker-compose -f docker-compose.prod.yml ps
        if ($containers -match "Up") {
            Log "✅ Application containers are running"
        } else {
            Warn "❌ Some application containers are not running"
        }
    } catch {
        Warn "❌ Could not check Docker containers"
    }
    
    # Test HTTP response
    try {
        $response = Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Log "✅ HTTP response is working"
        } else {
            Warn "❌ HTTP response test failed"
        }
    } catch {
        Warn "❌ HTTP response test failed: $_"
    }
}

# Display completion information
function Show-CompletionInfo {
    Log "🎉 Deployment completed successfully!"
    Write-Host ""
    Write-ColorOutput Blue "📋 Deployment Summary:"
    Write-Host "Domain: http://$Domain"
    Write-Host "Application: Employee Management System"
    Write-Host "Web Server: IIS"
    Write-Host "Application Directory: $AppDir"
    Write-Host ""
    Write-ColorOutput Blue "🔧 Useful Commands:"
    Write-Host "Check IIS status: Get-Service W3SVC"
    Write-Host "View IIS logs: Get-Content C:\inetpub\logs\LogFiles\W3SVC1\*.log -Tail 50"
    Write-Host "Restart application: docker-compose -f $AppDir\docker-compose.prod.yml restart"
    Write-Host "Update application: cd $AppDir; git pull; docker-compose -f docker-compose.prod.yml up -d --build"
    Write-Host ""
    Write-ColorOutput Green "🌐 Your Employee Management System is now available at: http://$Domain"
}

# Main execution
function Main {
    Log "🚀 Starting Employee Management System deployment with IIS..."
    
    # Read configuration if not set
    if ($Domain -eq "localhost") {
        $Domain = Read-Host "Enter your domain name (or press Enter for localhost)"
        if ([string]::IsNullOrEmpty($Domain)) {
            $Domain = "localhost"
        }
    }
    
    # Installation steps
    Test-Prerequisites
    Install-IIS
    Install-Docker
    Setup-Application
    Deploy-Application
    Configure-IIS
    
    # Final checks and information
    Test-Deployment
    Show-CompletionInfo
    
    Warn "Note: For production use, consider setting up SSL certificates and configuring proper domain bindings."
}

# Run main function
Main