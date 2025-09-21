// types/collaboration.ts
export interface FormContent {
  id: string;
  form: string;
  form_type: string;
  form_status: string;
  title: string;
  description: string;
  
  // Education 
  aims?: string;
  learning_outcomes?: string;
  type_label?: string;
  location?: string;
  organization?: string;
  year?: string;
  sdgs_related?: string;
  related_discipline?: string;
  useful_industries?: string;
  source?: string;
  link?: string;
  
  // Action 
  actions?: string;
  action_detail?: string;
  level?: number;
  individual_organization?: number;
  related_industry?: string;
  digital_actions?: boolean;
  source_descriptions?: string;
  award?: boolean;
  source_links?: string;
  additional_notes?: string;
  award_descriptions?: string;
  
  // Blank 
  free_content?: string;

  // IDA (Impact Design Analysis) 
  designer_names?: string;
  current_role_affiliation?: string;
  impact_project_name?: string;
  main_challenge?: string;
  project_description?: string;
  selected_sdgs?: string;
  impact_types?: string;
  project_importance?: string;
  existing_example?: string;
  implementation_step1?: string;
  implementation_step2?: string;
  implementation_step3?: string;
  implementation_step4?: string;
  implementation_step5?: string;
  implementation_step6?: string;
  resources_partnerships?: string;
  skills_capabilities?: string;
  impact_avenues?: string;
  risks_inhibitors?: string;
  mitigation_strategies?: string;
  
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ActiveEditor {
  user_id: number;
  user_name: string;
  user_avatar?: string;
  field_name?: string;
  cursor_position: number;
  selection_start?: number;
  selection_end?: number;
  last_activity: string;
}

export interface FieldPermission {
  id: string;
  field_name: string;
  permission: 'read' | 'edit' | 'admin';
  user_name: string;
  user_email: string;
  assigned_by_name: string;
  assigned_at: string;
}

export interface EditHistory {
  id: string;
  user_name: string;
  field_name: string;
  old_value: string;
  new_value: string;
  change_type: 'create' | 'update' | 'delete';
  timestamp: string;
  version: number;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'url' | 'select' | 'multiselect';
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  maxWords?: number;
  rows?: number; // for textarea
  options?: SelectOption[]; // for select and multiselect
}

// SDG 
export const SDG_TITLES = [
  'No Poverty', 'Zero Hunger', 'Good Health', 'Quality Education',
  'Gender Equality', 'Clean Water', 'Clean Energy', 'Economic Growth',
  'Innovation', 'Reduce Inequalities', 'Sustainable Cities', 'Responsible Consumption',
  'Climate Action', 'Life Below Water', 'Life on Land', 'Peace & Justice',
  'Partnerships'
];

// IDA Impact Type Options
export const IDA_IMPACT_TYPES = [
  'Education Impact',
  'Research Impact', 
  'Social Impact',
  'Local community Impact',
  'Commercial Impact',
  'Environmental Impact',
  'Family Impact',
  'Leadership Impact',
  'Policy Impact'
];

// Filter options - Education
export const EDUCATION_OPTIONS = {
  years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
  disciplines: [
    'Architecture and Building',
    'Business and Management', 
    'Creative Arts',
    'Education',
    'Engineering and Related Technologies',
    'Environmental and Related Studies',
    'Health',
    'Humanities and Law',
    'Information Technology',
    'Natural and Physical Sciences'
  ],
  industries: [
    'Education and training',
    'Health care and social assistance',
    'Professional services',
    'Information media and telecommunications',
    'Financial and insurance services',
    'Public administration and safety',
    'Manufacturing',
    'Construction',
    'Agriculture forestry and fishing'
  ]
};

// Filter options - Action
export const ACTION_OPTIONS = {
  levels: [
    { value: '1', label: 'Level 1 - on Couch, Individual action' },
    { value: '2', label: 'Level 2 - at Home, Individual action' },
    { value: '3', label: 'Level 3 - in Community, Individual action' },
    { value: '4', label: 'Level 4 - at School and Work, Individual action' },
    { value: '5', label: 'Level 5 - Organization action' },
    { value: '6', label: 'Level 6 - Government action' }
  ],
  individual_organization: [
    { value: '0', label: 'Individual' },
    { value: '1', label: 'Organization' },
    { value: '2', label: 'Both' }
  ],
  digital_actions: [
    { value: 'true', label: 'YES' },
    { value: 'false', label: 'NO' }
  ],
  award: [
    { value: 'false', label: 'No' },
    { value: 'true', label: 'Yes' }
  ],
  industries: [
    'Agriculture forestry and fishing',
    'Mining',
    'Manufacturing', 
    'Electricity gas water and waste services',
    'Construction',
    'Wholesale and retail trade',
    'Accommodation and food services',
    'Transport postal and warehousing',
    'Information media and telecommunications',
    'Financial and insurance services',
    'Rental hiring and real estate services',
    'Professional services',
    'Public administration and safety',
    'Education and training',
    'Health care and social assistance',
    'Arts and recreation services'
  ]
};

// General Options
export const COMMON_OPTIONS = {
  regions: [
    'Australia', 'United States', 'New Zealand', 'United Kingdom',
    'Italy', 'Spain', 'Global', 'China', 'Canada', 'India'
  ],
  years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
};

// Tool function for generating options
export const generateSelectOptions = (items: (string | number)[]): SelectOption[] => {
  return items.map(item => ({
    value: item.toString(),
    label: item.toString()
  }));
};

export const generateSDGOptions = (): SelectOption[] => {
  return SDG_TITLES.map((title, index) => ({
    value: (index + 1).toString(),
    label: `SDG ${index + 1}: ${title}`
  }));
};

export const generateImpactTypeOptions = (): SelectOption[] => {
  return IDA_IMPACT_TYPES.map((type, index) => ({
    value: (index + 1).toString(),
    label: type
  }));
};