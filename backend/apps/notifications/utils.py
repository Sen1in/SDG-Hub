import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

logger = logging.getLogger(__name__)

class EmailTemplateUtils:
    
    @staticmethod
    def get_base_url_from_request(request):
        """Get base URL from request"""
        if hasattr(settings, 'FRONTEND_URL') and settings.FRONTEND_URL:
            return settings.FRONTEND_URL.rstrip('/')
        
        import os
        frontend_url = os.environ.get('FRONTEND_URL')
        if frontend_url:
            return frontend_url.rstrip('/')
        
        scheme = 'https' if request.is_secure() else 'http'
        host = request.get_host()
        
        if 'localhost' in host or '127.0.0.1' in host:
            if ':8000' in host:
                host = host.replace(':8000', ':3000')
            elif ':3000' not in host:
                host = f"{host.split(':')[0]}:3000"
        else:
            if ':' in host and not host.startswith('['):
                host = host.split(':')[0]
        
        return f"{scheme}://{host}"
    
    @staticmethod
    def send_team_invitation_email(invitation, base_url):
        """Send team invitation email"""
        try:
            logger.info(f"Starting to send invitation email to {invitation.email}")
            
            registration_url = f"{base_url}/register?invitation_token={invitation.invitation_token}"
            logger.info(f"Generated registration URL: {registration_url}")
            
            html_content = EmailTemplateUtils._create_outlook_compatible_html(
                team_name=invitation.team_name,
                inviter_username=invitation.inviter_username,
                inviter_email=invitation.inviter_email,
                registration_url=registration_url,
                email=invitation.email
            )
            logger.info("HTML content created successfully")
            
            text_content = EmailTemplateUtils._create_plain_text(
                team_name=invitation.team_name,
                inviter_username=invitation.inviter_username,
                registration_url=registration_url,
                email=invitation.email
            )
            logger.info("Text content created successfully")
            
            subject = f'Team Invitation: Join "{invitation.team_name}" - SDG Knowledge System'
            logger.info(f"Email subject: {subject}")
            
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[invitation.email]
            )
            logger.info(f"EmailMultiAlternatives created, from: {settings.DEFAULT_FROM_EMAIL}, to: {invitation.email}")
            
            msg.attach_alternative(html_content, "text/html")
            logger.info("HTML alternative attached")
            
            logger.info("Attempting to send email...")
            msg.send()
            logger.info("Email sent successfully")
            
            logger.info(f"Team invitation email sent to {invitation.email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send team invitation email to {invitation.email}: {str(e)}")
            logger.error(f"Exception type: {type(e).__name__}")
            logger.error(f"Exception details: {repr(e)}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return False
    
    @staticmethod
    def _create_outlook_compatible_html(team_name, inviter_username, inviter_email, registration_url, email):
        """Create Outlook compatible HTML email template"""
        return f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Team Invitation - SDG Knowledge System</title>
    
    <!--[if gte mso 9]>
    <xml>
        <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
    
    <style type="text/css">
        body, table, td, p, a, li, blockquote {{
            -webkit-text-size-adjust: 100% !important;
            -ms-text-size-adjust: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
        }}
        
        table, td {{
            border-collapse: collapse !important;
            mso-table-lspace: 0pt !important;
            mso-table-rspace: 0pt !important;
        }}
        
        img {{
            border: 0 !important;
            height: auto !important;
            line-height: 100% !important;
            outline: none !important;
            text-decoration: none !important;
            -ms-interpolation-mode: bicubic !important;
        }}
        
        .ReadMsgBody {{ width: 100% !important; }}
        .ExternalClass {{ width: 100% !important; }}
        .ExternalClass * {{ line-height: 100% !important; }}
        #outlook a {{ padding: 0 !important; }}
        
        .cta-button {{
            background-color: #4F46E5 !important;
            border: 4px solid #4F46E5 !important;
            border-radius: 12px !important;
            color: #ffffff !important;
            display: inline-block !important;
            font-family: Arial, sans-serif !important;
            font-size: 18px !important;
            font-weight: bold !important;
            line-height: 54px !important;
            text-align: center !important;
            text-decoration: none !important;
            width: 300px !important;
            -webkit-text-size-adjust: none !important;
        }}
        
        <!--[if mso]>
        .cta-button {{ display: none !important; }}
        .outlook-button {{ display: block !important; }}
        <![endif]-->
        
        .no-link a {{ color: inherit !important; text-decoration: none !important; }}
    </style>
</head>

<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;">
    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        {inviter_username} invited you to join team "{team_name}" on SDG Knowledge System
    </div>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="width: 600px; max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                    
                    <tr>
                        <td style="background: linear-gradient(135deg, #4F46E5 0%, #059669 100%); padding: 40px 40px 30px 40px; text-align: center; border-radius: 16px 16px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; font-family: Arial, sans-serif; line-height: 1.2;">
                                🌍 SDG Knowledge System
                            </h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-family: Arial, sans-serif;">
                                Team Collaboration Invitation
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 40px;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <h2 style="margin: 0; color: #1f2937; font-size: 28px; font-weight: bold; font-family: Arial, sans-serif; line-height: 1.3;">
                                    You're Invited to Join a Team!
                                </h2>
                            </div>
                            
                            <div style="background-color: #f8fafc; border-left: 4px solid #4F46E5; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
                                <p style="margin: 0 0 10px 0; color: #374151; font-size: 16px; font-family: Arial, sans-serif; line-height: 1.5;">
                                    <strong>{inviter_username}</strong> has invited you to join the team:
                                </p>
                                <p style="margin: 0; color: #4F46E5; font-size: 24px; font-weight: bold; font-family: Arial, sans-serif;">
                                    "{team_name}"
                                </p>
                            </div>
                            
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <!--[if !mso]><!-->
                                        <a href="{registration_url}" class="cta-button" style="background-color: #4F46E5; border: 4px solid #4F46E5; border-radius: 12px; color: #ffffff; display: inline-block; font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; line-height: 54px; text-align: center; text-decoration: none; width: 300px;">
                                            🚀 Join {team_name} Team
                                        </a>
                                        <!--<![endif]-->
                                        
                                        <!--[if mso]>
                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{registration_url}" style="height:62px; v-text-anchor:middle; width:308px;" arcsize="19%" stroke="f" fillcolor="#4F46E5">
                                            <w:anchorlock/>
                                            <center style="color:#ffffff; font-family:Arial, sans-serif; font-size:18px; font-weight:bold;">
                                                🚀 Join {team_name} Team
                                            </center>
                                        </v:roundrect>
                                        <![endif]-->
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 25px 0; color: #374151; font-size: 16px; font-family: Arial, sans-serif; line-height: 1.6;">
                                Welcome to SDG Knowledge System! You've been invited to join our collaborative platform focused on Sustainable Development Goals (SDGs). Our platform enables teams to work together on impactful SDG initiatives.
                            </p>
                            
                            <div style="text-align: center; margin: 25px 0; padding: 20px; background-color: #f8fafc; border-radius: 12px; border: 3px solid #4F46E5;">
                                <p style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px; font-family: Arial, sans-serif; font-weight: bold;">
                                    Can't see the button? Use this link:
                                </p>
                                <div class="no-link">
                                    <p style="margin: 0; word-break: break-all; color: #4F46E5; font-size: 16px; font-family: Arial, sans-serif; font-weight: bold;">
                                        <a href="{registration_url}" style="color: #4F46E5; text-decoration: underline; font-weight: bold;">{registration_url}</a>
                                    </p>
                                </div>
                            </div>
                            
                            <div style="background-color: #fef3cd; border: 2px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 25px 0;">
                                <p style="margin: 0; color: #92400e; font-size: 16px; font-family: Arial, sans-serif; font-weight: bold; text-align: center;">
                                    ⏰ Important: This invitation expires in 7 days. Please register soon to join the team.
                                </p>
                            </div>
                            
                            <div style="margin: 30px 0;">
                                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; font-weight: bold; font-family: Arial, sans-serif;">
                                    What happens next?
                                </h3>
                                <ol style="margin: 0; padding-left: 20px; color: #374151; font-size: 15px; font-family: Arial, sans-serif; line-height: 1.6;">
                                    <li style="margin-bottom: 8px;">Click the "Join Team" button above</li>
                                    <li style="margin-bottom: 8px;">Complete your registration on SDG Knowledge System</li>
                                    <li style="margin-bottom: 8px;">Your team invitation will automatically appear in your notifications</li>
                                    <li style="margin-bottom: 8px;">Accept the invitation to start collaborating!</li>
                                </ol>
                            </div>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-radius: 0 0 16px 16px; border-top: 1px solid #e5e7eb;">
                            <h4 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px; font-weight: bold; font-family: Arial, sans-serif;">
                                SDG Knowledge System
                            </h4>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>"""

    @staticmethod
    def _create_plain_text(team_name, inviter_username, registration_url, email):
        """Create plain text version of email"""
        return f"""SDG Knowledge System - Team Invitation

You're Invited to Join a Team!

{inviter_username} has invited you to join the team: "{team_name}"

To join the team, please visit:
{registration_url}

Welcome to SDG Knowledge System! You've been invited to join our collaborative platform focused on Sustainable Development Goals (SDGs).

What happens next?
1. Click the link above
2. Complete your registration on SDG Knowledge System  
3. Your team invitation will automatically appear in your notifications
4. Accept the invitation to start collaborating!

Important: This invitation expires in 7 days. Please register soon to join the team.

---
SDG Knowledge System
"""