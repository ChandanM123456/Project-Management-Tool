#!/bin/bash

# PM Tool Backend Setup Script
echo "Setting up PM Tool Backend with AI and Face Recognition..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Install system dependencies for face recognition
echo "Installing system dependencies..."

# Check OS and install accordingly
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "Detected Linux. Installing dependencies..."
    sudo apt-get update
    sudo apt-get install -y cmake libopenblas-dev liblapack-dev python3-dev python3-numpy libjpeg-dev libpng-dev libtiff-dev
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "Detected macOS. Installing dependencies..."
    brew install cmake
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    # Windows
    echo "Detected Windows. Please install CMake and Visual Studio Build Tools manually."
    echo "Download from: https://cmake.org/download/ and https://visualstudio.microsoft.com/visual-cpp-build-tools/"
fi

# Create necessary directories
echo "Creating media directories..."
mkdir -p media/encodings
mkdir -p media/employee_encodings
mkdir -p media/faces
mkdir -p media/resumes
mkdir -p media/photos

# Run migrations
echo "Running Django migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
echo "Do you want to create a superuser? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    python manage.py createsuperuser
fi

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Setup complete!"
echo "To start the development server, run:"
echo "source venv/bin/activate"
echo "python manage.py runserver"
