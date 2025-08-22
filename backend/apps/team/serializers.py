from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Team, TeamMembership

class TeamMemberSerializer(serializers.ModelSerializer):
    """Team member serializer"""
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = TeamMembership
        fields = ['id', 'username', 'email', 'role', 'joined_at', 'last_active']
        read_only_fields = ['id', 'joined_at', 'last_active']

class TeamListSerializer(serializers.ModelSerializer):
    """Team list serializer for list display"""
    member_count = serializers.ReadOnlyField()
    role = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'member_count', 'max_members', 'created_at', 'role']
        read_only_fields = ['id', 'member_count', 'created_at']
    
    def get_role(self, obj):
        """Get current user's role in this team"""
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user and request.user.is_authenticated:
            membership = TeamMembership.objects.filter(
                user=request.user, 
                team=obj
            ).first()
            return membership.role if membership else None
        return None

class TeamDetailSerializer(serializers.ModelSerializer):
    """Team detail serializer"""
    member_count = serializers.ReadOnlyField()
    role = serializers.SerializerMethodField()
    members = TeamMemberSerializer(source='memberships', many=True, read_only=True)
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'member_count', 'max_members', 'created_at', 'role', 'members']
        read_only_fields = ['id', 'member_count', 'created_at']
    
    def get_role(self, obj):
        """Get current user's role in this team"""
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user and request.user.is_authenticated:
            membership = TeamMembership.objects.filter(
                user=request.user, 
                team=obj
            ).first()
            return membership.role if membership else None
        return None

class CreateTeamSerializer(serializers.ModelSerializer):
    """Create team serializer"""
    member_count = serializers.ReadOnlyField()  # Add member count
    role = serializers.SerializerMethodField()   # Add role information
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'max_members', 'member_count', 'role', 'created_at']  # Include all necessary fields
        read_only_fields = ['id', 'member_count', 'created_at']
    
    def get_role(self, obj):
        """Get current user's role in this team"""
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user and request.user.is_authenticated:
            membership = TeamMembership.objects.filter(
                user=request.user, 
                team=obj
            ).first()
            return membership.role if membership else None
        return None
    
    def create(self, validated_data):
        """Create team and set creator as owner"""
        request = self.context.get('request')
        team = Team.objects.create(**validated_data)
        
        # Set creator as team owner
        if request and hasattr(request, 'user') and request.user and request.user.is_authenticated:
            TeamMembership.objects.create(
                user=request.user,
                team=team,
                role='owner'
            )
        
        return team