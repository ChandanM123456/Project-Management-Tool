from django.db import models
from django.utils import timezone


class Company(models.Model):
    INDUSTRY_CHOICES = [
        ('technology', 'Technology'),
        ('healthcare', 'Healthcare'),
        ('finance', 'Finance'),
        ('education', 'Education'),
        ('retail', 'Retail'),
        ('manufacturing', 'Manufacturing'),
        ('consulting', 'Consulting'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=200, help_text="Company name")
    email = models.EmailField(unique=True, help_text="Company email address")
    password = models.CharField(max_length=128, help_text="Company password (hashed)")
    address = models.TextField(blank=True, help_text="Company address")
    phone = models.CharField(max_length=30, blank=True, help_text="Company phone number")
    website = models.URLField(blank=True, help_text="Company website")
    description = models.TextField(blank=True, help_text="Company description")
    industry = models.CharField(max_length=50, choices=INDUSTRY_CHOICES, default='other', help_text="Industry type")
    size = models.CharField(max_length=50, blank=True, help_text="Company size (e.g., '1-50', '51-200', '201-500', '500+')")
    logo = models.ImageField(upload_to='company_logos/', null=True, blank=True, help_text="Company logo")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Whether the company is active")
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['is_active']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.email})"
    
    @property
    def employee_count(self):
        """Get the number of employees in this company"""
        return self.employee_set.filter(is_active=True).count()
    
    @property
    def manager_count(self):
        """Get the number of managers in this company"""
        return self.manager_set.count()
