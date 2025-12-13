from django.urls import path
from .views import CompanyProjectsView

urlpatterns = [
    path('company/<int:company_id>/', CompanyProjectsView.as_view(), name='company-projects'),
]
