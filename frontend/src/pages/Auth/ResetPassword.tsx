import React from 'react';
import { BackToHomeButton } from './components/shared/BackToHomeButton';
import { AuthHeader } from './components/shared/AuthHeader';
import { PasswordField } from './components/shared/PasswordField';
import { PasswordConfirmField } from './components/register/PasswordConfirmField';
import { ErrorMessage } from './components/shared/ErrorMessage';
import { SubmitButton } from './components/shared/SubmitButton';
import { AuthFooter } from './components/shared/AuthFooter';
import { useResetPasswordForm } from './hooks/useResetPasswordForm';

const ResetPassword: React.FC = () => {
  const {
    formData,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    errors,
    loading,
    handleChange,
    handleSubmit
  } = useResetPasswordForm();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <BackToHomeButton />

      <div className="max-w-md w-full space-y-8">
        
        <AuthHeader 
          title="Reset Password"
          subtitle="Enter your new password"
        />

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <PasswordField 
              value={formData.password}
              onChange={handleChange}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              error={errors.password}
            />

            <PasswordConfirmField 
              value={formData.password_confirm}
              onChange={handleChange}
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              error={errors.password_confirm}
            />

            {errors.general && <ErrorMessage message={errors.general} />}

            <SubmitButton 
              loading={loading}
              loadingText="Resetting password..."
              text="Reset Password"
            />

          </form>
        </div>

        <AuthFooter />

      </div>
    </div>
  );
};

export default ResetPassword;