export interface SearchResultResource { 
  id: number;
  type: 'education' | 'actions'; // source type
  description: string | null; 
  title: string;
  sdgs: number[];
  organization: string;
  year: string;
  source: 'education' | 'actions'; 
  sdgs_list?: number[];
  location?: string;
}

export interface FilterState {
  searchQuery: string;
  selectedSDGs: number[];
  selectedLocation: string;
  selectedSource: string;
  selectedYear?: string;
  sortOrder: string;
}

export interface SearchStats {
  filter_options: {
    years: string[];
    locations: string[];
    sdgs: number[];
    sources: string[];
  };
}

