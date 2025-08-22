from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class Team(models.Model):
    """Team model"""
    name = models.CharField(max_length=100, unique=True, db_index=True)
    max_members = models.PositiveIntegerField(
        default=10,
        validators=[MinValueValidator(1), MaxValueValidator(100)]
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