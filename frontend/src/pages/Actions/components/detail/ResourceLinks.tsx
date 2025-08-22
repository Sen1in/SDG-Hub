import React from 'react';
import { ActionsResource } from '../../types';

interface ResourceLinksProps {
  resource: ActionsResource;
}

export const ResourceLinks: React.FC<ResourceLinksProps> = ({ resource }) => {
  const hasSourceInfo = resource.source_descriptions || resource.source_links;
  
  if (!hasSourceInfo) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-4">
        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">Resource Links</h3>
      </div>
      
      <div className="space-y-4">
        {resource.source_descriptions && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Source Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{resource.source_descriptions}</p>
          </div>
        )}
        
        {resource.source_links && (
          <div>
            <p className="font-medium text-blue-900 mb-1">External Link</p>
            <a
              href={resource.source_links}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
            >
              {resource.source_links}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};