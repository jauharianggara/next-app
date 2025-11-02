# File Upload Troubleshooting Guide

## 🔍 Common Upload Issues

### Issue 1: Upload Returns 400/413 Error
**Symptoms:**
- HTTP 400 Bad Request
- HTTP 413 Payload Too Large
- "File too large" error

**Solutions:**

#### A. Check File Size Limits

**Frontend (Already Set):**
```javascript
// Max file size: 5MB
if (file.size > 5 * 1024 * 1024) {
  toast.error('File size must be less than 5MB');
  return;
}
```

**Backend - Spring Boot:**
```properties
# application.properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

**Backend - Axum/Rust:**
```rust
// Set body size limit
.layer(DefaultBodyLimit::max(10 * 1024 * 1024)) // 10MB
```

**Apache (Updated in apache-config.conf):**
```apache
LimitRequestBody 10485760  # 10MB in bytes
ProxyTimeout 600           # 10 minutes for large uploads
```

#### B. Check Content-Type Header

The proxy now automatically handles `multipart/form-data`:
- ✅ Removes Content-Type header for multipart
- ✅ Lets fetch() set boundary automatically
- ✅ Passes FormData directly

### Issue 2: Upload Returns 415 Unsupported Media Type
**Cause:** Backend doesn't accept multipart/form-data

**Solution:** Backend must accept multipart

**Spring Boot:**
```java
@PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> uploadPhoto(
    @PathVariable Long id,
    @RequestParam("foto") MultipartFile foto
) {
    // Handle upload
}
```

### Issue 3: File Upload Times Out
**Cause:** Upload timeout too short

**Solutions:**

**Apache (Updated):**
```apache
ProxyTimeout 600  # 10 minutes
```

**Axios (api-client.ts):**
```javascript
const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000, // Increase for uploads: 60 seconds
});
```

**Next.js API Route:**
```javascript
export const config = {
  api: {
    bodyParser: false, // Don't parse body for file uploads
    responseLimit: false,
  },
};
```

### Issue 4: FormData Not Sent Correctly
**Fixed in:** `src/lib/api.ts`

```javascript
// DON'T transform FormData
transformRequest: [(data) => data]
```

### Issue 5: File Upload Shows Progress but Fails
**Debugging:**

1. **Check Network Tab:**
   - Request Headers should show `Content-Type: multipart/form-data; boundary=...`
   - Request Payload should show form fields and file

2. **Check Backend Logs:**
   ```bash
   # On aaPanel
   tail -f /path/to/backend/logs/application.log
   ```

3. **Check Apache Logs:**
   ```bash
   tail -f /www/wwwlogs/nextjs.synergyinfinity.id-error_log
   ```

4. **Test Direct Upload:**
   ```bash
   # Test backend directly
   curl -X POST https://axum.synergyinfinity.id/api/karyawans/1/photo \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "foto=@/path/to/image.jpg"
   ```

## ✅ What's Fixed

### 1. Proxy Route (`src/app/api/proxy/[...path]/route.ts`)
- ✅ Properly handles multipart/form-data
- ✅ Removes Content-Type for multipart (lets fetch set boundary)
- ✅ Passes FormData directly without transformation
- ✅ Added PATCH method support

### 2. API Client (`src/lib/api.ts`)
- ✅ Added `transformRequest` to prevent FormData transformation
- ✅ Applied to both `createWithPhoto` and `uploadPhoto`

### 3. Apache Config (`apache-config.conf`)
- ✅ Increased timeout to 600 seconds (10 minutes)
- ✅ Set body limit to 10MB
- ✅ Proper header forwarding

## 🧪 Testing Upload

### Test 1: Frontend Test
```javascript
// In browser console on create/edit employee page
const input = document.querySelector('input[type="file"]');
const file = input.files[0];

console.log('File:', {
  name: file.name,
  size: file.size,
  type: file.type
});

// Should show:
// { name: "photo.jpg", size: 123456, type: "image/jpeg" }
```

### Test 2: API Test
```bash
# Get auth token first
TOKEN="your_jwt_token"

# Upload photo
curl -X POST https://nextjs.synergyinfinity.id/api/karyawans/1/photo \
  -H "Authorization: Bearer $TOKEN" \
  -F "foto=@photo.jpg" \
  -v

# Should return 200 OK with updated employee data
```

### Test 3: Check Uploaded File
```bash
# On backend server
ls -lh /path/to/uploads/

# Should see uploaded file
```

## 📋 Upload Flow

```
Browser
  ↓ FormData with File
Frontend (React)
  ↓ axios.post() with FormData
API Client (axios interceptor)
  ↓ transformRequest: [(data) => data]
Proxy Route (/api/proxy/[...path])
  ↓ Remove Content-Type, pass FormData
Apache Reverse Proxy
  ↓ Forward to backend
Backend (axum.synergyinfinity.id)
  ↓ Process multipart/form-data
Save File & Return Response
```

## 🔧 Backend Requirements

### Spring Boot Example:
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    @Bean
    public MultipartResolver multipartResolver() {
        CommonsMultipartResolver resolver = new CommonsMultipartResolver();
        resolver.setMaxUploadSize(10485760); // 10MB
        resolver.setMaxInMemorySize(1048576); // 1MB
        return resolver;
    }
}

@RestController
@RequestMapping("/api/karyawans")
public class KaryawanController {
    
    @PostMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadPhoto(
        @PathVariable Long id,
        @RequestParam("foto") MultipartFile foto
    ) {
        // Validate file
        if (foto.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }
        
        if (foto.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body("File too large");
        }
        
        // Save file
        String filename = storageService.store(foto);
        
        // Update employee record
        karyawan.setFotoPath(filename);
        karyawanRepository.save(karyawan);
        
        return ResponseEntity.ok(karyawan);
    }
}
```

### Axum Example:
```rust
async fn upload_photo(
    Path(id): Path<i32>,
    mut multipart: Multipart,
) -> Result<Json<Karyawan>, StatusCode> {
    while let Some(field) = multipart.next_field().await.unwrap() {
        let name = field.name().unwrap().to_string();
        
        if name == "foto" {
            let data = field.bytes().await.unwrap();
            
            // Validate size
            if data.len() > 5 * 1024 * 1024 {
                return Err(StatusCode::PAYLOAD_TOO_LARGE);
            }
            
            // Save file
            let filename = save_file(&data).await?;
            
            // Update record
            let karyawan = update_photo(id, filename).await?;
            return Ok(Json(karyawan));
        }
    }
    
    Err(StatusCode::BAD_REQUEST)
}
```

## 🚨 Common Backend Errors

### Error: "No multipart boundary was found"
**Cause:** Content-Type header malformed

**Solution:** Let fetch() set Content-Type automatically (already fixed in proxy)

### Error: "The field 'foto' exceeds its maximum permitted size"
**Cause:** Backend file size limit too small

**Solution:** Increase backend limit to at least 10MB

### Error: "Access Denied" or 403
**Cause:** CSRF protection or authentication

**Solution:**
- Check CSRF token (see CSRF-TROUBLESHOOTING.md)
- Verify Authorization header is forwarded

## 📊 Monitoring Upload

### Browser DevTools
1. Open Network tab
2. Upload a file
3. Check the request:
   - **Headers:** Should have `Content-Type: multipart/form-data; boundary=...`
   - **Payload:** Should show file data
   - **Response:** Check status code and response

### Backend Logs
```bash
# Spring Boot
tail -f logs/application.log | grep -i upload

# Axum
tail -f logs/app.log | grep -i photo
```

### Apache Logs
```bash
tail -f /www/wwwlogs/nextjs.synergyinfinity.id-access_log | grep POST
tail -f /www/wwwlogs/nextjs.synergyinfinity.id-error_log
```

## ✅ Verification Checklist

- [ ] File size < 5MB (frontend validation)
- [ ] Backend accepts multipart/form-data
- [ ] Backend file size limit >= 10MB
- [ ] Apache timeout >= 600 seconds
- [ ] Apache body limit >= 10MB
- [ ] CSRF token forwarded (if required)
- [ ] Authorization header forwarded
- [ ] Upload directory writable on backend
- [ ] File extension validated on backend
- [ ] Response includes file path/URL

## 🆘 Still Not Working?

1. **Test backend directly:**
   ```bash
   curl -X POST https://axum.synergyinfinity.id/api/karyawans/1/photo \
     -H "Authorization: Bearer TOKEN" \
     -F "foto=@test.jpg" \
     -v
   ```

2. **Check if backend endpoint exists:**
   ```bash
   curl -I https://axum.synergyinfinity.id/api/karyawans/1/photo
   # Should return 405 Method Not Allowed (endpoint exists)
   # Not 404 (endpoint missing)
   ```

3. **Enable debug logging:**
   - Frontend: Check browser console for errors
   - Proxy: Add console.log in route.ts
   - Apache: Enable debug logging
   - Backend: Enable multipart debug logging

4. **Contact backend team:**
   - Confirm endpoint URL format
   - Confirm field name (foto, file, photo?)
   - Confirm authentication method
   - Request example curl command
