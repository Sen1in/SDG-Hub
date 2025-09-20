import React, { useRef, useEffect, useState } from 'react';
import { useSearchSuggestions } from '../../hooks/useSearchSuggestions';
import { useInstantSearch } from '../../hooks/useInstantSearch';
import { useInstantActionsSearch } from '../../hooks/useInstantActionsSearch';
import { useInstantEducationSearch } from '../../hooks/useInstantEducationSearch';
import { useSpellCheck } from '../../hooks/useSpellCheck';
import { AutocompleteSearchBarProps, SearchSuggestion } from '../../types/autocomplete';

type StyleVariant = 'default' | 'hero' | 'filter';

interface ExtendedAutocompleteSearchBarProps extends AutocompleteSearchBarProps {
  variant?: StyleVariant;
  customStyles?: {
    container?: string;
    input?: string;
    button?: string;
    dropdown?: string;
  };
  enableInstantSearch?: boolean; // Enable instant search mode
  instantSearchType?: 'all' | 'action' | 'education'; // Type of instant search
}

export const AutocompleteSearchBar: React.FC<ExtendedAutocompleteSearchBarProps> = ({
  value,
  onChange,
  onSearch,
  onSuggestionClick,
  config = {},
  className = '',
  label,
  disabled = false,
  variant = 'default',
  customStyles = {},
  enableInstantSearch = false,
  instantSearchType = 'all'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // State for managing instant search vs traditional suggestions
  const [showSpellSuggestion, setShowSpellSuggestion] = useState(false);
  const [spellCheckTimeout, setSpellCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [instantSelectedIndex, setInstantSelectedIndex] = useState(-1);
  const [forceClosedInstant, setForceClosedInstant] = useState(false);

  // Traditional search suggestions hook
  const traditionalSearch = useSearchSuggestions(value, config);

  // Instant search hooks (only used when enabled)
  const instantSearchAll = useInstantSearch(value, 200, 2);
  const instantSearchActions = useInstantActionsSearch(value, 200, 2);
  const instantSearchEducation = useInstantEducationSearch(value, 200, 2);

  // Spell check hook
  const spellCheck = useSpellCheck(300, 2);

  // Choose which search method to use
  const useInstant = enableInstantSearch && (variant === 'hero' || variant === 'filter');
  
  // Select the appropriate instant search hook based on type
  const getInstantSearch = () => {
    switch (instantSearchType) {
      case 'action':
        return instantSearchActions;
      case 'education':
        return instantSearchEducation;
      case 'all':
      default:
        return instantSearchAll;
    }
  };
  
  const instantSearch = getInstantSearch();
  
  const {
    suggestions,
    isLoading,
    isOpen,
    error,
    selectedIndex,
    handleKeyDown,
    closeSuggestions,
    selectSuggestion,
    clearError,
    config: mergedConfig
  } = useInstant ? {
    suggestions: instantSearch.hits.map(hit => ({
      term: hit.title,
      count: 0,
      type: 'instant' as const,
      _formatted: hit._formatted
    })),
    isLoading: instantSearch.loading,
    isOpen: !forceClosedInstant && instantSearch.hits.length > 0 && value.length >= 2,
    error: instantSearch.error,
    selectedIndex: instantSelectedIndex,
    handleKeyDown: () => null, // Custom handling in handleInputKeyDown
    closeSuggestions: () => {
      setInstantSelectedIndex(-1);
      setForceClosedInstant(true);
      traditionalSearch.closeSuggestions();
    },
    selectSuggestion: traditionalSearch.selectSuggestion,
    clearError: traditionalSearch.clearError,
    config: traditionalSearch.config
  } : traditionalSearch;

  const styleVariants = {
    default: {
      container: 'relative w-full',
      input: 'w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      button: 'absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200',
      dropdown: 'absolute left-0 right-0 top-full z-50 mt-1 bg-white border border-gray-300 rounded-b-md shadow-lg max-h-64 overflow-y-auto'
    },
    hero: {
      container: 'relative w-full max-w-2xl mx-auto',
      input: 'w-full px-6 py-4 pr-16 text-lg bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/30',
      button: 'absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95',
      dropdown: 'absolute left-0 right-0 top-full z-40 mt-2 bg-white/95 rounded-xl overflow-y-auto autocomplete-dropdown'
    },
    filter: {
      container: 'relative w-full',
      input: 'w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm',
      button: 'absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1',
      dropdown: 'absolute left-0 top-full z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto min-w-full w-max'
    }
  };

  const currentStyles = styleVariants[variant];
  const finalStyles = {
    container: customStyles.container || currentStyles.container,
    input: customStyles.input || currentStyles.input,
    button: customStyles.button || currentStyles.button,
    dropdown: customStyles.dropdown || currentStyles.dropdown
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (error) clearError();
    
    // Reset spell suggestion when typing
    setShowSpellSuggestion(false);
    
    // Reset instant search selection when typing
    if (useInstant) {
      setInstantSelectedIndex(-1);
      setForceClosedInstant(false); // Allow dropdown to show again when typing
    }
    
    // Clear previous spell check timeout
    if (spellCheckTimeout) {
      clearTimeout(spellCheckTimeout);
      setSpellCheckTimeout(null);
    }
    
    // If using instant search and no results, trigger spell check after a delay
    if (useInstant && newValue.length >= 2) {
      const timeout = setTimeout(() => {
        if (instantSearch.hits.length === 0 && !instantSearch.loading) {
          spellCheck.checkSpelling(newValue);
          setShowSpellSuggestion(true);
        }
      }, 500); // Wait a bit to see if results come in
      
      setSpellCheckTimeout(timeout);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    closeSuggestions();
    setInstantSelectedIndex(-1); // Reset selection
    onSearch(value);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.term);
    closeSuggestions();
    setShowSpellSuggestion(false);
    
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    } else {
      onSearch(suggestion.term);
    }
    
    inputRef.current?.focus();
  };

  const handleSpellSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSpellSuggestion(false);
    closeSuggestions();
    
    // Create a SearchSuggestion object for the spell suggestion
    const spellSuggestion: SearchSuggestion = {
      term: suggestion,
      count: 0,
      type: 'spell' as const
    };
    
    if (onSuggestionClick) {
      onSuggestionClick(spellSuggestion);
    } else {
      onSearch(suggestion);
    }
    
    inputRef.current?.focus();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (useInstant) {
      // Custom keyboard handling for instant search
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newIndex = instantSelectedIndex < suggestions.length - 1 ? instantSelectedIndex + 1 : -1;
        setInstantSelectedIndex(newIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newIndex = instantSelectedIndex > -1 ? instantSelectedIndex - 1 : suggestions.length - 1;
        setInstantSelectedIndex(newIndex);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (instantSelectedIndex >= 0 && instantSelectedIndex < suggestions.length && suggestions[instantSelectedIndex]) {
          handleSuggestionClick(suggestions[instantSelectedIndex]);
        } else {
          handleSubmit(e);
        }
      } else if (e.key === 'Escape') {
        closeSuggestions();
        setInstantSelectedIndex(-1);
      }
    } else {
      // Traditional search handling
      const selectedSuggestion = handleKeyDown(e);
      
      if (selectedSuggestion) {
        handleSuggestionClick(selectedSuggestion);
      } else if (e.key === 'Enter' && selectedIndex === -1) {
        handleSubmit(e);
      }
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        closeSuggestions();
      }
    }, 150);
  };

  const adjustDropdownPosition = () => {
    if (!dropdownRef.current || !containerRef.current || !isOpen) return;
    
    const container = containerRef.current;
    const dropdown = dropdownRef.current;
    const containerRect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Calculate available space above and below
    const spaceAbove = containerRect.top;
    const spaceBelow = viewportHeight - containerRect.bottom;
    
    // Calculate optimal height based on number of suggestions
    const suggestionHeight = 60; // Approximate height per suggestion
    const idealHeight = Math.min(suggestions.length * suggestionHeight, 300); // Cap at 300px
    
    // Reserve space for content below (hot searches, footer, etc.)
    const reservedSpaceBelow = 120;
    const availableSpaceBelow = spaceBelow - reservedSpaceBelow;
    
    // Decide positioning: prefer below, but go above if necessary
    const shouldPositionAbove = availableSpaceBelow < 150 && spaceAbove > idealHeight;
    
    if (shouldPositionAbove) {
      // Position above the input
      dropdown.style.top = 'auto';
      dropdown.style.bottom = '100%';
      dropdown.style.marginTop = '0';
      dropdown.style.marginBottom = '4px';
      
      const maxHeight = Math.min(idealHeight, spaceAbove - 20);
      dropdown.style.maxHeight = `${maxHeight}px`;
    } else {
      // Position below the input (default)
      dropdown.style.top = '100%';
      dropdown.style.bottom = 'auto';
      dropdown.style.marginTop = '4px';
      dropdown.style.marginBottom = '0';
      
      const maxHeight = Math.max(
        120, // Minimum height to show at least 2 suggestions
        Math.min(idealHeight, availableSpaceBelow)
      );
      dropdown.style.maxHeight = `${maxHeight}px`;
    }
    
    dropdown.style.overflowY = dropdown.scrollHeight > parseInt(dropdown.style.maxHeight) ? 'auto' : 'hidden';
  };

  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  useEffect(() => {
    suggestionRefs.current = suggestionRefs.current.slice(0, suggestions.length);
  }, [suggestions.length]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(adjustDropdownPosition, 0);
      
      const handleResize = () => adjustDropdownPosition();
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (spellCheckTimeout) {
        clearTimeout(spellCheckTimeout);
      }
    };
  }, [spellCheckTimeout]);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div ref={containerRef} className={finalStyles.container}>
        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            placeholder={mergedConfig.placeholder}
            disabled={disabled}
            className={`${finalStyles.input} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''} ${isOpen && variant !== 'hero' ? 'rounded-b-none' : ''}`}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            role="combobox"
          />

          <button
            type="submit"
            disabled={disabled}
            className={`${finalStyles.button} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            aria-label="Search"
          >
            <svg className={variant === 'hero' ? 'w-6 h-6' : 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.5 10.5a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </button>

          {isLoading && (
            <div className={`absolute ${variant === 'hero' ? 'right-20 top-1/2 -translate-y-1/2' : 'right-10 top-1/2 -translate-y-1/2'}`}>
              <div className={`animate-spin rounded-full border-2 border-blue-500 border-t-transparent ${variant === 'hero' ? 'h-5 w-5' : 'h-4 w-4'}`} />
            </div>
          )}
        </form>

        {isOpen && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className={finalStyles.dropdown}
            role="listbox"
            aria-label="Search suggestions"
            style={{
              minWidth: variant === 'filter' ? '100%' : '100%',
              maxWidth: variant === 'filter' ? 'none' : '100vw',
              width: variant === 'filter' ? 'max-content' : 'auto'
            }}
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.term}-${index}`}
                ref={el => suggestionRefs.current[index] = el}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full ${variant === 'filter' ? 'px-3 py-1.5' : 'px-3 py-2'} text-left hover:bg-blue-50 transition-colors duration-150 flex items-center justify-between group ${selectedIndex === index ? 'bg-blue-100 text-blue-900' : 'text-gray-900'} ${index === suggestions.length - 1 ? '' : 'border-b border-gray-100'}`}
                role="option"
                aria-selected={selectedIndex === index}
              >
                <span className="flex items-center gap-2">
                  <svg className={`${variant === 'filter' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-gray-400 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.5 10.5a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  {/* Render with highlighting if available */}
                  {useInstant && suggestion._formatted?.title ? (
                    <span 
                      className={`${variant === 'filter' ? 'text-sm font-medium' : 'font-medium'} ${variant === 'filter' ? 'whitespace-nowrap' : 'truncate'} instant-search-highlight`}
                      dangerouslySetInnerHTML={{ __html: suggestion._formatted.title }}
                    />
                  ) : (
                    <span className={`${variant === 'filter' ? 'text-sm font-medium' : 'font-medium'} ${variant === 'filter' ? 'whitespace-nowrap' : 'truncate'}`}>{suggestion.term}</span>
                  )}
                </span>

                {mergedConfig.showCount && suggestion.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full transition-colors duration-150 flex-shrink-0 ${selectedIndex === index ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-200 group-hover:text-blue-800'}`}>
                    {suggestion.count}
                  </span>
                )}
              </button>
            ))}
            
            {/* Show spell suggestion if available and no regular suggestions */}
            {useInstant && showSpellSuggestion && suggestions.length === 0 && spellCheck.suggestion && (
              <div className="px-3 py-2 text-sm text-gray-600 border-b border-gray-100 spell-suggestion">
                Did you mean: 
                <button
                  type="button"
                  onClick={() => handleSpellSuggestionClick(spellCheck.suggestion!)}
                  className="ml-1 spell-suggestion-link"
                >
                  {spellCheck.suggestion}
                </button>
                ?
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="absolute top-full left-0 right-0 mt-1 text-sm text-red-600 flex items-center bg-white border border-red-200 rounded-md p-2 shadow-sm z-50">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};