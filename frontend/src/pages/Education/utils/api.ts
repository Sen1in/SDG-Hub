import { API_BASE } from './constants';
import { EducationResource, EducationStats, PaginatedResponse, FilterState } from '../types';

const normalizeText = (text: string): string => {
  return text
    .replace(/[''`´]/g, "'")
    .replace(/[""]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

export const fetchEducationResources = async (
  page: number, 
  filters: FilterState,
  itemsPerPage: number = 20  
): Promise<PaginatedResponse<EducationResource>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('page_size', itemsPerPage.toString());  

  if (filters.searchQuery) params.append('search', normalizeText(filters.searchQuery));
  if (filters.selectedYear) params.append('year', filters.selectedYear);
  if (filters.selectedLocation) params.append('location', filters.selectedLocation);
  if (filters.selectedOrganization) params.append('organization', normalizeText(filters.selectedOrganization));
  
  filters.selectedSDGs.forEach(sdg => params.append('sdg', sdg.toString()));

  const response = await fetch(`${API_BASE}/api/education/?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch education resources');
  }
  return response.json();
};

export const fetchEducationStats = async (): Promise<EducationStats> => {
  const response = await fetch(`${API_BASE}/api/education/stats/`);
  if (!response.ok) {
    throw new Error('Failed to fetch education stats');
  }
  return response.json();
};

export const fetchEducationDetail = async (id: string): Promise<EducationResource> => {
  const response = await fetch(`${API_BASE}/api/education/${id}/`);
  if (!response.ok) {
    throw new Error('Resource not found');
  }
  return response.json();
};