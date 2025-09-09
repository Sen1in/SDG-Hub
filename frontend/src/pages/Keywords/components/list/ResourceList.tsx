import React from 'react';
import { KeywordResource } from '../../types';
import { KeywordCard } from './ResourceCard';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface KeywordListProps {
  keywords: KeywordResource[];
  loading: boolean;
  onKeywordClick: (id: number) => void;
}

export const ResourceList: React.FC<KeywordListProps> = ({
  keywords,
  loading,
  onKeywordClick
}) => {

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b text-sm font-medium text-gray-700">
        <div className="col-span-4">KEYWORD</div>
        <div className="col-span-4">RELATED SDGS</div>
        <div className="col-span-4">TARGET CODES</div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Loading keywords..." />
      ) : keywords.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No keywords found. Try adjusting your filters.
        </div>
      ) : (
        keywords.map((keyword, index) => (
          <KeywordCard
            key={`${keyword.keyword}-${index}`}
            keyword={keyword}
            onClick={onKeywordClick}
          />
        ))
      )}
    </div>
  );
};