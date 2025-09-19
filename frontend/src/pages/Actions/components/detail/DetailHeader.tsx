import React from 'react';
import { ActionsResource } from '../../types';
import { SDGBadge } from '../shared/SDGBadge';
import { useNavigate } from 'react-router-dom';

interface DetailHeaderProps {
  resource: ActionsResource;
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
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            {resource.actions}
          </h1>

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

          <div className="flex flex-wrap gap-3">
            {resource.level_label && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20">
                📊 {resource.level_label}
              </span>
            )}
            {resource.individual_organization_label && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20">
                👥 {resource.individual_organization_label}
              </span>
            )}
            {resource.award_label === 'Yes' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500 bg-opacity-90">
                🏆 Award Winner
              </span>
            )}
            {resource.digital_actions_label === 'YES' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500 bg-opacity-90">
                💻 Digital Action
              </span>
            )}
          </div>

          {resource.sdgs_list.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {resource.sdgs_list.map(sdg => (
                <SDGBadge key={sdg} sdg={sdg} size="md" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};