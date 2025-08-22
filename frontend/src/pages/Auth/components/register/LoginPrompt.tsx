import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginPrompt: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Already have an account?</span>
        </div>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-blue-600 hover:text-blue-500 font-medium text-sm hover:underline"
        >
          Sign in to your account
        </button>
      </div>
    </>
  );
};
