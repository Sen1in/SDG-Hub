import React from 'react';

interface ListHeaderProps {
  totalResources?: number;
  searchQuery?: string;
}

export const ListHeader: React.FC<ListHeaderProps> = ({ totalResources, searchQuery }) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SDG Education Database
          </h1>
          {searchQuery && searchQuery.trim() ? (
            <div className="mb-2">
              <p className="text-xl text-blue-600 font-medium">
                Search results for "{searchQuery}"
              </p>
            </div>
          ) : null}
          <p className="text-lg text-gray-600">
            {totalResources ? `${totalResources.toLocaleString()} Items Found` : 'Loading...'}
          </p>
        </div>
      </div>
    </div>
  );
};
