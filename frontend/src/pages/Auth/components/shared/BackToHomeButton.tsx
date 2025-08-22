import React from 'react';
import { useNavigate } from 'react-router-dom';

export const BackToHomeButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-6 left-6 z-10">
      <button
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all duration-200 group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm font-medium">Back to Home</span>
      </button>
    </div>
  );
};
