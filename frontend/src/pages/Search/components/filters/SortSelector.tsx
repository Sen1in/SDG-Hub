import React from 'react';

interface SortSelectorProps {
  sort: string;
  onSortChange: (newSort: string) => void;
}

export const SortSelector: React.FC<SortSelectorProps> = ({ sort, onSortChange }) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor="sort-select" className="text-gray-700 font-medium">Sort by:</label>
      <select
        id="sort-select"
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="w-48 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="relevance">Relevance</option>
        <option value="title">Title (A-Z)</option>
        <option value="sdg_count">SDG Count ↓</option>
      </select>
    </div>
  );
};
