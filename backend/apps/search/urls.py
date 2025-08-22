from django.urls import path
from .views import unified_search

urlpatterns = [
    path('', unified_search),  # to /api/search/
]
