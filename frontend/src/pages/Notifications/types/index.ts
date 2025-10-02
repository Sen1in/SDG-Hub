export interface TeamInvitation {
  id: string;
  team_id: string;
  team_name: string;
  inviter_username: string;
  inviter_email: string;
  invited_by_email: boolean;
  invited_identifier: string;
  created_at: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface FormReviewRequest {
  form_id: string;
  form_title: string;
  form_type: 'action' | 'education';
  team_id: string;
  team_name: string;
  submitter_username: string;
  submitter_email: string;
  submitted_at: string;
  comments?: string;
}

export interface NotificationResponse {
  id: string;
  notification_type: 'team_invitation' | 'form_review_request' | 'form_review_completed' | 'form_review_status_update';
  data: TeamInvitation | FormReviewRequest | any;
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