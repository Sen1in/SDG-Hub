import { useState, useEffect, useRef } from 'react';
import { KeywordResource, KeywordStats, FilterState } from '../types';
import { fetchKeywordSearch, fetchKeywordStats } from '../utils/api';

export const useKeywordData = (filters: FilterState, page: number, itemsPerPage: number = 20) => {
  const [keywords, setKeywords] = useState<KeywordResource[]>([]);
  const [stats, setStats] = useState<KeywordStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const currentRequestRef = useRef<number>(0);

  const loadData = async (requestFilters: FilterState, requestPage: number, requestItemsPerPage: number) => {
    const requestId = ++currentRequestRef.current;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchKeywordSearch(requestPage, requestFilters, requestItemsPerPage);
      
      if (requestId === currentRequestRef.current) {
        setKeywords(data.results);
        setTotalPages(Math.ceil((data.count || 0) / requestItemsPerPage));
      }
    } catch (err) {
      if (requestId === currentRequestRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
      }
    } finally {
      if (requestId === currentRequestRef.current) {
        setLoading(false);
      }
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await fetchKeywordStats();
      setStats(statsData);
    } catch (err) {
    }
  };

  // Check if there are any filtering conditions
  const hasFilters = () => {
    return !!(
      filters.searchQuery?.trim() ||
      filters.selectedSDGs.length > 0 ||
      filters.targetCode?.trim()
    );
  };

  useEffect(() => {
    
    if (hasFilters()) {
      // Load data when filtering conditions are present
      loadData(filters, page, itemsPerPage);
    } else {
      // Clear the results when there are no filtering conditions
      setKeywords([]);
      setLoading(false);
      setTotalPages(1);
    }
  }, [filters.searchQuery, filters.selectedSDGs, filters.targetCode, page, itemsPerPage]);

  useEffect(() => {
    loadStats();
  }, []);

  const triggerSearch = () => {
    if (hasFilters()) {
      loadData(filters, page, itemsPerPage);
    }
  };

  return {
    keywords,
    stats,
    loading,
    totalPages,
    error,
    triggerSearch
  };
};