# 🚀 Panduan Deployment ke Server

## 📋 Overview Deployment Options

Aplikasi Employee Management System ini dapat di-deploy dengan berbagai cara:

1. **🐳 Docker Deployment** (Recommended)
2. **☁️ Cloud Platform Deployment**
3. **🖥️ VPS/Server Manual Deployment**
4. **⚡ Serverless Deployment**

---

## 1. 🐳 Docker Deployment (Recommended)

### A. Deploy ke VPS dengan Docker

#### Prerequisites
```bash
# Install Docker di server
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Step 1: Setup Server
```bash
# 1. Clone repository ke server
git clone https://github.com/jauharianggara/next-app.git
cd next-app

# 2. Setup environment variables
cp .env.example .env
nano .env
```

#### Step 2: Environment Configuration
```bash
# .env untuk production
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://your-server-ip:8080

# Database (jika menggunakan real database)
DATABASE_URL=postgresql://username:password@localhost:5432/employee_db
POSTGRES_USER=employee_user
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=employee_db
```

#### Step 3: Deploy dengan Docker Compose
```bash
# Production deployment
docker-compose up -d

# Atau untuk development
docker-compose -f docker-compose.dev.yml up -d
```

#### Step 4: Setup Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/employee-app
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/employee-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 5: Setup SSL dengan Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 2. ☁️ Cloud Platform Deployment

### A. Deploy ke DigitalOcean App Platform

#### Step 1: Prepare App Spec
```yaml
# .do/app.yaml
name: employee-management
services:
- name: frontend
  source_dir: /
  github:
    repo: jauharianggara/next-app
    branch: master
  build_command: npm run build
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: NODE_ENV
    value: production
  - key: NEXT_PUBLIC_API_URL
    value: ${backend.DEPLOYED_URL}

- name: backend
  source_dir: /mock-backend
  build_command: npm install
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: NODE_ENV
    value: production

databases:
- name: employee-db
  engine: PG
  version: "13"
```

#### Step 2: Deploy via CLI
```bash
# Install doctl
curl -sL https://github.com/digitalocean/doctl/releases/download/v1.100.0/doctl-1.100.0-linux-amd64.tar.gz | tar -xzv
sudo mv doctl /usr/local/bin

# Authenticate
doctl auth init

# Deploy
doctl apps create --spec .do/app.yaml
```

### B. Deploy ke Vercel + Railway

#### Frontend ke Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
```

#### Backend ke Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login dan deploy
railway login
railway init
railway up
```

### C. Deploy ke AWS EC2

#### Step 1: Setup EC2 Instance
```bash
# 1. Launch EC2 instance (Ubuntu 22.04)
# 2. Configure Security Group:
#    - SSH (22): Your IP
#    - HTTP (80): 0.0.0.0/0
#    - HTTPS (443): 0.0.0.0/0
#    - Custom (3000): 0.0.0.0/0 (Frontend)
#    - Custom (8080): 0.0.0.0/0 (Backend)

# 3. Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### Step 2: Setup Environment
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Nginx
sudo apt install nginx
```

#### Step 3: Deploy Application
```bash
# Clone dan setup
git clone https://github.com/jauharianggara/next-app.git
cd next-app

# Build dan run dengan Docker
docker-compose up -d

# Setup Nginx (sama seperti VPS deployment)
```

---

## 3. 🖥️ VPS Manual Deployment (Without Docker)

### Step 1: Server Setup
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 untuk process management
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib
```

### Step 2: Database Setup
```bash
# Setup PostgreSQL
sudo -u postgres psql

CREATE DATABASE employee_db;
CREATE USER employee_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE employee_db TO employee_user;
\q
```

### Step 3: Application Deployment
```bash
# Clone repository
git clone https://github.com/jauharianggara/next-app.git
cd next-app

# Install dependencies dan build
npm ci
npm run build

# Setup environment
echo "NODE_ENV=production" > .env
echo "DATABASE_URL=postgresql://employee_user:secure_password@localhost:5432/employee_db" >> .env
echo "NEXT_PUBLIC_API_URL=http://your-server-ip:8080" >> .env

# Start dengan PM2
pm2 start npm --name "frontend" -- start
pm2 startup
pm2 save

# Setup backend
cd mock-backend
npm install
pm2 start server.js --name "backend"
```

---

## 4. ⚡ Serverless Deployment

### A. Frontend ke Vercel + Backend ke Vercel Functions

#### Step 1: Modify untuk Serverless
```javascript
// api/auth/login.js (Vercel Functions)
export default function handler(req, res) {
  // Your login logic here
  if (req.method === 'POST') {
    // Handle login
    res.json({ success: true, data: { user, token } });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
```

#### Step 2: Deploy
```bash
# Deploy ke Vercel
vercel

# Semua API routes akan otomatis menjadi serverless functions
```

### B. Frontend ke Netlify + Backend ke Netlify Functions

#### Step 1: Setup Netlify Functions
```javascript
// netlify/functions/auth-login.js
exports.handler = async (event, context) => {
  if (event.httpMethod === 'POST') {
    // Handle login logic
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: { user, token } })
    };
  }
};
```

#### Step 2: Deploy
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

---

## 5. 📊 Monitoring dan Maintenance

### A. Setup Monitoring
```bash
# Install monitoring tools
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  prom/prometheus

docker run -d \
  --name grafana \
  -p 3001:3000 \
  grafana/grafana
```

### B. Backup Strategy
```bash
# Database backup script
#!/bin/bash
DATE=$(date +"%Y%m%d_%H%M%S")
pg_dump -U employee_user employee_db > /backup/db_backup_$DATE.sql

# Docker volumes backup
docker run --rm -v next-app_postgres_data:/volume -v $(pwd):/backup alpine tar czf /backup/postgres_backup_$DATE.tar.gz -C /volume ./
```

### C. Auto-deployment dengan GitHub Actions
Workflow yang sudah dibuat akan otomatis:
- Build Docker images
- Push ke container registry
- Deploy ke server via SSH

---

## 6. 🔧 Production Optimizations

### A. Environment Variables
```bash
# Production .env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
DATABASE_URL=postgresql://user:pass@db.yourdomain.com:5432/employee_db

# Security
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12

# Performance
NEXT_TELEMETRY_DISABLED=1
```

### B. Docker Production Optimizations
```dockerfile
# Dockerfile optimizations sudah diterapkan:
# - Multi-stage builds
# - Non-root user
# - Minimal base image
# - Output tracing
```

### C. Nginx Optimizations
```nginx
# Gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Cache static files
location /_next/static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Security headers
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
```

---

## 7. 🚀 Quick Start Commands

### Docker Deployment (Fastest)
```bash
# 1. Clone
git clone https://github.com/jauharianggara/next-app.git
cd next-app

# 2. Setup environment
cp .env.example .env
# Edit .env sesuai kebutuhan

# 3. Deploy
docker-compose up -d

# 4. Access
# Frontend: http://your-server:3000
# Backend: http://your-server:8080
```

### VPS Manual Deployment
```bash
# 1. Install dependencies
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

# 2. Clone dan build
git clone https://github.com/jauharianggara/next-app.git
cd next-app
npm ci && npm run build

# 3. Start services
npm install -g pm2
pm2 start npm --name "frontend" -- start
cd mock-backend && npm install
pm2 start server.js --name "backend"

# 4. Setup Nginx reverse proxy
```

### Cloud Platform (Easiest)
```bash
# Vercel (Frontend)
npm i -g vercel
vercel

# Railway (Backend)
npm i -g @railway/cli
railway login && railway init && railway up
```

---

## 📞 Support

Untuk bantuan deployment:
1. **Docker Issues**: Check `docker-compose logs`
2. **Build Errors**: Check GitHub Actions logs
3. **SSL Issues**: Check Certbot logs
4. **Performance Issues**: Check monitoring dashboard

Semua workflow GitHub Actions sudah siap untuk automated deployment! 🎉