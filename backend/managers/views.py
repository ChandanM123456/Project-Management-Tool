from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Manager
from company.models import Company


class ManagerRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        required_fields = ["first_name", "last_name", "email", "password", "company_id"]
        for field in required_fields:
            if field not in data or not data[field]:
                return Response({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Check if company exists
            company = Company.objects.get(id=data["company_id"])
        except Company.DoesNotExist:
            return Response({"error": "Invalid company selected"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user with this email already exists
        if User.objects.filter(email=data["email"]).exists():
            return Response({"error": "A user with this email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if manager already exists for this company
        if Manager.objects.filter(user__email=data["email"], company=company).exists():
            return Response({"error": "Manager with this email already exists for this company"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Create Django User
            user = User.objects.create_user(
                username=data["email"],
                email=data["email"],
                password=data["password"],
                first_name=data["first_name"],
                last_name=data["last_name"]
            )
            
            # Create Manager profile
            manager = Manager.objects.create(user=user, company=company)
            
            return Response({
                "success": True,
                "manager_id": manager.id,
                "company_id": company.id,
                "company_name": company.name
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # If anything fails, clean up the user if created
            if 'user' in locals():
                user.delete()
            return Response({"error": f"Registration failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ManagerLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return Response({'error': 'email and password required'}, status=status.HTTP_400_BAD_REQUEST)

        # our manager user was created with username=email
        user = authenticate(username=email, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            manager = Manager.objects.get(user=user)
            token = f"manager_{manager.id}_{user.email}"
            return Response({
                'success': True,
                'token': token,
                'manager_id': manager.id,
                'company_id': manager.company.id,
                'company_name': manager.company.name,
                'manager_name': user.username
            }, status=status.HTTP_200_OK)
        except Manager.DoesNotExist:
            return Response({'error': 'Manager profile not found'}, status=status.HTTP_404_NOT_FOUND)
from django.shortcuts import render

# Create your views here.
