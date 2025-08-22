from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile
from apps.authentication.validation.validators import ProfileValidationMixin

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for extended user profile information"""
    class Meta:
        model = UserProfile
        fields = [
            'organization', 
            'faculty_and_major', 
            'avatar', 
            'bio',
            'gender',
            'language',
            'phone',
            'profile_picture',
            'positions',
        ]

class UserSerializer(serializers.ModelSerializer):
    """Serializer for basic user information"""
    userprofile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        # 👇 Add is_staff and is_superuser here
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name', 
            'is_staff', 
            'is_superuser', 
            'userprofile'
        ]

class UserUpdateSerializer(serializers.ModelSerializer, ProfileValidationMixin):
    """Serializer for updating user information, including basic and extended fields"""

    # Fields from the User model
    email = serializers.EmailField(required=False)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    # Extended fields from the UserProfile model
    organization = serializers.CharField(required=False, allow_blank=True)
    faculty_and_major = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    gender = serializers.CharField(required=False, allow_blank=True)
    language = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    profile_picture = serializers.CharField(required=False, allow_blank=True)
    positions = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'email',
            'first_name',
            'last_name',
            'organization',
            'faculty_and_major',
            'bio',
            'gender',
            'language',
            'phone',
            'profile_picture',
            'positions',
        ]

    def validate_email(self, value):
        return self.validate_unique_email_update(value, self.instance)

    def update(self, instance, validated_data):
        # Update User model fields
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()
        
        try:
            profile = instance.userprofile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=instance)
        
        profile.organization = validated_data.get('organization', profile.organization)
        profile.faculty_and_major = validated_data.get('faculty_and_major', profile.faculty_and_major)
        profile.bio = validated_data.get('bio', profile.bio)
        profile.gender = validated_data.get('gender', profile.gender)
        profile.language = validated_data.get('language', profile.language)
        profile.phone = validated_data.get('phone', profile.phone)
        profile.profile_picture = validated_data.get('profile_picture', profile.profile_picture)
        profile.positions = validated_data.get('positions', profile.positions)
        profile.save()

        return instance
