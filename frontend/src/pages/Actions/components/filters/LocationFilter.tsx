import React from 'react';

interface LocationFilterProps {
    value: string;
    onChange: (value: string) => void;
    regions: string[];
  }
  
  export const LocationFilter: React.FC<LocationFilterProps> = ({ value, onChange, regions }) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Locations</option>
          {regions.map(region => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>
    );
  };