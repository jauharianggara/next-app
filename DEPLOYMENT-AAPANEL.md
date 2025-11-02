# Deployment Guide for aaPanel

## 📋 Overview

This guide explains how to deploy the Next.js frontend with Apache reverse proxy to backend at `axum.synergyinfinity.id`.

## 🏗️ Architecture

```
Client Browser
    ↓ HTTPS
nextjs.synergyinfinity.id (Apache)
    ├─→ / → Next.js Frontend (localhost:3000)
    └─→ /api → Backend (https://axum.synergyinfinity.id/api)
```

## 🔧 Prerequisites

1. aaPanel installed
2. Apache web server
3. Docker and Docker Compose
4. SSL certificate for `nextjs.synergyinfinity.id`
5. Backend running at `axum.synergyinfinity.id`

## 📦 Deployment Steps

### 1. Upload Files to Server

```bash
# Upload to aaPanel server
scp -r * root@your-server:/www/wwwroot/
```

### 2. Update Apache Configuration

```bash
# Copy Apache config to vhost directory
sudo cp apache-config.conf /www/server/panel/vhost/apache/nextjs.synergyinfinity.id.conf

# Enable required Apache modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod proxy_wstunnel

# Test Apache configuration
sudo apachectl configtest

# Restart Apache
sudo systemctl restart apache2
```

### 3. Deploy Docker Containers

```bash
# Navigate to project directory
cd /www/wwwroot

# Build the Docker image
docker build --no-cache \
  --build-arg NEXT_PUBLIC_API_URL=/api \
  -t employee-frontend:latest .

# Start containers
docker-compose up -d

# Check logs
docker-compose logs -f frontend
```

### 4. Automated Deployment (Recommended)

```bash
# Make deployment script executable
chmod +x deploy-aapanel.sh

# Run deployment
./deploy-aapanel.sh
```

## ✅ Verification

### Test Frontend
```bash
curl -I https://nextjs.synergyinfinity.id
```

### Test Backend Proxy
```bash
curl -I https://nextjs.synergyinfinity.id/api/
```

### Test Specific API Endpoint
```bash
curl https://nextjs.synergyinfinity.id/api/jabatans
```

### Check Docker Container
```bash
docker ps
docker logs employee-frontend
docker exec employee-frontend env | grep NEXT_PUBLIC
```

### Check Apache Logs
```bash
tail -f /www/wwwlogs/nextjs.synergyinfinity.id-error_log
tail -f /www/wwwlogs/nextjs.synergyinfinity.id-access_log
```

## 🔍 Troubleshooting

### Apache Not Starting
```bash
# Check Apache syntax
apachectl configtest

# Check Apache error logs
tail -f /var/log/apache2/error.log

# Verify modules are loaded
apache2ctl -M | grep proxy
```

### Frontend Not Responding
```bash
# Check if container is running
docker ps

# Check container logs
docker logs employee-frontend

# Restart container
docker-compose restart frontend
```

### Backend API Not Working
```bash
# Test backend directly
curl -I https://axum.synergyinfinity.id/api/

# Test through proxy
curl -I https://nextjs.synergyinfinity.id/api/

# Check Apache proxy logs
grep "proxy" /www/wwwlogs/nextjs.synergyinfinity.id-error_log
```

### CORS Issues
Check that backend (`axum.synergyinfinity.id`) has proper CORS headers configured or that Apache proxy is handling CORS correctly.

## 🔄 Updates

### Update Frontend Code
```bash
# Pull latest code
git pull

# Rebuild image
docker build --no-cache \
  --build-arg NEXT_PUBLIC_API_URL=/api \
  -t employee-frontend:latest .

# Restart containers
docker-compose down
docker-compose up -d
```

### Update Apache Config
```bash
# Edit config
nano /www/server/panel/vhost/apache/nextjs.synergyinfinity.id.conf

# Test config
apachectl configtest

# Restart Apache
systemctl restart apache2
```

## 🌐 URLs

- **Frontend**: https://nextjs.synergyinfinity.id
- **Backend (Direct)**: https://axum.synergyinfinity.id/api
- **Backend (Proxied)**: https://nextjs.synergyinfinity.id/api

## 📝 Environment Variables

### Production (in docker-compose.yml)
```yaml
- NEXT_PUBLIC_API_URL=/api
- NEXT_PUBLIC_USE_PROXY=true
```

### Development (in .env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_USE_PROXY=false
```

## 🔐 Security Notes

1. Frontend only binds to localhost:3000 (not exposed directly)
2. All traffic goes through Apache reverse proxy
3. SSL/HTTPS enforced
4. Backend credentials managed separately
5. CORS handled at Apache level

## 📊 Monitoring

### Check Service Status
```bash
# Apache status
systemctl status apache2

# Docker status
docker ps
docker stats employee-frontend
```

### Resource Usage
```bash
# Container resources
docker stats employee-frontend

# System resources
htop
df -h
```

## 🆘 Support

For issues, check:
1. Apache error logs: `/www/wwwlogs/nextjs.synergyinfinity.id-error_log`
2. Docker logs: `docker-compose logs -f frontend`
3. Backend logs at `axum.synergyinfinity.id`

## 📄 Files

- `apache-config.conf` - Apache vhost configuration
- `docker-compose.yml` - Docker container configuration
- `deploy-aapanel.sh` - Automated deployment script
- `Dockerfile` - Docker image build instructions
