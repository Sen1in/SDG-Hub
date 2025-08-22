import React from 'react';

interface SourceFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const SourceFilter: React.FC<SourceFilterProps> = ({ value, onChange }) => {
  const sources = ['education', 'actions', 'keywords'];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Source
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Sources</option>
        {sources.map((src) => (
          <option key={src} value={src}>
            {src.charAt(0).toUpperCase() + src.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};
