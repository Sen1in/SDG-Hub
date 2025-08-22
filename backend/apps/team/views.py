from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from django.contrib.auth.models import User
from .models import Team, TeamMembership
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
    """Invite member to join team - supports username or email"""
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
    if email:
        try:
            user_to_invite = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': f'No user found with email: {email}'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    elif username:
        try:
            user_to_invite = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {'error': f'No user found with username: {username}'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    # Validate user exists and is active
    if not user_to_invite or not user_to_invite.is_active:
        return Response(
            {'error': 'User account is inactive or does not exist'}, 
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
    
    # Create new membership
    new_membership = TeamMembership.objects.create(
        user=user_to_invite,
        team=team,
        role='view'  # New members default to view permission
    )
    
    serializer = TeamMemberSerializer(new_membership)
    return Response({
        'message': f'Successfully invited {user_to_invite.username} to join the team',
        'member': serializer.data
    }, status=status.HTTP_201_CREATED)

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