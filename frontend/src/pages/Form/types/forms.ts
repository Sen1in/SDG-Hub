// Form type enumeration
export enum FormType {
    ACTION = 'action',
    EDUCATION = 'education',
    BLANK = 'blank',
    IDA = 'ida',
  }
  
  // Form status enumeration
  export enum FormStatus {
    ACTIVE = 'active',
    LOCKED = 'locked',
    ARCHIVED = 'archived'
  }
  
  // Form permission enumeration
  export enum FormPermission {
    READ = 'read',
    WRITE = 'write',
    ADMIN = 'admin'
  }
  
  // Form basic information
  export interface TeamForm {
    id: string;
    title: string;
    description?: string;
    type: FormType;
    status: FormStatus;
    teamId: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    lastModifiedBy?: string;
    responseCount: number;
    isTemplate: boolean;
    permission: FormPermission;
    settings: FormSettings;
  }
  
  // Form settings
  export interface FormSettings {
    allowAnonymous: boolean;
    allowMultipleSubmissions: boolean;
    requireLogin: boolean;
    deadline?: string;
    isPublic: boolean;
  }
  
  // Create form request
  export interface CreateFormRequest {
    title: string;
    description?: string;
    type: FormType;
    teamId: string;
    settings?: Partial<FormSettings>;
  }
  
  // Update form request
  export interface UpdateFormRequest {
    title?: string;
    description?: string;
    status?: FormStatus;
    settings?: Partial<FormSettings>;
  }
  
  // Form operation response
  export interface FormActionResponse {
    success: boolean;
    message: string;
    form?: TeamForm;
  }
  
  // API response type
  export interface FormsListResponse {
    forms: TeamForm[];
    total: number;
    page: number;
    pageSize: number;
  }
  
  // Component Props Type
  export interface TeamFormsPageProps {
    teamId: string;
  }
  
  export interface FormListItemProps {
    form: TeamForm;
    currentUserRole: 'owner' | 'edit' | 'view';
    onUpdateForm: (formId: string, updates: UpdateFormRequest) => Promise<void>;
    onDeleteForm: (formId: string) => Promise<void>;
    onToggleLock: (formId: string, isLocked: boolean) => Promise<void>;
    isLoading?: boolean;
  }
  
  export interface FormActionDropdownProps {
    form: TeamForm;
    currentUserRole: 'owner' | 'edit' | 'view';
    onUpdateForm: (formId: string, updates: UpdateFormRequest) => Promise<void>;
    onDeleteForm: (formId: string) => Promise<void>;
    onToggleLock: (formId: string, isLocked: boolean) => Promise<void>;
    onDuplicateForm?: (formId: string) => Promise<void>;
    isLoading?: boolean;
  }
  
  export interface CreateFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (formData: CreateFormRequest) => Promise<void>;
    teamId: string;
    isLoading?: boolean;
  }
  
  // Form statistics information
  export interface FormStats {
    totalForms: number;
    activeForms: number;
    lockedForms: number;
    formsByType: {
      action: number;
      education: number;
      blank: number;
      ida: number;
    };
  }