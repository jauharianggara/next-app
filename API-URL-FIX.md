# API URL Configuration Fix

## Problem
URL yang dihasilkan: `http://localhost:3000/api/api/auth/login`  
URL yang diharapkan: `http://localhost:8080/api/auth/login`

### Root Causes:
1. **Double `/api` prefix**: 
   - BaseURL dari proxy: `/api/proxy`
   - Endpoint di api.ts: `/api/auth/login`
   - Result: `/api/proxy/api/auth/login` ❌

2. **Wrong port (3000 vs 8080)**:
   - Frontend di port 3000
   - Backend di port 8080
   - Request seharusnya ke backend port 8080

## Solution Applied

### 1. Updated `src/lib/api-client.ts`

**Before:**
```typescript
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const useProxy = process.env.NEXT_PUBLIC_USE_PROXY === 'true';
    return useProxy 
      ? '/api/proxy'
      : (process.env.NEXT_PUBLIC_API_URL || 'https://axum.synergyinfinity.id/');
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://axum.synergyinfinity.id/';
};
```

**After:**
```typescript
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const useProxy = process.env.NEXT_PUBLIC_USE_PROXY === 'true';
    if (useProxy) {
      // When using proxy, endpoints in api.ts already have /api prefix
      return '/api/proxy';
    }
    // Direct API: clean URL without trailing slash
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://axum.synergyinfinity.id';
    return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  }
  // Server-side: clean URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://axum.synergyinfinity.id';
  return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
};
```

**Changes:**
- ✅ Remove trailing slash from API URL
- ✅ Better URL handling for both proxy and direct modes

### 2. Updated `docker-compose.yml`

**Changed:**
```yaml
- NEXT_PUBLIC_USE_PROXY=false  # Changed from true
```

**Reason:** Di production dengan Apache reverse proxy, frontend akan langsung hit backend URL, bukan menggunakan Next.js proxy.

## URL Resolution Flow

### Development (Local - No Proxy)
```
Environment:
  NEXT_PUBLIC_API_URL=http://localhost:8080
  NEXT_PUBLIC_USE_PROXY=false

Flow:
  1. api-client.ts → baseURL = "http://localhost:8080"
  2. api.ts → endpoint = "/api/auth/login"
  3. Final URL = "http://localhost:8080/api/auth/login" ✅
```

### Development (Local - With Proxy)
```
Environment:
  NEXT_PUBLIC_USE_PROXY=true

Flow:
  1. api-client.ts → baseURL = "/api/proxy"
  2. api.ts → endpoint = "/api/auth/login"
  3. Axios call = "/api/proxy/api/auth/login"
  4. Next.js proxy strips "/api/proxy" → "/api/auth/login"
  5. Proxy forwards to backend → "http://localhost:8080/api/auth/login" ✅
```

### Production (Apache Proxy)
```
Environment:
  NEXT_PUBLIC_API_URL=https://axum.synergyinfinity.id
  NEXT_PUBLIC_USE_PROXY=false

Flow:
  1. api-client.ts → baseURL = "https://axum.synergyinfinity.id"
  2. api.ts → endpoint = "/api/auth/login"
  3. Final URL = "https://axum.synergyinfinity.id/api/auth/login" ✅
```

## Testing

### To Rebuild Docker Image:

```powershell
# Stop running container
docker-compose down

# Rebuild image (open new terminal and let it run without interruption)
docker build -t employee-frontend:latest .

# Start container
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Expected API Calls:

When `NEXT_PUBLIC_USE_PROXY=false`:
```
POST http://localhost:8080/api/auth/login
GET http://localhost:8080/api/karyawans
POST http://localhost:8080/api/karyawans/with-photo
```

When `NEXT_PUBLIC_USE_PROXY=true`:
```
POST http://localhost:3000/api/proxy/api/auth/login
  → proxied to → http://localhost:8080/api/auth/login
```

### Verify in Browser DevTools:

1. Open Network tab (F12)
2. Login to application
3. Check request URL should be one of:
   - ✅ `http://localhost:8080/api/auth/login` (direct)
   - ✅ `http://localhost:3000/api/proxy/api/auth/login` (with proxy)
   - ❌ `http://localhost:3000/api/api/auth/login` (WRONG - double /api)

## Configuration Reference

### For Local Development:
`.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_USE_PROXY=false
```

### For Docker Production:
`docker-compose.yml`:
```yaml
environment:
  - NEXT_PUBLIC_API_URL=http://localhost:8080
  - NEXT_PUBLIC_USE_PROXY=false
```

### For aaPanel Production:
`docker-compose.yml`:
```yaml
environment:
  - NEXT_PUBLIC_API_URL=https://axum.synergyinfinity.id
  - NEXT_PUBLIC_USE_PROXY=false
```

## Files Modified

1. ✅ `src/lib/api-client.ts` - Fixed baseURL resolution
2. ✅ `docker-compose.yml` - Changed USE_PROXY to false
3. ✅ `.env.local` - Already correct

## Next Steps

1. **Rebuild Docker image** (in separate terminal, let it complete)
2. **Test locally** with `docker-compose up -d`
3. **Verify API calls** in browser DevTools
4. **Deploy to aaPanel** once verified

---

**Status:** ✅ Code fixed, ready for rebuild and testing
