from django.urls import path
from . import views

urlpatterns = [
    path('create-invite/', views.create_invite, name='create-invite'),  # manager-only, protected
    path('onboard/<str:token>/', views.onboard_public, name='onboard-public'),
    path('face-login/', views.face_login, name='face-login'),
    path('password-login/', views.employee_password_login, name='employee-password-login'),
    path('register/', views.employee_register, name='employee-register'),
    
    # Emotion detection endpoints
    path('<uuid:employee_id>/emotion-analytics/', views.employee_emotion_analytics, name='employee-emotion-analytics'),
    path('<uuid:employee_id>/capture-emotion/', views.capture_emotion, name='capture-emotion'),
    
    # New AI-powered endpoints
    path('analyze-resume/', views.analyze_resume, name='analyze-resume'),
    path('generate-encodings/', views.generate_encodings, name='generate-encodings'),
    path('onboard/', views.onboard_employee, name='onboard-employee'),
]
