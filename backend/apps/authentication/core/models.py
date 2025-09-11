from django.db import models
from django.utils import timezone
from datetime import timedelta
import random
import string

class EmailVerificationCode(models.Model):
    """Email verification code model"""
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'email_verification_codes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.email} - {self.code}"
    
    @classmethod
    def generate_code(cls):
        """Generate 6-digit random verification code"""
        return ''.join(random.choices(string.digits, k=6))
    
    @classmethod
    def create_code(cls, email):
        """Create verification code for specified email"""
        # Delete previous unused codes for this email
        cls.objects.filter(email=email, is_used=False).delete()
        
        # Create new verification code
        code = cls.generate_code()
        return cls.objects.create(email=email, code=code)
    
    def is_expired(self):
        """Check if verification code has expired (5 minute validity)"""
        expiry_time = self.created_at + timedelta(minutes=5)
        return timezone.now() > expiry_time
    
    @classmethod
    def verify_code(cls, email, code):
        """Verify email verification code"""
        try:
            verification = cls.objects.get(
                email=email, 
                code=code, 
                is_used=False
            )
            
            if verification.is_expired():
                return False, "Verification code has expired"
            
            # Mark as used
            verification.is_used = True
            verification.save()
            
            return True, "Verification successful"
            
        except cls.DoesNotExist:
            return False, "Invalid verification code"

class PasswordResetToken(models.Model):
    """Password reset token model"""
    email = models.EmailField()
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'password_reset_tokens'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.email} - {self.token[:20]}..."
    
    @classmethod
    def generate_token(cls):
        """Generate secure random token"""
        import secrets
        return secrets.token_urlsafe(32)
    
    @classmethod
    def create_token(cls, email):
        """Create password reset token for specified email"""
        # Delete previous unused tokens for this email
        cls.objects.filter(email=email, is_used=False).delete()
        
        # Create new reset token
        token = cls.generate_token()
        return cls.objects.create(email=email, token=token)
    
    def is_expired(self):
        """Check if reset token has expired (30 minute validity)"""
        expiry_time = self.created_at + timedelta(minutes=30)
        return timezone.now() > expiry_time
    
    @classmethod
    def verify_and_use_token(cls, email, token):
        """Verify and mark password reset token as used"""
        try:
            reset_token = cls.objects.get(
                email=email, 
                token=token, 
                is_used=False
            )
            
            if reset_token.is_expired():
                return False, "Reset token has expired"
            
            # Mark as used
            reset_token.is_used = True
            reset_token.save()
            
            return True, "Token verified successfully"
            
        except cls.DoesNotExist:
            return False, "Invalid reset token"