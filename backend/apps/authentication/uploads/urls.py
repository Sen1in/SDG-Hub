from django.urls import path
from . import views
from .views import AvatarUploadView

urlpatterns = [
    # Avatar upload API (using class-based view)
    path('avatar/', AvatarUploadView.as_view(), name='upload_avatar'),
]
