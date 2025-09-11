from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    """
    Extended user information - Similar to the main site structure but stored independently
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='userprofile'  # Note: different from the main site's 'profile'
    )
    organization = models.CharField(max_length=255, blank=True, null=True)
    faculty_and_major = models.CharField(max_length=255, blank=True, null=True)
    
    # Additional fields (if needed)
    avatar = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    gender = models.CharField(max_length=50, blank=True, null=True)
    language = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = models.URLField(blank=True, null=True)
    positions = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'auth_userprofile'  # Different table name to avoid conflicts
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.username}'s Profile"

# Automatically create UserProfile when a User is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'userprofile'):
        instance.userprofile.save()
