import React, { useRef, useEffect } from 'react';
import { useSearchSuggestions } from '../../hooks/useSearchSuggestions';
import { AutocompleteSearchBarProps, SearchSuggestion } from '../../types/autocomplete';

export const AutocompleteSearchBar: React.FC<AutocompleteSearchBarProps> = ({
  value,
  onChange,
  onSearch,
  onSuggestionClick,
  config = {}
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const {
    suggestions,
    isLoading,
    isOpen,
    error,
    selectedIndex,
    handleKeyDown,
    closeSuggestions,
    config: mergedConfig
  } = useSearchSuggestions(value, {
    placeholder: "Search SDG actions, education, keywords...",
    minInputLength: 2,
    maxSuggestions: 6,
    debounceMs: 250,
    showCount: true,
    ...config
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    closeSuggestions();
    onSearch(value);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.term);
    closeSuggestions();
    
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    } else {
      onSearch(suggestion.term);
    }
    
    inputRef.current?.focus();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const selectedSuggestion = handleKeyDown(e);
    
    if (selectedSuggestion) {
      handleSuggestionClick(selectedSuggestion);
    } else if (e.key === 'Enter' && selectedIndex === -1) {
      handleSubmit(e);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        closeSuggestions();
      }
    }, 150);
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

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          placeholder={mergedConfig.placeholder}
          className={`
            w-full px-6 py-4 pr-16 text-lg
            bg-white/95 backdrop-blur-sm
            border border-white/20 rounded-2xl
            focus:outline-none focus:ring-4 focus:ring-white/30
            transition-all duration-300 ease-out
            placeholder:text-gray-400
            ${isOpen ? 'rounded-b-none' : ''}
            ${error ? 'ring-2 ring-red-400' : ''}
          `}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />

        <button
          type="submit"
          className={`
            absolute right-2 top-1/2 -translate-y-1/2
            p-3 bg-green-600 hover:bg-green-700
            text-white rounded-xl
            transition-colors duration-200
            flex items-center justify-center
            shadow-lg hover:shadow-xl
            transform hover:scale-105 active:scale-95
          `}
          aria-label="Search"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-4.35-4.35M16.5 10.5a6 6 0 11-12 0 6 6 0 0112 0z" 
            />
          </svg>
        </button>

        {isLoading && (
          <div className="absolute right-20 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
          </div>
        )}
      </form>

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className={`
            absolute z-50 w-full mt-2
            bg-white/98 backdrop-blur-md
            border border-white/30 rounded-xl
            shadow-2xl
            max-h-72 overflow-y-auto
            animate-in slide-in-from-top-2 duration-200
          `}
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
                w-full px-4 py-3 text-left
                flex items-center justify-between gap-3
                transition-colors duration-150
                group
                ${selectedIndex === index 
                  ? 'bg-blue-50 text-blue-900' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
                ${index === 0 ? 'rounded-t-xl' : ''}
                ${index === suggestions.length - 1 ? 'rounded-b-xl' : 'border-b border-gray-100'}
              `}
              role="option"
              aria-selected={selectedIndex === index}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <svg 
                  className={`w-4 h-4 flex-shrink-0 ${
                    selectedIndex === index ? 'text-blue-600' : 'text-gray-400'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-4.35-4.35M16.5 10.5a6 6 0 11-12 0 6 6 0 0112 0z" 
                  />
                </svg>
                
                <span className="text-sm font-medium truncate">
                  {suggestion.term}
                </span>
              </div>

              {mergedConfig.showCount && suggestion.count > 0 && (
                <span className={`
                  px-2 py-1 text-xs rounded-full font-medium transition-colors duration-150
                  ${selectedIndex === index 
                    ? 'bg-blue-200 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                  }
                `}>
                  {suggestion.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-sm text-red-700">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            {error}
          </div>
        </div>
      )}
    </div>
  );
};