from django.contrib import admin
from .models import Manager

@admin.register(Manager)
class ManagerAdmin(admin.ModelAdmin):
    list_display = ('user', 'company', 'created_at')
    search_fields = ('user__username', 'company__name')
    list_filter = ('created_at', 'company')
