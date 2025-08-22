import React from 'react';
import { LocationFilter } from './LocationFilter';
import { SDGFilter } from './SDGFilter';
import { SourceFilter } from './SourceFilter';
import { SearchStats, FilterState } from '../../types';

interface FilterPanelProps {
  filters: FilterState;
  stats: SearchStats | null;
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
      

      {stats && (
        <>
          <LocationFilter
            value={filters.selectedLocation}
            onChange={(value) => onUpdateFilter('selectedLocation', value)}
            regions={stats.filter_options.locations}
          />

          <SourceFilter
            value={filters.selectedSource}
            onChange={(value) => onUpdateFilter('selectedSource', value)}
          />
          
          <SDGFilter
            selectedSDGs={filters.selectedSDGs}
            onToggle={onToggleSDG}
            sdgOptions={stats.filter_options.sdgs.map((num) => ({ value: num, label: `SDG ${num}` }))}
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