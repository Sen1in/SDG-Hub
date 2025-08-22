// frontend/src/pages/Analyze/components/RealTimeIndicator.tsx

import React, { useState, useEffect } from 'react';

interface RealTimeIndicatorProps {
  lastUpdate?: Date;
  isLive?: boolean;
  updateInterval?: number; 
}

const RealTimeIndicator: React.FC<RealTimeIndicatorProps> = ({
  lastUpdate = new Date(),
  isLive = true,
  updateInterval = 30000 // 30s
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isLive) {
      const updateTimer = setInterval(() => {
        setIsUpdating(true);
        
        setTimeout(() => setIsUpdating(false), 1000);
      }, updateInterval);

      return () => clearInterval(updateTimer);
    }
  }, [isLive, updateInterval]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTimeDifference = () => {
    const diff = currentTime.getTime() - lastUpdate.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) {
      return `${seconds}s ago`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ago`;
    } else {
      return `${Math.floor(seconds / 3600)}h ago`;
    }
  };

  return (
    <div className="flex items-center space-x-3 bg-white rounded-lg px-4 py-2 shadow-soft border border-gray-100">
      {/* Real-time status indicator */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-400'} ${isUpdating ? 'animate-pulse' : ''}`}></div>
        <span className="text-xs font-medium text-gray-700">
          {isLive ? 'Live Data' : 'Static Data'}
        </span>
      </div>


      <div className="w-px h-4 bg-gray-300"></div>

      <div className="flex items-center space-x-1">
        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-xs text-gray-600">{formatTime(currentTime)}</span>
      </div>

      <div className="w-px h-4 bg-gray-300"></div>

      <div className="flex items-center space-x-1">
        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="text-xs text-gray-600">Updated {getTimeDifference()}</span>
      </div>

      {isUpdating && (
        <div className="flex items-center space-x-1">
          <div className="animate-spin rounded-full h-3 w-3 border-b border-sdg-primary"></div>
          <span className="text-xs text-sdg-primary">Updating...</span>
        </div>
      )}
    </div>
  );
};

interface DataStatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'error';
  message: string;
  count?: number;
}

const DataStatusIndicator: React.FC<DataStatusIndicatorProps> = ({
  status,
  message,
  count
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      case 'offline':
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          )
        };
      case 'warning':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        };
      case 'error':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${config.bgColor}`}>
      <div className={config.color}>
        {config.icon}
      </div>
      <span className={`text-sm font-medium ${config.color}`}>{message}</span>
      {count !== undefined && (
        <span className={`text-xs font-semibold ${config.color} bg-white px-2 py-1 rounded-full`}>
          {count}
        </span>
      )}
    </div>
  );
};

interface DataFlowIndicatorProps {
  dataPoints: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  title: string;
}

const DataFlowIndicator: React.FC<DataFlowIndicatorProps> = ({ dataPoints, title }) => {
  const total = dataPoints.reduce((sum, point) => sum + point.value, 0);

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-soft border border-gray-700">
      <h4 className="text-sm font-medium text-white mb-3">{title}</h4>
      <div className="space-y-2">
        {dataPoints.map((point, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${point.color}`}></div>
              <span className="text-xs text-gray-300">{point.label}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-600 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${point.color}`}
                  style={{ width: `${(point.value / total) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium text-white">{point.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { RealTimeIndicator, DataStatusIndicator, DataFlowIndicator };
export default RealTimeIndicator; 