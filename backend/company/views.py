from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import make_password, check_password
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from .models import Company
from django.contrib.auth.models import User
from managers.models import Manager
import logging

logger = logging.getLogger(__name__)

class CompanyListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        companies = Company.objects.all().values('id', 'name', 'email', 'phone', 'website')
        return Response({
            'success': True,
            'companies': list(companies)
        }, status=status.HTTP_200_OK)

class CompanyRegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        data = request.data
        
        # Validate required fields
        required_fields = ["name", "email", "password"]
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return Response({
                "success": False,
                "error": "Missing required fields",
                "errors": {field: f"{field.replace('_', ' ').title()} is required" for field in missing_fields}
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate email format
        try:
            validate_email(data["email"])
        except ValidationError:
            return Response({
                "success": False,
                "error": "Invalid email format",
                "errors": {"email": "Please enter a valid email address"}
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate password strength
        password = data["password"]
        if len(password) < 8:
            return Response({
                "success": False,
                "error": "Password too short",
                "errors": {"password": "Password must be at least 8 characters long"}
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if company already exists
        if Company.objects.filter(email=data["email"].lower()).exists():
            return Response({
                "success": False,
                "error": "Company with this email already exists",
                "errors": {"email": "A company with this email is already registered"}
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Create company with hashed password
            company = Company.objects.create(
                name=data["name"].strip(),
                email=data["email"].lower().strip(),
                password=make_password(password),
                address=data.get("address", "").strip(),
                phone=data.get("phone", "").strip(),
                website=data.get("website", "").strip(),
                description=data.get("description", "").strip(),
                industry=data.get("industry", "other"),
                size=data.get("size", "").strip()
            )
            
            # Create a Django User for the initial manager
            try:
                username = data["email"].lower().strip()
                manager_user = User.objects.create_user(
                    username=username, 
                    email=data["email"].lower().strip(), 
                    password=password,
                    first_name=data.get("manager_first_name", ""),
                    last_name=data.get("manager_last_name", "")
                )
                Manager.objects.create(
                    user=manager_user, 
                    company=company,
                    role="admin",
                    phone=data.get("manager_phone", ""),
                    department="Management"
                )
                logger.info(f"Created manager account for company: {company.name}")
            except Exception as e:
                logger.error(f"Manager creation failed for company {company.name}: {e}")
                # Don't fail registration if manager creation fails
                
            return Response({
                "success": True, 
                "company_id": company.id,
                "message": "Company registered successfully"
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Company registration failed: {e}")
            return Response({
                "success": False,
                "error": "Registration failed",
                "message": "An error occurred during registration. Please try again."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CompanyStatsView(APIView):
    def get(self, request, company_id):
        try:
            company = Company.objects.get(id=company_id)
            # Get stats - mock data for now, replace with actual queries
            stats = {
                'employees': 12,  # Employee.objects.filter(company=company).count()
                'projects': 5,    # Project.objects.filter(company=company).count()
                'tasks': 23,      # Task.objects.filter(project__company=company).count()
                'managers': 3     # Manager.objects.filter(company=company).count()
            }
            return Response(stats, status=status.HTTP_200_OK)
        except Company.DoesNotExist:
            return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)


class CompanyLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        data = request.data
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        
        # Validate input
        if not email or not password:
            errors = {}
            if not email:
                errors["email"] = "Email is required"
            if not password:
                errors["password"] = "Password is required"
                
            return Response({
                "success": False,
                "error": "Email and password are required",
                "errors": errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate email format
        try:
            validate_email(email)
        except ValidationError:
            return Response({
                "success": False,
                "error": "Invalid email format",
                "errors": {"email": "Please enter a valid email address"}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            company = Company.objects.get(email=email)
            
            # Check if company is active
            if not company.is_active:
                return Response({
                    "success": False,
                    "error": "Account is deactivated",
                    "message": "Your company account has been deactivated. Please contact support."
                }, status=status.HTTP_403_FORBIDDEN)
            
            if check_password(password, company.password):
                # Generate a simple token (in production, use JWT)
                token = f"company_{company.id}_{company.email}"
                
                # Update last login (add this field to model if needed)
                # company.last_login = timezone.now()
                # company.save()
                
                logger.info(f"Company login successful: {company.name}")
                
                return Response({
                    "success": True,
                    "token": token,
                    "company_id": company.id,
                    "company_name": company.name,
                    "company_industry": company.industry,
                    "message": "Login successful"
                }, status=status.HTTP_200_OK)
            else:
                logger.warning(f"Failed login attempt for company: {company.name}")
                return Response({
                    "success": False,
                    "error": "Invalid credentials",
                    "message": "The email or password you entered is incorrect."
                }, status=status.HTTP_401_UNAUTHORIZED)
                
        except Company.DoesNotExist:
            # Don't reveal that the email doesn't exist for security
            logger.warning(f"Login attempt with non-existent email: {email}")
            return Response({
                "success": False,
                "error": "Invalid credentials",
                "message": "The email or password you entered is incorrect."
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        except Exception as e:
            logger.error(f"Login error for {email}: {e}")
            return Response({
                "success": False,
                "error": "Login failed",
                "message": "An error occurred during login. Please try again."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
