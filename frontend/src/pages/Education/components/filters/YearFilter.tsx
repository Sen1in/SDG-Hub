import React from 'react';

interface YearFilterProps {
  value: string;
  onChange: (value: string) => void;
  years: number[];
}

export const YearFilter: React.FC<YearFilterProps> = ({
  value,
  onChange,
  years
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Year
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Years</option>
        {years.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  );
};
