# 🔧 Cara Mengubah Backend URL di Apache

## 📍 File yang Perlu Diubah

### 1. Apache Configuration
File: `deployment/apache-frontend-only.conf`

**Ganti 3 lokasi berikut:**

```apache
# Lokasi 1: Content Security Policy (line 41)
Header always set Content-Security-Policy "default-src 'self' https://API-SERVER-ANDA.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://API-SERVER-ANDA.com; frame-ancestors 'none';"

# Lokasi 2: API Proxy (lines 77-78)
ProxyPass https://API-SERVER-ANDA.com/api/
ProxyPassReverse https://API-SERVER-ANDA.com/api/
```

### 2. Frontend Environment Variables
File: `docker-compose.yml`

```yaml
environment:
  - NEXT_PUBLIC_API_URL=https://API-SERVER-ANDA.com/api
```

## 🌐 Contoh Real URLs

### Contoh 1: Backend di Server Lain
```apache
# Ganti your-actual-api-server.com dengan:
https://backend.mycompany.com

# Hasil:
ProxyPass https://backend.mycompany.com/api/
ProxyPassReverse https://backend.mycompany.com/api/
```

### Contoh 2: Backend di Port Berbeda
```apache
# Ganti dengan:
https://myserver.com:8080

# Hasil:
ProxyPass https://myserver.com:8080/api/
ProxyPassReverse https://myserver.com:8080/api/
```

### Contoh 3: Backend di Localhost (Development)
```apache
# Ganti dengan:
http://localhost:8000

# Hasil:
ProxyPass http://localhost:8000/api/
ProxyPassReverse http://localhost:8000/api/
```

## ⚡ Quick Replace Command

**Windows PowerShell:**
```powershell
# Ganti BACKEND-URL-ANDA dengan URL sebenarnya
$oldUrl = "your-actual-api-server.com"
$newUrl = "BACKEND-URL-ANDA"  # Ganti ini!

(Get-Content "deployment\apache-frontend-only.conf") -replace $oldUrl, $newUrl | Set-Content "deployment\apache-frontend-only.conf"
```

**Linux/Mac:**
```bash
# Ganti BACKEND-URL-ANDA dengan URL sebenarnya
sed -i 's/your-actual-api-server.com/BACKEND-URL-ANDA/g' deployment/apache-frontend-only.conf
```

## 📋 Contoh Lengkap

Misalnya backend Anda di `https://api.example.com`:

**Sebelum:**
```apache
ProxyPass https://your-actual-api-server.com/api/
```

**Sesudah:**
```apache
ProxyPass https://api.example.com/api/
```

## 🔄 Restart Apache

Setelah edit config:
```bash
sudo systemctl restart apache2
# atau
sudo service apache2 restart
```

## ✅ Test Connection

```bash
curl -X GET https://yourdomain.com/api/employees
# Should proxy to your backend server
```

---

**PENTING:** Ganti `your-actual-api-server.com` dengan URL backend yang sebenarnya!