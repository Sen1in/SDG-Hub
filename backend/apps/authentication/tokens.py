from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class AutoLoginRefreshToken(RefreshToken):
    """
    自定义的RefreshToken类，在生成时自动更新用户的last_login
    """
    
    @classmethod
    def for_user(cls, user):
        """
        重写for_user方法，在生成token时自动更新last_login
        """
        # 生成token
        token = super().for_user(user)
        
        # 自动更新last_login
        try:
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            logger.info(f"Auto-updated last_login for user {user.username} via token generation")
        except Exception as e:
            logger.error(f"Failed to update last_login for user {user.username}: {e}")
        
        return token

class AutoLoginAccessToken(AccessToken):
    """
    自定义的AccessToken类，继承自AccessToken
    """
    pass 