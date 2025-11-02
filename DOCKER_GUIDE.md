# 🐳 Docker Deployment Guide

## Frontend-Only Employee Management System

Aplikasi ini adalah frontend-only yang dapat terhubung ke backend eksternal melalui konfigurasi API URL.

## 🚀 Quick Start

### Windows (PowerShell)
```powershell
# Deploy aplikasi lengkap
.\docker-deploy.ps1

# Atau dengan parameter spesifik
.\docker-deploy.ps1 -Action deploy
```

### Linux/Mac
```bash
# Buat executable
chmod +x docker-deploy.sh

# Deploy aplikasi
./docker-deploy.sh deploy
```

## 📋 Available Commands

| Command | Windows | Linux/Mac | Description |
|---------|---------|-----------|-------------|
| Deploy | `.\docker-deploy.ps1 -Action deploy` | `./docker-deploy.sh deploy` | Build dan start semua services |
| Build Only | `.\docker-deploy.ps1 -Action build` | `./docker-deploy.sh build` | Build Docker image saja |
| Restart | `.\docker-deploy.ps1 -Action restart` | `./docker-deploy.sh restart` | Restart services |
| Stop | `.\docker-deploy.ps1 -Action stop` | `./docker-deploy.sh stop` | Stop semua services |
| Logs | `.\docker-deploy.ps1 -Action logs` | `./docker-deploy.sh logs` | View container logs |
| Clean | `.\docker-deploy.ps1 -Action clean` | `./docker-deploy.sh clean` | Clean environment |

## 🔧 Configuration

### Environment Variables
Edit `docker-compose.yml` untuk konfigurasi:

```yaml
environment:
  - NEXT_PUBLIC_API_URL=http://your-backend-api.com/api
  - NODE_ENV=production
```

### Backend Integration
```javascript
// Dalam komponen React
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Contoh penggunaan
const response = await fetch(`${API_URL}/employees`);
```

## 🌐 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React/Next.js application |

## 🐛 Troubleshooting

### Common Issues

**1. Docker Image Format Error**
```powershell
# Solution: Clean and rebuild
.\docker-deploy.ps1 -Action clean
.\docker-deploy.ps1 -Action deploy
```

**2. Port Already in Use**
```bash
# Check what's using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Stop and restart
./docker-deploy.sh stop
./docker-deploy.sh deploy
```

**3. Container Won't Start**
```bash
# Check logs
./docker-deploy.sh logs

# Rebuild from scratch
./docker-deploy.sh clean
./docker-deploy.sh deploy
```

**4. Build Cache Issues**
```bash
# Clear all Docker cache
docker system prune -af
docker builder prune -af
```

## 📊 Health Checks

Script otomatis melakukan health check:
- ✅ Docker availability
- ✅ Container status
- ✅ HTTP response (200 OK)
- ✅ Service connectivity

## 🔄 Update Process

```bash
# 1. Stop current services
./docker-deploy.sh stop

# 2. Pull latest code
git pull origin main

# 3. Rebuild and deploy
./docker-deploy.sh deploy
```

## 📁 Project Structure

```
next-app/
├── docker-deploy.ps1       # Windows deployment script
├── docker-deploy.sh        # Linux/Mac deployment script
├── docker-compose.yml      # Docker orchestration
├── Dockerfile              # Container configuration
├── package.json            # Dependencies
└── src/                    # Frontend source code
```

## 🌍 Production Deployment

### Cloud Options

**Vercel (Recommended)**
```bash
npm install -g vercel
vercel
```

**Netlify**
```bash
npm run build
# Upload /out folder to Netlify
```

**Docker on Cloud**
```bash
# Build for production
docker build -t employee-frontend .

# Tag for registry
docker tag employee-frontend your-registry/employee-frontend

# Push to registry
docker push your-registry/employee-frontend
```

## 🔒 Security Notes

- Environment variables tidak commit ke Git
- Gunakan HTTPS di production
- Configure CORS di backend untuk domain production
- Set proper security headers di reverse proxy

## 📞 Support

Jika mengalami masalah:
1. Jalankan `./docker-deploy.sh logs` untuk melihat error
2. Gunakan `./docker-deploy.sh clean` untuk reset environment
3. Pastikan Docker Desktop running dan updated
4. Check firewall settings untuk port 3000

---

**Built with ❤️ for Frontend-Only Deployment**