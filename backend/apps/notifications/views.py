# apps/notifications/views.py
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Notification
from .services import EmailInvitationService
from .models import PendingEmailInvitation
from .serializers import (
    NotificationSerializer,
    AcceptInvitationSerializer,
    RejectInvitationSerializer
)

class NotificationListView(generics.ListAPIView):

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):

        Notification.cleanup_expired_notifications()
        
        return Notification.objects.filter(
            recipient=self.request.user
        ).order_by('-created_at')

class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def accept_invitation(request):

    serializer = AcceptInvitationSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': serializer.errors}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    notification_id = serializer.validated_data['notification_id']
    notification = get_object_or_404(
        Notification, 
        id=notification_id, 
        recipient=request.user
    )
    

    if notification.status != 'pending':
        return Response(
            {'error': f'Invitation is {notification.status}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if notification.is_expired:
        notification.mark_as_expired()
        return Response(
            {'error': 'Invitation has expired'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    from apps.team.models import Team, TeamMembership
    
    try:
        team = Team.objects.get(id=notification.data['team_id'])
    except Team.DoesNotExist:
        return Response(
            {'error': 'Team no longer exists'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    existing_membership = TeamMembership.objects.filter(
        user=request.user, 
        team=team
    ).first()
    
    if existing_membership:
        notification.status = 'accepted'
        notification.save()
        return Response(
            {
                'message': 'You are already a member of this team',
                'team_name': team.name,
                'current_role': existing_membership.role
            }, 
            status=status.HTTP_200_OK
        )

    if team.member_count >= team.max_members:
        return Response(
            {
                'error': 'Team is full',
                'current_members': team.member_count,
                'max_members': team.max_members
            }, 
            status=status.HTTP_400_BAD_REQUEST
        )

    new_membership = TeamMembership.objects.create(
        user=request.user,
        team=team,
        role='view' 
    )
    
    notification.status = 'accepted'
    notification.is_read = True
    notification.save()
    
    from apps.team.serializers import TeamMemberSerializer
    
    return Response({
        'message': f'Successfully joined team "{team.name}"',
        'team': {
            'id': team.id,
            'name': team.name,
            'role': new_membership.role
        },
        'member': TeamMemberSerializer(new_membership).data
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_invitation(request):
    serializer = RejectInvitationSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': serializer.errors}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    notification_id = serializer.validated_data['notification_id']
    notification = get_object_or_404(
        Notification, 
        id=notification_id, 
        recipient=request.user
    )

    if notification.status != 'pending':
        return Response(
            {'error': f'Invitation is {notification.status}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    notification.status = 'rejected'
    notification.is_read = True
    notification.save()
    
    team_name = notification.data.get('team_name', 'Unknown Team')
    
    return Response({
        'message': f'Successfully rejected invitation to "{team_name}"'
    }, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def mark_as_read(request, pk):
    notification = get_object_or_404(
        Notification, 
        id=pk, 
        recipient=request.user
    )
    
    notification.is_read = True
    notification.save()
    
    return Response({
        'message': 'Notification marked as read'
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_unread_count(request):
    Notification.cleanup_expired_notifications()
    
    unread_count = Notification.objects.filter(
        recipient=request.user,
        is_read=False,
        status='pending'
    ).count()
    
    return Response({
        'count': unread_count
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([])  
def validate_invitation_token(request):
    """验证邀请令牌（用于注册页面）"""
    token = request.data.get('invitation_token')
    
    if not token:
        return Response(
            {'error': 'Invitation token is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    is_valid, result = EmailInvitationService.validate_invitation_token(token)
    
    if is_valid:
        return Response({
            'valid': True,
            'data': result
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'valid': False,
            'error': result
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def convert_email_invitations(request):
    """用户注册/登录后转换邮件邀请为通知"""
    converted_count = PendingEmailInvitation.convert_to_notifications(request.user)
    
    return Response({
        'message': f'Converted {converted_count} email invitations to notifications',
        'converted_count': converted_count
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def cleanup_notifications(request):
    """手动清理过期通知和邮件邀请"""
    notifications_cleaned = Notification.cleanup_expired_notifications()
    invitations_cleaned = PendingEmailInvitation.cleanup_expired_invitations()
    
    return Response({
        'message': 'Cleanup completed',
        'notifications_deleted': notifications_cleaned,
        'invitations_deleted': invitations_cleaned
    }, status=status.HTTP_200_OK)