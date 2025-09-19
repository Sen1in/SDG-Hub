from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from .serializers import RegisterSerializer, LoginSerializer, EmailCodeSerializer
from ..profile.serializers import UserSerializer
from .models import EmailVerificationCode, PasswordResetToken
from .utils import send_verification_email, send_password_reset_email
from ..tokens import AutoLoginRefreshToken
from .serializers import PasswordResetCodeSerializer, PasswordResetVerifySerializer, PasswordResetSerializer
from .serializers import GoogleLoginSerializer

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def send_email_code(request):
    """Send email verification code"""
    serializer = EmailCodeSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        # Check rate limiting (only one code per minute)
        one_minute_ago = timezone.now() - timedelta(minutes=1)
        recent_code = EmailVerificationCode.objects.filter(
            email=email,
            created_at__gte=one_minute_ago
        ).first()
        
        if recent_code:
            return Response({
                'error': 'Please wait at least 1 minute before requesting another code'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        try:
            # Create verification code
            verification_code = EmailVerificationCode.create_code(email)
            
            # Send email
            success, message = send_verification_email(email, verification_code.code)
            
            if success:
                return Response({
                    'message': 'Verification code sent successfully',
                    'email': email
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': message
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                'error': f'Failed to send verification code: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """User registration"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # 转换邮件邀请为通知
        try:
            from apps.notifications.models import PendingEmailInvitation
            converted_count = PendingEmailInvitation.convert_to_notifications(user)
        except Exception as e:
            # 如果转换失败，不影响注册流程
            converted_count = 0
            print(f"Failed to convert email invitations: {e}")
        
        # Generate JWT tokens with auto last_login update
        refresh = AutoLoginRefreshToken.for_user(user)
        
        response_data = {
            'message': 'User created successfully',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }
        
        # 如果有转换的邀请，添加提示信息
        if converted_count > 0:
            response_data['team_invitations'] = {
                'count': converted_count,
                'message': f'You have {converted_count} team invitation(s) waiting in your notifications'
            }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    """User login"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # 检查并转换邮件邀请（每次登录时检查）
        try:
            from apps.notifications.models import PendingEmailInvitation
            converted_count = PendingEmailInvitation.convert_to_notifications(user)
        except Exception as e:
            # 如果转换失败，不影响登录流程
            converted_count = 0
            print(f"Failed to convert email invitations: {e}")
        
        # Generate JWT tokens with auto last_login update
        refresh = AutoLoginRefreshToken.for_user(user)
        
        response_data = {
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }
        
        # 如果有新的邀请转换，添加提示信息
        if converted_count > 0:
            response_data['team_invitations'] = {
                'count': converted_count,
                'message': f'You have {converted_count} new team invitation(s)'
            }
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def google_login(request):
    """Google OAuth login"""
    serializer = GoogleLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            google_user_info = serializer.validated_data['credential']
            user, is_first_login = serializer.create_or_get_user(google_user_info)
            
            # Convert email invitations if any
            try:
                from apps.notifications.models import PendingEmailInvitation
                converted_count = PendingEmailInvitation.convert_to_notifications(user)
            except Exception as e:
                converted_count = 0
                print(f"Failed to convert email invitations: {e}")
            
            # Generate JWT tokens with auto last_login update
            refresh = AutoLoginRefreshToken.for_user(user)
            
            response_data = {
                'message': 'Google login successful',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'isFirstLogin': is_first_login
            }
            
            # Add team invitations info if any
            if converted_count > 0:
                response_data['team_invitations'] = {
                    'count': converted_count,
                    'message': f'You have {converted_count} new team invitation(s)'
                }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Google login failed: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    """User logout"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def refresh_token(request):
    """Refresh access token"""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            refresh = RefreshToken(refresh_token)
            return Response({
                'access': str(refresh.access_token)
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Refresh token is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    except Exception as e:
        return Response(
            {'error': 'Invalid refresh token'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )



@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def send_reset_code(request):
    """Send password reset verification code"""
    serializer = PasswordResetCodeSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        # Check rate limiting (only one code per minute)
        one_minute_ago = timezone.now() - timedelta(minutes=1)
        recent_code = EmailVerificationCode.objects.filter(
            email=email,
            created_at__gte=one_minute_ago
        ).first()
        
        if recent_code:
            return Response({
                'error': 'Please wait at least 1 minute before requesting another code'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        try:
            # Create verification code
            verification_code = EmailVerificationCode.create_code(email)
            
            # Send password reset email
            success, message = send_password_reset_email(email, verification_code.code)
            
            if success:
                return Response({
                    'message': 'Password reset code sent successfully',
                    'email': email
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': message
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                'error': f'Failed to send password reset code: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_reset_code(request):
    """Verify password reset code and generate reset token"""
    serializer = PasswordResetVerifySerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        try:
            # Create password reset token
            reset_token = PasswordResetToken.create_token(email)
            
            return Response({
                'message': 'Code verified successfully',
                'reset_token': reset_token.token,
                'email': email
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to generate reset token: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    """Reset user password"""
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        new_password = serializer.validated_data['password']
        
        try:
            # Update user password
            user.set_password(new_password)
            user.save()
            
            # Update last_login timestamp
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            return Response({
                'message': 'Password reset successfully',
                'email': user.email
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to reset password: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)