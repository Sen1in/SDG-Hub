// Define team type
export interface Team {
  id: string;
  name: string;
  role: 'owner' | 'edit' | 'view';
  memberCount: number;
  maxMembers: number;
  createdAt?: string;
}

// Team member type
export interface TeamMember {
  id: string;
  username: string;
  email: string;
  role: 'owner' | 'edit' | 'view';
  joinedAt: string;
  lastActive?: string;
}

// API response type
export interface TeamDetailResponse {
  id: string;
  name: string;
  member_count: number;
  max_members: number;
  created_at: string;
  role: string;
  members: TeamMember[];
}

// Create team request type
export interface CreateTeamRequest {
  name: string;
  max_members?: number;
}

// Invite member request type
export interface InviteMemberRequest {
  username?: string;
  email?: string;
}

// User check response type
export interface UserCheckResponse {
  exists: boolean;
  message?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

// Component Props types
export interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (teamData: CreateTeamRequest) => void;
  isLoading?: boolean;
}

// Role level enum (optional, for better type safety)
export enum TeamRole {
  OWNER = 'owner',
  EDIT = 'edit',
  VIEW = 'view'
}

// Permission check utility function type
export type RolePermissions = {
  canInviteMembers: boolean;
  canEditTeam: boolean;
  canDeleteTeam: boolean;
  canLeaveTeam: boolean;
  canViewMembers: boolean;
}

export interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (identifier: string, type: 'email' | 'username') => Promise<InvitationResult>; 
  isLoading?: boolean;
}

export interface MemberActionDropdownProps {
  member: TeamMember;
  currentUserRole: string;
  onUpdateRole: (memberId: string, newRole: 'owner' | 'edit' | 'view') => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  isLoading?: boolean;
}

export interface ManageCapacityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCapacity: number) => Promise<void>;
  currentCapacity: number;
  currentMemberCount: number;
  isLoading?: boolean;
}

export interface InvitationResult {
  success: boolean;
  type: 'email_sent' | 'notification_sent' | 'unknown';
  message: string;
  emailSent?: boolean;
  member?: TeamMember;
  invitation?: {
    id: string;
    email?: string;
    team_name: string;
    expires_at: string;
  };
  notification?: {
    id: string;
    recipient: string;
    team_name: string;
    expires_at: string;
    status: string;
  };
}