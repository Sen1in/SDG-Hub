# apps/notifications/serializers.py
from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    
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
        data = super().to_representation(instance)
        
        if instance.is_expired and instance.status == 'pending':
            instance.mark_as_expired()
            data['status'] = 'expired'
        
        return data

class AcceptInvitationSerializer(serializers.Serializer):
    notification_id = serializers.IntegerField()
    
    def validate_notification_id(self, value):
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
    notification_id = serializers.IntegerField()
    
    def validate_notification_id(self, value):
        try:
            notification = Notification.objects.get(id=value)
            if notification.status != 'pending':
                raise serializers.ValidationError('Invitation is no longer pending')
            return value
        except Notification.DoesNotExist:
            raise serializers.ValidationError('Notification not found')