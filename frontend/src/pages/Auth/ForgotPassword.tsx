import React from 'react';
import { BackToHomeButton } from './components/shared/BackToHomeButton';
import { AuthHeader } from './components/shared/AuthHeader';
import { EmailField } from './components/shared/EmailField';
import { EmailVerificationField } from './components/register/EmailVertifyPrompt';
import { ErrorMessage } from './components/shared/ErrorMessage';
import { SubmitButton } from './components/shared/SubmitButton';
import { AuthFooter } from './components/shared/AuthFooter';
import { useForgotPasswordForm } from './hooks/useForgotPasswordForm';

const ForgotPassword: React.FC = () => {
  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    handleSendEmailCode
  } = useForgotPasswordForm();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <BackToHomeButton />

      <div className="max-w-md w-full space-y-8">
        
        <AuthHeader 
          title="Reset Password"
          subtitle="Enter your email to receive verification code"
        />

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
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

            {errors.general && <ErrorMessage message={errors.general} />}

            <SubmitButton 
              loading={loading}
              loadingText="Verifying..."
              text="Verify Code"
            />

            <div className="text-center">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Back to Login
              </button>
            </div>

          </form>
        </div>

        <AuthFooter />

      </div>
    </div>
  );
};

export default ForgotPassword;