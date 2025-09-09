import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ListHeader } from './components/list/ListHeader';
import { FilterPanel } from './components/filters/FilterPanel';
import { ResourceList } from './components/list/ResourceList';
import { Pagination } from './components/shared/Pagination';
import { ErrorMessage } from './components/shared/ErrorMessage';
import { ItemsPerPageSelector } from './components/filters/ItemPerPageSelector';
import { useKeywordData } from './hooks/useKeywordData';
import { useKeywordFilters } from './hooks/useKeywordFilters';
import { usePagination } from './hooks/usePagination';

import { useAuth } from '../../contexts/AuthContext';
import { trackSearch } from '../../services/tracker';
import { trackClick } from '../../services/tracker';

const Keywords: React.FC = () => {
  const { user } = useAuth();
  const { filters, updateFilter, toggleSDG, clearFilters } = useKeywordFilters();
  const { currentPage, goToPage, resetPage } = usePagination();
  
  const [itemsPerPage, setItemsPerPage] = React.useState(20);
  
  const { keywords, stats, loading, totalPages, error, triggerSearch } = useKeywordData(
    filters, 
    currentPage, 
    itemsPerPage
  );

  const handleKeywordClick = (keywordId: number) => {
    console.log('Keyword clicked:', keywordId);
    trackClick('keyword', keywordId);
  };

  const handleClearFilters = () => {
    clearFilters();
    resetPage();
  };

  const handlePageChange = (page: number) => {
    goToPage(page);
  };

  const handleFilterChange = <K extends keyof typeof filters>(key: K, value: typeof filters[K]) => {
    updateFilter(key, value);
    resetPage();
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    resetPage();
    setItemsPerPage(newItemsPerPage);
  };

  const handleSearch = () => {
    if (user?.id && filters.searchQuery?.trim()) {
      trackSearch(user.id.toString(), filters.searchQuery);
    }
    resetPage();
    triggerSearch();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message={error} onRetry={triggerSearch} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <ListHeader totalKeywords={stats?.unique_keywords} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left */}
          <div className="lg:w-1/4">
            <FilterPanel
              filters={filters}
              stats={stats}
              onUpdateFilter={handleFilterChange}
              onToggleSDG={(sdg) => {
                toggleSDG(sdg);
                resetPage();
              }}
              onSearch={handleSearch}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Right Result */}
          <div className="lg:w-3/4">
            <ResourceList
              keywords={keywords}
              loading={loading}
              onKeywordClick={handleKeywordClick}
            />

            {/* Bottom */}
            {!loading && keywords.length > 0 && (
              <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-lg border border-gray-200">
                <ItemsPerPageSelector
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  options={[10, 20, 30, 50]}
                />

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Keywords;