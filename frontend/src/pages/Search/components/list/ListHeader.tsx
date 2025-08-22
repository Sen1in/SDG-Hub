import React from 'react';

interface ListHeaderProps {
  totalResources?: number;
  query: string;
}

export const ListHeader: React.FC<ListHeaderProps> = ({ totalResources, query }) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search results for "<span className="text-blue-600">{query}</span>"
          </h1>
          <p className="text-lg text-gray-600">
            {totalResources ? `${totalResources.toLocaleString()} Items Found` : 'Loading...'}
          </p>
        </div>
      </div>
    </div>
  );
};

