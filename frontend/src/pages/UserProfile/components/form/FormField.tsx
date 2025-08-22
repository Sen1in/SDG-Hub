import React from 'react';

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  type?: 'text' | 'email' | 'textarea' | 'select';
  isEditing: boolean;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  options?: { value: string; label: string }[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  className?: string;
  onBlur?: () => void;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  label,
  value,
  type = 'text',
  isEditing,
  placeholder,
  required = false,
  rows = 4,
  options = [],
  onChange,
  onKeyDown,
  className = '',
  onBlur
}) => {
  const isInvalid = required && isEditing && !value?.trim();
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
      </label>

      {isEditing ? (
        type === 'textarea' ? (
          <textarea
            id={id}
            name={name}
            rows={rows}
            value={value}
            onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
            onKeyDown={onKeyDown}

            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 transition-colors duration-200 resize-none ${
              isInvalid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder={placeholder}
          />
        ) : type === 'select' ? (
          <select
            id={id}
            name={name}
            value={value}
            onChange={onChange as React.ChangeEventHandler<HTMLSelectElement>}
            onKeyDown={onKeyDown}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 transition-colors duration-200 ${
              isInvalid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            required={required}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            id={id}
            name={name}
            value={value}
            onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
            onKeyDown={onKeyDown}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 transition-colors duration-200 ${
              isInvalid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
          />
        )
      ) : (
        <div
          className={`px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 ${
            type === 'textarea' ? 'min-h-[100px] whitespace-pre-wrap' : ''
          }`}
        >
          {value || 'Not provided'}
        </div>
      )}
      {isInvalid && (
        <p className="text-sm text-red-500 mt-1">This field is required.</p>
      )}
    </div>
  );
};
