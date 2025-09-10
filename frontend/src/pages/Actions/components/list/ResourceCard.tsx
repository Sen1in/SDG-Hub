import React from 'react';
import { Link } from 'react-router-dom';
import { ActionsResource } from '../../types';
import { SDGBadge } from '../shared/SDGBadge';
import LikeButton from '../../../../components/LikeButton/LikeButton';

interface ResourceCardProps {
  resource: ActionsResource;
  onClick: (id: number) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onClick }) => {
  return (
    <Link
      to={`/actions/${resource.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 transition-colors block"
      onClick={() => onClick(resource.id)}
    >
      {/* Action Title + ❤️ */}
      <div className="col-span-4 flex flex-col justify-between">
        <div className="flex items-start justify-between">
        <h3 className="font-medium text-gray-900">{resource.actions}</h3>
        <LikeButton actionId={resource.id} />
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">{resource.action_detail}</p>
      {resource.location && (
        <p className="text-xs text-gray-500 mt-1">{resource.location}</p>
      )}
    </div>

      {/* Related SDGs */}
      <div className="col-span-3">
        <div className="flex flex-wrap gap-1">
          {resource.sdgs_list.map(sdg => (
            <SDGBadge key={sdg} sdg={sdg} size="sm" />
          ))}
        </div>
      </div>

      {/* Level & Type */}
      <div className="col-span-3">
        <div className="space-y-1">
          <p className="text-sm text-gray-900">{resource.level_label}</p>
          <p className="text-xs text-gray-600">{resource.individual_organization_label}</p>
        </div>
      </div>

      {/* Award & Digital Status */}
      <div className="col-span-2">
        <div className="space-y-1">
          {resource.award_label === 'Yes' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              🏆 Award
            </span>
          )}
          {resource.digital_actions_label === 'YES' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              💻 Digital
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};