import React from 'react';
import { KeywordResource } from '../../types';
import { SDGBadge } from '../shared/SDGBadge';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface KeywordListProps {
  keywords: KeywordResource[];
  loading: boolean;
  onKeywordClick: (keyword: string) => void;
}

export const KeywordList: React.FC<KeywordListProps> = ({
  keywords,
  loading,
  onKeywordClick
}) => {

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <LoadingSpinner text="Loading keywords..." />
      </div>
    );
  }

  if (keywords.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-12 text-center text-gray-500">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No keywords found</h3>
          <p>Try searching with different terms or adjust your filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Instructional message */}
      <div className="p-4 bg-blue-50 border-b">
        <div className="flex items-center text-blue-800">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">
            Click on any keyword to see detailed information and related targets
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keyword
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Related SDGs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target Codes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {keywords.map((keyword, index) => (
              <tr 
                key={`${keyword.keyword}-${index}`}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onKeywordClick(keyword.keyword)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900 capitalize">
                    {keyword.keyword}
                  </div>
                  <div className="text-sm text-gray-500">
                    {keyword.target_count || 1} target{(keyword.target_count || 1) > 1 ? 's' : ''}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {keyword.all_targets && keyword.all_targets.length > 0 ? (
                      
                      Array.from(new Set(keyword.all_targets.map(t => t.sdg_number)))
                        .sort((a, b) => a - b)
                        .map(sdgNumber => (
                          <div key={sdgNumber} className="flex items-center gap-1">
                            <SDGBadge sdg={sdgNumber} size="sm" />
                          </div>
                        ))
                    ) : (
                      
                      <div className="flex items-center gap-1">
                        <SDGBadge sdg={keyword.sdg_number} size="sm" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};