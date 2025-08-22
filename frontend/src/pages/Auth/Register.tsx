import React from 'react';
import { BackToHomeButton } from './components/shared/BackToHomeButton';
import { AuthHeader } from './components/shared/AuthHeader';
import { UsernameField } from './components/shared/RegisterUsernameField';
import { EmailField } from './components/shared/EmailField';
import { EmailVerificationField } from './components/register/EmailVertifyPrompt';
import { PasswordField } from './components/shared/PasswordField';
import { PasswordConfirmField } from './components/register/PasswordConfirmField';
import { UserAgreement } from './components/register/UserAgreement';
import { ErrorMessage } from './components/shared/ErrorMessage';
import { SubmitButton } from './components/shared/SubmitButton';
import { LoginPrompt } from './components/register/LoginPrompt';
import { AuthFooter } from './components/shared/AuthFooter';
import { useRegisterForm } from './hooks/useRegisterForm';

const Register: React.FC = () => {
  const {
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
  } = useRegisterForm();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <BackToHomeButton />

      <div className="max-w-md w-full space-y-8">
        
        <AuthHeader 
          title="Create Account"
          subtitle="Join SDG Knowledge System"
        />

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <UsernameField 
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
            />

            <EmailField 
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
            
            <EmailVerificationField
              email={formData.email}
              code={formData.email_code}
              onChange={handleChange}
              error={errors.email_code}
              onSendCode={handleSendEmailCode}
            />

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

            <UserAgreement 
              checked={formData.agreedToTerms}
              onChange={handleChange}
              error={errors.agreedToTerms}
            />

            {errors.general && <ErrorMessage message={errors.general} />}

            <SubmitButton 
              loading={loading}
              loadingText="Creating account..."
              text="Create Account"
            />

            <LoginPrompt />

          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;