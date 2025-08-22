import React from 'react';

interface IndustryFilterProps {
  value: string;
  onChange: (value: string) => void;
  industries: string[];
}

export const IndustryFilter: React.FC<IndustryFilterProps> = ({ value, onChange, industries }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Related Industry
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All Industries</option>
        {industries.map(industry => (
          <option key={industry} value={industry}>
            {industry}
          </option>
        ))}
      </select>
    </div>
  );
};
