from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('refresh/', views.refresh_token, name='refresh_token'),
    path('send-email-code/', views.send_email_code, name='send_email_code'), 
    path('send-reset-code/', views.send_reset_code, name='send_reset_code'), 
    path('verify-reset-code/', views.verify_reset_code, name='verify_reset_code'),
    path('reset-password/', views.reset_password, name='reset_password'),
]