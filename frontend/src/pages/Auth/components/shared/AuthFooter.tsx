import React from 'react';

export const AuthFooter: React.FC = () => {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500">
        By continuing, you agree to our{' '}
        <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
        {' '}and{' '}
        <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
      </p>
    </div>
  );
};