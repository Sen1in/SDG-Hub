import { useState, useEffect, useRef } from 'react';

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

interface InstantSearchResults {
  hits: SearchHit[];
  loading: boolean;
  error: string | null;
  processingTime: number;
}

export const useInstantSearch = (
  query: string,
  debounceMs: number = 200,
  minInputLength: number = 2
): InstantSearchResults => {
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState(0);

  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (query.length < minInputLength) {
      setHits([]);
      setLoading(false);
      setError(null);
      setProcessingTime(0);
      return;
    }

    setLoading(true);
    setError(null);

    debounceTimeoutRef.current = setTimeout(async () => {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        const params = new URLSearchParams({
          q: query,
          limit: '8',
        });
        const response = await fetch(`/api/search/instant/?${params.toString()}`, { signal });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Search failed: ${response.status}`);
        }

        const data = await response.json();
        setHits(data.hits || []);
        setProcessingTime(data.processingTimeMs || 0);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
        console.error('Instant search error:', err);
        setError(err.message || 'Failed to fetch instant search results');
        setHits([]);
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }, debounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, debounceMs, minInputLength]);

  return {
    hits,
    loading,
    error,
    processingTime
  };
};
