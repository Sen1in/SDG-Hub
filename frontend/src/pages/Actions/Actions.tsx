import React from 'react';
import { ListHeader } from './components/list/ListHeader';
import { FilterPanel } from './components/filters/FilterPanel';
import { ResourceList } from './components/list/ResourceList';
import { Pagination } from './components/shared/Pagination';
import { ErrorMessage } from './components/shared/ErrorMessage';
import { ItemsPerPageSelector } from './components/filters/ItemPerPageSelector';
import { useActionsData } from './hooks/useActionsData';
import { useActionsFilters } from './hooks/useActionsFilters';
import { usePagination } from './hooks/usePagination';

import { useAuth } from '../../contexts/AuthContext';
import { trackSearch } from '../../services/tracker';
import { trackClick } from '../../services/tracker';

const Actions: React.FC = () => {
  const { user } = useAuth();
  const { filters, updateFilter, toggleSDG, clearFilters } = useActionsFilters();
  const { currentPage, goToPage, resetPage } = usePagination();
  
  // Number of items displayed per page status
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  
  // use hook
  const { resources, stats, loading, totalPages, error, triggerSearch } = useActionsData(
    filters, 
    currentPage, 
    itemsPerPage
  );

  const handleResourceClick = (resourceId: number) => {
    if (user?.id) {
      trackClick('action', resourceId);
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message={error} onRetry={triggerSearch} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <ListHeader 
        totalResources={stats?.total_resources} 
        searchQuery={filters.searchQuery}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left filter */}
          <div className="lg:w-1/4">
            <FilterPanel
              filters={filters}
              stats={stats}
              onUpdateFilter={handleFilterChange}
              onToggleSDG={(sdg) => {
                toggleSDG(sdg);
                resetPage();
              }}
              onSearch={() => {
                if (user?.id && filters.searchQuery?.trim()) {
                  trackSearch(user.id.toString(), filters.searchQuery);
                }
                resetPage();
              }}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* The right result area */}
          <div className="lg:w-3/4">
            <ResourceList
              resources={resources}
              loading={loading}
              onResourceClick={handleResourceClick}
            />

            {/* Bottom navigation bar */}
            <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-lg border border-gray-200">
              {/* Left side: Component for selecting the number of items displayed per page */}
              <ItemsPerPageSelector
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                options={[5, 10, 15, 20, 25, 50]}
              />

              {/* Right side: Pagination component */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Actions;