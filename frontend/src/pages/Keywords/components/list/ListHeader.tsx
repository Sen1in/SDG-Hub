import React from 'react';

interface ListHeaderProps {
  totalKeywords?: number;
}

export const ListHeader: React.FC<ListHeaderProps> = ({ totalKeywords }) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SDG Keyword Search
          </h1>
          <p className="text-lg text-gray-600 mb-1">
            Search specific words or phrases to determine their relevance to the 17 SDGs and 169 targets
          </p>
          <p className="text-md text-gray-500">
            {totalKeywords ? `${totalKeywords.toLocaleString()} Unique Keywords Available` : 'Loading...'}
          </p>
        </div>
      </div>
    </div>
  );
};
