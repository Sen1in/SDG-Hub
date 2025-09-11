import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormValidation } from './useFormValidation';

interface ResetPasswordFormData {
  password: string;
  password_confirm: string;
}

interface ResetPasswordErrors {
  password?: string;
  password_confirm?: string;
  general?: string;
}

export const useResetPasswordForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { validatePassword, validatePasswordConfirm } = useFormValidation();
  
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: '',
    password_confirm: ''
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  // Get reset token and email from navigation state
  const resetToken = location.state?.resetToken;
  const email = location.state?.email;

  // Redirect if no reset token
  if (!resetToken || !email) {
    navigate('/forgot-password');
    return {
      formData,
      showPassword,
      setShowPassword,
      showConfirmPassword,
      setShowConfirmPassword,
      errors: { general: 'Invalid reset session. Please try again.' } as ResetPasswordErrors,
      loading: false,
      handleChange: () => {},
      handleSubmit: () => {}
    };
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear the errors in the corresponding fields
    if (errors[name as keyof ResetPasswordErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Front-end validation
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validatePasswordConfirm(formData.password, formData.password_confirm);
    
    if (passwordError || confirmPasswordError) {
      setErrors({
        password: passwordError,
        password_confirm: confirmPasswordError
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          reset_token: resetToken,
          password: formData.password,
          password_confirm: formData.password_confirm
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Navigate to success page
        navigate('/password-reset-success');
      } else {
        const backendErrors: ResetPasswordErrors = {};
        
        if (result.password) {
          backendErrors.password = Array.isArray(result.password) ? result.password[0] : result.password;
        }
        if (result.password_confirm) {
          backendErrors.password_confirm = Array.isArray(result.password_confirm) ? result.password_confirm[0] : result.password_confirm;
        }
        if (result.error || result.message) {
          backendErrors.general = result.error || result.message;
        }
        
        setErrors(backendErrors);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    }
    
    setLoading(false);
  };

  return {
    formData,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    errors,
    loading,
    handleChange,
    handleSubmit
  };
};