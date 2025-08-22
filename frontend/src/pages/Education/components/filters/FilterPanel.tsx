import React from 'react';
import { SearchBar } from './SearchBar';
import { AutocompleteSearchBar } from '../../../../components/AutocompleteSearchBar';
import { OrganizationFilter } from './OrganizationFilter';
import { LocationFilter } from './LocationFilter';
import { YearFilter } from './YearFilter';
import { SDGFilter } from './SDGFilter';
import { EducationStats, FilterState } from '../../types';

interface FilterPanelProps {
  filters: FilterState;
  stats: EducationStats | null;
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
      
      <AutocompleteSearchBar
        value={filters.searchQuery}
        onChange={(value) => onUpdateFilter('searchQuery', value)}
        onSearch={(query: string) => {
          onUpdateFilter('searchQuery', query);
          onSearch();
        }}
        config={{
          placeholder: "Search resources...",
          minInputLength: 2,
          maxSuggestions: 5,
          showCount: true
        }}
        label="Search Resources"
      />

      <OrganizationFilter
        value={filters.selectedOrganization}
        onChange={(value) => onUpdateFilter('selectedOrganization', value)}
        onSearch={onSearch}
      />

      {stats && (
        <>
          <LocationFilter
            value={filters.selectedLocation}
            onChange={(value) => onUpdateFilter('selectedLocation', value)}
            regions={stats.filter_options.regions}
          />

          <YearFilter
            value={filters.selectedYear}
            onChange={(value) => onUpdateFilter('selectedYear', value)}
            years={stats.filter_options.years}
          />

          <SDGFilter
            selectedSDGs={filters.selectedSDGs}
            onToggle={onToggleSDG}
            sdgOptions={stats.filter_options.sdgs}
            sdgDistribution={stats.sdg_distribution}
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
