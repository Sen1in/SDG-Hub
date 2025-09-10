from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from ..validation.validators import AuthValidationMixin, EmailValidator
from .models import EmailVerificationCode
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings

class LoginSerializer(serializers.Serializer):
    """User login serializer"""
    login = serializers.CharField(help_text='username or email')
    password = serializers.CharField()

    def validate(self, attrs):
        login_input = attrs.get('login')
        password = attrs.get('password')

        if not login_input or not password:
            raise serializers.ValidationError('Must include login and password')

        user = self.authenticate_user(login_input, password)
        
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled')
        
        attrs['user'] = user
        return attrs
    
    def authenticate_user(self, login_input, password):
        """
        Smart authentication strategy:
        1. Try username authentication first (even if it contains @ character)
        2. If username auth fails, try email authentication
        3. This handles usernames with @ symbols like john@company
        """
        
        # Strategy 1: Try username authentication first
        user = authenticate(username=login_input, password=password)
        if user:
            return user
        
        # Strategy 2: If username auth fails, try email authentication
        # Only attempt email auth if input looks like an email
        if self.looks_like_email(login_input):
            try:
                # Find user by email, then authenticate with username
                user_by_email = User.objects.get(email=login_input)
                user = authenticate(username=user_by_email.username, password=password)
                if user:
                    return user
            except User.DoesNotExist:
                pass
        
        return None
    
    def looks_like_email(self, input_str):
        """
        Basic email format validation
        Could use stricter regex but basic check is sufficient
        """
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(email_pattern, input_str) is not None
class GoogleLoginSerializer(serializers.Serializer):
    """Google OAuth login serializer"""
    credential = serializers.CharField()

    def validate_credential(self, value):
        """Validate Google ID token"""
        try:
            idinfo = id_token.verify_oauth2_token(
                value, 
                requests.Request(), 
                settings.GOOGLE_OAUTH2_CLIENT_ID
            )

            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise serializers.ValidationError('Wrong issuer.')

            return idinfo
        except ValueError as e:
            raise serializers.ValidationError(f'Invalid token: {str(e)}')

    def create_or_get_user(self, google_user_info):
        """Create or get user from Google user info"""
        google_id = google_user_info['sub']
        email = google_user_info['email']
        first_name = google_user_info.get('given_name', '')
        last_name = google_user_info.get('family_name', '')
        
        username = f"sdg_{google_id}"
        
        try:
            user = User.objects.get(username=username)
            return user, False
        except User.DoesNotExist:
            if User.objects.filter(email=email).exists():
                raise serializers.ValidationError(
                    'An account with this email already exists. Please use regular login.'
                )
            
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name
            )
            
            # Import UserProfile from profile subapp within authentication
            try:
                from ..profile.models import UserProfile
                UserProfile.objects.create(user=user)
            except ImportError:
                print("UserProfile model not found, skipping profile creation")
            
            return user, True
        
class EmailCodeSerializer(serializers.Serializer):
    """Email verification code sender serializer"""
    email = serializers.EmailField()
    
    def validate_email(self, value):
        # Check email format
        if not EmailValidator.validate_format(value):
            raise serializers.ValidationError("Invalid email format")
        
        # Check if email is already registered
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered")
        
        return value

class RegisterSerializer(serializers.ModelSerializer, AuthValidationMixin):
    """User registration serializer"""
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    organization = serializers.CharField(required=False, allow_blank=True)
    faculty_and_major = serializers.CharField(required=False, allow_blank=True)
    email_code = serializers.CharField(write_only=True, max_length=6, min_length=6) 
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm',
                  'organization', 'faculty_and_major', 'first_name', 'last_name',
                  'email_code'] 

    def validate(self, attrs):
        # Use mixin validation methods
        self.validate_password_match(attrs['password'], attrs['password_confirm'])
        
        # Added: validate email verification code
        email = attrs.get('email')
        email_code = attrs.get('email_code')
        
        if email and email_code:
            is_valid, message = EmailVerificationCode.verify_code(email, email_code)
            if not is_valid:
                raise serializers.ValidationError({"email_code": message})
        
        return attrs

    def validate_username(self, value):
        return self.validate_unique_username(value)

    def validate_email(self, value):
        if not EmailValidator.validate_format(value):
            raise serializers.ValidationError("Invalid Email Format")
        return self.validate_unique_email(value)
    
    def validate_email_code(self, value):
        """Validate email verification code format"""
        if not value.isdigit():
            raise serializers.ValidationError("Verification code must contain only numbers")
        if len(value) != 6:
            raise serializers.ValidationError("Verification code must be 6 digits")
        return value

    def create(self, validated_data):
        # Remove fields that don't belong to User model
        organization = validated_data.pop('organization', '')
        faculty_and_major = validated_data.pop('faculty_and_major', '')
        validated_data.pop('password_confirm')
        validated_data.pop('email_code')  # Added: remove verification code field, not needed in user model
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Update user profile information
        try:
            profile = user.userprofile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=user)
        
        profile.organization = organization
        profile.faculty_and_major = faculty_and_major
        profile.save()
        
        return user