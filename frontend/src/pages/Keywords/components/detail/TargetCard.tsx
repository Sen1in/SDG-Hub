import React from 'react';
import { KeywordResource } from '../../types';
import { SDGBadge } from '../shared/SDGBadge';

interface TargetCardProps {
  target: KeywordResource;
}

const ReferenceDisplay: React.FC<{ reference: any; label: string }> = ({ reference, label }) => {
  if (!reference) return null;

  return (
    <div className="bg-gray-50 p-3 rounded-md">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">{label}</h4>
      </div>
      <p className="text-sm text-gray-800 leading-relaxed">
        {reference.source}
      </p>
    </div>
  );
};

export const TargetCard: React.FC<TargetCardProps> = ({ target }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <SDGBadge sdg={target.sdg_number} size="lg" />
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-mono">
              {target.target_code}
            </span>
          </div>
          <p className="text-sm text-gray-600">{target.sdg_title}</p>
        </div>
      </div>

      {/* Target Description */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Target Description</h3>
        <p className="text-gray-700 leading-relaxed">{target.target_description}</p>
      </div>

      {/* References Section */}
      {(target.reference1_detail || target.reference2_detail || target.note) && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
            References & Notes
          </h3>
          
          {target.reference1_detail && (
            <ReferenceDisplay 
              reference={target.reference1_detail} 
              label="Reference 1" 
            />
          )}
          
          {target.reference2_detail && (
            <ReferenceDisplay 
              reference={target.reference2_detail} 
              label="Reference 2" 
            />
          )}
          
          {target.note && (
            <div className="bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
              <h4 className="text-sm font-medium text-blue-800 mb-1">Note</h4>
              <p className="text-sm text-blue-700">{target.note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
