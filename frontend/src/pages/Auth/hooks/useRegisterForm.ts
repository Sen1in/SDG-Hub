import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterFormData, RegisterErrors } from '../types';
import { useAuth } from '../../../contexts/AuthContext';
import { useFormValidation } from './useFormValidation';

export const useRegisterForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { validateRegisterForm, validateEmail } = useFormValidation();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    agreedToTerms: false,
    first_name: '',
    last_name: '',
    organization: '',
    faculty_and_major: '',
    email_code: '' 
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear the errors in the corresponding fields
    if (errors[name as keyof RegisterErrors]) {
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

  // Clear the errors in the email inbox
  setErrors(prev => ({
    ...prev,
    email: undefined
  }));

  try {
    const response = await fetch('/api/auth/send-email-code/', {
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

    // Front-end validation (including email verification code)
    const { errors: validationErrors, isValid } = validateRegisterForm({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password_confirm: formData.password_confirm,
      agreedToTerms: formData.agreedToTerms,
      email_code: formData.email_code 
    });
    
    if (!isValid) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const registerData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        first_name: formData.first_name || '',
        last_name: formData.last_name || '',
        organization: formData.organization || '',
        faculty_and_major: formData.faculty_and_major || '',
        email_code: formData.email_code 
      };

      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData)
      });

      const result = await response.json();

      if (response.ok) {
        if (result.tokens) {
          localStorage.setItem('access_token', result.tokens.access);
          localStorage.setItem('refresh_token', result.tokens.refresh);
        }
        try {
          const loginResult = await login(formData.username, formData.password);
          
          if (loginResult.success) {
            // Login successful. Redirecting to the profile page.
            navigate('/')
            navigate('/profile', {
              state: { 
                message: 'Registration and login successful! Welcome to your profile.',
                isNewUser: true 
              }
            });
          } else {
            // Registration was successful but automatic login failed. Redirected to the login page.
            navigate('/login', {
              state: { 
                message: 'Registration successful! Please log in.',
                email: formData.email
              }
            });
          }
        } catch (loginError) {
          // Automatic login failed. Redirecting to the login page.
          console.error('Auto login error:', loginError);
          navigate('/login', {
            state: { 
              message: 'Registration successful! Please log in.',
              email: formData.email
            }
          });
        }
        
      } else {
        const backendErrors: RegisterErrors = {};
       
        Object.keys(result).forEach(field => {
          if (field === 'non_field_errors') {
            backendErrors.general = Array.isArray(result[field]) 
              ? result[field][0] 
              : result[field];
          } else {
            backendErrors[field as keyof RegisterErrors] = Array.isArray(result[field]) 
              ? result[field][0] 
              : result[field];
          }
        });
        
        setErrors(backendErrors);
      }
    } catch (error) {
      console.error('Register error:', error);
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
    handleSubmit,
    handleSendEmailCode 
  };
};