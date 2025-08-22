import React from 'react';
import { SearchResultResource } from '../../types';
import { SDGBadge } from '../shared/SDGBadge';
import LikeButton from '../../../../components/LikeButton/LikeButton'; 

interface Props {
  resource: SearchResultResource;
  onClick: (id: number) => void;
}

export const SearchResultCard: React.FC<Props> = ({ resource, onClick }) => {
  return (
    <div 
      className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onClick(resource.id)}
    >
      {/* Title + ❤️ */}
      <div className="col-span-4 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-gray-900">{resource.title}</h3>
          {(resource.source === 'education' || resource.source === 'actions') && (
            <LikeButton
              educationId={resource.source === 'education' ? resource.id : undefined}
              actionId={resource.source === 'actions' ? resource.id : undefined}
            />
          )}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{resource.description || ''}</p>
        {resource.location && (
          <p className="text-xs text-gray-500 mt-1">{resource.location}</p>
        )}
      </div>

      {/* SDGs */}
      <div className="col-span-3">
        <div className="flex flex-wrap gap-1">
          {resource.sdgs_list?.map(sdg => (
            <SDGBadge key={sdg} sdg={Number(sdg)} size="sm" />
          ))}
        </div>
      </div>

      {/* Organization */}
      <div className="col-span-3">
        <p className="text-sm text-gray-900">{resource.organization || '—'}</p>
      </div>

      {/* Sourse */}
      <div className="col-span-2">
        <p className="text-sm text-gray-900">{resource.source || '-'}</p>
      </div>
    </div>
  );
};


