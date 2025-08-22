import { useState, useEffect, useRef } from 'react';
import { ActionsResource, ActionsStats, FilterState } from '../types';
import { fetchActionsResources, fetchActionsStats } from '../utils/api';

export const useActionsData = (filters: FilterState, page: number, itemsPerPage: number = 20) => {
  const [resources, setResources] = useState<ActionsResource[]>([]);
  const [stats, setStats] = useState<ActionsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Used to track the currently active requests
  const currentRequestRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = async (requestFilters: FilterState, requestPage: number, requestItemsPerPage: number) => {
    // Generate a unique request ID
    const requestId = ++currentRequestRef.current;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchActionsResources(requestPage, requestFilters, requestItemsPerPage);
      
      // Check whether this response is still the latest request.
      if (requestId === currentRequestRef.current) {
        setResources(data.results);
        setTotalPages(Math.ceil(data.count / requestItemsPerPage));
      } else {
        console.log(`[Request ${requestId}] Discarding outdated response. Current:`, currentRequestRef.current);
      }
    } catch (err) {
      // Only the current request is processed for errors.
      if (requestId === currentRequestRef.current) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching Actions data:', err);
      }
    } finally {
      // Only the current request sets the 'loading' property to false.
      if (requestId === currentRequestRef.current) {
        setLoading(false);
      }
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await fetchActionsStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Use useEffect to listen for parameter changes, but add an anti-shake mechanism
  useEffect(() => {
    // Clear the previous timer
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
    //  Directly monitor the individual attributes of the filters, rather than the entire object
    filters.searchQuery,
    filters.selectedLevel,
    filters.selectedIndividualOrganization,
    filters.selectedLocation,
    filters.selectedIndustry,
    filters.selectedDigitalActions,
    filters.selectedAward,
    JSON.stringify(filters.selectedSDGs) // SDGs The array needs to be serialized.
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