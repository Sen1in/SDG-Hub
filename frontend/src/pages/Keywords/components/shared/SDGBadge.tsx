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
  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-xs',
    lg: 'w-8 h-8 text-sm'
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded font-semibold text-white ${getSDGColor(sdg)} ${sizeClasses[size]} ${className}`}
      title={`SDG ${sdg} - ${getSDGTitle(sdg)}`}
    >
      {sdg}
      {showTitle && (
        <span className="ml-2 hidden sm:inline">{getSDGTitle(sdg)}</span>
      )}
    </span>
  );
};
