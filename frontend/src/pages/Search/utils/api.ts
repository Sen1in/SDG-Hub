import { API_BASE } from './constants';

export interface UnifiedSearchResponse {
  results: any[];
  total: number;
  num_pages: number;
  current_page: number;
}

export const fetchUnifiedSearchResults = async (
  query: string,
  page: number,
  itemsPerPage: number = 10,
  sort: string = 'relevance',
  sdgs: number[] = [],
  location: string = '',
  source: string = ''
): Promise<UnifiedSearchResponse> => {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  params.append('page', page.toString());
  params.append('size', itemsPerPage.toString());
  params.append('sort', sort);

  // add SDGs, locaiton, and source filters
  if (sdgs.length > 0) {
    params.append('sdg', sdgs.join(','));         //  SDG
  }
  if (location.trim()) {
    params.append('location', location);         //  locations
  }
  if (source.trim()) {
    params.append('source', source);              //  source
  }

  const response = await fetch(`${API_BASE}/api/search/?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch search results');
  }
  return response.json();
};

