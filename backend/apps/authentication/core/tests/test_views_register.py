from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
from apps.authentication.core.models import EmailVerificationCode


class SendEmailCodeViewTest(TestCase):
    """Send email code view tests for registration"""

    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.send_code_url = reverse('send_email_code')
        self.valid_email = 'test@example.com'

    def test_send_email_code_success(self):
        """Test successful email code sending"""
        with patch('apps.authentication.core.utils.send_verification_email') as mock_send:
            mock_send.return_value = (True, 'Email sent successfully')
            
            data = {'email': self.valid_email}
            response = self.client.post(self.send_code_url, data)
            
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn('Verification code sent successfully', response.data['message'])
            self.assertEqual(response.data['email'], self.valid_email)
            
            # Verify verification code was created
            self.assertTrue(
                EmailVerificationCode.objects.filter(email=self.valid_email).exists()
            )

    def test_send_email_code_invalid_email(self):
        """Test sending code with invalid email format"""
        data = {'email': 'invalid-email'}
        response = self.client.post(self.send_code_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_send_email_code_already_registered(self):
        """Test sending code to already registered email"""
        # Create user with email
        User.objects.create_user(
            username='testuser',
            email=self.valid_email,
            password='testpass123'
        )
        
        data = {'email': self.valid_email}
        response = self.client.post(self.send_code_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already registered', str(response.data))

    def test_send_email_code_rate_limiting(self):
        """Test rate limiting for email code sending"""
        with patch('apps.authentication.core.utils.send_verification_email') as mock_send:
            mock_send.return_value = (True, 'Email sent successfully')
            
            data = {'email': self.valid_email}
            
            # Send first code
            response1 = self.client.post(self.send_code_url, data)
            self.assertEqual(response1.status_code, status.HTTP_200_OK)
            
            # Try to send another code immediately
            response2 = self.client.post(self.send_code_url, data)
            self.assertEqual(response2.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
            self.assertIn('wait at least 1 minute', response2.data['error'])

    def test_send_email_code_missing_email(self):
        """Test sending code without email field"""
        data = {}
        response = self.client.post(self.send_code_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_send_email_code_empty_email(self):
        """Test sending code with empty email"""
        data = {'email': ''}
        response = self.client.post(self.send_code_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_send_email_code_with_valid_email_creates_code(self):
        """Test that sending email code creates verification code in database"""
        with patch('apps.authentication.core.views.send_verification_email') as mock_send:
            mock_send.return_value = (True, 'Email sent successfully')
            
            data = {'email': self.valid_email}
            response = self.client.post(self.send_code_url, data)
            
            # Verify response is successful
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            
            # Verify verification code was created
            verification_code = EmailVerificationCode.objects.filter(email=self.valid_email).first()
            self.assertIsNotNone(verification_code)
            self.assertEqual(len(verification_code.code), 6)
            self.assertTrue(verification_code.code.isdigit())
            self.assertFalse(verification_code.is_used)

    def test_send_email_code_replaces_old_codes(self):
        """Test that new email code replaces old unused codes"""
        with patch('apps.authentication.core.views.send_verification_email') as mock_send:
            mock_send.return_value = (True, 'Email sent successfully')
            
            data = {'email': self.valid_email}
            
            # Send first code
            response1 = self.client.post(self.send_code_url, data)
            self.assertEqual(response1.status_code, status.HTTP_200_OK)
            first_code = EmailVerificationCode.objects.get(email=self.valid_email).code
            
            # Manually create a second code to test replacement logic
            # This simulates the rate limiting bypass scenario
            EmailVerificationCode.create_code(self.valid_email)
            
            # Verify only one code exists and it's different from the first
            codes = EmailVerificationCode.objects.filter(email=self.valid_email)
            self.assertEqual(codes.count(), 1)
            current_code = codes.first().code
            self.assertNotEqual(current_code, first_code)


class RegisterViewTest(TestCase):
    """Register view tests"""

    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.register_url = reverse('register')
        self.valid_email = 'register@example.com'
        
        # Create valid verification code
        self.verification_code = EmailVerificationCode.create_code(self.valid_email)
        
        self.valid_registration_data = {
            'username': 'testuser',
            'email': self.valid_email,
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User',
            'organization': 'Test Organization',
            'faculty_and_major': 'Computer Science',
            'email_code': self.verification_code.code
        }

    @patch('apps.authentication.core.serializers.User.userprofile')
    def test_register_success(self, mock_userprofile):
        """Test successful user registration"""
        # Mock userprofile to avoid relation issues
        mock_profile = mock_userprofile
        mock_profile.organization = ''
        mock_profile.faculty_and_major = ''
        
        response = self.client.post(self.register_url, self.valid_registration_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('User created successfully', response.data['message'])
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        
        # Verify tokens structure
        tokens = response.data['tokens']
        self.assertIn('access', tokens)
        self.assertIn('refresh', tokens)
        
        # Verify user was created
        user = User.objects.get(username=self.valid_registration_data['username'])
        self.assertEqual(user.email, self.valid_registration_data['email'])
        self.assertEqual(user.first_name, self.valid_registration_data['first_name'])
        self.assertEqual(user.last_name, self.valid_registration_data['last_name'])

    def test_register_invalid_data(self):
        """Test registration with invalid data"""
        invalid_data = self.valid_registration_data.copy()
        invalid_data['password_confirm'] = 'differentpassword'
        
        response = self.client.post(self.register_url, invalid_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)

    def test_register_duplicate_username(self):
        """Test registration with duplicate username"""
        # Create existing user
        User.objects.create_user(
            username=self.valid_registration_data['username'],
            email='different@example.com',
            password='testpass123'
        )
        
        response = self.client.post(self.register_url, self.valid_registration_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_register_invalid_verification_code(self):
        """Test registration with invalid verification code"""
        invalid_data = self.valid_registration_data.copy()
        invalid_data['email_code'] = '999999'
        
        response = self.client.post(self.register_url, invalid_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email_code', response.data)

    def test_register_expired_verification_code(self):
        """Test registration with expired verification code"""
        # Make verification code expired
        self.verification_code.created_at = timezone.now() - timedelta(minutes=6)
        self.verification_code.save()
        
        response = self.client.post(self.register_url, self.valid_registration_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email_code', response.data)

    def test_register_missing_email_code(self):
        """Test registration without email verification code"""
        invalid_data = self.valid_registration_data.copy()
        del invalid_data['email_code']
        
        response = self.client.post(self.register_url, invalid_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email_code', response.data)

    def test_register_invalid_email_format(self):
        """Test registration with invalid email format"""
        invalid_data = self.valid_registration_data.copy()
        invalid_data['email'] = 'invalid-email'
        
        response = self.client.post(self.register_url, invalid_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_register_short_password(self):
        """Test registration with password too short"""
        invalid_data = self.valid_registration_data.copy()
        invalid_data['password'] = '123'
        invalid_data['password_confirm'] = '123'
        
        response = self.client.post(self.register_url, invalid_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)