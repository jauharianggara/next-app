# CSRF Protection Troubleshooting Guide

## 🔍 Understanding CSRF Protection

CSRF (Cross-Site Request Forgery) protection prevents unauthorized requests from malicious sites. When enabled on backend, it requires a valid CSRF token for state-changing operations (POST, PUT, DELETE).

## ⚠️ Common CSRF Errors

```
403 Forbidden - CSRF token mismatch
403 Forbidden - CSRF token missing
419 Page Expired (Laravel)
403 Invalid CSRF Token (Spring Boot)
```

## 🔧 Solutions Implemented

### 1. Updated API Client (`src/lib/api-client.ts`)
- ✅ Added `withCredentials: true` to axios config
- ✅ Interceptor automatically adds CSRF token from cookies
- ✅ Supports multiple CSRF cookie names: `XSRF-TOKEN`, `csrf_token`, `_csrf`

### 2. Updated Proxy Route (`src/app/api/proxy/[...path]/route.ts`)
- ✅ Forwards CSRF tokens in headers
- ✅ Preserves cookies with `credentials: 'include'`
- ✅ Properly handles Set-Cookie headers from backend
- ✅ CORS configured for credentials

### 3. Created CSRF Helper (`src/lib/csrf.ts`)
- ✅ `getCsrfToken()` - Get token from cookies
- ✅ `fetchCsrfToken()` - Fetch token from backend
- ✅ `initCsrfToken()` - Initialize token on app load
- ✅ `getCsrfHeaders()` - Get headers for manual requests

### 4. Updated Apache Config (`apache-config.conf`)
- ✅ CORS with credentials enabled
- ✅ Cookie domain rewriting
- ✅ Proper header forwarding
- ✅ CSRF headers in allowed headers list

## 🚀 Backend Requirements

Your backend (axum.synergyinfinity.id) needs to:

### Option 1: Disable CSRF for API (Recommended for API-only backends)
```rust
// Axum example
// Remove CSRF middleware for API routes
```

```java
// Spring Boot example
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable(); // For API-only applications
    }
}
```

### Option 2: Configure CSRF with Cookie-Based Tokens
```java
// Spring Boot with Cookie CSRF
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf()
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            .and()
            .cors()
                .configurationSource(corsConfigurationSource());
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("https://nextjs.synergyinfinity.id"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### Option 3: Add CSRF Endpoint
```java
// Spring Boot - Expose CSRF token endpoint
@RestController
public class CsrfController {
    @GetMapping("/csrf")
    public CsrfToken csrf(CsrfToken token) {
        return token;
    }
}
```

## 🧪 Testing CSRF

### Test 1: Check if Backend Sets CSRF Cookie
```bash
# Make a GET request and check Set-Cookie header
curl -I -X GET https://axum.synergyinfinity.id/api/ -v

# Look for:
# Set-Cookie: XSRF-TOKEN=...
# Set-Cookie: csrf_token=...
```

### Test 2: Test POST with CSRF Token
```bash
# 1. Get CSRF token
curl -c cookies.txt https://axum.synergyinfinity.id/api/

# 2. Use token in POST
curl -b cookies.txt \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: <token-from-cookie>" \
  -d '{"username":"test","password":"test"}' \
  https://axum.synergyinfinity.id/api/auth/login
```

### Test 3: Check Frontend CSRF Handling
```javascript
// Open browser console on your site
// Check if CSRF token is in cookies
document.cookie.split(';').find(c => c.includes('XSRF-TOKEN'))

// Check if token is sent in requests (Network tab)
// Look for X-XSRF-TOKEN or X-CSRF-TOKEN header
```

## 🔍 Debugging Steps

### 1. Check Backend CSRF Configuration
```bash
# Test if backend requires CSRF
curl -X POST https://axum.synergyinfinity.id/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# If you get 403 CSRF error, CSRF is enabled
```

### 2. Check Cookie Visibility
```javascript
// In browser console
console.log(document.cookie);

// If CSRF cookie is HttpOnly, you won't see it here
// Check in DevTools → Application → Cookies
```

### 3. Check Network Requests
1. Open DevTools → Network tab
2. Make a POST request (e.g., login)
3. Check request headers for:
   - `X-XSRF-TOKEN` or `X-CSRF-TOKEN`
   - `Cookie` header with CSRF token
4. Check response headers for:
   - `Set-Cookie` with CSRF token

### 4. Check Proxy Logs
```bash
# On aaPanel server
tail -f /www/wwwlogs/nextjs.synergyinfinity.id-error_log

# Check for CSRF-related errors
```

## 💡 Recommendations

### For Development (Fastest):
```bash
# Disable CSRF on backend temporarily
# Focus on getting authentication working first
# Enable CSRF later
```

### For Production (Most Secure):
```bash
# Option 1: Use JWT tokens instead of sessions
#   - Stateless authentication
#   - No CSRF protection needed
#   - Store JWT in httpOnly cookie

# Option 2: Proper CSRF with cookies
#   - Backend sets CSRF cookie
#   - Frontend reads and sends in headers
#   - All configured above
```

## 📋 Quick Fix Checklist

- [ ] Backend: Disable CSRF OR configure it properly
- [ ] Backend: Enable CORS with credentials
- [ ] Backend: Set CSRF cookie (if using CSRF)
- [ ] Frontend: Updated to send CSRF token
- [ ] Apache: Cookie domain rewriting configured
- [ ] Test: POST request works without 403 error

## 🆘 Still Not Working?

### Check Backend Framework Documentation:
- **Spring Boot**: https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html
- **Axum**: https://docs.rs/tower-csrf/
- **Laravel**: https://laravel.com/docs/csrf
- **Django**: https://docs.djangoproject.com/en/stable/ref/csrf/

### Alternative: Use JWT Authentication
If CSRF is too complex, consider switching to JWT-based authentication:
- No session cookies = No CSRF issues
- Token in Authorization header
- Stateless and scalable

```javascript
// Example: JWT in Authorization header
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

## 📞 Contact Backend Team

If backend is maintained by another team, ask them:
1. Is CSRF protection enabled?
2. What is the CSRF cookie name?
3. What header name should we use?
4. Can you provide a /csrf endpoint?
5. Can we switch to JWT instead?
