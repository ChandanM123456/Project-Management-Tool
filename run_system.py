#!/usr/bin/env python3
"""
Simple startup script for the integrated project management system.
This script starts both backend and frontend servers.
"""

import os
import sys
import subprocess
import time
import threading
from pathlib import Path

def run_backend():
    """Run Django backend server"""
    backend_dir = Path("integrated_backend")
    
    print("🚀 Starting Django backend server...")
    
    # Change to backend directory and run server
    os.chdir(backend_dir)
    
    # Run migrations first
    print("📊 Running database migrations...")
    subprocess.run([sys.executable, "manage.py", "migrate"], check=False)
    
    # Start server
    subprocess.run([sys.executable, "manage.py", "runserver", "8000"])

def run_frontend():
    """Run React frontend server"""
    frontend_dir = Path("integrated_frontend")
    
    print("🚀 Starting React frontend server...")
    
    # Change to frontend directory and run server
    os.chdir(frontend_dir)
    subprocess.run(["npm", "run", "dev"])

def main():
    """Main function to start both servers"""
    print("🎯 Starting Integrated Project Management System")
    print("=" * 50)
    
    # Check if directories exist
    if not Path("integrated_backend").exists():
        print("❌ Backend directory not found. Please run the setup first.")
        return
    
    if not Path("integrated_frontend").exists():
        print("❌ Frontend directory not found. Please run the setup first.")
        return
    
    print("📋 Starting servers...")
    print("🔧 Backend will be available at: http://localhost:8000")
    print("🌐 Frontend will be available at: http://localhost:3000")
    print("💡 Press Ctrl+C to stop all servers")
    print("=" * 50)
    
    # Start backend in a separate thread
    backend_thread = threading.Thread(target=run_backend, daemon=True)
    backend_thread.start()
    
    # Wait a moment for backend to start
    time.sleep(3)
    
    # Start frontend (this will block)
    try:
        run_frontend()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
        print("✅ Goodbye!")

if __name__ == "__main__":
    main()