import React from 'react';

interface ContentSectionProps {
  title: string;
  content: string;
  icon: React.ReactNode;
  bgColor?: string;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  content,
  icon,
  bgColor = 'bg-blue-100'
}) => {
  if (!content) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-8">
      <div className="flex items-center mb-6">
        <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center mr-4`}>
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="prose max-w-none">
        <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </div>
  );
};
