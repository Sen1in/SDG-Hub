import React from 'react';
import { BackToHomeButton } from './components/shared/BackToHomeButton';
import { AuthHeader } from './components/shared/AuthHeader';
import { UsernameField } from './components/shared/LoginUsernameField';
import { PasswordField } from './components/shared/PasswordField';
import { FormActions } from './components/login/FormActions';
import { ErrorMessage } from './components/shared/ErrorMessage';
import { SubmitButton } from './components/shared/SubmitButton';
import { RegisterPrompt } from './components/login/RegisterPrompt';
import { AuthFooter } from './components/shared/AuthFooter';
import { useLoginForm } from './hooks/useLoginForm';

const Login: React.FC = () => {
  const {
    formData,
    showPassword,
    setShowPassword,
    errors,
    loading,
    handleChange,
    handleSubmit
  } = useLoginForm();

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <BackToHomeButton />

      <div className="max-w-md w-full space-y-8">
        
        <AuthHeader 
          title="Welcome Back"
          subtitle="Login to access SDG Knowledge System"
        />

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <UsernameField 
              value={formData.login}
              onChange={handleChange}
              error={errors.login}
            />

            <PasswordField 
              value={formData.password}
              onChange={handleChange}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              error={errors.password}
            />

            <FormActions onForgotPassword={handleForgotPassword} />

            {errors.general && <ErrorMessage message={errors.general} />}

            <SubmitButton 
              loading={loading}
              loadingText="Logging in..."
              text="Login"
            />

            <RegisterPrompt />

          </form>
        </div>

        <AuthFooter />

      </div>
    </div>
  );
};

export default Login;