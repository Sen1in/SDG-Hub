from django.urls import path
from . import views
from .views import LikeActionView, ListLikedActionView, LikedActionDetailView

app_name = 'action'

urlpatterns = [
    path('', views.ActionListView.as_view(), name='action-list'),
    path('<int:id>/', views.ActionDetailView.as_view(), name='action-detail'),
    

    path('stats/', views.action_stats, name='action-stats'),
    path('filters/', views.action_filters, name='action-filters'),
    
    path('sdg/<int:sdg_number>/', views.action_by_sdg, name='action-by-sdg'),
    
    path('level/<int:level_number>/', views.action_by_level, name='action-by-level'),
    
    path('like/', LikeActionView.as_view(), name='like-action'),
    path('liked/', ListLikedActionView.as_view(), name='liked-action-list'),  
    path('liked/detail/', LikedActionDetailView.as_view(), name='liked-action-detail'),  
]