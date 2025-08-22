import { useState, useEffect, useCallback, useRef } from 'react';
import { SearchSuggestion, SearchSuggestionsState, AutocompleteConfig } from '../types/autocomplete';

// Default configuration for autocomplete behavior
const DEFAULT_CONFIG: Required<AutocompleteConfig> = {
  minInputLength: 1,
  maxSuggestions: 8,
  debounceMs: 300,
  showCount: true,
  placeholder: 'Search...'
};

/**
 * Custom hook for managing search autocomplete functionality
 * Fetches popular search terms and filters them based on user input
 */
export const useSearchSuggestions = (
  inputValue: string,
  config: AutocompleteConfig = {}
) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  // State management for suggestions
  const [state, setState] = useState<SearchSuggestionsState>({
    suggestions: [],
    isLoading: false,
    isOpen: false,
    error: null,
    selectedIndex: -1
  });

  // Cache for popular search terms to avoid repeated API calls
  const [cachedTerms, setCachedTerms] = useState<SearchSuggestion[]>([]);
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(0);
  
  // Refs for managing timeouts and preventing race conditions
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const requestIdRef = useRef<number>(0);

  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  /**
   * Fetches popular search terms from the API
   * Uses caching to reduce unnecessary API calls
   */
  const fetchPopularTerms = useCallback(async (): Promise<SearchSuggestion[]> => {
    const now = Date.now();
    
    // Return cached data if still valid
    if (cachedTerms.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
      return cachedTerms;
    }

    try {
      const currentRequestId = ++requestIdRef.current;
      
      const response = await fetch('/api/analytics/popular-search-terms/');
      if (!response.ok) {
        throw new Error(`Failed to fetch suggestions: ${response.status}`);
      }

      // Prevent race condition - only process if this is still the latest request
      if (currentRequestId !== requestIdRef.current) {
        return cachedTerms;
      }

      const data = await response.json();
      const terms: SearchSuggestion[] = data.map((item: any) => ({
        term: item.term,
        count: item.count,
        type: 'popular' as const
      }));

      // Update cache
      setCachedTerms(terms);
      setCacheTimestamp(now);
      
      return terms;
    } catch (error) {
      console.error('Error fetching popular search terms:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load suggestions',
        isLoading: false 
      }));
      return cachedTerms; // Fallback to cached data
    }
  }, [cachedTerms, cacheTimestamp]);

  /**
   * Filters suggestions based on user input
   * Implements fuzzy matching for better user experience
   */
  const filterSuggestions = useCallback((
    terms: SearchSuggestion[], 
    query: string
  ): SearchSuggestion[] => {
    if (!query || query.length < mergedConfig.minInputLength) {
      return terms.slice(0, mergedConfig.maxSuggestions);
    }

    const normalizedQuery = query.toLowerCase().trim();
    
    // Score suggestions based on relevance
    const scoredSuggestions = terms
      .map(suggestion => {
        const normalizedTerm = suggestion.term.toLowerCase();
        let score = 0;

        // Exact match gets highest score
        if (normalizedTerm === normalizedQuery) {
          score = 1000;
        }
        // Starts with query gets high score
        else if (normalizedTerm.startsWith(normalizedQuery)) {
          score = 500 + (100 - normalizedQuery.length); // Shorter queries score higher
        }
        // Contains query gets medium score
        else if (normalizedTerm.includes(normalizedQuery)) {
          score = 250 + (100 - normalizedQuery.length);
        }
        // No match
        else {
          return null;
        }

        // Boost score based on popularity (search count)
        score += Math.min(suggestion.count * 2, 100);

        return { ...suggestion, score };
      })
      .filter((item): item is SearchSuggestion & { score: number } => item !== null) // Remove null matches with type guard
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, mergedConfig.maxSuggestions);

    // Remove score property and return clean suggestions
    return scoredSuggestions.map(({ score, ...suggestion }) => suggestion);
  }, [mergedConfig.minInputLength, mergedConfig.maxSuggestions]);

  /**
   * Updates suggestions based on input value with debouncing
   */
  const updateSuggestions = useCallback(async () => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // If input is too short, hide suggestions
    if (inputValue.length < mergedConfig.minInputLength) {
      setState(prev => ({ 
        ...prev, 
        isOpen: false, 
        suggestions: [],
        selectedIndex: -1 
      }));
      return;
    }

    // Set loading state
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null 
    }));

    // Debounce the actual search
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const popularTerms = await fetchPopularTerms();
        const filteredSuggestions = filterSuggestions(popularTerms, inputValue);

        setState(prev => ({
          ...prev,
          suggestions: filteredSuggestions,
          isLoading: false,
          isOpen: filteredSuggestions.length > 0,
          selectedIndex: -1,
          error: null
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load suggestions',
          isOpen: false
        }));
      }
    }, mergedConfig.debounceMs);
  }, [inputValue, mergedConfig.minInputLength, mergedConfig.debounceMs, fetchPopularTerms, filterSuggestions]);

  // Update suggestions when input value changes
  useEffect(() => {
    updateSuggestions();
    
    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [updateSuggestions]);

  /**
   * Handles keyboard navigation within suggestions
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!state.isOpen || state.suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setState(prev => ({
          ...prev,
          selectedIndex: prev.selectedIndex < prev.suggestions.length - 1 
            ? prev.selectedIndex + 1 
            : 0
        }));
        break;

      case 'ArrowUp':
        event.preventDefault();
        setState(prev => ({
          ...prev,
          selectedIndex: prev.selectedIndex > 0 
            ? prev.selectedIndex - 1 
            : prev.suggestions.length - 1
        }));
        break;

      case 'Enter':
        event.preventDefault();
        if (state.selectedIndex >= 0 && state.selectedIndex < state.suggestions.length) {
          return state.suggestions[state.selectedIndex];
        }
        break;

      case 'Escape':
        event.preventDefault();
        setState(prev => ({ 
          ...prev, 
          isOpen: false, 
          selectedIndex: -1 
        }));
        break;
    }
    return null;
  }, [state.isOpen, state.suggestions, state.selectedIndex]);

  /**
   * Closes the suggestions dropdown
   */
  const closeSuggestions = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isOpen: false, 
      selectedIndex: -1 
    }));
  }, []);

  /**
   * Selects a suggestion by index
   */
  const selectSuggestion = useCallback((index: number) => {
    if (index >= 0 && index < state.suggestions.length) {
      return state.suggestions[index];
    }
    return null;
  }, [state.suggestions]);

  /**
   * Clears any error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    suggestions: state.suggestions,
    isLoading: state.isLoading,
    isOpen: state.isOpen,
    error: state.error,
    selectedIndex: state.selectedIndex,
    
    // Actions
    handleKeyDown,
    closeSuggestions,
    selectSuggestion,
    clearError,
    
    // Configuration
    config: mergedConfig
  };
}; 