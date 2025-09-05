# apps/notifications/serializers.py
from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    """通知序列化器"""
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'data',
            'status',
            'is_read',
            'created_at',
            'expires_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def to_representation(self, instance):
        """自定义序列化输出格式"""
        data = super().to_representation(instance)
        
        # 检查是否过期并更新状态
        if instance.is_expired and instance.status == 'pending':
            instance.mark_as_expired()
            data['status'] = 'expired'
        
        return data

class AcceptInvitationSerializer(serializers.Serializer):
    """接受邀请序列化器"""
    notification_id = serializers.IntegerField()
    
    def validate_notification_id(self, value):
        """验证通知ID是否有效"""
        try:
            notification = Notification.objects.get(id=value)
            if notification.status != 'pending':
                raise serializers.ValidationError('Invitation is no longer pending')
            if notification.is_expired:
                notification.mark_as_expired()
                raise serializers.ValidationError('Invitation has expired')
            return value
        except Notification.DoesNotExist:
            raise serializers.ValidationError('Notification not found')

class RejectInvitationSerializer(serializers.Serializer):
    """拒绝邀请序列化器"""
    notification_id = serializers.IntegerField()
    
    def validate_notification_id(self, value):
        """验证通知ID是否有效"""
        try:
            notification = Notification.objects.get(id=value)
            if notification.status != 'pending':
                raise serializers.ValidationError('Invitation is no longer pending')
            return value
        except Notification.DoesNotExist:
            raise serializers.ValidationError('Notification not found')