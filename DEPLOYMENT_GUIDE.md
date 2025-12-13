# 🚀 PM Tool Application - Production Deployment Guide

## 📋 **Overview**

This guide covers deploying the PM Tool application to production environment. The application consists of:
- **Backend**: Django REST API with emotion detection
- **Frontend**: React.js single-page application
- **Database**: PostgreSQL (recommended) or SQLite (development)

## 🛠️ **Prerequisites**

### **System Requirements**
- **Server**: Ubuntu 20.04+ / CentOS 8+ / AWS EC2
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 20GB SSD
- **CPU**: Minimum 2 cores, Recommended 4+ cores
- **Network**: Stable internet connection

### **Software Requirements**
- **Python**: 3.8+
- **Node.js**: 16+
- **Database**: PostgreSQL 13+ (recommended)
- **Web Server**: Nginx
- **Process Manager**: Gunicorn + Systemd
- **SSL Certificate**: Let's Encrypt

## 🗄️ **Backend Deployment**

### **1. Server Setup**

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install python3 python3-pip python3-venv nginx postgresql postgresql-contrib certbot python3-certbot-nginx -y

# Create application user
sudo adduser pmtool
sudo usermod -aG sudo pmtool
```

### **2. Database Setup**

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE pmtool_db;
CREATE USER pmtool_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE pmtool_db TO pmtool_user;
ALTER USER pmtool_user CREATEDB;
\q

# Configure PostgreSQL
sudo nano /etc/postgresql/13/main/postgresql.conf
# Set: listen_addresses = 'localhost'

sudo nano /etc/postgresql/13/main/pg_hba.conf
# Add: local   pmtool_db   pmtool_user   md5

sudo systemctl restart postgresql
```

### **3. Application Setup**

```bash
# Clone repository
cd /home/pmtool
git clone <your-repository-url> pmtool-app
cd pmtool-app/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install additional production packages
pip install gunicorn psycopg2-binary

# Environment variables
nano .env
```

### **4. Environment Configuration**

```bash
# .env file
DEBUG=False
SECRET_KEY=your_very_long_secret_key_here
DATABASE_URL=postgresql://pmtool_user:your_secure_password@localhost/pmtool_db
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
MEDIA_ROOT=/home/pmtool/pmtool-app/media
STATIC_ROOT=/home/pmtool/pmtool-app/staticfiles
```

### **5. Database Migration**

```bash
# Apply migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Create media directories
mkdir -p media/faces media/photos media/emotions media/company_logos media/resumes
sudo chown -R pmtool:pmtool media/
```

### **6. Gunicorn Service**

```bash
# Create gunicorn service file
sudo nano /etc/systemd/system/pmtool.service
```

```ini
[Unit]
Description=PM Tool Django Application
After=network.target

[Service]
User=pmtool
Group=www-data
WorkingDirectory=/home/pmtool/pmtool-app/backend
Environment="PATH=/home/pmtool/pmtool-app/backend/venv/bin"
ExecStart=/home/pmtool/pmtool-app/backend/venv/bin/gunicorn --workers 3 --bind unix:/run/pmtool.sock backend.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Start and enable service
sudo systemctl daemon-reload
sudo systemctl start pmtool
sudo systemctl enable pmtool
```

## 🌐 **Frontend Deployment**

### **1. Build Frontend**

```bash
cd /home/pmtool/pmtool-app/company-hub

# Install dependencies
npm install

# Build for production
npm run build

# Copy build files to nginx directory
sudo cp -r build/* /var/www/html/
```

### **2. Nginx Configuration**

```bash
# Create nginx config
sudo nano /etc/nginx/sites-available/pmtool
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Frontend static files
    location / {
        root /var/www/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://unix:/run/pmtool.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Media files
    location /media/ {
        alias /home/pmtool/pmtool-app/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Static files
    location /static/ {
        alias /home/pmtool/pmtool-app/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/pmtool /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 **SSL Certificate Setup**

```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Set up auto renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 **Production Optimizations**

### **1. Django Settings**

```python
# settings.py production additions
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Security
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DATABASE_NAME', 'pmtool_db'),
        'USER': os.environ.get('DATABASE_USER', 'pmtool_user'),
        'PASSWORD': os.environ.get('DATABASE_PASSWORD'),
        'HOST': os.environ.get('DATABASE_HOST', 'localhost'),
        'PORT': os.environ.get('DATABASE_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',
        }
    }
}

# Caching
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/home/pmtool/pmtool-app/logs/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### **2. Performance Tuning**

```bash
# Install Redis for caching
sudo apt install redis-server -y
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Optimize PostgreSQL
sudo nano /etc/postgresql/13/main/postgresql.conf
```

```ini
# Performance settings
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

## 📊 **Monitoring & Logging**

### **1. Application Monitoring**

```bash
# Create logs directory
mkdir -p /home/pmtool/pmtool-app/logs
sudo chown pmtool:pmtool logs/

# Set up log rotation
sudo nano /etc/logrotate.d/pmtool
```

```
/home/pmtool/pmtool-app/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 pmtool pmtool
    postrotate
        systemctl reload pmtool
    endscript
}
```

### **2. Health Check Endpoint**

```python
# Add to backend/urls.py
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'version': '1.0.0'
    })

urlpatterns = [
    # ... existing urls
    path('health/', health_check, name='health-check'),
]
```

## 🔄 **Backup Strategy**

### **1. Database Backup**

```bash
# Create backup script
sudo nano /home/pmtool/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/pmtool/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="pmtool_db"
DB_USER="pmtool_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Media files backup
tar -czf $BACKUP_DIR/media_backup_$DATE.tar.gz /home/pmtool/pmtool-app/media/

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable and schedule
chmod +x /home/pmtool/backup.sh
sudo crontab -e
# Add: 0 2 * * * /home/pmtool/backup.sh >> /home/pmtool/backup.log 2>&1
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **502 Bad Gateway**
   ```bash
   # Check if gunicorn is running
   sudo systemctl status pmtool
   
   # Check nginx logs
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Database Connection Error**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Test connection
   psql -h localhost -U pmtool_user -d pmtool_db
   ```

3. **Static Files Not Loading**
   ```bash
   # Check permissions
   sudo chown -R www-data:www-data /home/pmtool/pmtool-app/staticfiles/
   
   # Recollect static files
   python manage.py collectstatic --noinput --clear
   ```

### **Performance Issues**

1. **Slow API Response**
   ```bash
   # Check database queries
   python manage.py shell
   from django.db import connection
   print(connection.queries)
   ```

2. **High Memory Usage**
   ```bash
   # Monitor memory
   htop
   
   # Restart gunicorn
   sudo systemctl restart pmtool
   ```

## 📈 **Scaling Considerations**

### **1. Database Scaling**
- Use connection pooling (PgBouncer)
- Implement read replicas
- Consider database sharding for large datasets

### **2. Application Scaling**
- Load balance multiple Gunicorn workers
- Use Redis for session storage
- Implement CDN for static assets

### **3. Infrastructure Scaling**
- Use containerization (Docker)
- Implement auto-scaling (AWS ECS/EKS)
- Use managed database services (RDS)

## 🎯 **Post-Deployment Checklist**

- [ ] Verify all API endpoints are working
- [ ] Test user authentication flow
- [ ] Verify file uploads are working
- [ ] Test emotion detection features
- [ ] Check SSL certificate validity
- [ ] Verify backup system is working
- [ ] Monitor system performance
- [ ] Set up alerting for critical errors
- [ ] Document deployment process
- [ ] Train support team

## 🚀 **Launch Commands**

```bash
# Final deployment sequence
sudo systemctl restart pmtool
sudo systemctl restart nginx
sudo systemctl restart postgresql
sudo systemctl status pmtool nginx postgresql

# Test health endpoint
curl -I https://yourdomain.com/api/health/

# Test application
curl -I https://yourdomain.com/
```

🎉 **Your PM Tool application is now live in production!**

## 📞 **Support & Maintenance**

- Monitor application health daily
- Apply security updates weekly
- Review and optimize performance monthly
- Update dependencies quarterly
- Full security audit annually

For issues, check logs at:
- Application: `/home/pmtool/pmtool-app/logs/django.log`
- Nginx: `/var/log/nginx/error.log`
- System: `journalctl -u pmtool`
