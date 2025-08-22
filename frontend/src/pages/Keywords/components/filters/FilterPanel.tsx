import React from 'react';
import { AutocompleteSearchBar } from '../../../../components/AutocompleteSearchBar';
import { SearchBar } from './SearchBar';
import { SDGFilter } from './SDGFilter';
import { TargetCodeFilter } from './TargetCodeFilter';
import { KeywordStats, FilterState } from '../../types';

interface FilterPanelProps {
  filters: FilterState;
  stats: KeywordStats | null;
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onToggleSDG: (sdg: number) => void;
  onSearch: () => void;
  onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  stats,
  onUpdateFilter,
  onToggleSDG,
  onSearch,
  onClearFilters
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
      
      <SearchBar
        value={filters.searchQuery}
        onChange={(value) => onUpdateFilter('searchQuery', value)}
        onSearch={() => {
          onSearch();
        }}
        placeholder="Search Keywords"
      />

      {stats && (
        <>
          <SDGFilter
            selectedSDGs={filters.selectedSDGs}
            onToggle={onToggleSDG}
            sdgOptions={stats.filter_options.sdgs}
            sdgDistribution={stats.sdg_distribution}
          />

          <TargetCodeFilter
            value={filters.targetCode}
            onChange={(value) => onUpdateFilter('targetCode', value)}
            targetCodes={stats.filter_options.target_codes}
          />
        </>
      )}

      <button
        onClick={onClearFilters}
        className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
};
