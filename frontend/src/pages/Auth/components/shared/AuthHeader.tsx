import React from 'react';
import { Link } from 'react-router-dom';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center">
      <Link to="/" className="inline-block">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white font-bold text-2xl">SDG</span>
        </div>
      </Link>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        {title}
      </h2>
      <p className="text-gray-600">
        {subtitle}
      </p>
    </div>
  );
};
