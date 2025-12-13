from django.db import models
from django.contrib.auth.models import User
from company.models import Company


class Manager(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('hr', 'HR Manager'),
        ('project_manager', 'Project Manager'),
        ('team_lead', 'Team Lead'),
        ('executive', 'Executive'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='manager_profile')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='managers')
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='admin', help_text="Manager role")
    phone = models.CharField(max_length=30, blank=True, help_text="Manager phone number")
    department = models.CharField(max_length=100, blank=True, help_text="Department")
    bio = models.TextField(blank=True, help_text="Manager biography")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Whether the manager is active")
    last_login = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['company', 'is_active']),
            models.Index(fields=['user']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.company.name}"
    
    @property
    def full_name(self):
        """Get manager's full name"""
        return self.user.get_full_name() or self.user.username
    
    @property
    def email(self):
        """Get manager's email"""
        return self.user.email
