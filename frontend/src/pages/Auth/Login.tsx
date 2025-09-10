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
import { GoogleLoginButton } from './components/login/GoogleLoginButton';
import { useLoginForm } from './hooks/useLoginForm';
import { useGoogleLogin } from './hooks/useGoogleLogin';

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

  const {
    googleLoading,
    handleGoogleLogin
  } = useGoogleLogin();

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

          </form>

          {/* 分割线 */}
          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
          </div>

          {/* Google登录按钮 */}
          <GoogleLoginButton 
            onGoogleLogin={handleGoogleLogin}
            loading={googleLoading}
          />

          {/* 注册提示 */}
          <div className="mt-6">
            <RegisterPrompt />
          </div>

        </div>

        <AuthFooter />

      </div>
    </div>
  );
};

export default Login;