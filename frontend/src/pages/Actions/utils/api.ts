import { API_BASE } from './constants';
import { ActionsResource, ActionsStats, PaginatedResponse, FilterState } from '../types';

const normalizeText = (text: string): string => {
  return text
    .replace(/[''`´]/g, "'")
    .replace(/[""]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

export const fetchActionsResources = async (
  page: number,
  filters: FilterState,
  itemsPerPage: number = 20  
): Promise<PaginatedResponse<ActionsResource>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('page_size', itemsPerPage.toString());  

  if (filters.searchQuery) params.append('search', normalizeText(filters.searchQuery));
  if (filters.selectedLevel) params.append('level', filters.selectedLevel);
  if (filters.selectedIndividualOrganization) params.append('individual_organization', filters.selectedIndividualOrganization);
  if (filters.selectedLocation) params.append('location', filters.selectedLocation);
  if (filters.selectedIndustry) params.append('industry', filters.selectedIndustry);
  if (filters.selectedDigitalActions) params.append('digital_actions', filters.selectedDigitalActions);
  if (filters.selectedAward) params.append('award', filters.selectedAward);
  
  filters.selectedSDGs.forEach(sdg => params.append('sdg', sdg.toString()));

  const response = await fetch(`${API_BASE}/api/actions/?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Action resources');
  }
  return response.json();
};

export const fetchActionsStats = async (): Promise<ActionsStats> => {
  const response = await fetch(`${API_BASE}/api/actions/stats/`);
  if (!response.ok) {
    throw new Error('Failed to fetch Action stats');
  }
  return response.json();
};

export const fetchActionsDetail = async (id: string): Promise<ActionsResource> => {
  const response = await fetch(`${API_BASE}/api/actions/${id}/`);
  if (!response.ok) {
    throw new Error('Resource not found');
  }
  return response.json();
};