import React from 'react';

interface TargetCodeFilterProps {
  value: string;
  onChange: (value: string) => void;
  targetCodes: string[];
}

export const TargetCodeFilter: React.FC<TargetCodeFilterProps> = ({
  value,
  onChange,
  targetCodes
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Target Code
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Targets</option>
        {targetCodes.map(code => (
          <option key={code} value={code}>Target {code}</option>
        ))}
      </select>
    </div>
  );
};
