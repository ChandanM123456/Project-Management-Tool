import uuid
import json
from django.db import models
from django.contrib.auth.models import User


def face_upload_path(instance, filename):
    return f"faces/{instance.id}/{filename}"


def photo_upload_path(instance, filename):
    return f"photos/{instance.id}/{filename}"


class EmotionData(models.Model):
    """Store emotion detection data for employees"""
    employee = models.ForeignKey('Employee', on_delete=models.CASCADE, related_name='emotion_data')
    emotion = models.CharField(max_length=50)  # happy, sad, angry, surprise, fear, disgust, neutral
    confidence = models.FloatField(default=0.0)
    image = models.ImageField(upload_to='emotions/', null=True, blank=True)  # Store the image that was analyzed
    context = models.CharField(max_length=20, default='login')  # login, task_update, etc.
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['employee', 'created_at']),
            models.Index(fields=['emotion']),
            models.Index(fields=['context']),
        ]
    
    def __str__(self):
        return f"{self.employee.name} - {self.emotion} ({self.confidence:.2f})"


class InviteToken(models.Model):
    company = models.ForeignKey("company.Company", on_delete=models.CASCADE)
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"{self.company.name} | {self.token}"


class Employee(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
        ('P', 'Prefer not to say'),
    ]
    
    WORK_MODE_CHOICES = [
        ('remote', 'Remote'),
        ('office', 'Office'),
        ('hybrid', 'Hybrid'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey("company.Company", on_delete=models.CASCADE, related_name='employees')
    
    # Personal Information
    first_name = models.CharField(max_length=100, default='', help_text="First name")
    last_name = models.CharField(max_length=100, default='', help_text="Last name")
    email = models.EmailField(unique=True, help_text="Email address (unique)")
    phone = models.CharField(max_length=30, blank=True, default='', help_text="Phone number")
    
    # Professional Information
    designation = models.CharField(max_length=150, default='Employee', help_text="Job designation")
    role = models.CharField(max_length=100, blank=True, help_text="Job role")
    department = models.CharField(max_length=100, blank=True, help_text="Department")
    experience = models.CharField(max_length=50, blank=True, help_text="Years of experience")
    skills = models.TextField(blank=True, help_text="Skills (JSON array)")
    previous_company = models.CharField(max_length=200, blank=True, help_text="Previous company")
    
    # Additional Information
    date_of_birth = models.DateField(null=True, blank=True, help_text="Date of birth")
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True, help_text="Gender")
    address = models.TextField(blank=True, help_text="Address")
    emergency_contact = models.CharField(max_length=100, blank=True, help_text="Emergency contact")
    blood_group = models.CharField(max_length=10, blank=True, help_text="Blood group")
    marital_status = models.CharField(max_length=20, blank=True, help_text="Marital status")
    nationality = models.CharField(max_length=50, blank=True, help_text="Nationality")
    languages = models.TextField(blank=True, help_text="Languages (JSON array)")
    
    # Education
    education = models.CharField(max_length=200, blank=True, help_text="Education level")
    university = models.CharField(max_length=200, blank=True, help_text="University")
    
    # Contact & Social
    linkedin_profile = models.URLField(blank=True, help_text="LinkedIn profile URL")
    portfolio = models.URLField(blank=True, help_text="Portfolio URL")
    
    # Employment Details
    expected_salary = models.CharField(max_length=50, blank=True, help_text="Expected salary")
    work_mode = models.CharField(max_length=50, choices=WORK_MODE_CHOICES, blank=True, help_text="Work mode")
    start_date = models.DateField(null=True, blank=True, help_text="Start date")
    reference = models.CharField(max_length=200, blank=True, help_text="Reference")
    
    # Files & Media
    resume = models.FileField(upload_to="resumes/", null=True, blank=True, help_text="Resume file")
    photo = models.ImageField(upload_to=photo_upload_path, null=True, blank=True, help_text="Profile photo")
    
    # Face Recognition
    face_images_count = models.IntegerField(default=0, help_text="Number of face images captured")
    face_encoding_path = models.CharField(max_length=500, null=True, blank=True, help_text="Face encoding file path")
    face_encodings_path = models.CharField(max_length=500, null=True, blank=True, help_text="Face encodings file path")
    
    # Resume Analysis (JSON) - Using TextField for SQLite compatibility
    resume_analysis = models.TextField(null=True, blank=True, help_text="Resume analysis results (JSON)")
    
    # Authentication
    password = models.CharField(max_length=128, blank=True, null=True, help_text="Hashed password")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Whether the employee is active")
    last_login = models.DateTimeField(null=True, blank=True, help_text="Last login timestamp")
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['company', 'is_active']),
            models.Index(fields=['email']),
            models.Index(fields=['created_at']),
            models.Index(fields=['last_login']),
            models.Index(fields=['department']),
            models.Index(fields=['designation']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    @property
    def name(self):
        return f"{self.first_name} {self.last_name}"
    
    def get_skills_list(self):
        """Return skills as a Python list"""
        if self.skills:
            try:
                return json.loads(self.skills)
            except:
                return []
        return []
    
    def set_skills_list(self, skills_list):
        """Set skills from a Python list"""
        self.skills = json.dumps(skills_list)
    
    def get_languages_list(self):
        """Return languages as a Python list"""
        if self.languages:
            try:
                return json.loads(self.languages)
            except:
                return []
        return []
    
    def set_languages_list(self, languages_list):
        """Set languages from a Python list"""
        self.languages = json.dumps(languages_list)


class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey("company.Company", on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=50, choices=[
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ], default='planning')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    deadline = models.DateField(null=True, blank=True)
    
    # Project team
    employees = models.ManyToManyField(Employee, related_name='projects', blank=True)
    team_lead = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='led_projects')
    
    # Progress tracking
    progress_percentage = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.company.name}"


class EmployeeProject(models.Model):
    """Intermediate model for employee-project relationships with additional details"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    role = models.CharField(max_length=100, blank=True)  # e.g., "Frontend Developer", "UI Designer"
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['employee', 'project']
    
    def __str__(self):
        return f"{self.employee.name} - {self.project.name} ({self.role})"
