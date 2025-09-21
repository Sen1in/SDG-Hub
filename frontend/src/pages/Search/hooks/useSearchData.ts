import { useState, useEffect, useRef } from 'react';
import { fetchUnifiedSearchResults } from '../utils/api';
import { sortCombined } from '../../../utils/sort';

export const useSearchData = (
  query: string,
  page: number,
  itemsPerPage: number = 10,
  sort: string = 'relevance',
  sdgs: number[] = [],
  location: string = '',
  source: string = ''
) => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const currentRequestRef = useRef(0);

  useEffect(() => {
    const requestId = ++currentRequestRef.current;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUnifiedSearchResults(query, page, itemsPerPage, sort, sdgs, location, source);
        if (currentRequestRef.current === requestId) {
          // Apply frontend fallback sorting if server-side sorting is insufficient
          // This ensures consistent ordering even when results come from different sources
          const sortedResults = sort === 'unified_ranking' || sort === 'relevance' 
            ? sortCombined(data.results) 
            : data.results;
          
          setResults(sortedResults);
          setTotal(data.total);
          setTotalPages(Math.ceil(data.total / itemsPerPage));
        }
      } catch (err: any) {
        if (currentRequestRef.current === requestId) {
          setError(err.message || 'Error fetching search results');
        }
      } finally {
        if (currentRequestRef.current === requestId) {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [query, page, itemsPerPage, sort, sdgs, location, source]);

  return { results, loading, totalPages, total, error };
};
