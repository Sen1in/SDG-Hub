import React from 'react';
import { useNavigate } from 'react-router-dom';

interface DetailHeaderProps {
  keyword: string;
  totalTargets: number;
  onBack?: () => void; 
}

export const DetailHeader: React.FC<DetailHeaderProps> = ({ keyword, totalTargets, onBack }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (window.history.length <= 1) {
      window.close();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-white/90 hover:text-white font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 capitalize">
            "{keyword}"
          </h1>
          <p className="text-xl text-purple-100">
            Related to {totalTargets} SDG target{totalTargets !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};