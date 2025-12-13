#!/usr/bin/env python3
"""
Startup script for the integrated project management system.
This script will:
1. Set up the backend database
2. Create a superuser
3. Start the backend server
4. Set up and start the frontend
"""

import os
import sys
import subprocess
import time
import threading
from pathlib import Path

def run_command(command, cwd=None, shell=True):
    """Run a command and return the result"""
    try:
        result = subprocess.run(command, shell=shell, cwd=cwd, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def setup_backend():
    """Set up the Django backend"""
    print("🔧 Setting up backend...")
    
    backend_dir = Path("integrated_backend")
    
    # Install Python dependencies
    print("📦 Installing Python dependencies...")
    success, stdout, stderr = run_command("pip install -r requirements.txt", cwd=backend_dir)
    if not success:
        print(f"❌ Failed to install dependencies: {stderr}")
        return False
    
    # Run migrations
    print("🗄️ Running database migrations...")
    success, stdout, stderr = run_command("python manage.py makemigrations", cwd=backend_dir)
    if not success:
        print(f"❌ Failed to make migrations: {stderr}")
        return False
    
    success, stdout, stderr = run_command("python manage.py migrate", cwd=backend_dir)
    if not success:
        print(f"❌ Failed to run migrations: {stderr}")
        return False
    
    # Create superuser (optional)
    print("👤 Creating superuser...")
    superuser_script = """
from accounts.models import User
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123',
        first_name='Admin',
        last_name='User'
    )
    print('Superuser created: admin@example.com / admin123')
else:
    print('Superuser already exists')
"""
    
    with open(backend_dir / "create_superuser.py", "w") as f:
        f.write(superuser_script)
    
    success, stdout, stderr = run_command("python manage.py shell < create_superuser.py", cwd=backend_dir)
    if success:
        print("✅ Superuser setup complete")
    
    # Clean up
    os.remove(backend_dir / "create_superuser.py")
    
    print("✅ Backend setup complete!")
    return True

def setup_frontend():
    """Set up the React frontend"""
    print("🔧 Setting up frontend...")
    
    # We'll create a new integrated frontend
    frontend_dir = Path("integrated_frontend")
    
    if not frontend_dir.exists():
        print("📦 Creating new React frontend...")
        success, stdout, stderr = run_command("npm create vite@latest integrated_frontend -- --template react")
        if not success:
            print(f"❌ Failed to create React app: {stderr}")
            return False
    
    # Install dependencies
    print("📦 Installing Node.js dependencies...")
    success, stdout, stderr = run_command("npm install", cwd=frontend_dir)
    if not success:
        print(f"❌ Failed to install dependencies: {stderr}")
        return False
    
    # Install additional packages
    additional_packages = [
        "axios",
        "react-router-dom",
        "@hello-pangea/dnd",
        "tailwindcss",
        "autoprefixer",
        "postcss",
        "lucide-react",
        "chart.js",
        "react-chartjs-2",
        "date-fns",
        "react-webcam"
    ]
    
    print("📦 Installing additional packages...")
    for package in additional_packages:
        success, stdout, stderr = run_command(f"npm install {package}", cwd=frontend_dir)
        if not success:
            print(f"⚠️ Warning: Failed to install {package}")
    
    print("✅ Frontend setup complete!")
    return True

def start_backend():
    """Start the Django backend server"""
    print("🚀 Starting backend server...")
    backend_dir = Path("integrated_backend")
    
    def run_backend():
        subprocess.run("python manage.py runserver 8000", shell=True, cwd=backend_dir)
    
    backend_thread = threading.Thread(target=run_backend, daemon=True)
    backend_thread.start()
    
    # Wait a moment for the server to start
    time.sleep(3)
    print("✅ Backend server started on http://localhost:8000")
    return backend_thread

def start_frontend():
    """Start the React frontend server"""
    print("🚀 Starting frontend server...")
    frontend_dir = Path("integrated_frontend")
    
    def run_frontend():
        subprocess.run("npm run dev", shell=True, cwd=frontend_dir)
    
    frontend_thread = threading.Thread(target=run_frontend, daemon=True)
    frontend_thread.start()
    
    # Wait a moment for the server to start
    time.sleep(3)
    print("✅ Frontend server started on http://localhost:5173")
    return frontend_thread

def main():
    """Main startup function"""
    print("🎯 Starting Integrated Project Management System")
    print("=" * 50)
    
    # Check if Python and Node.js are available
    python_available, _, _ = run_command("python --version")
    node_available, _, _ = run_command("node --version")
    npm_available, _, _ = run_command("npm --version")
    
    if not python_available:
        print("❌ Python is not available. Please install Python 3.8+")
        return
    
    if not node_available or not npm_available:
        print("❌ Node.js/npm is not available. Please install Node.js 16+")
        return
    
    # Setup phase
    if not setup_backend():
        print("❌ Backend setup failed")
        return
    
    if not setup_frontend():
        print("❌ Frontend setup failed")
        return
    
    # Start servers
    backend_thread = start_backend()
    frontend_thread = start_frontend()
    
    print("\n" + "=" * 50)
    print("🎉 System is running!")
    print("📊 Backend API: http://localhost:8000")
    print("🌐 Frontend App: http://localhost:5173")
    print("🔧 Admin Panel: http://localhost:8000/admin")
    print("👤 Admin Login: admin@example.com / admin123")
    print("\n💡 Press Ctrl+C to stop all servers")
    print("=" * 50)
    
    try:
        # Keep the main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
        print("✅ Goodbye!")

if __name__ == "__main__":
    main()