from django.urls import path, include
from .core import views as core_views
from .profile import views as profile_views
from .uploads import views as upload_views

app_name = 'authentication'

urlpatterns = [
    path('', include('apps.authentication.core.urls')),
    
    path('', include('apps.authentication.profile.urls')),
    
    path('upload/', include('apps.authentication.uploads.urls')),
]