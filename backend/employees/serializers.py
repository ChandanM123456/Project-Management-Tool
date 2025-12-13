from rest_framework import serializers
from .models import Employee, InviteToken

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ('id','face_images_count','face_encoding_path','created_at')

class InviteTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = InviteToken
        fields = '__all__'
        read_only_fields = ('token','created_at')
