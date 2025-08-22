import { useState } from 'react';
import { FilterState } from '../types';

export const useEducationFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedSDGs: [],
    selectedYear: '',
    selectedLocation: '',
    selectedOrganization: ''
  });

  const updateFilter = <K extends keyof FilterState>(
    key: K, 
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleSDG = (sdg: number) => {
    setFilters(prev => ({
      ...prev,
      selectedSDGs: prev.selectedSDGs.includes(sdg)
        ? prev.selectedSDGs.filter(s => s !== sdg)
        : [...prev.selectedSDGs, sdg]
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      selectedSDGs: [],
      selectedYear: '',
      selectedLocation: '',
      selectedOrganization: ''
    });
  };

  return {
    filters,
    updateFilter,
    toggleSDG,
    clearFilters
  };
};
