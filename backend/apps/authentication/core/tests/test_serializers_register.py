from django.test import TestCase
from django.contrib.auth.models import User
from apps.authentication.core.serializers import (
    EmailCodeSerializer, 
    RegisterSerializer
)
from apps.authentication.core.models import EmailVerificationCode


class EmailCodeSerializerTest(TestCase):
    """Email code serializer tests"""

    def setUp(self):
        """Set up test data"""
        self.valid_email = 'test@example.com'
        self.invalid_email = 'invalid-email'

    def test_valid_email_serializer(self):
        """Test serializer with valid email"""
        data = {'email': self.valid_email}
        serializer = EmailCodeSerializer(data=data)
        
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['email'], self.valid_email)

    def test_invalid_email_format(self):
        """Test serializer with invalid email format"""
        data = {'email': self.invalid_email}
        serializer = EmailCodeSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_missing_email(self):
        """Test serializer with missing email"""
        data = {}
        serializer = EmailCodeSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_already_registered_email(self):
        """Test serializer with already registered email"""
        # Create user with email
        User.objects.create_user(
            username='testuser',
            email=self.valid_email,
            password='testpass123'
        )
        
        data = {'email': self.valid_email}
        serializer = EmailCodeSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)
        self.assertIn('already registered', str(serializer.errors['email']))


class RegisterSerializerTest(TestCase):
    """Register serializer tests"""

    def setUp(self):
        """Set up test data"""
        self.valid_email = 'register@example.com'
        
        # Create valid verification code
        self.verification_code = EmailVerificationCode.create_code(self.valid_email)
        
        self.valid_data = {
            'username': 'testuser',
            'email': self.valid_email,
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User',
            'organization': 'Test Org',
            'faculty_and_major': 'Computer Science',
            'email_code': self.verification_code.code
        }

    def test_valid_registration_data(self):
        """Test serializer with valid registration data"""
        serializer = RegisterSerializer(data=self.valid_data)
        
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_password_mismatch(self):
        """Test password confirmation mismatch"""
        data = self.valid_data.copy()
        data['password_confirm'] = 'differentpass'
        
        serializer = RegisterSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_duplicate_username(self):
        """Test registration with duplicate username"""
        # Create user with same username
        User.objects.create_user(
            username=self.valid_data['username'],
            email='different@example.com',
            password='testpass123'
        )
        
        serializer = RegisterSerializer(data=self.valid_data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)

    def test_duplicate_email(self):
        """Test registration with duplicate email"""
        # Create user with same email
        User.objects.create_user(
            username='differentuser',
            email=self.valid_data['email'],
            password='testpass123'
        )
        
        serializer = RegisterSerializer(data=self.valid_data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_invalid_email_code(self):
        """Test registration with invalid email code"""
        data = self.valid_data.copy()
        data['email_code'] = '999999'  # Invalid code
        
        serializer = RegisterSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('email_code', serializer.errors)

    def test_expired_email_code(self):
        """Test registration with expired email code"""
        # Make verification code expired
        from django.utils import timezone
        from datetime import timedelta
        
        self.verification_code.created_at = timezone.now() - timedelta(minutes=6)
        self.verification_code.save()
        
        serializer = RegisterSerializer(data=self.valid_data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('email_code', serializer.errors)

    def test_used_email_code(self):
        """Test registration with already used email code"""
        # Mark code as used
        self.verification_code.is_used = True
        self.verification_code.save()
        
        serializer = RegisterSerializer(data=self.valid_data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('email_code', serializer.errors)

    def test_email_code_format_validation(self):
        """Test email code format validation"""
        # Test non-digit code
        data = self.valid_data.copy()
        data['email_code'] = 'abcdef'
        
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email_code', serializer.errors)
        
        # Test wrong length code
        data['email_code'] = '12345'  # 5 digits instead of 6
        
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email_code', serializer.errors)

    def test_missing_required_fields(self):
        """Test serializer with missing required fields"""
        required_fields = ['username', 'email', 'password', 'password_confirm', 'email_code']
        
        for field in required_fields:
            data = self.valid_data.copy()
            del data[field]
            
            serializer = RegisterSerializer(data=data)
            self.assertFalse(serializer.is_valid())
            self.assertIn(field, serializer.errors)

    def test_optional_fields(self):
        """Test serializer with optional fields missing"""
        # Remove optional fields
        minimal_data = {
            'username': 'minimaluser',
            'email': 'minimal@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'email_code': EmailVerificationCode.create_code('minimal@example.com').code
        }
        
        serializer = RegisterSerializer(data=minimal_data)
        
        self.assertTrue(serializer.is_valid())

    def test_password_too_short(self):
        """Test password minimum length validation"""
        data = self.valid_data.copy()
        data['password'] = '12345'  # 5 characters, minimum is 6
        data['password_confirm'] = '12345'
        
        serializer = RegisterSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)

    def test_create_user_success(self):
        """Test successful user creation"""
        serializer = RegisterSerializer(data=self.valid_data)
        
        self.assertTrue(serializer.is_valid())
        
        user = serializer.save()
        
        # Verify user was created
        self.assertEqual(user.username, self.valid_data['username'])
        self.assertEqual(user.email, self.valid_data['email'])
        self.assertEqual(user.first_name, self.valid_data['first_name'])
        self.assertEqual(user.last_name, self.valid_data['last_name'])
        
        # Verify password was set correctly
        self.assertTrue(user.check_password(self.valid_data['password']))
        
        # Verify user profile was updated
        self.assertEqual(user.userprofile.organization, self.valid_data['organization'])
        self.assertEqual(user.userprofile.faculty_and_major, self.valid_data['faculty_and_major'])

    def test_verification_code_marked_used_after_registration(self):
        """Test verification code is marked as used after successful registration"""
        serializer = RegisterSerializer(data=self.valid_data)
        
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        
        # Refresh verification code from database
        self.verification_code.refresh_from_db()
        
        # Verify code is marked as used
        self.assertTrue(self.verification_code.is_used)

    def test_invalid_email_format_in_registration(self):
        """Test registration with invalid email format"""
        data = self.valid_data.copy()
        data['email'] = 'invalid-email-format'
        
        serializer = RegisterSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)