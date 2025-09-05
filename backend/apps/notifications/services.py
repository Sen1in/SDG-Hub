# apps/notifications/services.py
import secrets
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import PendingEmailInvitation

class EmailInvitationService:
    """邮件邀请服务"""
    
    @staticmethod
    def generate_invitation_token():
        """生成邀请令牌"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def create_email_invitation(email, team_id, team_name, inviter_username, 
                              inviter_email, invited_identifier):
        """创建邮件邀请记录"""
        # 检查是否已有待处理的邀请
        existing_invitation = PendingEmailInvitation.objects.filter(
            email=email,
            team_id=str(team_id),
            status='pending'
        ).first()
        
        if existing_invitation:
            # 如果已存在，更新过期时间并重新发送
            existing_invitation.expires_at = timezone.now() + timedelta(days=7)
            existing_invitation.email_sent = False
            existing_invitation.save()
            return existing_invitation
        
        # 创建新的邀请记录
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
    def send_invitation_email(invitation):
        """发送邀请邮件"""
        try:
            # 构建注册链接
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            registration_url = f"{frontend_url}/register?invitation_token={invitation.invitation_token}"
            
            # 邮件上下文
            context = {
                'inviter_username': invitation.inviter_username,
                'team_name': invitation.team_name,
                'registration_url': registration_url,
                'expires_days': 7,
                'site_name': getattr(settings, 'SITE_NAME', 'SDG Knowledge System'),
            }
            
            # 渲染邮件模板
            html_message = render_to_string('notifications/invitation_email.html', context)
            plain_message = strip_tags(html_message)
            
            # 发送邮件
            send_mail(
                subject=f'You\'re invited to join "{invitation.team_name}" team',
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[invitation.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            # 更新发送状态
            invitation.email_sent = True
            invitation.email_sent_at = timezone.now()
            invitation.save()
            
            return True
            
        except Exception as e:
            print(f"Failed to send invitation email: {e}")
            return False
    
    @staticmethod
    def get_invitation_by_token(token):
        """根据令牌获取邀请"""
        try:
            invitation = PendingEmailInvitation.objects.get(
                invitation_token=token,
                status='pending'
            )
            
            if invitation.is_expired:
                invitation.delete()  # 直接删除过期邀请
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
        
        # 检查团队是否仍然存在
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
            # 团队不存在，删除邀请
            invitation.delete()
            return False, "The team no longer exists"