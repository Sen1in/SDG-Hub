import React from 'react';
import { EducationResource } from '../../types';
import { safeValue, safeArray } from '../../utils/helpers';

interface QuickInfoGridProps {
  resource: EducationResource;
}

export const QuickInfoGrid: React.FC<QuickInfoGridProps> = ({ resource }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-medium text-white/90">Organization</span>
            </div>
            <p className="font-semibold">{safeValue(resource.organization)}</p>
          </div>
          
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium text-white/90">Location</span>
            </div>
            <p className="font-semibold">{safeValue(resource.location)}</p>
          </div>
          
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium text-white/90">Year</span>
            </div>
            <p className="font-semibold">{safeValue(resource.year)}</p>
          </div>
          
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="font-medium text-white/90">Type</span>
            </div>
            <p className="font-semibold">
              {safeArray(resource.type_list).length > 0 
                ? safeArray(resource.type_list).join(', ') 
                : safeValue(resource.type_label, 'Not specified')
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
