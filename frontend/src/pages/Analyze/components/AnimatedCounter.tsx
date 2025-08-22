// frontend/src/pages/Analyze/components/AnimatedCounter.tsx

import React, { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number; 
  className?: string;
  formatValue?: (value: number) => string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  delay = 0,
  className = '',
  formatValue = (val) => val.toLocaleString()
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    const startAnimation = () => {
      setIsAnimating(true);
      const startValue = displayValue;
      const endValue = value;
      const startTime = Date.now();
      startTimeRef.current = startTime;

      const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (endValue - startValue) * easeOutQuart;

        setDisplayValue(Math.floor(currentValue));

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayValue(endValue);
          setIsAnimating(false);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    };

    const timer = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, delay, displayValue]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <span className={`${className} ${isAnimating ? 'animate-pulse' : ''}`}>
      {formatValue(displayValue)}
    </span>
  );
};

// Percentage animation counter
interface AnimatedPercentageProps {
  value: number;
  maxValue: number;
  duration?: number;
  delay?: number;
  className?: string;
  showDecimal?: boolean;
}

const AnimatedPercentage: React.FC<AnimatedPercentageProps> = ({
  value,
  maxValue,
  duration = 1000,
  delay = 0,
  className = '',
  showDecimal = false
}) => {
  const percentage = (value / maxValue) * 100;
  
  return (
    <AnimatedCounter
      value={percentage}
      duration={duration}
      delay={delay}
      className={className}
      formatValue={(val) => `${showDecimal ? val.toFixed(1) : Math.round(val)}%`}
    />
  );
};

// Currency animation counter
interface AnimatedCurrencyProps {
  value: number;
  currency?: string;
  duration?: number;
  delay?: number;
  className?: string;
}

const AnimatedCurrency: React.FC<AnimatedCurrencyProps> = ({
  value,
  currency = '¥',
  duration = 1000,
  delay = 0,
  className = ''
}) => {
  return (
    <AnimatedCounter
      value={value}
      duration={duration}
      delay={delay}
      className={className}
      formatValue={(val) => `${currency}${val.toLocaleString()}`}
    />
  );
};


interface AnimatedIconCounterProps {
  value: number;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  duration?: number;
  delay?: number;
  className?: string;
  color?: string;
}

const AnimatedIconCounter: React.FC<AnimatedIconCounterProps> = ({
  value,
  icon,
  title,
  subtitle,
  duration = 1000,
  delay = 0,
  className = '',
  color = 'text-sdg-primary'
}) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`p-2 rounded-lg bg-gray-100 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className="flex items-baseline space-x-1">
          <AnimatedCounter
            value={value}
            duration={duration}
            delay={delay}
            className="text-2xl font-bold text-gray-900"
          />
          {subtitle && (
            <span className="text-sm text-gray-500">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
};


interface AnimatedProgressCounterProps {
  value: number;
  maxValue: number;
  title: string;
  subtitle?: string;
  duration?: number;
  delay?: number;
  color?: string;
  showValue?: boolean;
}

const AnimatedProgressCounter: React.FC<AnimatedProgressCounterProps> = ({
  value,
  maxValue,
  title,
  subtitle,
  duration = 1000,
  delay = 0,
  color = 'bg-sdg-primary',
  showValue = true
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const percentage = (value / maxValue) * 100;
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, maxValue, delay]);

  return (
    <div className="bg-white rounded-xl p-4 shadow-soft border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        {showValue && (
          <AnimatedCounter
            value={value}
            duration={duration}
            delay={delay}
            className="text-sm font-semibold text-gray-700"
          />
        )}
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>进度</span>
          <AnimatedPercentage
            value={value}
            maxValue={maxValue}
            duration={duration}
            delay={delay}
            className="text-xs"
          />
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full ${color} transition-all duration-1000 ease-out`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {subtitle && (
        <p className="text-xs text-gray-500">{subtitle}</p>
      )}
    </div>
  );
};

export {
  AnimatedCounter,
  AnimatedPercentage,
  AnimatedCurrency,
  AnimatedIconCounter,
  AnimatedProgressCounter
};
export default AnimatedCounter; 