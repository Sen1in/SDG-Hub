from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from django.contrib.auth.models import User
from .models import Team, TeamMembership
from apps.notifications.models import Notification
from datetime import timedelta
from django.utils import timezone
from .serializers import (
    TeamListSerializer, 
    TeamDetailSerializer, 
    CreateTeamSerializer,
    TeamMemberSerializer
)

class TeamListCreateView(generics.ListCreateAPIView):
    """Team list and creation API"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only teams the current user belongs to"""
        return Team.objects.filter(
            memberships__user=self.request.user
        ).select_related().prefetch_related('memberships')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateTeamSerializer
        return TeamListSerializer

class TeamDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Team detail API"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TeamDetailSerializer
    
    def get_queryset(self):
        """Only allow access to teams the user belongs to"""
        return Team.objects.filter(
            memberships__user=self.request.user
        ).prefetch_related(
            Prefetch(
                'memberships',
                queryset=TeamMembership.objects.select_related('user').order_by('role', '-joined_at')
            )
        )
    
    def destroy(self, request, *args, **kwargs):
        """Only team owner can delete the team"""
        team = self.get_object()
        membership = TeamMembership.objects.filter(
            user=request.user, 
            team=team,
            role='owner'
        ).first()
        
        if not membership:
            return Response(
                {'error': 'Only team owner can delete the team'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def leave_team(request, team_id):
    """Leave team"""
    team = get_object_or_404(Team, id=team_id)
    membership = TeamMembership.objects.filter(
        user=request.user, 
        team=team
    ).first()
    
    if not membership:
        return Response(
            {'error': 'You are not a member of this team'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if membership.role == 'owner':
        # Check if there are other members
        other_members = TeamMembership.objects.filter(team=team).exclude(user=request.user)
        if other_members.exists():
            return Response(
                {'error': 'Owner cannot leave team with other members. Transfer ownership or delete team instead.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        else:
            # If sole member, delete entire team
            team.delete()
    else:
        # Regular member leaves directly
        membership.delete()
    
    return Response({'message': 'Successfully left the team'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def invite_member(request, team_id):
    """Invite member to join team - supports username or email, handles unregistered users"""
    team = get_object_or_404(Team, id=team_id)
    
    # Check permissions (only owner and editors can invite)
    membership = TeamMembership.objects.filter(
        user=request.user, 
        team=team,
        role__in=['owner', 'edit']
    ).first()
    
    if not membership:
        return Response(
            {'error': 'Only team owner or edit member can invite members'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get invitation parameters - supports username or email
    username = request.data.get('username')
    email = request.data.get('email')
    
    if not username and not email:
        return Response(
            {'error': 'Username or email is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Find user - prioritize email, then username
    user_to_invite = None
    invited_by_email = False
    invited_identifier = ''
    
    if email:
        try:
            user_to_invite = User.objects.get(email=email)
            invited_by_email = True
            invited_identifier = email
        except User.DoesNotExist:
            # 用户不存在，发送邮件邀请
            from apps.notifications.services import EmailInvitationService
            from apps.notifications.models import PendingEmailInvitation
            
            # 检查是否已有待处理的邮件邀请
            existing_email_invitation = PendingEmailInvitation.objects.filter(
                email=email,
                team_id=str(team.id),
                status='pending'
            ).first()
            
            if existing_email_invitation:
                return Response(
                    {
                        'error': f'An invitation has already been sent to {email}',
                        'invitation_id': existing_email_invitation.id
                    }, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 检查团队是否已满
            if team.member_count >= team.max_members:
                return Response(
                    {
                        'error': 'Team is full',
                        'current_members': team.member_count,
                        'max_members': team.max_members
                    }, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 创建邮件邀请
            invitation = EmailInvitationService.create_email_invitation(
                email=email,
                team_id=team.id,
                team_name=team.name,
                inviter_username=request.user.username,
                inviter_email=request.user.email,
                invited_identifier=email
            )
            
            # 发送邮件
            email_sent = EmailInvitationService.send_invitation_email(invitation)
            
            if email_sent:
                return Response({
                    'message': f'Invitation email sent to {email}. They will receive a team invitation after registering.',
                    'invitation': {
                        'id': str(invitation.id),
                        'email': email,
                        'team_name': team.name,
                        'expires_at': invitation.expires_at.isoformat(),
                        'email_sent': True
                    }
                }, status=status.HTTP_201_CREATED)
            else:
                return Response(
                    {'error': 'Failed to send invitation email. Please try again later.'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
    elif username:
        try:
            user_to_invite = User.objects.get(username=username)
            invited_by_email = False
            invited_identifier = username
        except User.DoesNotExist:
            return Response(
                {'error': f'No user found with username: {username}. Username invitations require existing users.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    # 如果找到了用户，继续正常的邀请流程
    if user_to_invite:
        # Validate user exists and is active
        if not user_to_invite.is_active:
            return Response(
                {'error': 'User account is inactive'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user is already a team member
        existing_membership = TeamMembership.objects.filter(
            user=user_to_invite, 
            team=team
        ).first()
        
        if existing_membership:
            return Response(
                {
                    'error': f'User {user_to_invite.username} is already a member of this team',
                    'current_role': existing_membership.role
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if team is full
        if team.member_count >= team.max_members:
            return Response(
                {
                    'error': 'Team is full',
                    'current_members': team.member_count,
                    'max_members': team.max_members
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if there's already a pending invitation for this user to this team
        from apps.notifications.models import Notification
        existing_invitation = Notification.objects.filter(
            recipient=user_to_invite,
            notification_type='team_invitation',
            status='pending',
            data__team_id=str(team.id)
        ).first()
        
        if existing_invitation:
            return Response(
                {
                    'error': f'User {user_to_invite.username} already has a pending invitation to this team',
                    'invitation_id': existing_invitation.id
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create notification instead of direct membership
        from datetime import timedelta
        from django.utils import timezone
        
        expires_at = timezone.now() + timedelta(days=7)
        
        notification = Notification.objects.create(
            recipient=user_to_invite,
            notification_type='team_invitation',
            data={
                'team_id': str(team.id),
                'team_name': team.name,
                'inviter_username': request.user.username,
                'inviter_email': request.user.email,
                'invited_by_email': invited_by_email,
                'invited_identifier': invited_identifier,
            },
            expires_at=expires_at,
            status='pending'
        )
        
        return Response({
            'message': f'Successfully sent invitation to {user_to_invite.username}',
            'notification': {
                'id': str(notification.id),
                'recipient': user_to_invite.username,
                'team_name': team.name,
                'expires_at': expires_at.isoformat(),
                'status': 'pending'
            }
        }, status=status.HTTP_201_CREATED)
    
    # 这里不应该到达
    return Response(
        {'error': 'Unexpected error occurred'}, 
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def check_user_exists(request):
    """Check if user exists (for frontend validation)"""
    email = request.data.get('email')
    username = request.data.get('username')
    
    if not email and not username:
        return Response(
            {'error': 'Email or username is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = None
    if email:
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'exists': False, 'message': f'No user found with email: {email}'}, 
                status=status.HTTP_200_OK
            )
    elif username:
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {'exists': False, 'message': f'No user found with username: {username}'}, 
                status=status.HTTP_200_OK
            )
    
    if user and user.is_active:
        return Response({
            'exists': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        }, status=status.HTTP_200_OK)
    else:
        return Response(
            {'exists': False, 'message': 'User account is inactive'}, 
            status=status.HTTP_200_OK
        )

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_member_role(request, team_id, member_id):
    """Update team member role - only team owner can perform this action"""
    team = get_object_or_404(Team, id=team_id)
    
    # Check if current user is team owner
    current_membership = TeamMembership.objects.filter(
        user=request.user, 
        team=team,
        role='owner'
    ).first()
    
    if not current_membership:
        return Response(
            {'error': 'Only team owner can update member roles'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get target member to update
    target_membership = TeamMembership.objects.filter(
        id=member_id,
        team=team
    ).first()
    
    if not target_membership:
        return Response(
            {'error': 'Member not found in this team'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Cannot modify own role
    if target_membership.user == request.user:
        return Response(
            {'error': 'Cannot modify your own role'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get new role
    new_role = request.data.get('role')
    if not new_role or new_role not in ['owner', 'edit', 'view']:
        return Response(
            {'error': 'Valid role is required (owner, edit, view)'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # If setting as owner, confirm operation
    if new_role == 'owner':
        # Demote current owner to editor (handled in model's save method)
        target_membership.role = new_role
        target_membership.save()
        
        return Response({
            'message': f'Successfully transferred ownership to {target_membership.user.username}',
            'member': TeamMemberSerializer(target_membership).data
        }, status=status.HTTP_200_OK)
    else:
        # Regular role update
        target_membership.role = new_role
        target_membership.save()
        
        return Response({
            'message': f'Successfully updated {target_membership.user.username} role to {new_role}',
            'member': TeamMemberSerializer(target_membership).data
        }, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_member(request, team_id, member_id):
    """Remove team member - only team owner can perform this action"""
    team = get_object_or_404(Team, id=team_id)
    
    # Check if current user is team owner
    current_membership = TeamMembership.objects.filter(
        user=request.user, 
        team=team,
        role='owner'
    ).first()
    
    if not current_membership:
        return Response(
            {'error': 'Only team owner can remove members'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get target member to remove
    target_membership = TeamMembership.objects.filter(
        id=member_id,
        team=team
    ).first()
    
    if not target_membership:
        return Response(
            {'error': 'Member not found in this team'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Cannot remove self
    if target_membership.user == request.user:
        return Response(
            {'error': 'Cannot remove yourself from the team'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Cannot remove other owners (shouldn't exist in theory, but safety check)
    if target_membership.role == 'owner':
        return Response(
            {'error': 'Cannot remove team owner'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Save username for return message
    removed_username = target_membership.user.username
    
    # Delete membership
    target_membership.delete()
    
    return Response({
        'message': f'Successfully removed {removed_username} from the team'
    }, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_team_capacity(request, team_id):
    """Update team capacity - only team owner can perform this action"""
    team = get_object_or_404(Team, id=team_id)
    
    # Check if current user is team owner
    membership = TeamMembership.objects.filter(
        user=request.user, 
        team=team,
        role='owner'
    ).first()
    
    if not membership:
        return Response(
            {'error': 'Only team owner can manage team capacity'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get new capacity
    new_capacity = request.data.get('max_members')
    
    if new_capacity is None:
        return Response(
            {'error': 'max_members is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        new_capacity = int(new_capacity)
    except (TypeError, ValueError):
        return Response(
            {'error': 'max_members must be a valid number'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate capacity range (1-6)
    if new_capacity < 1:
        return Response(
            {'error': 'Capacity must be at least 1'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if new_capacity > 6:
        return Response(
            {'error': 'Capacity cannot exceed 6 members'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if new capacity is not less than current member count
    if new_capacity < team.member_count:
        return Response(
            {
                'error': f'Capacity cannot be less than current member count ({team.member_count})',
                'current_members': team.member_count,
                'requested_capacity': new_capacity
            }, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # No need to update if capacity hasn't changed
    if new_capacity == team.max_members:
        return Response({
            'message': 'Team capacity unchanged',
            'max_members': team.max_members
        }, status=status.HTTP_200_OK)
    
    # Update team capacity
    team.max_members = new_capacity
    team.save()
    
    # Return updated team info
    serializer = TeamDetailSerializer(team, context={'request': request})
    
    return Response({
        'message': f'Successfully updated team capacity to {new_capacity}',
        'team': serializer.data
    }, status=status.HTTP_200_OK)