# backend/company/urls.py
from django.urls import path
from .views import CompanyRegisterView, CompanyLoginView, CompanyListView, CompanyStatsView

urlpatterns = [
    path("register/", CompanyRegisterView.as_view(), name="company-register"),
    path("login/", CompanyLoginView.as_view(), name="company-login"),
    path("list/", CompanyListView.as_view(), name="company-list"),
    path("<int:company_id>/stats/", CompanyStatsView.as_view(), name="company-stats"),
]
