from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from apps.authentication.core.models import EmailVerificationCode


class EmailVerificationCodeModelTest(TestCase):
    """Email verification code model tests"""

    def setUp(self):
        """Set up test data"""
        self.test_email = 'test@example.com'

    def test_create_verification_code(self):
        """Test creating verification code"""
        code_obj = EmailVerificationCode.create_code(self.test_email)
        
        self.assertEqual(code_obj.email, self.test_email)
        self.assertEqual(len(code_obj.code), 6)
        self.assertTrue(code_obj.code.isdigit())
        self.assertFalse(code_obj.is_used)
        self.assertIsNotNone(code_obj.created_at)

    def test_generate_code_format(self):
        """Test generated code format"""
        code = EmailVerificationCode.generate_code()
        
        self.assertEqual(len(code), 6)
        self.assertTrue(code.isdigit())

    def test_create_code_removes_old_codes(self):
        """Test creating new code removes old unused codes"""
        # Create first code
        first_code = EmailVerificationCode.create_code(self.test_email)
        first_code_value = first_code.code
        
        # Create second code
        second_code = EmailVerificationCode.create_code(self.test_email)
        
        # Verify old code is deleted
        self.assertFalse(
            EmailVerificationCode.objects.filter(
                email=self.test_email,
                code=first_code_value
            ).exists()
        )
        
        # Verify new code exists
        self.assertTrue(
            EmailVerificationCode.objects.filter(
                email=self.test_email,
                code=second_code.code,
                is_used=False
            ).exists()
        )

    def test_is_expired_false_when_fresh(self):
        """Test code is not expired when fresh"""
        code_obj = EmailVerificationCode.create_code(self.test_email)
        
        self.assertFalse(code_obj.is_expired())

    def test_is_expired_true_when_old(self):
        """Test code is expired when old"""
        code_obj = EmailVerificationCode.create_code(self.test_email)
        
        # Manually set created_at to 6 minutes ago
        code_obj.created_at = timezone.now() - timedelta(minutes=6)
        code_obj.save()
        
        self.assertTrue(code_obj.is_expired())

    def test_verify_code_success(self):
        """Test successful code verification"""
        code_obj = EmailVerificationCode.create_code(self.test_email)
        
        is_valid, message = EmailVerificationCode.verify_code(
            self.test_email, 
            code_obj.code
        )
        
        self.assertTrue(is_valid)
        self.assertEqual(message, "Verification successful")
        
        # Verify code is marked as used
        code_obj.refresh_from_db()
        self.assertTrue(code_obj.is_used)

    def test_verify_code_invalid_code(self):
        """Test verification with invalid code"""
        EmailVerificationCode.create_code(self.test_email)
        
        is_valid, message = EmailVerificationCode.verify_code(
            self.test_email, 
            '999999'
        )
        
        self.assertFalse(is_valid)
        self.assertEqual(message, "Invalid verification code")

    def test_verify_code_expired(self):
        """Test verification with expired code"""
        code_obj = EmailVerificationCode.create_code(self.test_email)
        
        # Make code expired
        code_obj.created_at = timezone.now() - timedelta(minutes=6)
        code_obj.save()
        
        is_valid, message = EmailVerificationCode.verify_code(
            self.test_email, 
            code_obj.code
        )
        
        self.assertFalse(is_valid)
        self.assertEqual(message, "Verification code has expired")

    def test_verify_code_already_used(self):
        """Test verification with already used code"""
        code_obj = EmailVerificationCode.create_code(self.test_email)
        code_obj.is_used = True
        code_obj.save()
        
        is_valid, message = EmailVerificationCode.verify_code(
            self.test_email, 
            code_obj.code
        )
        
        self.assertFalse(is_valid)
        self.assertEqual(message, "Invalid verification code")

    def test_verify_code_wrong_email(self):
        """Test verification with wrong email"""
        code_obj = EmailVerificationCode.create_code(self.test_email)
        
        is_valid, message = EmailVerificationCode.verify_code(
            'wrong@example.com', 
            code_obj.code
        )
        
        self.assertFalse(is_valid)
        self.assertEqual(message, "Invalid verification code")

    def test_model_str_method(self):
        """Test model string representation"""
        code_obj = EmailVerificationCode.create_code(self.test_email)
        expected_str = f"{self.test_email} - {code_obj.code}"
        
        self.assertEqual(str(code_obj), expected_str)

    def test_model_ordering(self):
        """Test model ordering by created_at descending"""
        # Create two codes with different emails
        code1 = EmailVerificationCode.create_code('first@example.com')
        code2 = EmailVerificationCode.create_code('second@example.com')
        
        # Get all codes
        codes = EmailVerificationCode.objects.all()
        
        # Verify ordering (newest first)
        self.assertEqual(codes[0], code2)
        self.assertEqual(codes[1], code1)

    def test_multiple_emails_independent(self):
        """Test codes for different emails are independent"""
        email1 = 'user1@example.com'
        email2 = 'user2@example.com'
        
        code1 = EmailVerificationCode.create_code(email1)
        code2 = EmailVerificationCode.create_code(email2)
        
        # Verify both codes exist
        self.assertTrue(
            EmailVerificationCode.objects.filter(
                email=email1, 
                code=code1.code
            ).exists()
        )
        self.assertTrue(
            EmailVerificationCode.objects.filter(
                email=email2, 
                code=code2.code
            ).exists()
        )
        
        # Verify codes are different
        self.assertNotEqual(code1.code, code2.code)