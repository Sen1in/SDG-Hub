import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormValidation } from './useFormValidation';

interface ForgotPasswordFormData {
  email: string;
  email_code: string;
}

interface ForgotPasswordErrors {
  email?: string;
  email_code?: string;
  general?: string;
}

export const useForgotPasswordForm = () => {
  const navigate = useNavigate();
  const { validateEmail, validateEmailCode } = useFormValidation();
  
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
    email_code: ''
  });
  const [errors, setErrors] = useState<ForgotPasswordErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear the errors in the corresponding fields
    if (errors[name as keyof ForgotPasswordErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSendEmailCode = async () => {
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setErrors(prev => ({
        ...prev,
        email: emailError
      }));
      throw new Error(emailError);
    }

    // Clear the errors in the email field
    setErrors(prev => ({
      ...prev,
      email: undefined
    }));

    try {
      const response = await fetch('/api/auth/send-reset-code/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email })
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.email) {
          setErrors(prev => ({
            ...prev,
            email: Array.isArray(result.email) ? result.email[0] : result.email
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            general: result.message || 'Failed to send verification code'
          }));
        }
        throw new Error(result.message || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Send email code error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Front-end validation
    const emailError = validateEmail(formData.email);
    const codeError = validateEmailCode(formData.email_code);
    
    if (emailError || codeError) {
      setErrors({
        email: emailError,
        email_code: codeError
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-reset-code/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          email_code: formData.email_code
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Navigate to reset password page with token
        navigate('/reset-password', {
          state: { 
            resetToken: result.reset_token,
            email: formData.email
          }
        });
      } else {
        const backendErrors: ForgotPasswordErrors = {};
        
        if (result.email) {
          backendErrors.email = Array.isArray(result.email) ? result.email[0] : result.email;
        }
        if (result.email_code) {
          backendErrors.email_code = Array.isArray(result.email_code) ? result.email_code[0] : result.email_code;
        }
        if (result.error || result.message) {
          backendErrors.general = result.error || result.message;
        }
        
        setErrors(backendErrors);
      }
    } catch (error) {
      console.error('Verify code error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    }
    
    setLoading(false);
  };

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    handleSendEmailCode
  };
};