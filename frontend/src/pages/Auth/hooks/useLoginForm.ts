import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { LoginFormData, LoginErrors } from '../types';

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    login: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear the errors in the corresponding fields
    if (errors[name as keyof LoginErrors]) {
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

    if (!formData.login.trim()) {
      setErrors({ login: 'Username or email is required' });
      setLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setErrors({ password: 'Password is required' });
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData.login, formData.password);
      
      if (result.success) {
        navigate('/');
      } else {
        // Handle the errors returned from the backend
        const backendErrors: LoginErrors = {};
        
        if (result.errors) {
          // Handling field-level errors
          if (result.errors.username) {
            backendErrors.login = Array.isArray(result.errors.username) 
              ? result.errors.username[0] 
              : result.errors.username;
          }
          if (result.errors.password) {
            backendErrors.password = Array.isArray(result.errors.password) 
              ? result.errors.password[0] 
              : result.errors.password;
          }
          
          // Handling non-field errors
          if (result.errors.non_field_errors) {
            backendErrors.general = Array.isArray(result.errors.non_field_errors)
              ? result.errors.non_field_errors[0]
              : result.errors.non_field_errors;
          } else if (result.errors.detail) {
            backendErrors.general = result.errors.detail;
          } else if (typeof result.errors === 'string') {
            backendErrors.general = result.errors;
          } else {
            backendErrors.general = 'Invalid username or password';
          }
        } else {
          backendErrors.general = 'Login failed. Please try again.';
        }
        
        setErrors(backendErrors);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    }
    
    setLoading(false);
  };

  return {
    formData,
    showPassword,
    setShowPassword,
    errors,
    loading,
    handleChange,
    handleSubmit
  };
};
