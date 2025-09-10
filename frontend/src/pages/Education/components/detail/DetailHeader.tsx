import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EducationResource } from '../../types';
import { SDGBadge } from '../shared/SDGBadge';
import { safeValue, safeArray } from '../../utils/helpers';

interface DetailHeaderProps {
  resource: EducationResource;
  liked: boolean;
  onToggleLike: () => void;
  onBack?: () => void; 
}

export const DetailHeader: React.FC<DetailHeaderProps> = ({ resource, liked, onToggleLike, onBack }) => {
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
    <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
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

        {/* SDG Badges */}
        {safeArray(resource.sdgs_list).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {safeArray(resource.sdgs_list).map(sdg => (
              <span
                key={sdg}
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white bg-white/20 shadow-lg"
              >
                <SDGBadge sdg={sdg} size="sm" className="mr-2" />
                SDG {sdg}
              </span>
            ))}
          </div>
        )}

        {/* Title & Like */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-4xl font-bold leading-tight">
            {safeValue(resource.title, 'Untitled Resource')}
          </h1>

          {/* Like Button */}
          <button
            onClick={onToggleLike}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium shadow-sm transition ${
              liked
                ? 'bg-red-100 text-red-600 border-red-200 hover:bg-red-200'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            <span>{liked ? '❤️' : '🤍'}</span>
            <span>{liked ? 'Liked' : 'Like'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};