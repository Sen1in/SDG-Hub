# apps/notifications/services.py
import secrets
import logging
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import PendingEmailInvitation
from .utils import EmailTemplateUtils

logger = logging.getLogger(__name__)

class EmailInvitationService:
    
    @staticmethod
    def generate_invitation_token():
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def create_email_invitation(email, team_id, team_name, inviter_username, 
                              inviter_email, invited_identifier, base_url=None):
        """创建邮件邀请，支持动态base_url"""
        existing_invitation = PendingEmailInvitation.objects.filter(
            email=email,
            team_id=str(team_id),
            status='pending'
        ).first()
        
        if existing_invitation:
            existing_invitation.expires_at = timezone.now() + timedelta(days=7)
            existing_invitation.email_sent = False
            existing_invitation.save()
            return existing_invitation
        
        invitation = PendingEmailInvitation.objects.create(
            email=email,
            team_id=str(team_id),
            team_name=team_name,
            inviter_username=inviter_username,
            inviter_email=inviter_email,
            invited_by_email=True,
            invited_identifier=invited_identifier,
            invitation_token=EmailInvitationService.generate_invitation_token(),
            expires_at=timezone.now() + timedelta(days=7)
        )
        
        return invitation
    
    @staticmethod
    def send_invitation_email(invitation, base_url=None):
        """send invitation email"""
        try:
            if not base_url:
                base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            
            base_url = base_url.rstrip('/')
            
            success = EmailTemplateUtils.send_team_invitation_email(invitation, base_url)
            
            if success:
                invitation.email_sent = True
                invitation.email_sent_at = timezone.now()
                invitation.save()
                logger.info(f"Invitation email sent successfully to {invitation.email}")
            else:
                logger.error(f"Failed to send invitation email to {invitation.email}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error sending invitation email to {invitation.email}: {str(e)}")
            return False
    
    @staticmethod
    def get_invitation_by_token(token):
        try:
            invitation = PendingEmailInvitation.objects.get(
                invitation_token=token,
                status='pending'
            )
            
            if invitation.is_expired:
                invitation.delete() 
                return None
                
            return invitation
        except PendingEmailInvitation.DoesNotExist:
            return None
    
    @staticmethod
    def validate_invitation_token(token):
        """验证邀请令牌"""
        invitation = EmailInvitationService.get_invitation_by_token(token)
        
        if not invitation:
            return False, "Invalid or expired invitation token"
        
        from apps.team.models import Team
        try:
            team = Team.objects.get(id=invitation.team_id)
            return True, {
                'email': invitation.email,
                'team_name': invitation.team_name,
                'inviter_username': invitation.inviter_username,
                'team_id': invitation.team_id
            }
        except Team.DoesNotExist:
            invitation.delete()
            return False, "The team no longer exists"