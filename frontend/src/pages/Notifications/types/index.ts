// src/pages/Notifications/types/index.ts

export interface TeamInvitation {
  id: string;
  team_id: string;
  team_name: string;
  inviter_username: string;
  inviter_email: string;
  invited_by_email: boolean; // true if invited by email, false if by username
  invited_identifier: string; // the email or username used for invitation
  created_at: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface NotificationResponse {
  id: string;
  type: 'team_invitation';
  data: TeamInvitation;
  created_at: string;
  expires_at: string;
  is_read: boolean;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface AcceptInvitationRequest {
  notification_id: string;
}

export interface RejectInvitationRequest {
  notification_id: string;
}

export interface NotificationListResponse {
  results: NotificationResponse[];
  count: number;
  next?: string;
  previous?: string;
}