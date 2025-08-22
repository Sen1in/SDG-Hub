from django.urls import path
from . import views
from .views import LikeEducationView, ListLikedEducationView, LikedEducationDetailView

app_name = 'education'

urlpatterns = [
    # Main API endpoints
    path('', views.EducationListView.as_view(), name='education-list'),
    path('<int:id>/', views.EducationDetailView.as_view(), name='education-detail'),
    
    # Statistics and filtering
    path('stats/', views.education_stats, name='education-stats'),
    path('filters/', views.education_filters, name='education-filters'),
    
    # Query by SDG
    path('sdg/<int:sdg_number>/', views.education_by_sdg, name='education-by-sdg'),

    path('like/', LikeEducationView.as_view(), name='like-education'),
    path('liked/', ListLikedEducationView.as_view(), name='liked-education-list'),
    path('liked/detail/', LikedEducationDetailView.as_view(), name='liked-education-detail'),
]