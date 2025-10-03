// locationService.ts - 获取location选项的服务

export interface LocationOption {
  value: string;
  label: string;
}

export interface LocationResponse {
  success: boolean;
  locations: LocationOption[];
  total: number;
  error?: string;
}

/**
 * Get all available location options
 * Used for React Select component autocomplete functionality
 */
export const fetchLocationOptions = async (): Promise<LocationOption[]> => {
  try {
    const response = await fetch('/api/locations/suggestions/');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: LocationResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch locations');
    }
    
    return data.locations;
  } catch (error) {
    console.error('Failed to fetch location options:', error);
    
    // Return predefined common regions as fallback
    return [
      { value: 'Australia', label: 'Australia' },
      { value: 'United States', label: 'United States' },
      { value: 'New Zealand', label: 'New Zealand' },
      { value: 'United Kingdom', label: 'United Kingdom' },
      { value: 'Italy', label: 'Italy' },
      { value: 'Spain', label: 'Spain' },
      { value: 'Global', label: 'Global' },
      { value: 'China', label: 'China' },
      { value: 'Canada', label: 'Canada' },
      { value: 'India', label: 'India' },
      { value: 'Others', label: 'Others' }
    ];
  }
};
