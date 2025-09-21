from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Form, FormContent, FormEditSession, FormEditHistory

class FormListSerializer(serializers.ModelSerializer):
    """Form list serializer"""
    response_count = serializers.ReadOnlyField()
    permission = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    last_modified_by_username = serializers.CharField(source='last_modified_by.username', read_only=True)
    
    class Meta:
        model = Form
        fields = [
            'id', 'title', 'description', 'type', 'status',
            'response_count', 'permission', 'is_template',
            'allow_anonymous', 'allow_multiple_submissions', 'require_login', 'is_public',
            'deadline', 'max_responses',
            'created_by_username', 'last_modified_by_username',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'response_count', 'created_at', 'updated_at']
    
    def get_permission(self, obj):
        """Obtain the current user's permissions for the form"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.get_user_permission(request.user)
        return None

class FormDetailSerializer(serializers.ModelSerializer):
    """Form details serializer"""
    response_count = serializers.ReadOnlyField()
    permission = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    last_modified_by_username = serializers.CharField(source='last_modified_by.username', read_only=True)
    team_name = serializers.CharField(source='team.name', read_only=True)
    
    class Meta:
        model = Form
        fields = [
            'id', 'title', 'description', 'type', 'status',
            'response_count', 'permission', 'is_template',
            'allow_anonymous', 'allow_multiple_submissions', 'require_login', 'is_public',
            'deadline', 'max_responses',
            'team_name', 'created_by_username', 'last_modified_by_username',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'response_count', 'created_at', 'updated_at', 'team_name']
    
    def get_permission(self, obj):
        """Obtain the current user's permissions for the form"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.get_user_permission(request.user)
        return None

class CreateFormSerializer(serializers.ModelSerializer):
    """Create Form Serializer"""
    response_count = serializers.ReadOnlyField()
    permission = serializers.SerializerMethodField()
    
    class Meta:
        model = Form
        fields = [
            'id', 'title', 'description', 'type', 'status',
            'response_count', 'permission', 'is_template',
            'allow_anonymous', 'allow_multiple_submissions', 'require_login', 'is_public',
            'deadline', 'max_responses',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'response_count', 'created_at', 'updated_at']
    
    def get_permission(self, obj):
        """Obtain the current user's permissions for the form"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.get_user_permission(request.user)
        return None
    
    def create(self, validated_data):
        """Create a form"""
        request = self.context.get('request')
        team_id = self.context.get('team_id')
        
        # Set the creator and the team
        validated_data['created_by'] = request.user
        validated_data['last_modified_by'] = request.user
        validated_data['team_id'] = team_id
        
        return super().create(validated_data)

class FormContentSerializer(serializers.ModelSerializer):
    """Form content serializer"""
    form_type = serializers.CharField(source='form.type', read_only=True)
    form_status = serializers.CharField(source='form.status', read_only=True)
    
    class Meta:
        model = FormContent
        fields = '__all__'
        read_only_fields = ['version', 'created_at', 'updated_at']
    
    def get_editable_fields(self, form_type):
        """Return editable fields based on the form type"""
        common_fields = ['title', 'description', 'location', 'organization', 'year', 'sdgs_related', 'source', 'link']
        
        if form_type == 'education':
            return common_fields + [
                'aims', 'learning_outcomes', 'type_label', 
                'related_discipline', 'useful_industries'
            ]
        elif form_type == 'action':
            return common_fields + [
                'actions', 'action_detail', 'level', 'individual_organization',
                'related_industry', 'digital_actions',
                'source_descriptions', 'award', 'source_links', 
                'additional_notes', 'award_descriptions'
            ]
        elif form_type == 'blank':
            return ['title', 'description', 'free_content']
        return common_fields

class FormEditSessionSerializer(serializers.ModelSerializer):
    """Editor Conversation Serializer"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = FormEditSession
        fields = ['id', 'user_name', 'user_avatar', 'field_name', 'cursor_position',
                 'selection_start', 'selection_end', 'last_activity']
    
    def get_user_avatar(self, obj):
        # Return the user's profile picture URL or generate a default profile picture
        return f"https://ui-avatars.com/api/?name={obj.user.username}&background=random"

class FormEditHistorySerializer(serializers.ModelSerializer):
    """Editor History Serializer"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = FormEditHistory
        fields = ['id', 'user_name', 'field_name', 'old_value', 'new_value',
                 'change_type', 'timestamp', 'version']
        
class CreatePersonalFormSerializer(serializers.ModelSerializer):
    """Create Personal Form Serializer"""
    response_count = serializers.ReadOnlyField()
    permission = serializers.SerializerMethodField()
    
    class Meta:
        model = Form
        fields = [
            'id', 'title', 'description', 'type', 'status',
            'response_count', 'permission', 'is_template',
            'allow_anonymous', 'allow_multiple_submissions', 'require_login', 'is_public',
            'deadline', 'max_responses',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'response_count', 'created_at', 'updated_at']
    
    def get_permission(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.get_user_permission(request.user)
        return None
    
    def create(self, validated_data):
        """Create a personal form"""
        request = self.context.get('request')
        
        validated_data['created_by'] = request.user
        validated_data['last_modified_by'] = request.user
        validated_data['team'] = None
        
        return super().create(validated_data)