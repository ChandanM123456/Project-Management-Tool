# 🚀 AI-Powered Employee Management System - Advanced Features

## 📋 Overview

This document outlines the advanced features implemented for the PM Tool, including **Render PostgreSQL integration**, **comprehensive data storage**, **face recognition with encodings.pkl**, and **voice greeting system**.

## 🗄️ Database Configuration

### Render PostgreSQL Setup

1. **Get your Render PostgreSQL connection string** from Render dashboard
2. **Run the setup script**:
   ```bash
   cd backend
   setup_render_db.bat "postgresql://username:password@host:port/database"
   ```

3. **Environment Variables**:
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

### Database Schema

#### Enhanced Employee Model
```python
# Personal Information
first_name = models.CharField(max_length=100)
last_name = models.CharField(max_length=100)
email = models.EmailField(unique=True)
phone = models.CharField(max_length=30)

# Professional Information
designation = models.CharField(max_length=150)
role = models.CharField(max_length=100)
department = models.CharField(max_length=100)
experience = models.CharField(max_length=50)
skills = models.TextField()  # JSON array
previous_company = models.CharField(max_length=200)

# Additional Information
date_of_birth = models.DateField()
gender = models.CharField(max_length=20)
address = models.TextField()
emergency_contact = models.CharField(max_length=100)
blood_group = models.CharField(max_length=10)
marital_status = models.CharField(max_length=20)
nationality = models.CharField(max_length=50)
languages = models.TextField()  # JSON array

# Education
education = models.CharField(max_length=200)
university = models.CharField(max_length=200)

# Contact & Social
linkedin_profile = models.URLField()
portfolio = models.URLField()

# Employment Details
expected_salary = models.CharField(max_length=50)
work_mode = models.CharField(max_length=50)
start_date = models.DateField()
reference = models.CharField(max_length=200)

# Files & Media
resume = models.FileField(upload_to="resumes/")
photo = models.ImageField(upload_to="photos/")

# Face Recognition
face_encodings_path = models.CharField(max_length=500)

# Resume Analysis
resume_analysis = models.JSONField()

# Timestamps & Status
created_at = models.DateTimeField(auto_now_add=True)
updated_at = models.DateTimeField(auto_now=True)
is_active = models.BooleanField(default=True)
last_login = models.DateTimeField()
```

#### Project Management
```python
class Project(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()
    deadline = models.DateField()
    employees = models.ManyToManyField(Employee)
    team_lead = models.ForeignKey(Employee, related_name='led_projects')
    progress_percentage = models.IntegerField(default=0)
```

## 🔐 Face Recognition System

### Encodings.pkl File Structure

Each employee gets their own **encodings.pkl** file stored in:
```
media/employee_encodings/{employee_id}/encodings.pkl
```

### Face Recognition Flow

1. **During Onboarding**:
   - Capture 3+ face photos
   - Generate 128D face encodings
   - Average encodings for robustness
   - Store in employee-specific encodings.pkl

2. **During Login**:
   - Capture single face photo
   - Generate encoding
   - Compare with all employee encodings
   - Find best match below threshold (0.48)

### Enhanced Face Login API

**Endpoint**: `POST /api/employees/face-login/`

**Response**:
```json
{
  "success": true,
  "employee_id": "uuid",
  "name": "John Doe",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@company.com",
  "designation": "Senior Developer",
  "department": "Engineering",
  "company": "Tech Corp",
  "greeting": "Hello John Doe. Senior Developer. Currently working on Project Alpha, Project Beta. Welcome to the system!",
  "voice_greeting": "Hello John Doe. Senior Developer. Currently working on Project Alpha, Project Beta. Welcome to the system!",
  "current_projects": [
    {
      "name": "Project Alpha",
      "description": "Mobile app development",
      "status": "active",
      "progress": 75,
      "deadline": "2024-03-15",
      "role": "Team Member"
    }
  ],
  "skills": ["React", "Node.js", "Python"],
  "experience": "5 years",
  "photo_url": "/media/photos/employee_id/photo.jpg",
  "login_time": "2024-01-15T10:30:00Z",
  "token": "employee_uuid_john@company.com"
}
```

## 🎤 Voice Greeting System

### Voice Synthesis Implementation

**Location**: `company-hub/src/utils/voiceGreeting.js`

**Features**:
- **Web Speech API** integration
- **Natural voice synthesis**
- **Customizable rate, pitch, volume**
- **Multiple voice options**
- **Error handling**

### Voice Greeting Logic

```javascript
const greetingParts = [];
greetingParts.push(f"Hello {emp.first_name} {emp.last_name}");

if (emp.designation) {
  greetingParts.push(f"{emp.designation}");
}

if (current_projects.length > 0) {
  const projectNames = current_projects.slice(0, 2).map(p => p.name);
  if (projectNames.length === 1) {
    greetingParts.push(`currently working on ${projectNames[0]} project`);
  } else {
    greetingParts.push(`currently working on ${projectNames.join(', ')} projects`);
  }
}

greeting = greetingParts.join('. ') + '. Welcome to the system!';
```

### Example Voice Greetings

1. **Basic**: "Hello John Doe. Welcome to the system!"
2. **With Designation**: "Hello Jane Smith. Senior Developer. Welcome to the system!"
3. **With Projects**: "Hello Mike Johnson. Frontend Developer. Currently working on Project Alpha, Project Beta. Welcome to the system!"

## 📊 Resume Analysis Enhancement

### Improved Data Extraction

#### Personal Information
- **Name Detection**: Capitalized names in first 8 lines
- **Email Extraction**: Case-insensitive regex patterns
- **Phone Parsing**: Multiple formats including international

#### Professional Information
- **70+ Skills**: Programming, Web, Cloud, DevOps, Data Science
- **20+ Roles**: Including seniority levels
- **Experience Patterns**: Multiple year extraction formats

#### Education Information
- **Degree Recognition**: B.S., M.S., Ph.D., B.Tech, MBA, etc.
- **University Detection**: Multiple patterns with filtering

### Resume Analysis Response

```json
{
  "personal_info": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "professional_info": {
    "role": "Senior Software Engineer",
    "experience": "5 years",
    "skills": ["Python", "React", "Node.js", "AWS"],
    "previous_company": "Tech Corp"
  },
  "education_info": {
    "degree": "Bachelor of Science",
    "university": "State University"
  },
  "contact_info": {
    "linkedin_profile": "linkedin.com/in/johndoe",
    "portfolio": "johndoe.dev"
  },
  "additional_info": {
    "languages": ["English", "Spanish"]
  }
}
```

## 🚀 API Endpoints

### Enhanced Onboarding Flow

1. **Resume Analysis**: `POST /api/employees/analyze-resume/`
2. **Face Encoding Generation**: `POST /api/employees/generate-encodings/`
3. **Complete Onboarding**: `POST /api/employees/onboard/`

### Face Login Enhancement

**Endpoint**: `POST /api/employees/face-login/`

**Features**:
- ✅ **Accurate face recognition** (threshold: 0.48)
- ✅ **Voice greeting** on successful login
- ✅ **Project details** in response
- ✅ **Employee information** comprehensive
- ✅ **Login tracking** with timestamps

## 📁 File Structure

```
backend/
├── media/
│   ├── employee_encodings/
│   │   ├── {employee_id}/
│   │   │   └── encodings.pkl          # Face encodings
│   ├── photos/
│   │   └── {employee_id}/
│   │       └── photo.jpg              # Profile photo
│   ├── resumes/
│   │   └── {resume_file.pdf}          # Uploaded resumes
│   └── faces/
│       └── {employee_id}/
│           ├── capture_0.jpg
│           ├── capture_1.jpg
│           └── capture_2.jpg
├── employees/
│   ├── models.py                      # Enhanced models
│   ├── views.py                       # Enhanced views
│   └── migrations/
│       └── 0003_auto_20251128_1909.py # Database migrations
└── .env                              # Database configuration

company-hub/
├── src/
│   ├── utils/
│   │   └── voiceGreeting.js           # Voice synthesis
│   └── pages/
│       └── EmployeeLogin.jsx          # Enhanced with voice
└── package.json
```

## 🔧 Configuration

### Environment Variables

Create `.env` file in backend directory:
```env
DATABASE_URL=postgresql://username:password@host:port/database
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Database Migration Commands

```bash
# Create migrations
python manage.py makemigrations employees

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

## 🎯 Usage Instructions

### 1. Setup Database
```bash
cd backend
setup_render_db.bat "your_render_postgresql_url"
```

### 2. Start Backend
```bash
python manage.py runserver
```

### 3. Start Frontend
```bash
cd ../company-hub
npm run dev
```

### 4. Test Features

#### Employee Onboarding
1. Access onboarding link
2. Upload resume (AI auto-fill)
3. Complete professional details
4. Add additional information
5. Capture face photos (3+)
6. Submit - creates encodings.pkl

#### Employee Login
1. Go to employee login
2. Click "Use Camera"
3. Capture face photo
4. **Voice greeting plays**: "Hello John Doe. Senior Developer. Currently working on Project Alpha. Welcome to the system!"
5. Redirect to dashboard

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify DATABASE_URL is correct
   - Check Render database status
   - Ensure firewall allows connection

2. **Face Recognition Not Working**
   - Ensure encodings.pkl files exist
   - Check face_recognition library installation
   - Verify image quality and lighting

3. **Voice Greeting Not Playing**
   - Check browser support for Web Speech API
   - Ensure user has granted microphone permission
   - Check browser console for errors

4. **Resume Analysis Inaccurate**
   - Verify PDF/DOCX file format
   - Check file size (< 5MB)
   - Ensure text is extractable (not scanned images)

## 🚀 Production Deployment

### Render Deployment

1. **Backend Service**:
   - Connect to PostgreSQL database
   - Set environment variables
   - Run migrations automatically

2. **Frontend Service**:
   - Build production bundle
   - Deploy to Render static service
   - Configure API endpoints

3. **Database**:
   - Render PostgreSQL managed service
   - Automatic backups and scaling
   - Connection pooling enabled

## 📈 Performance Optimization

### Database Indexing
- Email fields (unique)
- Employee-company relationships
- Project-employee relationships

### File Storage
- Compressed face images
- Efficient encodings.pkl storage
- CDN for static assets

### Voice Synthesis
- Cached voice responses
- Pre-loaded voice models
- Optimized speech parameters

---

**Implementation Complete! 🎉**

All advanced features are now implemented:
- ✅ **Render PostgreSQL Integration**
- ✅ **Comprehensive Data Storage**
- ✅ **Face Recognition with encodings.pkl**
- ✅ **Voice Greeting System**
- ✅ **Enhanced Resume Analysis**
- ✅ **Project Management Integration**
