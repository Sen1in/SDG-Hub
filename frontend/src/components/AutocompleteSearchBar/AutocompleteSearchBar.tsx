import React, { useRef, useEffect } from 'react';
import { useSearchSuggestions } from '../../hooks/useSearchSuggestions';
import { AutocompleteSearchBarProps, SearchSuggestion } from '../../types/autocomplete';

/**
 * AutocompleteSearchBar Component
 * A search input with dropdown suggestions based on popular search terms
 * Supports keyboard navigation and click interactions
 */
export const AutocompleteSearchBar: React.FC<AutocompleteSearchBarProps> = ({
  value,
  onChange,
  onSearch,
  onSuggestionClick,
  config = {},
  className = '',
  label,
  disabled = false
}) => {
  // Refs for managing focus and dropdown positioning
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Use our custom hook for suggestions logic
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
  } = useSearchSuggestions(value, config);

  /**
   * Handles input change and propagates to parent
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Clear any existing errors when user starts typing
    if (error) {
      clearError();
    }
  };

  /**
   * Handles form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    closeSuggestions();
    onSearch(value);
  };

  /**
   * Handles suggestion selection via click
   */
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.term);
    closeSuggestions();
    
    // Notify parent component about suggestion selection
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    } else {
      // Default behavior: trigger search
      onSearch(suggestion.term);
    }
    
    // Return focus to input
    inputRef.current?.focus();
  };

  /**
   * Enhanced keyboard handling that integrates with our hook
   */
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const selectedSuggestion = handleKeyDown(e);
    
    // If Enter was pressed with a selected suggestion, use it
    if (selectedSuggestion) {
      handleSuggestionClick(selectedSuggestion);
    }
    // If Enter was pressed without selection, submit the form
    else if (e.key === 'Enter' && selectedIndex === -1) {
      handleSubmit(e);
    }
  };

  /**
   * Handles input blur - close suggestions after a delay to allow for clicks
   */
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay closing to allow suggestion clicks to register
    setTimeout(() => {
      // Only close if focus hasn't moved to a suggestion
      if (!dropdownRef.current?.contains(document.activeElement)) {
        closeSuggestions();
      }
    }, 150);
  };

  /**
   * Handles input focus - show suggestions if we have any
   */
  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      // This will be handled by the hook when user starts typing
    }
  };

  /**
   * Scroll selected suggestion into view
   */
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  /**
   * Update suggestion refs when suggestions change
   */
  useEffect(() => {
    suggestionRefs.current = suggestionRefs.current.slice(0, suggestions.length);
  }, [suggestions.length]);

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          placeholder={mergedConfig.placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 pr-10 border border-gray-300 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-200
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
            ${isOpen ? 'rounded-b-none' : ''}
          `}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
          aria-describedby={error ? 'search-error' : undefined}
        />

        {/* Search Button */}
        <button
          type="submit"
          disabled={disabled}
          className={`
            absolute right-2 top-1/2 transform -translate-y-1/2 
            text-gray-400 hover:text-blue-600 transition-colors duration-200
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `}
          aria-label="Search"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-4.35-4.35M16.5 10.5a6 6 0 11-12 0 6 6 0 0112 0z" 
            />
          </svg>
        </button>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
          </div>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full bg-white border border-gray-300 border-t-0 rounded-b-md shadow-lg max-h-64 overflow-y-auto"
          role="listbox"
          aria-label="Search suggestions"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.term}-${index}`}
              ref={el => suggestionRefs.current[index] = el}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`
                w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors duration-150
                flex items-center justify-between group
                ${selectedIndex === index ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}
                ${index === suggestions.length - 1 ? '' : 'border-b border-gray-100'}
              `}
              role="option"
              aria-selected={selectedIndex === index}
            >
              {/* Suggestion Text */}
              <span className="flex-1 font-medium">
                {suggestion.term}
              </span>

              {/* Search Count Badge (if enabled) */}
              {mergedConfig.showCount && suggestion.count > 0 && (
                <span className={`
                  ml-2 px-2 py-1 text-xs rounded-full transition-colors duration-150
                  ${selectedIndex === index 
                    ? 'bg-blue-200 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-blue-200 group-hover:text-blue-800'
                  }
                `}>
                  {suggestion.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div id="search-error" className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}; 