interface ContentSectionProps {
  title: string;
  content: string;
  bgColor: string;
  icon: React.ReactNode;
}

export const ContentSection: React.FC<ContentSectionProps> = ({ 
  title, 
  content, 
  bgColor, 
  icon 
}) => {
  if (!content || content.trim() === '') return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className={`${bgColor} px-6 py-4`}>
        <div className="flex items-center">
          {icon}
          <h2 className="ml-2 text-lg font-semibold text-gray-900">{title}</h2>
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
          {content.split('\n').map((paragraph: string, index: number) => (
            paragraph.trim() && (
              <p key={index} className="mb-3 last:mb-0">
                {paragraph.trim()}
              </p>
            )
          ))}
        </div>
      </div>
    </div>
  );
};
