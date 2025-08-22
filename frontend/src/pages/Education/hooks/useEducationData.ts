import { useState, useEffect, useRef } from 'react';
import { EducationResource, EducationStats, FilterState } from '../types';
import { fetchEducationResources, fetchEducationStats } from '../utils/api';

export const useEducationData = (filters: FilterState, page: number, itemsPerPage: number = 20) => {
  const [resources, setResources] = useState<EducationResource[]>([]);
  const [stats, setStats] = useState<EducationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);


  const currentRequestRef = useRef<number>(0);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = async (requestFilters: FilterState, requestPage: number, requestItemsPerPage: number) => {

    const requestId = ++currentRequestRef.current;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchEducationResources(requestPage, requestFilters, requestItemsPerPage);
      

      if (requestId === currentRequestRef.current) {
        setResources(data.results);
        setTotalPages(Math.ceil(data.count / requestItemsPerPage));
      } else {
        console.log(`[Education Request ${requestId}] Discarding outdated response. Current:`, currentRequestRef.current);
      }
    } catch (err) {

      if (requestId === currentRequestRef.current) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching education data:', err);
      }
    } finally {

      if (requestId === currentRequestRef.current) {
        setLoading(false);
      }
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await fetchEducationStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };


  useEffect(() => {

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }


    timeoutRef.current = setTimeout(() => {
      loadData(filters, page, itemsPerPage);
    }, 200);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    page,
    itemsPerPage,
    filters.searchQuery,
    filters.selectedYear,
    filters.selectedLocation,
    filters.selectedOrganization,
    JSON.stringify(filters.selectedSDGs) 
  ]);

  useEffect(() => {
    loadStats();
  }, []);

  const triggerSearch = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    loadData(filters, page, itemsPerPage);
  };

  return {
    resources,
    stats,
    loading,
    totalPages,
    error,
    triggerSearch
  };
};