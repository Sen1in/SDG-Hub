import React from 'react';

interface AwardFilterProps {
    value: string;
    onChange: (value: string) => void;
    options: Array<{value: number; label: string}>;
  }
  
  export const AwardFilter: React.FC<AwardFilterProps> = ({ value, onChange, options }) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Award Status
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Actions</option>
          {options.map(option => (
            <option key={option.value} value={option.value.toString()}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };
  