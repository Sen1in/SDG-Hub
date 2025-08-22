import React from 'react';

interface ItemsPerPageSelectorProps {
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  options?: number[];
  className?: string;
  showLabel?: boolean;
  labelText?: string;
  disabled?: boolean;
}

export const ItemsPerPageSelector: React.FC<ItemsPerPageSelectorProps> = ({
  itemsPerPage,
  onItemsPerPageChange,
  options = [5, 10, 15, 20, 25, 50],
  className = '',
  showLabel = true,
  labelText = 'Show:',
  disabled = false
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && (
        <span className="text-sm text-gray-600 font-medium">
          {labelText}
        </span>
      )}
      <div className="relative">
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          disabled={disabled}
          className={`
            w-full bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 
            text-sm font-medium text-gray-700 cursor-pointer transition-all
            hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{ 
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            backgroundImage: 'none',
            paddingRight: '2rem'
          }}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {/* Customized drop-down arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg 
            className={`w-4 h-4 text-gray-400 ${disabled ? 'opacity-50' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <span className="text-sm text-gray-600">per page</span>
    </div>
  );
};