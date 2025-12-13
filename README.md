# Integrated Project Management System

A comprehensive Jira-like project management system that combines company management, employee onboarding with face recognition, and advanced project management features.

## 🚀 Features

### 🏢 Company Management
- Company registration and profile management
- Multi-tenant architecture with company isolation
- Department management
- Employee invitation system
- Company settings and customization

### 👥 User Management & Authentication
- Multiple user types: Company Admin, Manager, Scrum Master, Employee
- Traditional email/password authentication
- **Face recognition login** with emotion detection
- User profiles with skills and professional information
- Role-based access control

### 📊 Project Management (Jira-like)
- **Kanban boards** with drag-and-drop functionality
- **Sprint planning** and management
- **Issue tracking** with multiple types (Story, Task, Bug, Epic, Sub-task)
- **Custom workflows** and status management
- **Priority management** (Lowest to Critical)
- **Story points** and estimation
- **Task linking** (blocks, relates to, duplicates)
- **Comments** and mentions
- **File attachments**
- **Activity tracking** and audit trails

### ⏱️ Time Tracking
- Built-in time tracking with start/stop timers
- Manual time entry
- Time reports and analytics
- Integration with tasks and projects

### 📈 Analytics & Reporting
- **Dashboard** with key metrics
- **Team performance** analytics
- **Project progress** tracking
- **Burndown charts** and velocity tracking
- **Calendar view** for due dates
- **Custom reports**

### 🔔 Notifications & Collaboration
- Real-time notifications
- Email notifications (configurable)
- Task watchers
- @mentions in comments
- Activity feeds

## 🏗️ Architecture

### Backend (Django)
- **Django 4.2** with Django REST Framework
- **PostgreSQL** database (SQLite for development)
- **JWT authentication** with refresh tokens
- **Face recognition** using face_recognition library
- **Modular app structure**:
  - `accounts` - User management and authentication
  - `companies` - Company and department management
  - `projects` - Project and sprint management
  - `tasks` - Task management and tracking
  - `analytics` - Reporting and analytics

### Frontend (React)
- **React 19** with modern hooks
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **React DnD** for drag-and-drop
- **Chart.js** for analytics
- **React Webcam** for face recognition

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL (optional, SQLite works for development)

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd integrated-project-management

# Run the automated setup script
python start_integrated_system.py
```

This script will:
1. Set up the Django backend with database migrations
2. Create a superuser account
3. Set up the React frontend with dependencies
4. Start both servers automatically

### Option 2: Manual Setup

#### Backend Setup

```bash
# Navigate to backend directory
cd integrated_backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver 8000
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd integrated_frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
FACE_RECOGNITION_TOLERANCE=0.6
```

### Database Configuration

For PostgreSQL (production):
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'integrated_pm',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## 📱 Usage

### 1. Company Registration
1. Visit `/company-register`
2. Fill in company details and admin user information
3. Complete registration to access the system

### 2. Employee Onboarding
1. Company admin invites employees via email
2. Employees receive invitation links
3. Complete registration with face recognition setup (optional)
4. Access granted based on assigned role

### 3. Project Management
1. Create projects with team members
2. Set up sprints and plan work
3. Create and manage tasks on Kanban boards
4. Track time and monitor progress
5. Generate reports and analytics

### 4. Face Recognition Login
1. Upload 3-5 clear face images during setup
2. Use face login option on login page
3. System recognizes face and logs in automatically

## 🎯 Key Features Comparison with Jira

| Feature | Our System | Jira |
|---------|------------|------|
| Issue Types | ✅ Story, Task, Bug, Epic, Sub-task | ✅ |
| Kanban Boards | ✅ Drag & Drop | ✅ |
| Sprint Management | ✅ Planning & Tracking | ✅ |
| Custom Workflows | ✅ Configurable | ✅ |
| Time Tracking | ✅ Built-in Timer | ✅ |
| Reporting | ✅ Analytics Dashboard | ✅ |
| Face Recognition | ✅ **Unique Feature** | ❌ |
| Company Management | ✅ **Multi-tenant** | ❌ |
| Employee Onboarding | ✅ **Integrated** | ❌ |

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Company data isolation
- Face recognition with configurable tolerance
- Password validation and hashing
- CORS protection
- SQL injection protection via Django ORM

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login/` - Email/password login
- `POST /api/auth/face-login/` - Face recognition login
- `POST /api/auth/register/` - User registration
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile

### Project Management Endpoints
- `GET /api/projects/` - List projects
- `POST /api/projects/` - Create project
- `GET /api/projects/{id}/board/` - Get Kanban board
- `GET /api/tasks/` - List tasks
- `POST /api/tasks/{id}/move/` - Move task (drag & drop)

### Analytics Endpoints
- `GET /api/analytics/dashboard-stats/` - Dashboard metrics
- `GET /api/analytics/team-stats/` - Team performance
- `GET /api/analytics/calendar-tasks/` - Calendar view data

## 🚀 Deployment

### Production Deployment

1. **Backend (Django)**:
   ```bash
   # Install production dependencies
   pip install gunicorn
   
   # Collect static files
   python manage.py collectstatic
   
   # Run with Gunicorn
   gunicorn integrated_backend.wsgi:application
   ```

2. **Frontend (React)**:
   ```bash
   # Build for production
   npm run build
   
   # Serve with nginx or any static server
   ```

3. **Database**: Use PostgreSQL for production
4. **Media Files**: Configure cloud storage (AWS S3, etc.)
5. **Environment**: Set `DEBUG=False` and configure proper `SECRET_KEY`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs and request features via GitHub Issues
- **Email**: Contact support at support@yourcompany.com

## 🎉 Acknowledgments

- Django and Django REST Framework teams
- React and Vite communities
- Face recognition library contributors
- Tailwind CSS team
- All open-source contributors

---

**Built with ❤️ for modern project management**