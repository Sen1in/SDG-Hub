// frontend/src/pages/Analyze/components/DashboardGauge.tsx

import React from 'react';

interface GaugeProps {
  value: number;
  maxValue: number;
  title: string;
  subtitle?: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showPercentage?: boolean;
}

const DashboardGauge: React.FC<GaugeProps> = ({
  value,
  maxValue,
  title,
  subtitle,
  color,
  size = 'md',
  showValue = true,
  showPercentage = true,
}) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const angle = (percentage / 100) * 180; 
  
  const sizeClasses = {
    sm: { container: 'w-24 h-24', gauge: 'w-20 h-20', text: 'text-xs' },
    md: { container: 'w-32 h-32', gauge: 'w-28 h-28', text: 'text-sm' },
    lg: { container: 'w-40 h-40', gauge: 'w-36 h-36', text: 'text-base' },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className={`relative ${currentSize.container} flex items-center justify-center`}>
        {/* Background ring */}
        <svg className={`${currentSize.gauge} transform -rotate-90`} viewBox="0 0 100 100">
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-600"
          />
          {/* Progress track */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray="125.6"
            strokeDashoffset={125.6 - (125.6 * percentage) / 100}
            strokeLinecap="round"
            className={`${color} transition-all duration-1000 ease-out`}
          />
        </svg>
        
        {/* Main content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue && (
            <span className={`font-bold text-white ${currentSize.text}`}>
              {value.toLocaleString()}
            </span>
          )}
          {showPercentage && (
            <span className={`font-semibold text-white ${currentSize.text}`}>
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      
      <div className="text-center">
        <h3 className={`font-medium text-white ${currentSize.text}`}>{title}</h3>
        {subtitle && (
          <p className={`text-gray-200 ${currentSize.text}`}>{subtitle}</p>
        )}
      </div>
    </div>
  );
};

// Mini instrument panel component
interface MiniGaugeProps {
  value: number;
  maxValue: number;
  label: string;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

const MiniGauge: React.FC<MiniGaugeProps> = ({ value, maxValue, label, color, trend }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg shadow-soft border border-gray-700">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="35"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-gray-600"
          />
          <circle
            cx="50"
            cy="50"
            r="35"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray="110"
            strokeDashoffset={110 - (110 * percentage) / 100}
            strokeLinecap="round"
            className={`${color} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-300">{percentage.toFixed(0)}%</span>
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center space-x-1">
          <span className="text-sm font-medium text-white">{label}</span>
          {getTrendIcon()}
        </div>
        <p className="text-xs text-gray-400">{value.toLocaleString()} / {maxValue.toLocaleString()}</p>
      </div>
    </div>
  );
};

// Progress bar dashboard component
interface ProgressGaugeProps {
  value: number;
  maxValue: number;
  title: string;
  subtitle?: string;
  color: string;
  showValue?: boolean;
  animated?: boolean;
}

const ProgressGauge: React.FC<ProgressGaugeProps> = ({
  value,
  maxValue,
  title,
  subtitle,
  color,
  showValue = true,
  animated = true,
}) => {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow-soft border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-white">{title}</h3>
        {showValue && (
          <span className="text-sm font-semibold text-gray-300">
            {value.toLocaleString()}
          </span>
        )}
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full ${color} ${animated ? 'transition-all duration-1000 ease-out' : ''}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
      
      {subtitle && (
        <p className="text-xs text-gray-400">{subtitle}</p>
      )}
    </div>
  );
};

export { DashboardGauge, MiniGauge, ProgressGauge };
export default DashboardGauge; 