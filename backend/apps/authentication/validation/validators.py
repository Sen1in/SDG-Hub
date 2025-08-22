from rest_framework import serializers
from django.contrib.auth.models import User
import re

class AuthValidationMixin:
    """Authentication-related verification integration class"""
    
    def validate_password_match(self, password, password_confirm):
        """Verify password match"""
        if password != password_confirm:
            raise serializers.ValidationError("Passwords don't match")
        return password

    def validate_unique_username(self, username):
        """Verify the uniqueness of the username"""
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError("Username already exists")
        return username

    def validate_unique_email(self, email):
        """Verify the uniqueness of the email address"""   
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Email already exists")
        return email

class ProfileValidationMixin:
    """User data-related verification integration class"""
    
    VALID_GENDERS = ['Female', 'Male', 'Other']
    
    VALID_LANGUAGES = ['English', 'Mandarin', 'Arabic', 'Cantonese', 'Vietnamese', 'Hindu', 'Italian', 'Other']
    
    VALID_MAJORS = [
        'Architecture and Building',
        'Business and Management', 
        'Creative Arts',
        'Education',
        'Engineering and Related Technologies',
        'Environmental and Related Studies',
        'Health',
        'Humanities, Law and Social Sciences',
        'Information Technology',
        'Natural and Sciences'
    ]
    
    def validate_unique_email_update(self, email, instance):  
        if User.objects.filter(email=email).exclude(id=instance.id).exists():
            raise serializers.ValidationError("Email already exists")
        return email
    
    def validate_gender(self, value):
        if value and value not in self.VALID_GENDERS:
            # If not in the predefined list, allow for custom input (handle the "Other" case)
            if len(value.strip()) == 0:
                raise serializers.ValidationError("Gender cannot be empty")
        return value
    
    def validate_language(self, value):
        """Verify the language field"""
        if value and value not in self.VALID_LANGUAGES:
            # If not in the predefined list, allow custom input (handle the "Other" case)
            if len(value.strip()) == 0:
                raise serializers.ValidationError("Language cannot be empty")
        return value
    
    def validate_faculty_and_major(self, value):
        """Verify the professional fields"""
        if value and value not in self.VALID_MAJORS:
            if len(value.strip()) == 0:
                raise serializers.ValidationError("Faculty and major cannot be empty")
        return value
    
    def validate_phone(self, value):
        """Verify the format of the phone number"""
        if value:
            digits_only = ''.join(filter(str.isdigit, value))
            if len(digits_only) < 8 or len(digits_only) > 15:
                raise serializers.ValidationError("Phone number must be between 8 and 15 digits")
        return value

class EmailValidator:
    """Verufy Email """
    
    @staticmethod
    def validate_format(email):
        """Basic format validationBasic format validation"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_domain_whitelist(email, allowed_domains=None):
        """Domain name whitelist verification"""
        if not allowed_domains:
            return True
        
        domain = email.split('@')[1] if '@' in email else ''
        return domain.lower() in [d.lower() for d in allowed_domains]
    
    @staticmethod
    def validate_blacklist(email, blocked_domains=None):
        """Domain name blacklist verificationDomain name blacklist verification"""
        if not blocked_domains:
            return True
        
        domain = email.split('@')[1] if '@' in email else ''
        return domain.lower() not in [d.lower() for d in blocked_domains]
