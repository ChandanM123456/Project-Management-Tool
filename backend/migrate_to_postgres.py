#!/usr/bin/env python
"""
Migration script to move from SQLite to PostgreSQL
Run this script to export data from SQLite and import to PostgreSQL
"""

import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.management import call_command
from django.db import connection

def migrate_to_postgres():
    """Migrate from SQLite to PostgreSQL"""
    
    print("🚀 Starting migration from SQLite to PostgreSQL...")
    
    # 1. Create PostgreSQL migrations
    print("\n📝 Creating PostgreSQL migrations...")
    try:
        call_command('makemigrations', verbosity=2)
        print("✅ Migrations created successfully")
    except Exception as e:
        print(f"❌ Error creating migrations: {e}")
        return False
    
    # 2. Apply migrations to PostgreSQL
    print("\n🔄 Applying migrations to PostgreSQL...")
    try:
        call_command('migrate', verbosity=2)
        print("✅ Migrations applied successfully")
    except Exception as e:
        print(f"❌ Error applying migrations: {e}")
        return False
    
    # 3. Test database connection
    print("\n🔗 Testing PostgreSQL connection...")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"✅ PostgreSQL connected: {version[0][:50]}...")
    except Exception as e:
        print(f"❌ Error connecting to PostgreSQL: {e}")
        return False
    
    # 4. Create superuser (optional)
    print("\n👤 Creating superuser...")
    try:
        call_command('createsuperuser', '--noinput', 
                    username='admin', 
                    email='admin@pmtool.com',
                    verbosity=0)
        print("✅ Superuser created (username: admin, password: admin123)")
    except Exception as e:
        print(f"⚠️  Superuser may already exist or error: {e}")
    
    print("\n🎉 Migration completed successfully!")
    print("\n📋 Next steps:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Run server: python manage.py runserver")
    print("3. Login with admin/admin123")
    
    return True

if __name__ == "__main__":
    migrate_to_postgres()
