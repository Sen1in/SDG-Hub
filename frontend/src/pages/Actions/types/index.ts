export interface ActionsResource {
  id: number;
  actions: string;
  action_detail: string;
  field_sdgs: string;
  sdgs_list: number[];
  level: number | null;
  level_label: string;
  individual_organization: number | null;
  individual_organization_label: string;
  location_specific_actions_org_onlyonly_field: string;
  location: string;
  related_industry_org_only_field: string;
  related_industry: string;
  industry_list: string[];
  digital_actions: number | null;
  digital_actions_label: string;
  source_descriptions: string;
  source_links: string;
  award: number | null;
  award_label: string;
  award_descriptions: string;
  additional_notes: string;
}

export interface ActionsStats {
  total_resources: number;
  sdg_distribution: Record<string, number>;
  level_distribution: Record<string, number>;
  individual_organization_distribution: Record<string, number>;
  digital_actions_stats: {
    digital_yes: number;
    digital_no: number;
  };
  award_stats: {
    award_yes: number;
    award_no: number;
  };
  latest_resources: ActionsResource[];
  filter_options: {
    sdgs: Array<{value: number; label: string}>;
    levels: Array<{value: number; label: string}>;
    individual_organization: Array<{value: number; label: string}>;
    digital_actions: Array<{value: number; label: string}>;
    award: Array<{value: number; label: string}>;
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
  selectedLevel: string;
  selectedIndividualOrganization: string;
  selectedLocation: string;
  selectedIndustry: string;
  selectedDigitalActions: string;
  selectedAward: string;
}