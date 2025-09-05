# apps/notifications/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    
    path('accept/', views.accept_invitation, name='accept-invitation'),
    
    path('reject/', views.reject_invitation, name='reject-invitation'),
    
    path('<int:pk>/read/', views.mark_as_read, name='mark-as-read'),
    
    path('<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    
    path('unread-count/', views.get_unread_count, name='unread-count'),
]