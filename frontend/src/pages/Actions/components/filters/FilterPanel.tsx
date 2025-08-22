import React from 'react';
import { SearchBar } from './SearchBar';
import { AutocompleteSearchBar } from '../../../../components/AutocompleteSearchBar';
import { LevelFilter } from './LevelFilter';
import { IndividualOrganizationFilter } from './IndividualOrganizationFilter';
import { LocationFilter } from './LocationFilter';
import { IndustryFilter } from './IndustryFilter';
import { DigitalActionsFilter } from './DigitalActionsFilter';
import { AwardFilter } from './AwardFilter';
import { SDGFilter } from './SDGFilter';
import { ActionsStats, FilterState } from '../../types';

interface FilterPanelProps {
  filters: FilterState;
  stats: ActionsStats | null;
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
        onChange={(value: string) => onUpdateFilter('searchQuery', value)}
        onSearch={(query: string) => {
          onUpdateFilter('searchQuery', query);
          onSearch();
        }}
        config={{
          placeholder: "Search actions...",
          minInputLength: 2,
          maxSuggestions: 5,
          showCount: true
        }}
        label="Search Resources"
      />

      {stats && (
        <>
          <LevelFilter
            value={filters.selectedLevel}
            onChange={(value: string) => onUpdateFilter('selectedLevel', value)}
            levels={stats.filter_options.levels}
          />

          <IndividualOrganizationFilter
            value={filters.selectedIndividualOrganization}
            onChange={(value: string) => onUpdateFilter('selectedIndividualOrganization', value)}
            options={stats.filter_options.individual_organization}
          />

          <LocationFilter
            value={filters.selectedLocation}
            onChange={(value: string) => onUpdateFilter('selectedLocation', value)}
            regions={stats.filter_options.regions}
          />

          <IndustryFilter
            value={filters.selectedIndustry}
            onChange={(value: string) => onUpdateFilter('selectedIndustry', value)}
            industries={stats.filter_options.industries}
          />

          <DigitalActionsFilter
            value={filters.selectedDigitalActions}
            onChange={(value: string) => onUpdateFilter('selectedDigitalActions', value)}
            options={stats.filter_options.digital_actions}
          />

          <AwardFilter
            value={filters.selectedAward}
            onChange={(value: string) => onUpdateFilter('selectedAward', value)}
            options={stats.filter_options.award}
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