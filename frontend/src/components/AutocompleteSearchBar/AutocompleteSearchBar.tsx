import React, { useRef, useEffect } from 'react';
import { useSearchSuggestions } from '../../hooks/useSearchSuggestions';
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

  suggestions?: SearchSuggestion[];
  isLoading?: boolean;
  isOpen?: boolean;
  error?: string | null;
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
  // 外部传入的建议数据
  suggestions: externalSuggestions,
  isLoading: externalIsLoading,
  isOpen: externalIsOpen,
  error: externalError
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const {
    suggestions: internalSuggestions,
    isLoading: internalIsLoading,
    isOpen: internalIsOpen,
    error: internalError,
    selectedIndex,
    handleKeyDown,
    closeSuggestions,
    selectSuggestion,
    clearError,
    config: mergedConfig
  } = useSearchSuggestions(value, config);

  // 使用外部数据或内部Hook数据
  const suggestions = externalSuggestions || internalSuggestions;
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading;
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const error = externalError !== undefined ? externalError : internalError;

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
      dropdown: 'absolute left-0 right-0 top-full z-50 mt-2 bg-white border border-white/30 rounded-xl shadow-2xl max-h-72 overflow-y-auto'
    },
    filter: {
      container: 'relative w-full',
      input: 'w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm',
      button: 'absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1',
      dropdown: 'absolute left-0 right-0 top-full z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto'
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

  const adjustDropdownPosition = () => {
    if (!dropdownRef.current || !containerRef.current || !isOpen) return;
    
    const container = containerRef.current;
    const dropdown = dropdownRef.current;
    const containerRect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - containerRect.bottom;
    const dropdownHeight = dropdown.scrollHeight;
    
    if (spaceBelow < dropdownHeight && containerRect.top > dropdownHeight) {
      dropdown.style.top = 'auto';
      dropdown.style.bottom = '100%';
      dropdown.style.marginTop = '0';
      dropdown.style.marginBottom = '4px';
    } else {
      dropdown.style.top = '100%';
      dropdown.style.bottom = 'auto';
      dropdown.style.marginTop = '4px';
      dropdown.style.marginBottom = '0';
    }
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
              minWidth: '100%',
              maxWidth: '100vw'
            }}
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.term}-${index}`}
                ref={el => suggestionRefs.current[index] = el}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors duration-150 flex items-center justify-between group ${selectedIndex === index ? 'bg-blue-100 text-blue-900' : 'text-gray-900'} ${index === suggestions.length - 1 ? '' : 'border-b border-gray-100'}`}
                role="option"
                aria-selected={selectedIndex === index}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.5 10.5a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  <span className="font-medium truncate">{suggestion.term}</span>
                </span>

                {mergedConfig.showCount && suggestion.count > 0 && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full transition-colors duration-150 flex-shrink-0 ${selectedIndex === index ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-200 group-hover:text-blue-800'}`}>
                    {suggestion.count}
                  </span>
                )}
              </button>
            ))}
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