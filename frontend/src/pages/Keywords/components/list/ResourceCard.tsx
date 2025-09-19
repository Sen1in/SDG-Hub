import React from 'react';
import { Link } from 'react-router-dom';
import { KeywordResource } from '../../types';
import { SDGBadge } from '../shared/SDGBadge';

interface ResourceCardProps {
  keyword: KeywordResource;
  onClick: (id: number) => void;
}

export const KeywordCard: React.FC<ResourceCardProps> = ({ keyword, onClick }) => {
  return (
    <Link
      to={`/keywords/${encodeURIComponent(keyword.keyword)}`}
      target="_blank"
      rel="noreferrer"
      className="block p-4 border-b hover:bg-gray-50 transition-colors"
      onClick={() => onClick(keyword.id)}
    >
      <div className="grid grid-cols-12 gap-4">
        
        {/* Keyword Info */}
        <div className="col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-gray-900 capitalize mb-1">
              {keyword.keyword}
            </h3>
            <p className="text-sm text-gray-500">
              {keyword.target_count || 1} target{(keyword.target_count || 1) > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Related SDGs */}
        <div className="col-span-4">
          <div className="flex flex-wrap gap-1">
            {keyword.all_targets && keyword.all_targets.length > 0 ? (
              Array.from(new Set(keyword.all_targets.map(t => t.sdg_number)))
                .sort((a, b) => a - b)
                .map(sdgNumber => (
                  <SDGBadge key={sdgNumber} sdg={sdgNumber} size="sm" />
                ))
            ) : (
              <SDGBadge sdg={keyword.sdg_number} size="sm" />
            )}
          </div>
        </div>

        {/* Target Codes */}
        <div className="col-span-4">
          <div className="flex flex-wrap gap-1">
            {keyword.all_targets && keyword.all_targets.length > 0 ? (
              Array.from(new Set(keyword.all_targets.map(t => t.target_code)))
                .sort()
                .map(targetCode => (
                  <span 
                    key={targetCode}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 font-mono"
                  >
                    {targetCode}
                  </span>
                ))
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 font-mono">
                {keyword.target_code}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};