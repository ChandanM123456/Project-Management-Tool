from django.urls import path
from .views import ManagerLoginView, ManagerRegisterView

urlpatterns = [
    path('register/', ManagerRegisterView.as_view(), name='manager-register'),
    path('login/', ManagerLoginView.as_view(), name='manager-login'),
]
