import React from 'react';
import { EducationResource } from '../../types';
import { SidebarCard } from './SidebarCard';

interface ResourceLinksProps {
  resource: EducationResource;
}

export const ResourceLinks: React.FC<ResourceLinksProps> = ({ resource }) => {
  const hasLinks = (resource.link && resource.link.trim()) || (resource.source && resource.source.trim());

  if (!hasLinks) return null;

  return (
    <SidebarCard
      title="Additional Resources"
      icon={
        <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      }
    >
      <div className="space-y-4">
        {resource.link && resource.link.trim() && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <div>
                <p className="font-medium text-blue-900 mb-1">External Link</p>
                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                >
                  {resource.link}
                </a>
              </div>
            </div>
          </div>
        )}
        
        {resource.source && resource.source.trim() && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900 mb-1">Source</p>
                <p className="text-gray-700 text-sm">{resource.source}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarCard>
  );
};
