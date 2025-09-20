import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchHit {
  id: string;
  type: string;
  title: string;
  summary: string;
  url: string;
  _formatted?: {
    title?: string;
    summary?: string;
  };
}

interface InstantSearchResult {
  hits: SearchHit[];
  processingTimeMs: number;
  query: string;
  nbHits: number;
  error?: string;
}

interface UseInstantActionsSearchReturn {
  hits: SearchHit[];
  loading: boolean;
  error: string | null;
  processingTime: number;
}

/**
 * Custom hook for instant search with Meilisearch specifically for Actions
 * Provides real-time search results with debouncing and highlighting
 */
export const useInstantActionsSearch = (
  query: string,
  debounceMs: number = 200,
  minQueryLength: number = 2
): UseInstantActionsSearchReturn => {
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState(0);

  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const performSearch = useCallback(async (searchQuery: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        q: searchQuery,
        limit: '8',
        type: 'action'  // Filter for actions only
      });

      const response = await fetch(`/api/search/instant/?${params}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data: InstantSearchResult = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setHits(data.hits || []);
      setProcessingTime(data.processingTimeMs || 0);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Request was aborted, which is normal
        return;
      }
      
      console.error('Instant actions search error:', err);
      setError(err.message || 'Search failed');
      setHits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Reset state if query is too short
    if (query.length < minQueryLength) {
      setHits([]);
      setLoading(false);
      setError(null);
      setProcessingTime(0);
      return;
    }

    // Debounce the search
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, debounceMs);

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, debounceMs, minQueryLength, performSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    hits,
    loading,
    error,
    processingTime
  };
};
