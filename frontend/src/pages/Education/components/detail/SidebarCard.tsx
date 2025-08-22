import React from 'react';

interface SidebarCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const SidebarCard: React.FC<SidebarCardProps> = ({
  title,
  icon,
  children
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
};
