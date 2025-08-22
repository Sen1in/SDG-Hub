import React from 'react';
import { EducationResource } from '../../types';
import { ResourceCard } from './ResourceCard';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface ResourceListProps {
  resources: EducationResource[];
  loading: boolean;
  onResourceClick: (id: number) => void;
}

export const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  loading,
  onResourceClick
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b text-sm font-medium text-gray-700">
        <div className="col-span-4">TITLE</div>
        <div className="col-span-3">RELATED SDGS</div>
        <div className="col-span-3">ORGANIZATION</div>
        <div className="col-span-2">YEAR</div>
      </div>

      {/* Data row */}
      {loading ? (
        <LoadingSpinner text="Loading resources..." />
      ) : resources.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No resources found. Try adjusting your filters.
        </div>
      ) : (
        resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onClick={onResourceClick}
          />
        ))
      )}
    </div>
  );
};
