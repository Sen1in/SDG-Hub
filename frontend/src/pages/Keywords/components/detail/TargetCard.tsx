import React from 'react';
import { KeywordResource } from '../../types';
import { SDGBadge } from '../shared/SDGBadge';

interface TargetCardProps {
  target: KeywordResource;
}

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
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-2">Target Description</h3>
        <p className="text-gray-700 leading-relaxed">{target.target_description}</p>
      </div>

      {/* References */}
      {(target.reference1 || target.reference2 || target.note) && (
        <div className="space-y-3">
          {target.reference1 && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-1">Reference 1</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{target.reference1}</p>
            </div>
          )}
          
          {target.reference2 && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-1">Reference 2</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{target.reference2}</p>
            </div>
          )}
          
          {target.note && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-1">Note</h4>
              <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">{target.note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
