import { useState } from 'react';
import { FilterState } from '../types';

export const useKeywordFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedSDGs: [],
    targetCode: ''
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
      targetCode: ''
    });
  };

  return {
    filters,
    updateFilter,
    toggleSDG,
    clearFilters
  };
};