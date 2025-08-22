# Avatar Upload Related Models
# 
# The avatar functionality currently uses the existing UserProfile model
# located at apps.authentication.profile.models.UserProfile
# 
# The avatar field is defined as:
# avatar = models.URLField(blank=True, null=True)
# 
# No additional models are needed for the avatar upload functionality
# as we store the URL directly in the UserProfile model.

from django.db import models

# Future expansion: If we need to track upload history or metadata
# class AvatarUploadHistory(models.Model):
#     user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
#     avatar_url = models.URLField()
#     uploaded_at = models.DateTimeField(auto_now_add=True)
#     file_size = models.PositiveIntegerField()  # in bytes
#     original_filename = models.CharField(max_length=255)
#     
#     class Meta:
#         ordering = ['-uploaded_at']