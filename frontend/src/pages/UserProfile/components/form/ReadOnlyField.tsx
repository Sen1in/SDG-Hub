import React from 'react';

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  description?: string;
  className?: string;
}

export const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
  label,
  value,
  description,
  className = ''
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
        {value}
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
};
