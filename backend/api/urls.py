# backend/api/urls.py

from django.urls import path, include
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('info/', views.api_info, name='api_info'),
    
    path('search/', include('apps.search.urls')),
    
    path('analytics/', include('apps.analytics.urls')),
]