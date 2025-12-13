@echo off
REM PM Tool Backend Setup Script for Windows
echo Setting up PM Tool Backend with AI and Face Recognition...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Please install Python 3 first.
    pause
    exit /b 1
)

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo Installing Python dependencies...
pip install -r requirements.txt

REM Create necessary directories
echo Creating media directories...
if not exist "media" mkdir media
if not exist "media\encodings" mkdir media\encodings
if not exist "media\employee_encodings" mkdir media\employee_encodings
if not exist "media\faces" mkdir media\faces
if not exist "media\resumes" mkdir media\resumes
if not exist "media\photos" mkdir media\photos

REM Run migrations
echo Running Django migrations...
python manage.py makemigrations
python manage.py migrate

REM Ask to create superuser
set /p response="Do you want to create a superuser? (y/n): "
if /i "%response%"=="y" (
    python manage.py createsuperuser
)

REM Collect static files
echo Collecting static files...
python manage.py collectstatic --noinput

echo Setup complete!
echo To start the development server, run:
echo venv\Scripts\activate.bat
echo python manage.py runserver
pause
