// Interface for search suggestion items
export interface SearchSuggestion {
  term: string;
  count: number;
  type?: 'popular' | 'recent' | 'keyword';
}

// Configuration options for autocomplete behavior
export interface AutocompleteConfig {
  minInputLength?: number;  // Minimum characters before showing suggestions
  maxSuggestions?: number;  // Maximum number of suggestions to display
  debounceMs?: number;      // Debounce delay for API calls
  showCount?: boolean;      // Whether to show search count next to suggestions
  placeholder?: string;     // Input placeholder text
}

// Props for AutocompleteSearchBar component
export interface AutocompleteSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  config?: AutocompleteConfig;
  className?: string;
  label?: string;
  disabled?: boolean;
}

// State for useSearchSuggestions hook
export interface SearchSuggestionsState {
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  isOpen: boolean;
  error: string | null;
  selectedIndex: number;
}

// API response structure for popular search terms
export interface PopularSearchTermsResponse {
  term: string;
  count: number;
} 