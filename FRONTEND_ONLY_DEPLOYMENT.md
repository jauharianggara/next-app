# Frontend-Only Deployment Guide
# Employee Management System - Frontend Only Configuration

## 🎯 Overview

Konfigurasi ini untuk deploy **frontend Next.js saja**, dengan backend API external yang sudah ada di server lain.

---

## 📋 Prerequisites

- ✅ Next.js Frontend (sudah ada)
- ✅ External API Server (backend di server terpisah)
- ✅ Domain/Server untuk hosting frontend

---

## 🔧 Configuration

### 1. Environment Variables

Edit file `.env.production`:

```bash
# External API Configuration
NEXT_PUBLIC_API_URL=https://api.your-backend-server.com
NEXT_PUBLIC_APP_NAME=Employee Management System
NEXT_PUBLIC_VERSION=1.0.0

# Optional: API Authentication
NEXT_PUBLIC_API_KEY=your-api-key-here

# Disable telemetry
NEXT_TELEMETRY_DISABLED=1
```

### 2. Next.js Configuration

Update `next.config.ts` untuk external API:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // External API rewrite rules
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
      }
    ];
  },
  
  // CORS headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## 🚀 Deployment Options

### Option 1: Docker (Recommended)

```bash
# Build dan run frontend only
docker-compose -f docker-compose.frontend-only.yml up -d --build

# Check status
docker-compose -f docker-compose.frontend-only.yml ps

# View logs
docker-compose -f docker-compose.frontend-only.yml logs -f frontend
```

### Option 2: Apache dengan Frontend Only

**Apache Configuration (`apache-frontend-only.conf`):**

```apache
<VirtualHost *:443>
    ServerName your-domain.com
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/your-domain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/your-domain.com/privkey.pem
    
    # Frontend Proxy (Next.js only)
    ProxyPreserveHost On
    ProxyRequests Off
    
    # Static files caching
    <LocationMatch "^/_next/static/.*">
        ProxyPass http://127.0.0.1:3000/_next/static/
        ProxyPassReverse http://127.0.0.1:3000/_next/static/
        Header set Cache-Control "public, max-age=31536000, immutable"
    </LocationMatch>

    # API Proxy to External Server
    <Location /api/>
        ProxyPass https://api.your-backend-server.com/api/
        ProxyPassReverse https://api.your-backend-server.com/api/
        
        # SSL for external API
        SSLProxyEngine on
        SSLProxyVerify none
        
        # CORS Headers
        Header always set Access-Control-Allow-Origin "*"
        Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header always set Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-API-Key"
    </Location>

    # Frontend catch-all
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>
```

### Option 3: Nginx Frontend Only

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Frontend static files
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API proxy to external server
    location /api/ {
        proxy_pass https://api.your-backend-server.com;
        proxy_ssl_verify off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-API-Key" always;
    }
    
    # Frontend application
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option 4: Vercel (Serverless)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables di Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://api.your-backend-server.com
```

### Option 5: Netlify

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/api/*"
  to = "https://api.your-backend-server.com/api/:splat"
  status = 200

[build.environment]
  NEXT_PUBLIC_API_URL = "https://api.your-backend-server.com"
```

---

## 🔍 Testing Frontend Only

### 1. Health Check

```bash
# Test frontend
curl -I http://localhost:3000

# Test API proxy
curl -I http://localhost:3000/api/health
```

### 2. Browser Test

```
Frontend: http://localhost:3000
API Test: http://localhost:3000/api/karyawans
```

---

## 📊 Monitoring Frontend Only

### Simple Monitoring Script

```bash
#!/bin/bash
# monitor-frontend.sh

while true; do
    # Check frontend
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ Frontend OK - $(date)"
    else
        echo "❌ Frontend DOWN - $(date)"
        # Restart frontend container
        docker-compose -f docker-compose.frontend-only.yml restart frontend
    fi
    
    sleep 30
done
```

---

## 🛠️ Quick Commands

```bash
# Build frontend only
docker build -t employee-frontend:latest .

# Run frontend only
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.your-backend-server.com \
  employee-frontend:latest

# Stop and remove containers
docker-compose -f docker-compose.frontend-only.yml down

# View logs
docker-compose -f docker-compose.frontend-only.yml logs -f

# Update frontend
git pull && docker-compose -f docker-compose.frontend-only.yml up -d --build
```

---

## 📋 External API Requirements

Backend API server harus menyediakan endpoints:

```
GET    /api/karyawans         - List employees
GET    /api/karyawans/:id     - Get employee by ID
POST   /api/karyawans         - Create employee
PUT    /api/karyawans/:id     - Update employee
DELETE /api/karyawans/:id     - Delete employee

GET    /api/jabatans          - List positions
POST   /api/jabatans          - Create position

GET    /api/kantors           - List offices
POST   /api/kantors           - Create office

POST   /api/auth/login        - User login
POST   /api/auth/register     - User registration
GET    /api/user/me           - Get current user

GET    /api/health            - Health check
```

---

## ⚡ Performance Tips

1. **CDN**: Gunakan CDN untuk static assets
2. **Caching**: Setup browser caching untuk /_next/static/
3. **Compression**: Enable gzip/brotli
4. **API Caching**: Cache API responses di frontend
5. **Image Optimization**: Gunakan Next.js Image component

---

## 🔒 Security Considerations

1. **API Key**: Secure API key management
2. **CORS**: Proper CORS configuration
3. **SSL**: HTTPS untuk semua requests
4. **CSP**: Content Security Policy headers
5. **Rate Limiting**: API rate limiting di reverse proxy

Frontend-only deployment sudah siap! 🚀