export type DatabaseType = 'education' | 'actions';

export interface DatabaseRecord {
  id: number;
  title?: string;
  actions?: string;
  description?: string;
  action_detail?: string;
  year?: string;
  organization?: string;
  location?: string;
  level?: number;
  level_label?: string;
  sdgs_list?: number[];
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  num_pages: number;
  current_page: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ColumnMapping {
  [key: number]: {
    excel_column: string;
    mapped_field: string | null;
    status: 'required' | 'optional' | 'unmapped';
  };
}

export interface ValidationResults {
  valid_records: any[];
  invalid_records: Array<{
    row_index: number;
    data: any;
    errors: string[];
  }>;
  valid_count: number;
  invalid_count: number;
}

export interface DuplicateResults {
  duplicates: Array<{
    index: number;
    record: any;
    duplicate_title: string;
    type: 'existing' | 'in_file';
  }>;
  duplicate_count: number;
}

export interface ProcessFileResponse {
  column_mapping: ColumnMapping;
  validation_results: ValidationResults;
  duplicate_results: DuplicateResults;
  total_rows: number;
}

// Enhanced ImportResponse with failed records
export interface FailedRecord {
  record: any;
  error: string;
  details?: string;
  row_index?: number;
}

export interface ImportResponse {
  message: string;
  imported_count: number;
  skipped_count: number;
  failed_count: number;
  failed_records?: FailedRecord[];
}

export interface DatabaseSchema {
  required_fields: string[];
  optional_fields: string[];
  field_descriptions: { [key: string]: string };
}

export interface SearchFilters {
  search: string;
  year: string;
  page: number;
  page_size: number;
}

export interface DataManagementStats {
  education_count: number;
  actions_count: number;
}