import React from 'react';

interface LevelFilterProps {
  value: string;
  onChange: (value: string) => void;
  levels: Array<{value: number; label: string}>;
}

export const LevelFilter: React.FC<LevelFilterProps> = ({ value, onChange, levels }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Action Level
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All Levels</option>
        {levels.map(level => (
          <option key={level.value} value={level.value.toString()}>
            {level.label}
          </option>
        ))}
      </select>
    </div>
  );
};
