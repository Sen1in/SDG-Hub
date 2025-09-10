import React from 'react';
import { useNavigate } from 'react-router-dom';

export const RegisterPrompt: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center text-sm text-gray-600">
      Don't have an account?&nbsp;&nbsp;&nbsp;
      <button
        type="button"
        onClick={() => navigate('/register')}
        className="text-blue-600 hover:text-blue-500 font-medium hover:underline"
      >
        Create a new account
      </button>
    </div>
  );
};