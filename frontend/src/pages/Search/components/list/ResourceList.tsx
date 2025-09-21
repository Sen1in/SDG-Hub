import React from 'react';
import { SearchResultResource } from '../../types';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { SearchResultCard } from './SearchResultCard';

interface ResourceListProps {
  resources: SearchResultResource[];
  loading: boolean;
}

export const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  loading
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b text-sm font-medium text-gray-700">
        <div className="col-span-4">TITLE/KEYWORDS</div>
        <div className="col-span-3">RELATED SDGS</div>
        <div className="col-span-3">ORGANIZATION/TARGETS</div>
        <div className="col-span-2">SOURCE</div>
      </div>

      {/* Data list */}
      {loading ? (
        <LoadingSpinner text="Loading search results..." />
      ) : resources.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No matching results found.
        </div>
      ) : (
        resources.map((resource) => (
          <SearchResultCard
            key={`${resource.source}-${resource.id}`}
            resource={resource}
          />
        ))
      )}
    </div>
  );
};