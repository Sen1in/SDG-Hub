import { useState, useEffect, useRef, useCallback } from 'react';

interface SpellCheckResult {
  suggestion: string | null;
  original: string;
  error: string | null;
}

export const useSpellCheck = (
  debounceMs: number = 300,
  minInputLength: number = 2
) => {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController | null>(null);

  const checkSpelling = useCallback((query: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (query.length < minInputLength) {
      setSuggestion(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    debounceTimeoutRef.current = setTimeout(async () => {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        const params = new URLSearchParams({ q: query });
        const response = await fetch(`/api/search/spell/?${params.toString()}`, { signal });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Spell check failed: ${response.status}`);
        }

        const data: SpellCheckResult = await response.json();
        setSuggestion(data.suggestion);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
        console.error('Spell check error:', err);
        setError(err.message || 'Failed to fetch spell suggestion');
        setSuggestion(null);
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }, debounceMs);
  }, [debounceMs, minInputLength]);

  return {
    suggestion,
    loading,
    error,
    checkSpelling
  };
};
