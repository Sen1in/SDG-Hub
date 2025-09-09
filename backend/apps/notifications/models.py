from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from django.db import transaction
class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('team_invitation', 'Team Invitation'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]
    
    recipient = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=50, 
        choices=NOTIFICATION_TYPES,
        default='team_invitation'
    )
    data = models.JSONField() 
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'status']),
            models.Index(fields=['expires_at']),
        ]
        # No unique constraint here - users can receive multiple team invitations
    
    def __str__(self):
        return f"{self.notification_type} for {self.recipient.username}"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def mark_as_expired(self):
        self.status = 'expired'
        self.save()
    
    @classmethod
    def cleanup_expired_notifications(cls):
        expired_notifications = cls.objects.filter(
            expires_at__lt=timezone.now(),
            status='pending'
        )
        count = expired_notifications.count()
        expired_notifications.delete()
        return count

class PendingEmailInvitation(models.Model):
    email = models.EmailField()
    team_id = models.CharField(max_length=50)
    team_name = models.CharField(max_length=100)
    inviter_username = models.CharField(max_length=150)
    inviter_email = models.EmailField()
    invited_by_email = models.BooleanField(default=True)
    invited_identifier = models.CharField(max_length=255)
    
    invitation_token = models.CharField(max_length=100, unique=True)
    email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('registered', 'User Registered'),
            ('expired', 'Expired'),
        ],
        default='pending'
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', 'status']),
            models.Index(fields=['invitation_token']),
            models.Index(fields=['expires_at']),
        ]
        unique_together = ['email', 'team_id', 'status']
    
    def __str__(self):
        return f"Email invitation to {self.email} for team {self.team_name}"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    @classmethod
    def cleanup_expired_invitations(cls):
        expired_invitations = cls.objects.filter(
            expires_at__lt=timezone.now(),
            status='pending'
        )
        count = expired_invitations.count()
        expired_invitations.delete()
        return count
    
    @classmethod
    def convert_to_notifications(cls, user):
        pending_invitations = cls.objects.filter(
            email=user.email,
            status='pending'
        )
        
        converted_count = 0
        
        with transaction.atomic():
            for invitation in pending_invitations:
                from apps.team.models import Team
                try:
                    team = Team.objects.get(id=invitation.team_id)
                    
                    # Check if notification already exists for this team
                    existing_notification = Notification.objects.filter(
                        recipient=user,
                        notification_type='team_invitation',
                        status='pending',
                        data__team_id=invitation.team_id
                    ).first()
                    
                    if not existing_notification:
                        notification = Notification.objects.create(
                            recipient=user,
                            notification_type='team_invitation',
                            data={
                                'team_id': invitation.team_id,
                                'team_name': invitation.team_name,
                                'inviter_username': invitation.inviter_username,
                                'inviter_email': invitation.inviter_email,
                                'invited_by_email': invitation.invited_by_email,
                                'invited_identifier': invitation.invited_identifier,
                            },
                            expires_at=invitation.expires_at,
                            status='pending'
                        )
                        converted_count += 1
                    
                    # Mark email invitation as processed
                    invitation.status = 'registered'
                    invitation.save()
                    
                except Team.DoesNotExist:
                    invitation.delete()
        
        return converted_count