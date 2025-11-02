# 🚀 Quick Deployment Guide

## 📦 Pilihan Deployment

### 1. 🐳 **Docker Deployment (Recommended)**
Paling mudah dan konsisten across semua environment.

```bash
# Linux/Mac
chmod +x deploy.sh
./deploy.sh production docker

# Windows PowerShell
.\deploy.ps1 production docker
```

### 2. ⚡ **Cloud Platform Deployment (Fastest)**
Deploy langsung ke cloud tanpa setup server.

#### A. Vercel (Frontend Only)
```bash
npm install -g vercel
vercel
```

#### B. Railway (Full Stack)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### 3. 🖥️ **VPS Deployment (Most Control)**
Deploy ke server sendiri untuk kontrol penuh.

```bash
# Auto deployment
./deploy.sh production pm2

# Manual setup
npm ci && npm run build
npm install -g pm2
pm2 start npm --name "frontend" -- start
```

---

## 🔥 Super Quick Start (5 Menit)

### Option 1: Docker (Local/VPS)
```bash
git clone https://github.com/jauharianggara/next-app.git
cd next-app
docker-compose up -d
```
✅ **Done!** Akses di http://localhost:3000

### Option 2: Vercel (Cloud)
```bash
git clone https://github.com/jauharianggara/next-app.git
cd next-app
npm install -g vercel
vercel
```
✅ **Done!** Akan mendapat URL deployment otomatis

### Option 3: Railway (Cloud Full Stack)
```bash
git clone https://github.com/jauharianggara/next-app.git
cd next-app
npm install -g @railway/cli
railway login
railway init
railway up
```
✅ **Done!** Frontend + Backend deployed automatically

---

## 🌐 Production Deployment (Recommended Setups)

### 1. **Small Business (Budget-Friendly)**
- **Frontend**: Vercel (Free tier)
- **Backend**: Railway/Heroku ($5-10/month)
- **Database**: Supabase/PlanetScale (Free tier)
- **Domain**: Namecheap ($10/year)

**Total Cost**: ~$5-15/month

```bash
# Frontend to Vercel
vercel --prod

# Backend to Railway
railway up

# Update NEXT_PUBLIC_API_URL di Vercel settings
```

### 2. **Medium Business (Performance Focused)**
- **Server**: DigitalOcean Droplet ($20/month)
- **Database**: Managed PostgreSQL ($15/month)
- **CDN**: Cloudflare (Free)
- **SSL**: Let's Encrypt (Free)

**Total Cost**: ~$35/month

```bash
# Setup server
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Deploy
git clone https://github.com/jauharianggara/next-app.git
cd next-app
docker-compose up -d

# Setup Nginx + SSL
sudo apt install nginx certbot
# Configure reverse proxy
```

### 3. **Enterprise (Scalable)**
- **Container**: AWS ECS/EKS
- **Database**: AWS RDS
- **CDN**: AWS CloudFront
- **Monitoring**: AWS CloudWatch

```bash
# Deploy with Terraform/CDK
# Automated via GitHub Actions
```

---

## 🛠️ Platform-Specific Instructions

### 🔵 DigitalOcean App Platform
```yaml
# .do/app.yaml
name: employee-management
services:
- name: frontend
  source_dir: /
  build_command: npm run build
  run_command: npm start
- name: backend
  source_dir: /mock-backend
  run_command: npm start
```

```bash
doctl apps create --spec .do/app.yaml
```

### 🟢 Heroku
```bash
# Frontend
git subtree push --prefix=. heroku-frontend main

# Backend
git subtree push --prefix=mock-backend heroku-backend main
```

### 🔴 AWS EC2
```bash
# User data script
#!/bin/bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
git clone https://github.com/jauharianggara/next-app.git
cd next-app
docker-compose up -d
```

### 🟡 Google Cloud Run
```bash
# Build dan deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/employee-app
gcloud run deploy --image gcr.io/PROJECT-ID/employee-app
```

---

## 🔧 Environment Configuration

### Development
```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8080
DATABASE_URL=postgresql://localhost:5432/employee_dev
```

### Staging
```env
NODE_ENV=staging
NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com
DATABASE_URL=postgresql://staging-db:5432/employee_staging
```

### Production
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
DATABASE_URL=postgresql://prod-db:5432/employee_prod
JWT_SECRET=super-secure-secret-key
BCRYPT_ROUNDS=12
```

---

## 📊 Monitoring & Health Checks

### Health Check Endpoints
```bash
# Backend health
curl http://localhost:8080/health

# Frontend health
curl http://localhost:3000

# API endpoints
curl http://localhost:8080/api/jabatans
curl http://localhost:8080/api/kantors
```

### Monitoring Setup
```bash
# Docker monitoring
docker stats
docker-compose logs -f

# PM2 monitoring
pm2 monit
pm2 logs

# System monitoring
htop
df -h
free -h
```

---

## 🆘 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :8080

# Kill process
kill -9 <PID>
```

#### Docker Issues
```bash
# Clean up Docker
docker system prune -a
docker-compose down -v

# Rebuild
docker-compose build --no-cache
```

#### Node.js Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json
npm install
```

#### Build Errors
```bash
# TypeScript errors
npm run type-check

# Lint errors
npm run lint

# Test failures
npm test
```

### Performance Issues
```bash
# Check memory usage
free -h

# Check disk space
df -h

# Check CPU usage
top

# Optimize Docker
docker-compose -f docker-compose.yml up -d
```

---

## 📞 Support

### Quick Help Commands
```bash
# Check application status
./deploy.sh --help
docker-compose ps
pm2 status

# View logs
docker-compose logs -f
pm2 logs
tail -f /var/log/nginx/error.log

# Restart services
docker-compose restart
pm2 restart all
sudo systemctl restart nginx
```

### Common URLs
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **API Docs**: http://localhost:8080/
- **Health Check**: http://localhost:8080/health

### GitHub Actions
Semua deployment otomatis via GitHub Actions:
- **Push ke master**: Auto deploy ke production
- **Push ke develop**: Auto deploy ke staging
- **Create tag v***: Auto create release

---

## 🎯 Next Steps

1. **Deploy aplikasi** dengan salah satu method di atas
2. **Setup domain** dan SSL certificate
3. **Configure monitoring** dan backup
4. **Setup database** production yang proper
5. **Configure CI/CD** via GitHub Actions

**Selamat deploy! 🚀**