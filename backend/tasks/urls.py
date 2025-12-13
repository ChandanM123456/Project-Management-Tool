from django.urls import path
from . import views

app_name = 'tasks'

urlpatterns = [
    # Employee dashboard endpoints
    path('employees/<uuid:employee_id>/tasks/', views.employee_tasks, name='employee_tasks'),
    path('employees/<uuid:employee_id>/projects/', views.employee_projects, name='employee_projects'),
    path('employees/<uuid:employee_id>/notifications/', views.employee_notifications, name='employee_notifications'),
    path('employees/<uuid:employee_id>/stats/', views.employee_dashboard_stats, name='employee_dashboard_stats'),
    path('employees/<uuid:employee_id>/notifications/mark-read/', views.mark_notifications_read, name='mark_notifications_read'),
    path('employees/<uuid:employee_id>/sample-data/', views.create_sample_data, name='create_sample_data'),
    
    # Task management
    path('tasks/<uuid:task_id>/status/', views.update_task_status, name='update_task_status'),
]
