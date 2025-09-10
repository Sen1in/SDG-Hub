import React from 'react';
import { DatabaseType, SearchFilters as SearchFiltersType } from '../../types';

interface SearchFiltersProps {
  database: DatabaseType;
  filters: SearchFiltersType;
  onUpdateFilters: (filters: Partial<SearchFiltersType>) => void;
  onSearch: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  database,
  filters,
  onUpdateFilters,
  onSearch
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const handleClearFilters = () => {
    onUpdateFilters({
      search: '',
      year: '',
      page: 1
    });
    // Auto search after clearing
    setTimeout(onSearch, 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search by Title
            </label>
            <input
              type="text"
              placeholder={`Search ${database} records...`}
              value={filters.search}
              onChange={(e) => onUpdateFilters({ search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Year/Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {database === 'education' ? 'Year' : 'Level'}
            </label>
            <select
              value={filters.year}
              onChange={(e) => onUpdateFilters({ year: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All {database === 'education' ? 'Years' : 'Levels'}</option>
              {database === 'education' ? (
                // Year options for education
                <>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                </>
              ) : (
                // Level options for actions
                <>
                  <option value="1">Level 1 - Individual action (on Couch)</option>
                  <option value="2">Level 2 - Individual action (at Home)</option>
                  <option value="3">Level 3 - Individual action (in Community)</option>
                  <option value="4">Level 4 - Individual action (at School and Work)</option>
                  <option value="5">Level 5 - Organization action</option>
                  <option value="6">Level 6 - Government action</option>
                </>
              )}
            </select>
          </div>

          {/* Page Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Records per page
            </label>
            <select
              value={filters.page_size}
              onChange={(e) => onUpdateFilters({ page_size: Number(e.target.value), page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </form>

      {/* Filter Summary */}
      {(filters.search || filters.year) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Search: "{filters.search}"
                <button
                  onClick={() => onUpdateFilters({ search: '' })}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.year && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                {database === 'education' ? 'Year' : 'Level'}: {filters.year}
                <button
                  onClick={() => onUpdateFilters({ year: '' })}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};