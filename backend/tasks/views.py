from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
from django.utils import timezone

from .models import Task, Notification
from employees.models import Employee, Project


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_tasks(request, employee_id):
    """Get all tasks assigned to a specific employee"""
    try:
        employee = get_object_or_404(Employee, id=employee_id)
        
        tasks = Task.objects.filter(
            assigned_to=employee,
            company=employee.company
        ).select_related('project').order_by('-created_at')
        
        task_data = []
        for task in tasks:
            task_data.append({
                'id': str(task.id),
                'title': task.title,
                'description': task.description,
                'priority': task.priority,
                'status': task.status,
                'progress': task.progress,
                'due_date': task.due_date.isoformat() if task.due_date else None,
                'project': task.project.name if task.project else None,
                'created_at': task.created_at.isoformat(),
                'is_overdue': task.is_overdue
            })
        
        return Response({
            'success': True,
            'tasks': task_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_projects(request, employee_id):
    """Get all projects for a specific employee"""
    try:
        employee = get_object_or_404(Employee, id=employee_id)
        
        # Get projects through EmployeeProject relationship
        employee_projects = employee.projects.all()
        
        project_data = []
        for project in employee_projects:
            # Get employee's role in this project
            try:
                employee_project = project.employeeproject_set.get(employee=employee)
                role = employee_project.role
            except:
                role = "Team Member"
            
            # Count team members
            team_size = project.employees.count()
            
            project_data.append({
                'id': str(project.id),
                'name': project.name,
                'description': project.description,
                'status': project.status,
                'progress': project.progress_percentage,
                'deadline': project.deadline.isoformat() if project.deadline else None,
                'team_size': team_size,
                'role': role,
                'start_date': project.start_date.isoformat() if project.start_date else None,
                'end_date': project.end_date.isoformat() if project.end_date else None
            })
        
        return Response({
            'success': True,
            'projects': project_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_notifications(request, employee_id):
    """Get all notifications for a specific employee"""
    try:
        employee = get_object_or_404(Employee, id=employee_id)
        
        notifications = Notification.objects.filter(
            employee=employee
        ).select_related('task', 'project').order_by('-created_at')[:50]  # Limit to 50 most recent
        
        notification_data = []
        for notification in notifications:
            notification_data.append({
                'id': str(notification.id),
                'type': notification.type,
                'title': notification.title,
                'message': notification.message,
                'read': notification.is_read,
                'created_at': notification.created_at.isoformat(),
                'task_title': notification.task.title if notification.task else None,
                'project_name': notification.project.name if notification.project else None
            })
        
        return Response({
            'success': True,
            'notifications': notification_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_task_status(request, task_id):
    """Update task status"""
    try:
        task = get_object_or_404(Task, id=task_id)
        new_status = request.data.get('status')
        
        if new_status not in dict(Task.STATUS_CHOICES):
            return Response({
                'success': False,
                'error': 'Invalid status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        old_status = task.status
        task.status = new_status
        
        # Update progress based on status
        if new_status == 'completed':
            task.progress = 100
            task.completed_at = timezone.now()
        elif new_status == 'in-progress' and old_status == 'todo':
            task.progress = 25
        elif new_status == 'review':
            task.progress = 90
        
        task.save()
        
        # Create notification for task completion
        if new_status == 'completed' and task.assigned_to:
            Notification.objects.create(
                employee=task.assigned_to,
                type='task_completed',
                title='Task Completed',
                message=f'Task "{task.title}" has been marked as completed',
                task=task
            )
        
        return Response({
            'success': True,
            'message': 'Task status updated successfully'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notifications_read(request, employee_id):
    """Mark all notifications as read for an employee"""
    try:
        employee = get_object_or_404(Employee, id=employee_id)
        
        updated_count = Notification.objects.filter(
            employee=employee,
            is_read=False
        ).update(is_read=True, read_at=timezone.now())
        
        return Response({
            'success': True,
            'message': f'{updated_count} notifications marked as read'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_dashboard_stats(request, employee_id):
    """Get dashboard statistics for an employee"""
    try:
        employee = get_object_or_404(Employee, id=employee_id)
        
        # Task statistics
        total_tasks = Task.objects.filter(assigned_to=employee, company=employee.company).count()
        completed_tasks = Task.objects.filter(assigned_to=employee, company=employee.company, status='completed').count()
        in_progress_tasks = Task.objects.filter(assigned_to=employee, company=employee.company, status='in-progress').count()
        overdue_tasks = Task.objects.filter(
            assigned_to=employee, 
            company=employee.company,
            due_date__lt=timezone.now().date(),
            status__in=['todo', 'in-progress']
        ).count()
        
        # Project statistics
        active_projects = employee.projects.filter(status='active').count()
        
        # Notification statistics
        unread_notifications = Notification.objects.filter(employee=employee, is_read=False).count()
        
        # Calculate average progress
        all_tasks = Task.objects.filter(assigned_to=employee, company=employee.company)
        avg_progress = sum(task.progress for task in all_tasks) / all_tasks.count() if all_tasks.exists() else 0
        
        return Response({
            'success': True,
            'stats': {
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'in_progress_tasks': in_progress_tasks,
                'overdue_tasks': overdue_tasks,
                'active_projects': active_projects,
                'unread_notifications': unread_notifications,
                'average_progress': round(avg_progress, 1)
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Create sample data for demo purposes
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_sample_data(request, employee_id):
    """Create sample tasks and projects for demo"""
    try:
        employee = get_object_or_404(Employee, id=employee_id)
        
        # Create sample projects if they don't exist
        sample_projects_data = [
            {
                'name': 'Mobile App Development',
                'description': 'Native mobile application for iOS and Android',
                'status': 'active',
                'progress_percentage': 75,
                'deadline': timezone.now().date() + timedelta(days=45)
            },
            {
                'name': 'Web Platform Redesign',
                'description': 'Complete redesign of the web platform',
                'status': 'active',
                'progress_percentage': 60,
                'deadline': timezone.now().date() + timedelta(days=30)
            },
            {
                'name': 'Backend Services',
                'description': 'API development and backend services',
                'status': 'active',
                'progress_percentage': 45,
                'deadline': timezone.now().date() + timedelta(days=60)
            }
        ]
        
        created_projects = []
        for project_data in sample_projects_data:
            project, created = Project.objects.get_or_create(
                company=employee.company,
                name=project_data['name'],
                defaults=project_data
            )
            if created:
                project.employees.add(employee)
                # Create EmployeeProject with role
                from employees.models import EmployeeProject
                EmployeeProject.objects.create(
                    employee=employee,
                    project=project,
                    role='Senior Developer' if 'Development' in project_data['name'] else 'Team Lead'
                )
            created_projects.append(project)
        
        # Create sample tasks
        sample_tasks_data = [
            {
                'title': 'Complete UI Design for Mobile App',
                'description': 'Design responsive UI screens for the mobile application',
                'priority': 'high',
                'status': 'in-progress',
                'progress': 65,
                'due_date': timezone.now().date() + timedelta(days=15),
                'project': created_projects[0]
            },
            {
                'title': 'Fix Authentication Bug',
                'description': 'Resolve login issues reported by users',
                'priority': 'high',
                'status': 'todo',
                'progress': 0,
                'due_date': timezone.now().date() + timedelta(days=10),
                'project': created_projects[1]
            },
            {
                'title': 'Database Optimization',
                'description': 'Optimize database queries for better performance',
                'priority': 'medium',
                'status': 'in-progress',
                'progress': 40,
                'due_date': timezone.now().date() + timedelta(days=20),
                'project': created_projects[2]
            },
            {
                'title': 'Write API Documentation',
                'description': 'Create comprehensive API documentation',
                'priority': 'low',
                'status': 'completed',
                'progress': 100,
                'due_date': timezone.now().date() - timedelta(days=2),
                'project': created_projects[2]
            }
        ]
        
        created_tasks = []
        for task_data in sample_tasks_data:
            task, created = Task.objects.get_or_create(
                company=employee.company,
                title=task_data['title'],
                defaults={
                    **task_data,
                    'assigned_to': employee,
                    'created_by': employee
                }
            )
            created_tasks.append(task)
        
        # Create sample notifications
        sample_notifications_data = [
            {
                'type': 'task_assigned',
                'title': 'New Task Assigned',
                'message': 'New task assigned: Complete UI Design for Mobile App',
                'task': created_tasks[0]
            },
            {
                'type': 'deadline_reminder',
                'title': 'Deadline Reminder',
                'message': 'Task "Fix Authentication Bug" is due in 3 days',
                'task': created_tasks[1]
            },
            {
                'type': 'project_update',
                'title': 'Project Update',
                'message': 'Mobile App Development project reached 75% completion',
                'project': created_projects[0]
            }
        ]
        
        for notification_data in sample_notifications_data:
            Notification.objects.get_or_create(
                employee=employee,
                title=notification_data['title'],
                defaults=notification_data
            )
        
        return Response({
            'success': True,
            'message': 'Sample data created successfully',
            'created_projects': len(created_projects),
            'created_tasks': len(created_tasks)
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
