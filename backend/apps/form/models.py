from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.team.models import Team
import json

class Form(models.Model):
    """Form model"""
    FORM_TYPE_CHOICES = [
        ('action', 'Action'),
        ('education', 'Education'),
        ('blank', 'Blank'),
        ('ida', 'IDA'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('locked', 'Locked'),
        ('archived', 'Archived'),
    ]
    
    PERMISSION_CHOICES = [
        ('read', 'Read'),
        ('write', 'Write'),
        ('admin', 'Admin'),
    ]

    REVIEW_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted_for_review', 'Submitted for Review'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    title = models.CharField(max_length=200, db_index=True)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=20, choices=FORM_TYPE_CHOICES, default='action')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Association relationship
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='forms')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_forms')
    last_modified_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='modified_forms', null=True, blank=True)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Form settings
    allow_anonymous = models.BooleanField(default=False)
    allow_multiple_submissions = models.BooleanField(default=False)
    require_login = models.BooleanField(default=True)
    is_public = models.BooleanField(default=False)
    is_template = models.BooleanField(default=False)
    deadline = models.DateTimeField(null=True, blank=True)
    max_responses = models.PositiveIntegerField(null=True, blank=True)

    # Add fields related to collaborative editing
    is_collaborative = models.BooleanField(default=True)
    current_editors = models.JSONField(default=list)
    last_edit_at = models.DateTimeField(auto_now=True)
    edit_version = models.PositiveIntegerField(default=1)

    # Review workflow fields
    review_status = models.CharField(
        max_length=25, 
        choices=REVIEW_STATUS_CHOICES, 
        default='draft'
    )
    submitted_for_review_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='reviewed_forms'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_comments = models.TextField(blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['team', 'status']),
            models.Index(fields=['team', 'type']),
            models.Index(fields=['created_by']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['-updated_at']),
        ]
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.title} ({self.team.name})"
     
    def get_user_permission(self, user):
        """Obtain the user's permissions for the form"""
        from apps.team.models import TeamMembership
        
        # The form creator has admin privileges.
        if self.created_by == user:
            return 'admin'
        
        # Determine permissions based on team roles
        membership = TeamMembership.objects.filter(user=user, team=self.team).first()
        if not membership:
            return None
        
        if membership.role == 'owner':
            return 'admin'
        elif membership.role == 'edit':
            return 'write'
        elif membership.role == 'view':
            return 'read'
        
        return None
    
class FormContent(models.Model):
    """Form content model - Stores specific forms"""
    form = models.OneToOneField(Form, on_delete=models.CASCADE, related_name='content')
    
    # General Fields
    title = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    
    # Education Form-specific fields
    aims = models.TextField(blank=True)
    learning_outcomes = models.TextField(blank=True)
    type_label = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=100, blank=True)
    organization = models.CharField(max_length=128, blank=True)
    year = models.CharField(max_length=10, blank=True)
    sdgs_related = models.TextField(blank=True)
    related_discipline = models.CharField(max_length=128, blank=True)
    useful_industries = models.TextField(blank=True)
    source = models.TextField(blank=True)
    link = models.URLField(blank=True)
    
    # Action Form-specific fields
    actions = models.TextField(blank=True)
    action_detail = models.TextField(blank=True)
    level = models.IntegerField(null=True, blank=True, default=None)
    individual_organization = models.IntegerField(null=True, blank=True, default=None)
    related_industry = models.TextField(blank=True)
    digital_actions = models.BooleanField(default=False, null=False)
    source_descriptions = models.TextField(blank=True)
    award = models.BooleanField(default=False, null=False)
    source_links = models.TextField(blank=True)
    additional_notes = models.TextField(blank=True)
    award_descriptions = models.TextField(blank=True)

    # Add free content fields for the Blank form
    free_content = models.TextField(blank=True)

    # IDA (Impact Design Analysis) Form-specific fields
    designer_names = models.CharField(max_length=200, blank=True) 
    current_role_affiliation = models.CharField(max_length=200, blank=True)
    impact_project_name = models.CharField(max_length=100, blank=True)
    main_challenge = models.TextField(blank=True)
    project_description = models.TextField(blank=True)
    selected_sdgs = models.JSONField(default=list, blank=True)
    impact_types = models.JSONField(default=dict, blank=True)
    project_importance = models.TextField(blank=True)
    existing_example = models.TextField(blank=True)
    implementation_step1 = models.TextField(blank=True)
    implementation_step2 = models.TextField(blank=True)
    implementation_step3 = models.TextField(blank=True)
    implementation_step4 = models.TextField(blank=True)
    implementation_step5 = models.TextField(blank=True)
    implementation_step6 = models.TextField(blank=True)
    resources_partnerships = models.TextField(blank=True)
    skills_capabilities = models.TextField(blank=True)
    impact_avenues = models.TextField(blank=True)
    risks_inhibitors = models.TextField(blank=True)
    mitigation_strategies = models.TextField(blank=True)
    
    # Metadata
    version = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['form', 'version']),
        ]

class FormEditSession(models.Model):
    """Edit session model - Records the user's editing status"""
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='edit_sessions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    field_name = models.CharField(max_length=50, null=True, blank=True)  
    is_active = models.BooleanField(default=True)
    cursor_position = models.IntegerField(default=0)  
    selection_start = models.IntegerField(null=True, blank=True)  
    selection_end = models.IntegerField(null=True, blank=True)  
    started_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['form', 'user']

class FormEditHistory(models.Model):
    """Form editing history"""
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='edit_history')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    field_name = models.CharField(max_length=50)
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    change_type = models.CharField(
        max_length=20,
        choices=[
            ('create', 'Create'),
            ('update', 'Update'), 
            ('delete', 'Delete'),
        ],
        default='update'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    version = models.PositiveIntegerField()
    
    class Meta:
        indexes = [
            models.Index(fields=['form', 'timestamp']),
            models.Index(fields=['form', 'field_name']),
        ]