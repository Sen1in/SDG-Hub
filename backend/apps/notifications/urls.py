# apps/notifications/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # 获取通知列表
    path('', views.NotificationListView.as_view(), name='notification-list'),
    
    # 接受团队邀请
    path('accept/', views.accept_invitation, name='accept-invitation'),
    
    # 拒绝团队邀请
    path('reject/', views.reject_invitation, name='reject-invitation'),
    
    # 标记通知为已读
    path('<int:pk>/read/', views.mark_as_read, name='mark-as-read'),
    
    # 通知详情（包含删除功能）
    path('<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    
    # 获取未读通知数量
    path('unread-count/', views.get_unread_count, name='unread-count'),
    
    # 邮件邀请相关API
    path('validate-token/', views.validate_invitation_token, name='validate-invitation-token'),
    path('convert-invitations/', views.convert_email_invitations, name='convert-email-invitations'),
    
    # 清理过期数据
    path('cleanup/', views.cleanup_notifications, name='cleanup-notifications'),
]