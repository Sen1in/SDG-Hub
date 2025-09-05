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
    
    def validate_max_members(self, value):
        """Validate max_members when updating"""
        if value < 1:
            raise serializers.ValidationError("Team capacity must be at least 1.")
        if value > 6:
            raise serializers.ValidationError("Team capacity cannot exceed 6 members.")
        
        # Check if new capacity is not less than current member count
        if self.instance:  # Only check when updating
            if value < self.instance.member_count:
                raise serializers.ValidationError(
                    f"Capacity cannot be less than current member count ({self.instance.member_count})."
                )
        
        return value
    
    def update(self, instance, validated_data):
        """Update team with permission check"""
        request = self.context.get('request')
        
        # If trying to update max_members, check permission
        if 'max_members' in validated_data:
            # Check if user is owner
            membership = TeamMembership.objects.filter(
                user=request.user,
                team=instance,
                role='owner'
            ).first()
            
            if not membership:
                raise serializers.ValidationError({
                    'max_members': 'Only team owner can manage team capacity.'
                })
        
        return super().update(instance, validated_data)

class CreateTeamSerializer(serializers.ModelSerializer):
    """Create team serializer"""
    member_count = serializers.ReadOnlyField()
    role = serializers.SerializerMethodField()
    # Make max_members optional with default value of 2
    max_members = serializers.IntegerField(
        required=False,
        default=2,
        min_value=1,
        max_value=6,
        help_text="Maximum number of members (1-6). Defaults to 2 if not specified."
    )
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'max_members', 'member_count', 'role', 'created_at']
        read_only_fields = ['id', 'member_count', 'created_at']
    
    def validate_name(self, value):
        """Validate team name"""
        if not value or not value.strip():
            raise serializers.ValidationError("Team name is required.")
        
        value = value.strip()
        
        if len(value) < 2:
            raise serializers.ValidationError("Team name must be at least 2 characters.")
        
        if len(value) > 50:
            raise serializers.ValidationError("Team name must be less than 50 characters.")
        
        # Check for duplicate team name for the same user
        request = self.context.get('request')
        if request and request.user:
            existing_teams = Team.objects.filter(
                name=value,
                memberships__user=request.user
            )
            if existing_teams.exists():
                raise serializers.ValidationError("A team with this name already exists.")
        
        return value
    
    def validate_max_members(self, value):
        """Validate max_members is within acceptable range"""
        if value < 1:
            raise serializers.ValidationError("Team must have at least 1 member.")
        if value > 6:
            raise serializers.ValidationError("Team cannot exceed 6 members.")
        return value
    
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
        
        # Ensure max_members has default value if not provided
        if 'max_members' not in validated_data:
            validated_data['max_members'] = 2
        
        team = Team.objects.create(**validated_data)
        
        # Set creator as team owner
        if request and hasattr(request, 'user') and request.user and request.user.is_authenticated:
            TeamMembership.objects.create(
                user=request.user,
                team=team,
                role='owner'
            )
        
        return team