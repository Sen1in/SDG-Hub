import React from 'react';

interface PopularKeywordsProps {
  keywords: string[];
  onKeywordClick: (keyword: string) => void;
}

export const PopularKeywords: React.FC<PopularKeywordsProps> = ({
  keywords,
  onKeywordClick
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Popular Keywords
      </label>
      <div className="flex flex-wrap gap-2">
        {keywords.slice(0, 12).map((keyword, index) => (
          <button
            key={`${keyword}-${index}`}
            onClick={() => onKeywordClick(keyword)}
            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  );
};
