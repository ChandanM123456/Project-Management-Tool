from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render
from .models import Project


class CompanyProjectsView(APIView):
    def get(self, request, company_id):
        try:
            # Mock data for now - replace with actual database queries
            projects = [
                {
                    'id': 1,
                    'name': 'Website Redesign',
                    'description': 'Complete redesign of company website with modern UI/UX',
                    'progress': 75,
                    'status': 'active',
                    'start_date': '2024-01-15',
                    'end_date': '2024-03-30',
                    'team_size': 4
                },
                {
                    'id': 2,
                    'name': 'Mobile App Development',
                    'description': 'Native mobile app for iOS and Android platforms',
                    'progress': 45,
                    'status': 'active',
                    'start_date': '2024-02-01',
                    'end_date': '2024-06-15',
                    'team_size': 6
                },
                {
                    'id': 3,
                    'name': 'Database Migration',
                    'description': 'Migrate legacy database to cloud infrastructure',
                    'progress': 90,
                    'status': 'active',
                    'start_date': '2024-01-01',
                    'end_date': '2024-02-28',
                    'team_size': 2
                }
            ]
            
            return Response({
                'success': True,
                'projects': projects
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to fetch projects: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
