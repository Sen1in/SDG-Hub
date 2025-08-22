export interface KeywordResource {
  id: number;
  keyword: string;
  sdg_number: number;
  target_code: string;
  target_description: string;
  reference1: string;
  reference2: string;
  note: string;
  sdg_title: string;
  is_liked: boolean;
  created_at: string;
  
  all_targets?: {
      sdg_number: number;
      target_code: string;
      sdg_title: string;
  }[];
  target_count?: number;
}


export type KeywordSearchResult = KeywordResource;

export interface KeywordStats {
  total_keywords: number;
  unique_keywords: number;
  sdg_distribution: Record<string, number>;
  target_distribution: Record<string, number>;
  filter_options: {
    sdgs: Array<{value: number; label: string}>;
    target_codes: string[];
  };
}

export interface KeywordDetailResponse {
  keyword: string;
  targets: KeywordResource[];
  total_targets: number;
}

export interface FilterState {
  searchQuery: string;
  selectedSDGs: number[];
  targetCode: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}