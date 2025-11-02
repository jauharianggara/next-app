# 🔧 Apache Configuration for Employee Management System

## 📋 Apache Setup Guide

Apache dapat digunakan sebagai reverse proxy untuk aplikasi Employee Management System, menggantikan Nginx.

---

## 1. 📦 Install Apache

### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Apache
sudo apt install apache2 apache2-utils

# Enable required modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_balancer
sudo a2enmod lbmethod_byrequests
sudo a2enmod ssl
sudo a2enmod rewrite
sudo a2enmod headers

# Start and enable Apache
sudo systemctl start apache2
sudo systemctl enable apache2
```

### CentOS/RHEL/Rocky Linux
```bash
# Install Apache
sudo dnf install httpd mod_ssl

# Enable modules (modules are usually pre-enabled)
sudo systemctl start httpd
sudo systemctl enable httpd

# Configure firewall
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

---

## 2. 🔧 Apache Virtual Host Configuration

### Basic HTTP Configuration
Create file: `/etc/apache2/sites-available/employee-app.conf`

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    DocumentRoot /var/www/html

    # Redirect HTTP to HTTPS
    Redirect permanent / https://your-domain.com/

    # Logs
    ErrorLog ${APACHE_LOG_DIR}/employee-app-error.log
    CustomLog ${APACHE_LOG_DIR}/employee-app-access.log combined
</VirtualHost>
```

### Complete HTTPS Configuration
Create file: `/etc/apache2/sites-available/employee-app-ssl.conf`

```apache
<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    DocumentRoot /var/www/html

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/your-domain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/your-domain.com/privkey.pem
    
    # Modern SSL Configuration
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384
    SSLHonorCipherOrder off
    SSLSessionTickets off

    # Security Headers
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"

    # Compression
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \.(?:gif|jpe?g|png|ico|woff|woff2|ttf|eot)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>

    # Frontend Proxy (Next.js)
    ProxyPreserveHost On
    ProxyRequests Off
    
    # Frontend static files caching
    <LocationMatch "^/_next/static/.*">
        ProxyPass http://127.0.0.1:3000/_next/static/
        ProxyPassReverse http://127.0.0.1:3000/_next/static/
        Header set Cache-Control "public, max-age=31536000, immutable"
    </LocationMatch>

    # API Backend Proxy
    <Location /api/>
        # Rate limiting (requires mod_evasive)
        DOSHashTableSize 4096
        DOSPageCount 2
        DOSSiteCount 50
        DOSPageInterval 1
        DOSSiteInterval 1
        DOSBlockingPeriod 600

        ProxyPass http://127.0.0.1:8080/api/
        ProxyPassReverse http://127.0.0.1:8080/api/
        
        # CORS Headers
        Header always set Access-Control-Allow-Origin "*"
        Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header always set Access-Control-Allow-Headers "Authorization, Content-Type, Accept"
        Header always set Access-Control-Allow-Credentials "true"
    </Location>

    # Health check endpoint
    <Location /health>
        ProxyPass http://127.0.0.1:8080/health
        ProxyPassReverse http://127.0.0.1:8080/health
        # Disable logging for health checks
        SetEnv dontlog
    </Location>

    # Frontend Proxy (catch-all)
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
    
    # WebSocket support for Next.js development
    ProxyPass /ws/ ws://127.0.0.1:3000/ws/
    ProxyPassReverse /ws/ ws://127.0.0.1:3000/ws/

    # Custom error pages
    ErrorDocument 404 /404.html
    ErrorDocument 500 /50x.html
    ErrorDocument 502 /50x.html
    ErrorDocument 503 /50x.html
    ErrorDocument 504 /50x.html

    # Logs
    ErrorLog ${APACHE_LOG_DIR}/employee-app-ssl-error.log
    CustomLog ${APACHE_LOG_DIR}/employee-app-ssl-access.log combined
    
    # Exclude health checks from access log
    SetEnvIf Request_URI "^/health$" dontlog
    CustomLog ${APACHE_LOG_DIR}/employee-app-ssl-access.log combined env=!dontlog

    # Disable server signature
    ServerSignature Off
</VirtualHost>
</IfModule>
```

---

## 3. 🚀 Enable Sites and Restart Apache

```bash
# Enable sites
sudo a2ensite employee-app.conf
sudo a2ensite employee-app-ssl.conf

# Disable default site
sudo a2dissite 000-default.conf

# Test configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2

# Check status
sudo systemctl status apache2
```

---

## 4. 🔒 SSL Certificate with Let's Encrypt

### Install Certbot
```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-apache

# CentOS/RHEL
sudo dnf install certbot python3-certbot-apache
```

### Generate SSL Certificate
```bash
# Generate certificate
sudo certbot --apache -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run

# Setup auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

---

## 5. ⚡ Performance Optimization

### Enable Additional Modules
```bash
# Performance modules
sudo a2enmod expires
sudo a2enmod deflate
sudo a2enmod filter
sudo a2enmod headers

# Security modules
sudo a2enmod security2  # ModSecurity (optional)
sudo a2enmod evasive    # DDoS protection (optional)
```

### Create Performance Configuration
Create file: `/etc/apache2/conf-available/performance.conf`

```apache
# Performance and Caching Configuration

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType application/x-javascript "access plus 1 year"
    ExpiresByType text/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/ico "access plus 1 month"
    ExpiresByType image/icon "access plus 1 month"
    ExpiresByType image/x-icon "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
    ExpiresByType application/font-woff "access plus 1 year"
    ExpiresByType application/font-woff2 "access plus 1 year"
</IfModule>

# File ETag
FileETag None

# Hide Apache version
ServerTokens Prod
ServerSignature Off
```

Enable the configuration:
```bash
sudo a2enconf performance
sudo systemctl reload apache2
```

---

## 6. 🛡️ Security Configuration

### Install ModSecurity (Optional)
```bash
# Ubuntu/Debian
sudo apt install libapache2-mod-security2

# Enable ModSecurity
sudo a2enmod security2

# Copy recommended configuration
sudo cp /etc/modsecurity/modsecurity.conf-recommended /etc/modsecurity/modsecurity.conf

# Edit configuration
sudo nano /etc/modsecurity/modsecurity.conf
# Change: SecRuleEngine DetectionOnly
# To: SecRuleEngine On
```

### Install mod_evasive (DDoS Protection)
```bash
# Ubuntu/Debian
sudo apt install libapache2-mod-evasive

# Create configuration
sudo nano /etc/apache2/mods-available/evasive.conf
```

Add to evasive.conf:
```apache
<IfModule mod_evasive24.c>
    DOSHashTableSize    4096
    DOSPageCount        3
    DOSSiteCount        50
    DOSPageInterval     1
    DOSSiteInterval     1
    DOSBlockingPeriod   600
    DOSEmailNotify      admin@your-domain.com
    DOSSystemCommand    "sudo /sbin/iptables -A INPUT -s %s -j DROP"
    DOSLogDir           "/var/log/mod_evasive"
</IfModule>
```

Enable modules:
```bash
sudo a2enmod evasive
sudo systemctl restart apache2
```

---

## 7. 📊 Monitoring and Logging

### Apache Status Module
```bash
# Enable status module
sudo a2enmod status

# Add to main configuration
sudo nano /etc/apache2/apache2.conf
```

Add at the end:
```apache
<Location "/server-status">
    SetHandler server-status
    Require local
    Require ip 127.0.0.1
</Location>

<Location "/server-info">
    SetHandler server-info
    Require local
    Require ip 127.0.0.1
</Location>
```

### Log Rotation
Create `/etc/logrotate.d/employee-app`:
```bash
/var/log/apache2/employee-app*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 640 root adm
    sharedscripts
    postrotate
        systemctl reload apache2
    endscript
}
```

---

## 8. 🔧 Troubleshooting

### Common Commands
```bash
# Check Apache status
sudo systemctl status apache2

# Test configuration
sudo apache2ctl configtest

# Check enabled modules
apache2ctl -M

# Check enabled sites
sudo a2ensite

# View error logs
sudo tail -f /var/log/apache2/error.log

# View access logs
sudo tail -f /var/log/apache2/employee-app-ssl-access.log

# Check Apache processes
ps aux | grep apache2

# Check listening ports
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### Performance Testing
```bash
# Test with curl
curl -I https://your-domain.com

# Test compression
curl -H "Accept-Encoding: gzip" -I https://your-domain.com

# Load testing with ab
ab -n 1000 -c 10 https://your-domain.com/
```

---

## 9. 🚀 Deployment with Apache

### Complete Deployment Script
Create `deploy-apache.sh`:

```bash
#!/bin/bash

# Employee Management System - Apache Deployment Script

set -e

DOMAIN="your-domain.com"
EMAIL="your-email@domain.com"
APP_DIR="/var/www/employee-management"

echo "🚀 Deploying Employee Management System with Apache..."

# Install Apache and modules
sudo apt update
sudo apt install -y apache2 apache2-utils certbot python3-certbot-apache

# Enable required modules
sudo a2enmod proxy proxy_http ssl rewrite headers deflate expires

# Create application directory
sudo mkdir -p $APP_DIR
cd $APP_DIR

# Clone repository
sudo git clone https://github.com/jauharianggara/next-app.git .

# Setup Docker
sudo curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Deploy application
sudo docker-compose up -d

# Wait for services
sleep 30

# Copy Apache configuration
sudo cp deployment/apache.conf /etc/apache2/sites-available/employee-app.conf
sudo sed -i "s/your-domain.com/$DOMAIN/g" /etc/apache2/sites-available/employee-app.conf

# Enable site
sudo a2ensite employee-app.conf
sudo a2dissite 000-default.conf

# Test configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2

# Setup SSL
sudo certbot --apache -d $DOMAIN -m $EMAIL --agree-tos --non-interactive

echo "✅ Deployment completed!"
echo "🌐 Access your application at: https://$DOMAIN"
```

Make it executable:
```bash
chmod +x deploy-apache.sh
sudo ./deploy-apache.sh
```

---

## 10. 📋 Apache vs Nginx Comparison

| Feature | Apache | Nginx |
|---------|--------|-------|
| **Configuration** | .htaccess support | Centralized config |
| **Performance** | Process-based | Event-driven |
| **Memory Usage** | Higher | Lower |
| **Modules** | Dynamic loading | Static compilation |
| **Learning Curve** | Easier | Steeper |
| **Documentation** | Extensive | Good |
| **Windows Support** | Better | Limited |

---

## 🎯 Best Practices

### 1. **Security**
- Always use HTTPS
- Keep Apache updated
- Use ModSecurity
- Implement rate limiting
- Hide server information

### 2. **Performance**
- Enable compression
- Configure caching
- Use CDN for static files
- Monitor resource usage
- Optimize worker settings

### 3. **Monitoring**
- Set up log monitoring
- Use server-status module
- Monitor SSL certificate expiry
- Set up alerts for errors

### 4. **Backup**
- Backup Apache configuration
- Backup SSL certificates
- Document configuration changes
- Test backup restoration

---

## 📞 Support

### Quick Help Commands
```bash
# Restart Apache
sudo systemctl restart apache2

# Check configuration
sudo apache2ctl configtest

# View real-time logs
sudo tail -f /var/log/apache2/error.log

# Check virtual hosts
sudo apache2ctl -S

# Test SSL
sudo certbot certificates
```

**Apache configuration untuk Employee Management System sudah siap! 🚀**