import { useState, useEffect } from 'react';
import { KeywordDetailResponse } from '../types';
import { fetchKeywordDetail } from '../utils/api';

export const useKeywordDetail = (keyword: string | undefined) => {
  const [keywordData, setKeywordData] = useState<KeywordDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (keyword) {
      loadDetail();
    }
  }, [keyword]);

  const loadDetail = async () => {
    if (!keyword) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await fetchKeywordDetail(keyword);
      setKeywordData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load keyword details');
      console.error('Error fetching keyword detail:', err);
    } finally {
      setLoading(false);
    }
  };

  return { keywordData, loading, error, retry: loadDetail };
};
