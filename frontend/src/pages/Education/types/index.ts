export interface EducationResource {
  id: number;
  title: string;
  descriptions: string;
  aims: string;
  learning_outcome_expecting_outcome_field: string;
  organization: string;
  location: string;
  year: string;
  year_int: number | null;
  sdgs_list: number[];
  sdgs_related: string;
  type_list: string[];
  type_label: string;
  discipline_list: string[];
  related_to_which_discipline: string;
  industry_list: string[];
  useful_for_which_industries: string;
  source: string;
  link: string;
}

export interface EducationStats {
  total_resources: number;
  sdg_distribution: Record<string, number>;
  filter_options: {
    years: number[];
    sdgs: Array<{value: number; label: string}>;
    disciplines: string[];
    industries: string[];
    regions: string[];
  };
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface FilterState {
  searchQuery: string;
  selectedSDGs: number[];
  selectedYear: string;
  selectedLocation: string;
  selectedOrganization: string;
}
