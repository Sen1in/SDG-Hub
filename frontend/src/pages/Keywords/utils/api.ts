import { API_BASE } from './constants';
import { 
  KeywordResource, 
  KeywordStats, 
  KeywordDetailResponse, 
  FilterState, 
  PaginatedResponse
} from '../types';

export const fetchKeywordSearch = async (
  page: number,
  filters: FilterState,
  itemsPerPage: number = 20
): Promise<PaginatedResponse<KeywordResource>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('page_size', itemsPerPage.toString());


  if (filters.searchQuery) params.append('search', filters.searchQuery.trim());
  filters.selectedSDGs.forEach(sdg => params.append('sdg', sdg.toString()));
  if (filters.targetCode) params.append('target_code', filters.targetCode);


  const url = `${API_BASE}/api/keywords/?${params}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch keywords: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchKeywordStats = async (): Promise<KeywordStats> => {
  const url = `${API_BASE}/api/keywords/stats/`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Failed to fetch keyword stats');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchKeywordDetail = async (keyword: string): Promise<KeywordDetailResponse> => {
  const url = `${API_BASE}/api/keywords/detail/${encodeURIComponent(keyword)}/`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Keyword not found');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchKeywordAutocomplete = async (query: string): Promise<{suggestions: string[]}> => {
  const params = new URLSearchParams({ q: query });
  const url = `${API_BASE}/api/keywords/autocomplete/?${params}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Failed to fetch suggestions');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};