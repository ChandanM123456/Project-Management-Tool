# PostgreSQL Connection Troubleshooting Guide

## 🔍 **Issue Identified**
The PostgreSQL connection is failing with "password authentication failed" errors. This indicates the credentials provided are not correct for the Render PostgreSQL database.

## 🛠️ **What We've Tried**

### **Attempt 1: Original Configuration**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'pm_tool',
        'USER': 'pm_tool_db_user',
        'PASSWORD': 'BjqjWUbw78BkZNm2jvyz22dyk53sHb81',
        'HOST': 'dpg-d4a47n7gi27c739rbnv0-a.singapore-postgres.render.com',
        'PORT': '5432',
        'OPTIONS': {'sslmode': 'require'},
    }
}
```
❌ **Error**: `password authentication failed for user "pm_tool_db_user"`

### **Attempt 2: Database Name 'postgres'**
```python
'NAME': 'postgres',
'USER': 'pm_tool_db_user',
```
❌ **Error**: `password authentication failed for user "pm_tool_db_user"`

### **Attempt 3: User 'postgres'**
```python
'NAME': 'postgres',
'USER': 'postgres',
```
❌ **Error**: `password authentication failed for user "postgres"`

## 🔧 **Solutions to Try**

### **Option 1: Check Render Dashboard**
1. Go to your Render dashboard
2. Navigate to your PostgreSQL service
3. Copy the **exact** connection details
4. Look for:
   - **Database Name**: Could be `postgres`, `pm_tool`, or something else
   - **Username**: Could be `postgres`, `pm_tool_db_user`, or custom
   - **Password**: May be different from what was provided

### **Option 2: Test Different Combinations**
Try these combinations in your `settings.py`:

#### **Combination A:**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'postgres',
        'PASSWORD': 'BjqjWUbw78BkZNm2jvyz22dyk53sHb81',
        'HOST': 'dpg-d4a47n7gi27c739rbnv0-a.singapore-postgres.render.com',
        'PORT': '5432',
        'OPTIONS': {'sslmode': 'require'},
    }
}
```

#### **Combination B:**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'pm_tool_db_user',
        'PASSWORD': 'BjqjWUbw78BkZNm2jvyz22dyk53sHb81',
        'HOST': 'dpg-d4a47n7gi27c739rbnv0-a.singapore-postgres.render.com',
        'PORT': '5432',
        'OPTIONS': {'sslmode': 'require'},
    }
}
```

#### **Combination C:**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'pm_tool',
        'USER': 'postgres',
        'PASSWORD': 'BjqjWUbw78BkZNm2jvyz22dyk53sHb81',
        'HOST': 'dpg-d4a47n7gi27c739rbnv0-a.singapore-postgres.render.com',
        'PORT': '5432',
        'OPTIONS': {'sslmode': 'require'},
    }
}
```

### **Option 3: Use dj-database-url with Environment Variables**
```python
import os

DATABASES = {
    'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
}
```

Then set environment variable:
```bash
export DATABASE_URL="postgres://pm_tool_db_user:BjqjWUbw78BkZNm2jvyz22dyk53sHb81@dpg-d4a47n7gi27c739rbnv0-a.singapore-postgres.render.com:5432/pm_tool"
```

### **Option 4: Test Connection Directly**
Create a test script `test_pg.py`:
```python
import psycopg2

try:
    conn = psycopg2.connect(
        host="dpg-d4a47n7gi27c739rbnv0-a.singapore-postgres.render.com",
        port="5432",
        database="postgres",
        user="postgres",
        password="BjqjWUbw78BkZNm2jvyz22dyk53sHb81",
        sslmode="require"
    )
    print("✅ Connection successful!")
    conn.close()
except Exception as e:
    print(f"❌ Connection failed: {e}")
```

Run: `python test_pg.py`

## 🎯 **Most Likely Issues**

### **1. Incorrect Password**
The password `BjqjWUbw78BkZNm2jvyz22dyk53sHb81` may be:
- Outdated
- For a different database
- Incorrectly copied

### **2. Wrong Username**
Render might use:
- `postgres` (default)
- Custom username
- Email-based username

### **3. Wrong Database Name**
Common Render database names:
- `postgres`
- `render_db`
- Custom name like `pm_tool`

### **4. Connection String Format**
Render might provide a different connection string format.

## 📋 **Steps to Fix**

### **Step 1: Get Correct Credentials**
1. Login to Render dashboard
2. Go to PostgreSQL service
3. Click "Connect" tab
4. Copy the **external connection string**
5. Extract the correct values

### **Step 2: Update Settings**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'YOUR_CORRECT_DB_NAME',
        'USER': 'YOUR_CORRECT_USERNAME',
        'PASSWORD': 'YOUR_CORRECT_PASSWORD',
        'HOST': 'dpg-d4a47n7gi27c739rbnv0-a.singapore-postgres.render.com',
        'PORT': '5432',
        'OPTIONS': {'sslmode': 'require'},
    }
}
```

### **Step 3: Test Connection**
```bash
python manage.py check --database default
```

### **Step 4: Run Migrations**
```bash
python manage.py migrate
```

### **Step 5: Start Server**
```bash
python manage.py runserver
```

## 🚨 **Current Status**

✅ **SQLite Working**: Server runs successfully with SQLite
❌ **PostgreSQL Failing**: Authentication error with current credentials
🔄 **Next Step**: Get correct credentials from Render dashboard

## 📞 **Getting Help**

1. **Render Support**: Check Render docs for PostgreSQL connection
2. **Render Dashboard**: Verify exact connection details
3. **Test Script**: Use the test script to debug connection
4. **Environment Variables**: Try using environment variables

---

**🎯 Once you have the correct credentials from Render, PostgreSQL will work perfectly!**
