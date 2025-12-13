"""
Django settings for backend project.
"""

from pathlib import Path
import os
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure--)n02la(49bz25gbj#(wya5&&_zt=60-1p8)!#3+meb0om9l&d'

DEBUG = True

ALLOWED_HOSTS = ["*"]   # allow all during development

# near top: import os


# SQLite Configuration (currently active)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / "db.sqlite3",
    }
}

# PostgreSQL Configuration (commented out - needs correct credentials)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': 'postgres',  # or 'pm_tool' - try both
#         'USER': 'postgres',  # or 'pm_tool_db_user' - try both
#         'PASSWORD': 'YOUR_CORRECT_PASSWORD_HERE',
#         'HOST': 'dpg-d4a47n7gi27c739rbnv0-a.singapore-postgres.render.com',
#         'PORT': '5432',
#         'OPTIONS': {
#             'sslmode': 'require',
#         },
#         'ATOMIC_REQUESTS': True,
#     }
# }

# SQLite Configuration (commented out)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / "db.sqlite3",
#     }
# }

# ---------------- APPLICATIONS ----------------

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    'rest_framework',
    'corsheaders',

    # Local apps
    'company',
    'managers',
    'employees',
    'projects',
    'tasks',
]


# ---------------- MIDDLEWARE ----------------

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',

    # Required for React and APIs
    'corsheaders.middleware.CorsMiddleware',

    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# ---------------- CORS CONFIG ----------------
CORS_ALLOW_ALL_ORIGINS = True


ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, "templates")  # for HTML templates later
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# ---------------- PASSWORDS ----------------

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
]


# ---------------- LANGUAGE / TIMEZONE ----------------

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'  # recommended for you
USE_I18N = True
USE_TZ = True


# ---------------- STATIC & MEDIA FILES ----------------

STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, "static")]

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
