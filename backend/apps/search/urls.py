from django.urls import path
from .views import unified_search, instant_search, spell_check

urlpatterns = [
    path('', unified_search),  # to /api/search/
    path('instant/', instant_search),  # to /api/search/instant/
    path('spell/', spell_check),  # to /api/search/spell/
]
