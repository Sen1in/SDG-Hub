// frontend/src/pages/Analyze/components/SearchWordCloud.tsx

import React, { useState, useEffect } from 'react';

import WordCloud from 'react-d3-cloud';
import analyticsService, { WordCloudData } from '../../../services/analyticsService';



const SearchWordCloud: React.FC = () => {
  const [words, setWords] = useState<WordCloudData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWordCloudData = async () => {
      setLoading(true);
      const result = await analyticsService.getWordCloudData();

      if (result.success && result.data) {
        setWords(result.data);
      } else {
        const errorDetail = result.errors?.detail || 'Could not load word cloud data.';
        setError(errorDetail);
      }
      setLoading(false);
    };

    fetchWordCloudData();
  }, []);

  const fontSizeMapper = (word: { value: number }): number => Math.log2(word.value) * 5 + 16;


  const rotate = () => 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sdg-secondary-red"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }
  
  if (words.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-center py-4 text-gray-500">No search data available to generate a word cloud.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-soft p-2 h-96 w-full">

      <WordCloud
        data={words}
        width={500} 
        height={350}
        font="sans-serif"
        fontSize={fontSizeMapper}
        rotate={rotate}
        padding={2}
      />
    </div>
  );
};

export default SearchWordCloud;
