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