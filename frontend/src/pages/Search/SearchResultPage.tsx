import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSearchData } from './hooks/useSearchData';
import { ResourceList } from './components/list/ResourceList';
import { Pagination } from './components/shared/Pagination';
import { ItemsPerPageSelector } from './components/filters/ItemPerPageSelector';
import { ErrorMessage } from './components/shared/ErrorMessage';
import { ListHeader } from './components/list/ListHeader';
import { SortSelector } from './components/filters/SortSelector';
import { FilterPanel } from './components/filters/FilterPanel'; 

const SearchResultPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(5);

  const sdgParam = searchParams.get('sdg') || '';
  const initialSDGs = sdgParam ? sdgParam.split(',').map(Number) : [];
  const initialLocation = searchParams.get('location') || '';
  const initialSource = searchParams.get('source') || '';

  const [selectedSDGs, setSelectedSDGs] = React.useState<number[]>(initialSDGs);
  const [selectedLocation, setSelectedLocation] = React.useState(initialLocation);
  const [selectedSource, setSelectedSource] = React.useState(initialSource);
  const [availableLocations, setAvailableLocations] = React.useState<string[]>([]);


  const [sort, setSort] = React.useState('unified_ranking');
  const { results, loading, totalPages, total, error } = useSearchData(
    query,
    currentPage,
    itemsPerPage,
    sort,
    selectedSDGs,
    selectedLocation,
    selectedSource
  );
  const stats = {
    filter_options: {
      years: [],
      locations: [
        "Australia", "United States", "New Zealand", "United Kingdom", "Italy",
        "Spain", "Global", "China", "Canada", "India"
      ],
      sdgs: Array.from({ length: 17 }, (_, i) => i + 1),
      sources: []
    },
    sdg_distribution: {}
  };



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setCurrentPage(1);
    setItemsPerPage(newItemsPerPage);
  };

  const handleResourceClick = (
    resourceId: number,
    type: 'education' | 'action' | 'keywords',
    title?: string // available parameter
  ) => {
    if (type === 'education') {
      navigate(`/education/${resourceId}`);
    } else if (type === 'action') {
      navigate(`/actions/${resourceId}`);
    } else if (type === 'keywords' && title) {
      navigate(`/keywords/${encodeURIComponent(title)}`);
    }
  };



  if (!query.trim()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Please enter a search term.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message={error} onRetry={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ListHeader totalResources={total} query={query} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* left filter*/}
          <div className="lg:w-1/4">
            <FilterPanel
              filters={{
                selectedSDGs,
                selectedLocation,
                selectedSource,
                searchQuery: '', 
                sortOrder: sort 
              }}
              stats={stats} 
              onUpdateFilter={(key: string, value: any) => {
                if (key === 'selectedLocation') setSelectedLocation(value as string);
                if (key === 'selectedSource') setSelectedSource(value as string);
              }}
              onToggleSDG={(sdg) => {
                setSelectedSDGs(prev =>
                  prev.includes(sdg) ? prev.filter(s => s !== sdg) : [...prev, sdg]
                );
                setCurrentPage(1);
              }}
              onClearFilters={() => {
                setSelectedLocation('');
                setSelectedSource('');
                setSelectedSDGs([]);
                setCurrentPage(1);
              }}
              onSearch={() => {
                setCurrentPage(1);
              }}
            />
          </div>

          {/* right result lists */}
          <div className="lg:w-3/4">
            {/* Sort selector above the list */}
            <div className="flex justify-end items-center mb-4">
              {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Total: {total} items</span>
              </div> */}
              <SortSelector sort={sort} onSortChange={(newSort) => {
                setSort(newSort);
                setCurrentPage(1);
              }} />
            </div>
            
            <ResourceList
              resources={results}
              loading={loading}
              onResourceClick={handleResourceClick}
            />
            
            <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-lg border border-gray-200">
              <ItemsPerPageSelector
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                options={[5, 10, 15, 20, 25, 50]}
              />
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

export default SearchResultPage;
