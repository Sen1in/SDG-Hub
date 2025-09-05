from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError

class Team(models.Model):
    """Team model"""
    name = models.CharField(max_length=100, unique=True, db_index=True)
    max_members = models.PositiveIntegerField(
        default=2,  # 默认值改为2
        validators=[MinValueValidator(1), MaxValueValidator(6)]  # 范围改为1-6
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Add indexes for improved query performance
    class Meta:
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['-created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def member_count(self):
        """Get current member count"""
        return self.memberships.count()
    
    def get_owner(self):
        """Get team owner"""
        return self.memberships.filter(role='owner').first()
    
    def clean(self):
        """Additional validation"""
        # Ensure max_members is within range
        if self.max_members < 1:
            raise ValidationError({'max_members': 'Team must have at least 1 member.'})
        if self.max_members > 6:
            raise ValidationError({'max_members': 'Team cannot exceed 6 members.'})
        
        # If updating existing team, ensure capacity is not less than current member count
        if self.pk:  # Only check if this is an update (pk exists)
            current_count = self.member_count
            if self.max_members < current_count:
                raise ValidationError({
                    'max_members': f'Capacity cannot be less than current member count ({current_count}).'
                })
    
    def save(self, *args, **kwargs):
        """Override save to validate before saving"""
        self.full_clean()  # This will call clean() method
        super().save(*args, **kwargs)

class TeamMembership(models.Model):
    """Team membership model"""
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('edit', 'Edit'), 
        ('view', 'View'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='team_memberships')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='view')
    joined_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)
    
    class Meta:
        # Ensure user can only have one role per team
        unique_together = ['user', 'team']
        indexes = [
            models.Index(fields=['user', 'team']),
            models.Index(fields=['team', 'role']),
            models.Index(fields=['-joined_at']),
        ]
        ordering = ['role', '-joined_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.team.name} ({self.role})"
    
    def save(self, *args, **kwargs):
        # Ensure only one owner per team
        if self.role == 'owner':
            TeamMembership.objects.filter(
                team=self.team, 
                role='owner'
            ).exclude(id=self.id).update(role='edit')
        super().save(*args, **kwargs)