from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def send_verification_email(email, code):
    """Sending Code by Email"""
    subject = 'SDG Knowledge System - Email Verification Code'
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Email Verification</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 10px 10px 0 0;
                text-align: center;
            }}
            .content {{
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }}
            .code-box {{
                background: #fff;
                border: 2px dashed #667eea;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
            }}
            .code {{
                font-size: 32px;
                font-weight: bold;
                color: #667eea;
                letter-spacing: 5px;
                font-family: 'Courier New', monospace;
            }}
            .warning {{
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
            }}
            .spam-notice {{
                background: #e8f4f8;
                border: 1px solid #bee5eb;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
                color: #0c5460;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>SDG Knowledge System</h1>
            <p>Email Verification Required</p>
        </div>
        
        <div class="content">
            <div class="spam-notice">
                <strong>📧 Email Notice:</strong> You don't often get email from contactus@sdg.unswzoo.com. Please check your spam/junk folder if you don't see this email in your inbox.
            </div>
            
            <h2>Hello!</h2>
            <p>Thank you for registering with SDG Knowledge System. To complete your registration, please use the verification code below:</p>
            
            <div class="code-box">
                <div class="code">{code}</div>
                <p style="margin: 10px 0 0 0; color: #666;">Enter this code in the registration form</p>
            </div>
            
            <div class="warning">
                <strong>Important:</strong>
                <ul style="margin: 10px 0;">
                    <li>This code will expire in 5 minutes</li>
                    <li>Don't share this code with anyone</li>
                    <li>If you didn't request this code, please ignore this email</li>
                    <li><strong>📁 Can't find this email? Please check your spam/junk folder</strong></li>
                </ul>
            </div>
            
            <p>If you're having trouble with registration, please contact our support team at contactus@sdg.unswzoo.com.</p>
            
            <p>Best regards,<br>SDG Knowledge System Team</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>Contact us: contactus@sdg.unswzoo.com</p>
        </div>
    </body>
    </html>
    """

    plain_message = f"""
    SDG Knowledge System - Email Verification
    
    📧 EMAIL NOTICE: You don't often get email from contactus@sdg.unswzoo.com. 
    Please check your spam/junk folder if you don't see this email in your inbox.
    
    Hello!
    
    Thank you for registering with SDG Knowledge System. 
    To complete your registration, please use the verification code below:
    
    Verification Code: {code}
    
    Important:
    - This code will expire in 5 minutes
    - Don't share this code with anyone
    - If you didn't request this code, please ignore this email

    If you're having trouble with registration, please contact our support team at contactus@sdg.unswzoo.com.
    
    Best regards,
    SDG Knowledge System Team
    
    This is an automated message, please do not reply to this email.
    Contact us: contactus@sdg.unswzoo.com
    """
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )
        return True, "Email sent successfully"
    except Exception as e:
        return False, f"Failed to send email: {str(e)}"

def send_password_reset_email(email, code):
    """Sending Password Reset Code by Email"""
    subject = 'SDG Knowledge System - Password Reset Code'
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Password Reset</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 10px 10px 0 0;
                text-align: center;
            }}
            .content {{
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }}
            .code-box {{
                background: #fff;
                border: 2px dashed #667eea;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
            }}
            .code {{
                font-size: 32px;
                font-weight: bold;
                color: #667eea;
                letter-spacing: 5px;
                font-family: 'Courier New', monospace;
            }}
            .warning {{
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
            }}
            .spam-notice {{
                background: #e8f4f8;
                border: 1px solid #bee5eb;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
                color: #0c5460;
            }}
            .security-notice {{
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
                color: #721c24;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>SDG Knowledge System</h1>
            <p>Password Reset Request</p>
        </div>
        
        <div class="content">
            <div class="spam-notice">
                <strong>📧 Email Notice:</strong> You don't often get email from contactus@sdg.unswzoo.com. Please check your spam/junk folder if you don't see this email in your inbox.
            </div>
            
            <h2>Hello!</h2>
            <p>We received a request to reset your password for your SDG Knowledge System account. Use the verification code below to proceed:</p>
            
            <div class="code-box">
                <div class="code">{code}</div>
                <p style="margin: 10px 0 0 0; color: #666;">Enter this code to verify your identity</p>
            </div>
            
            <div class="security-notice">
                <strong>🔒 Security Alert:</strong>
                <ul style="margin: 10px 0;">
                    <li>If you didn't request this password reset, please ignore this email</li>
                    <li>Your account security has not been compromised</li>
                    <li>Consider changing your password if you suspect unauthorized access</li>
                </ul>
            </div>
            
            <div class="warning">
                <strong>Important:</strong>
                <ul style="margin: 10px 0;">
                    <li>This code will expire in 5 minutes</li>
                    <li>Don't share this code with anyone</li>
                    <li>SDG support will never ask for this code</li>
                    <li><strong>📁 Can't find this email? Please check your spam/junk folder</strong></li>
                </ul>
            </div>
            
            <p>If you're having trouble with password reset, please contact our support team at contactus@sdg.unswzoo.com.</p>
            
            <p>Best regards,<br>SDG Knowledge System Team</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>Contact us: contactus@sdg.unswzoo.com</p>
        </div>
    </body>
    </html>
    """

    plain_message = f"""
    SDG Knowledge System - Password Reset Request
    
    📧 EMAIL NOTICE: You don't often get email from contactus@sdg.unswzoo.com. 
    Please check your spam/junk folder if you don't see this email in your inbox.
    
    Hello!
    
    We received a request to reset your password for your SDG Knowledge System account.
    Use the verification code below to proceed:
    
    Verification Code: {code}
    
    🔒 Security Alert:
    - If you didn't request this password reset, please ignore this email
    - Your account security has not been compromised
    - Consider changing your password if you suspect unauthorized access
    
    Important:
    - This code will expire in 5 minutes
    - Don't share this code with anyone
    - SDG support will never ask for this code

    If you're having trouble with password reset, please contact our support team at contactus@sdg.unswzoo.com.
    
    Best regards,
    SDG Knowledge System Team
    
    This is an automated message, please do not reply to this email.
    Contact us: contactus@sdg.unswzoo.com
    """
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )
        return True, "Password reset email sent successfully"
    except Exception as e:
        return False, f"Failed to send email: {str(e)}"