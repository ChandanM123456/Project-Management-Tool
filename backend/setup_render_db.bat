@echo off
REM Setup script for Render PostgreSQL Database

echo Setting up PM Tool with Render PostgreSQL Database...

REM Check if DATABASE_URL is provided
if "%1"=="" (
    echo Usage: %0 "postgresql://username:password@host:port/database"
    echo.
    echo Please provide your Render PostgreSQL connection string
    echo You can find this in your Render dashboard under Database Settings
    echo.
    pause
    exit /b 1
)

set DATABASE_URL=%1

echo.
echo Database URL: %DATABASE_URL%
echo.

REM Create .env file
echo DATABASE_URL=%DATABASE_URL% > .env

echo Created .env file with database configuration

REM Install dependencies
echo.
echo Installing dependencies...
pip install -r requirements.txt

REM Run migrations
echo.
echo Running database migrations...
python manage.py makemigrations
python manage.py migrate

REM Create superuser (optional)
echo.
echo Do you want to create a superuser? (y/n)
set /p response=
if /i "%response%"=="y" (
    python manage.py createsuperuser
)

REM Collect static files
echo.
echo Collecting static files...
python manage.py collectstatic --noinput

echo.
echo Setup complete!
echo.
echo To start the development server:
echo python manage.py runserver
echo.
echo Your database is now connected to Render PostgreSQL!
echo.
pause
