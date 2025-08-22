from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import os
import uuid
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile


class AvatarUploadView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Upload user avatar
        Supports JPG/PNG formats, maximum 2MB
        """
        file = request.FILES.get('avatar')
        if not file:
            return Response(
                {"error": "No file provided."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file size (2MB = 2 * 1024 * 1024 bytes)
        if file.size > 2 * 1024 * 1024:
            return Response(
                {"error": "File size exceeds 2MB limit."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file format
        allowed_extensions = ['.jpg', '.jpeg', '.png']
        file_extension = os.path.splitext(file.name)[1].lower()
        if file_extension not in allowed_extensions:
            return Response(
                {"error": "Only JPG and PNG files are allowed."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Generate unique filename to avoid conflicts
            filename = f"{uuid.uuid4()}{file_extension}"
            avatar_path = f"avatars/{filename}"
            
            # Ensure avatars directory exists
            avatars_dir = os.path.join(settings.MEDIA_ROOT, 'avatars')
            os.makedirs(avatars_dir, exist_ok=True)
            
            # Save file
            saved_path = default_storage.save(avatar_path, ContentFile(file.read()))
            
            # Generate access URL
            avatar_url = f"{settings.MEDIA_URL}{saved_path}"
            
            
            try:
                user_profile = request.user.userprofile
            except AttributeError:
                
                from apps.authentication.profile.models import UserProfile
                user_profile = UserProfile.objects.create(user=request.user)
                print(f"Created new UserProfile for user {request.user.username}")
            
            # If user had a previous avatar, delete the old avatar file
            if user_profile.avatar and user_profile.avatar != avatar_url:
                old_avatar_path = user_profile.avatar.replace(settings.MEDIA_URL, '')
                if default_storage.exists(old_avatar_path):
                    default_storage.delete(old_avatar_path)
            
            # Update avatar URL
            user_profile.avatar = avatar_url
            user_profile.save()
            
            return Response({
                "message": "Avatar uploaded successfully",
                "avatar_url": avatar_url
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Upload failed: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Backward compatible function-based view
def upload_avatar(request):
    """Backward compatible function-based view"""
    view = AvatarUploadView.as_view()
    return view(request)