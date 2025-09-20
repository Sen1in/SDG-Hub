import { useState, useEffect, useRef, useCallback } from 'react';

interface SpellCheckResult {
  suggestion: string | null;
  original?: string;
  error?: string;
}

interface UseSpellCheckReturn {
  suggestion: string | null;
  loading: boolean;
  error: string | null;
  checkSpelling: (query: string) => void;
}

/**
 * Custom hook for spell checking with SymSpell
 * Provides "Did you mean" suggestions for misspelled queries
 */
export const useSpellCheck = (
  debounceMs: number = 300,
  minQueryLength: number = 2
): UseSpellCheckReturn => {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const performSpellCheck = useCallback(async (query: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ q: query });

      const response = await fetch(`/api/search/spell/?${params}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Spell check failed: ${response.status}`);
      }

      const data: SpellCheckResult = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setSuggestion(data.suggestion);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Request was aborted, which is normal
        return;
      }
      
      console.error('Spell check error:', err);
      setError(err.message || 'Spell check failed');
      setSuggestion(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkSpelling = useCallback((query: string) => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Reset state if query is too short
    if (query.length < minQueryLength) {
      setSuggestion(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Debounce the spell check
    debounceTimeoutRef.current = setTimeout(() => {
      performSpellCheck(query);
    }, debounceMs);
  }, [debounceMs, minQueryLength, performSpellCheck]);

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
    suggestion,
    loading,
    error,
    checkSpelling
  };
};
