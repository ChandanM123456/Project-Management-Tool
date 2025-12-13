from django.contrib import admin
from .models import Employee, InviteToken

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'company', 'designation', 'created_at')
    search_fields = ('name', 'email', 'designation')
    list_filter = ('company', 'created_at')
    readonly_fields = ('id', 'face_images_count', 'created_at')

@admin.register(InviteToken)
class InviteTokenAdmin(admin.ModelAdmin):
    list_display = ('company', 'token', 'created_at', 'expires_at')
    search_fields = ('token', 'company__name')
    list_filter = ('created_at', 'company')
    readonly_fields = ('token', 'created_at')
