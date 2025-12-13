# 🚀 Quick Commands Reference

## Backend Commands

### Setup & Migration
```bash
cd backend

# Create migrations for changes
python manage.py makemigrations

# Apply migrations to database
python manage.py migrate

# Create superuser for admin
python manage.py createsuperuser
```

### Run Development Server
```bash
cd backend
python manage.py runserver
# Server runs at: http://127.0.0.1:8000
# Admin panel: http://127.0.0.1:8000/admin/
```

### Django Shell
```bash
python manage.py shell

# Example: Create a test company
from company.models import Company
Company.objects.create(name="Acme Corp", email="admin@acme.com", password="hashedpassword")

# Exit shell
exit()
```

### Run Tests
```bash
python manage.py test
```

### Collect Static Files (for production)
```bash
python manage.py collectstatic
```

## Frontend Commands

### Install Dependencies
```bash
cd company-hub
npm install
```

### Development Server
```bash
npm run dev
# Frontend runs at: http://localhost:5173
```

### Production Build
```bash
npm run build
# Output: dist/ folder
```

### Linting
```bash
npm run lint
```

### Preview Production Build
```bash
npm run preview
```

## API Testing with cURL

### Register Company
```bash
curl -X POST http://127.0.0.1:8000/api/company/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Company",
    "email": "admin@mycompany.com",
    "password": "securepassword",
    "phone": "1234567890",
    "address": "123 Main St"
  }'
```

### Login Company
```bash
curl -X POST http://127.0.0.1:8000/api/company/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mycompany.com",
    "password": "securepassword"
  }'
```

### Create Invite Token
```bash
curl -X POST http://127.0.0.1:8000/api/employees/create-invite/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{}'
```

### Employee Onboarding
```bash
curl -X POST http://127.0.0.1:8000/api/employees/onboard/TOKEN_HERE/ \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "designation=Developer" \
  -F "experience=5" \
  -F "resume=@/path/to/resume.pdf" \
  -F "face_images=@/path/to/image1.jpg" \
  -F "face_images=@/path/to/image2.jpg"
```

## Docker Commands (Optional)

### Build Docker Image
```bash
docker build -t pm-tool-backend .
docker build -t pm-tool-frontend .
```

### Run Containers
```bash
# Backend
docker run -p 8000:8000 pm-tool-backend

# Frontend
docker run -p 5173:5173 pm-tool-frontend
```

## Database Management

### SQLite Commands
```bash
# Access SQLite database directly
sqlite3 backend/db.sqlite3

# List all tables
.tables

# Check company table
SELECT * FROM company_company;

# Exit
.exit
```

### Reset Database
```bash
# Delete existing database
rm backend/db.sqlite3

# Recreate with migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

## Useful URL Paths

### Frontend Routes
- `/login` - Company login page
- `/register` - Company registration page
- `/onboard/<token>` - Employee onboarding (add if needed)

### Backend Admin
- `/admin/` - Django admin panel
- `/admin/company/company/` - Manage companies
- `/admin/employees/employee/` - Manage employees
- `/admin/managers/manager/` - Manage managers

### API Endpoints
- `POST /api/company/register/` - Register company
- `POST /api/company/login/` - Login company
- `POST /api/employees/onboard/<token>/` - Onboard employee
- `POST /api/employees/face-login/` - Face recognition login
- `POST /api/employees/create-invite/` - Create invite token

## Debugging

### Frontend Debugging
```bash
# Check browser console (F12)
# Look for network requests in Network tab
# Use React DevTools extension

# View frontend logs
npm run dev  # Check terminal for errors
```

### Backend Debugging
```bash
# View Django logs
python manage.py runserver  # Logs printed to console

# Enable verbose output
python manage.py runserver --verbosity=2

# Print SQL queries
# Add to settings.py DEBUG section:
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

## Environment Variables

### Backend (.env)
```
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

### Frontend (.env)
```
VITE_API_URL=http://127.0.0.1:8000/api
```

## Troubleshooting

### Common Issues

**CORS Error**
- Check that CORS_ALLOW_ALL_ORIGINS is True in settings.py
- Verify frontend baseURL matches backend URL

**Migration Errors**
```bash
python manage.py migrate --fake initial  # Skip initial migration if needed
```

**Port Already in Use**
```bash
# Backend - use different port
python manage.py runserver 8001

# Frontend - use different port
npm run dev -- --port 5174
```

**Module Not Found**
```bash
# Install missing package
pip install package-name  # Backend
npm install package-name  # Frontend
```

## Performance Tips

### Backend
- Enable database query optimization
- Use connection pooling
- Implement caching for frequent queries

### Frontend
- Use production build: `npm run build`
- Enable code splitting
- Lazy load routes

---
**For more help:**
- Django Docs: https://docs.djangoproject.com/
- React Docs: https://react.dev/
- Vite Docs: https://vitejs.dev/
