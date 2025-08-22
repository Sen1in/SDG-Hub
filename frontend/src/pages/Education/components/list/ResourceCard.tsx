import React from 'react';
import { EducationResource } from '../../types';
import { SDGBadge } from '../shared/SDGBadge';
import LikeButton from '../../../../components/LikeButton/LikeButton';

interface ResourceCardProps {
  resource: EducationResource;
  onClick: (id: number) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onClick }) => {
  return (
    <div 
      className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onClick(resource.id)}
    >
      {/* Title + ❤️ */}
      <div className="col-span-4 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-gray-900">{resource.title}</h3>
          <LikeButton educationId={resource.id} />
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{resource.description}</p>
        {resource.location && (
          <p className="text-xs text-gray-500 mt-1">{resource.location}</p>
        )}
      </div>

      {/* SDGs */}
      <div className="col-span-3">
        <div className="flex flex-wrap gap-1">
          {resource.sdgs_list.map(sdg => (
            <SDGBadge key={sdg} sdg={sdg} size="sm" />
          ))}
        </div>
      </div>

      {/* Organization */}
      <div className="col-span-3">
        <p className="text-sm text-gray-900">{resource.organization}</p>
      </div>

      {/* Year */}
      <div className="col-span-2">
        <p className="text-sm text-gray-900">{resource.year || '-'}</p>
      </div>
    </div>
  );
};