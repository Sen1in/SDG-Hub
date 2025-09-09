// src/components/Navigation/NotificationBadge.tsx

import React from 'react';

interface NotificationBadgeProps {
  count: number;
  children: React.ReactNode;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, children }) => {
  return (
    <div className="relative">
      {children}
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
};

export default NotificationBadge;