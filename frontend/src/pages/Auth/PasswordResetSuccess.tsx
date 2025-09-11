import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BackToHomeButton } from './components/shared/BackToHomeButton';
import { AuthFooter } from './components/shared/AuthFooter';

const PasswordResetSuccess: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <BackToHomeButton />

      <div className="max-w-md w-full space-y-8">
        
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
            <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Password Reset Successful!</h2>
          <p className="text-gray-600 mb-8">
            Your password has been successfully updated. You can now log in with your new password.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            
            <button
              onClick={handleBackToLogin}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              Back to Login
            </button>

            <div className="text-center text-sm text-gray-500">
              <p>Remember to keep your password secure and don't share it with anyone.</p>
            </div>

          </div>
        </div>

        <AuthFooter />

      </div>
    </div>
  );
};

export default PasswordResetSuccess;