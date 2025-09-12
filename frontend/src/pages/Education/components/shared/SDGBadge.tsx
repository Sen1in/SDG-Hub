import React from 'react';
import { getSDGColor, getSDGTitle } from '../../utils/sdg';

interface SDGBadgeProps {
  sdg: number;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
  className?: string;
}

export const SDGBadge: React.FC<SDGBadgeProps> = ({ 
  sdg, 
  size = 'md', 
  showTitle = false,
  className = '' 
}) => {
  const badgeSizeClasses = {
    sm: 'w-5 h-5 min-w-5 text-xs',
    md: 'w-6 h-6 min-w-6 text-xs', 
    lg: 'w-8 h-8 min-w-8 text-sm'
  };

  const titleTextSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (showTitle) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span
          className={`flex items-center justify-center rounded font-semibold text-white flex-shrink-0 ${getSDGColor(sdg)} ${badgeSizeClasses[size]}`}
          title={`SDG ${sdg} - ${getSDGTitle(sdg)}`}
        >
          {sdg}
        </span>
        <span className={`font-medium text-gray-700 ${titleTextSizes[size]} hidden sm:inline`}>
          {getSDGTitle(sdg)}
        </span>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded font-semibold text-white flex-shrink-0 ${getSDGColor(sdg)} ${badgeSizeClasses[size]} ${className}`}
      title={`SDG ${sdg} - ${getSDGTitle(sdg)}`}
    >
      {sdg}
    </span>
  );
};