# 🚀 Quick Deploy Guide

## Frontend-Only Employee Management System

### Windows (PowerShell) - RECOMMENDED ✅

```powershell
# Deploy aplikasi (build + start)
.\deploy.ps1

# Command lainnya
.\deploy.ps1 build     # Build image saja
.\deploy.ps1 stop      # Stop services
.\deploy.ps1 restart   # Restart services  
.\deploy.ps1 logs      # View logs
.\deploy.ps1 status    # Check status
.\deploy.ps1 clean     # Clean environment
```

### Linux/Mac

```bash
chmod +x docker-deploy.sh
./docker-deploy.sh deploy
```

## 🌐 Access

- **Frontend**: http://localhost:3000
- **Health**: Container auto-health check included

## 🔧 Configuration

Edit `docker-compose.yml` untuk backend API:

```yaml
environment:
  - NEXT_PUBLIC_API_URL=http://your-api-server.com/api
```

## ⚡ Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | `.\deploy.ps1 stop` then `.\deploy.ps1` |
| Build fails | `.\deploy.ps1 clean` then `.\deploy.ps1` |
| Old cache | `.\deploy.ps1 clean` (removes cache) |

## 🏗️ Project Status

✅ **READY FOR PRODUCTION**
- Frontend-only architecture
- Docker containerized  
- Health checks included
- External API integration ready
- Clean, minimal dependencies

---

**Script tested and working on Windows PowerShell ✅**