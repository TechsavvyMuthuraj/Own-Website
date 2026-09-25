export type MeetingStatus = "scheduled" | "live" | "completed" | "cancelled";
export type MeetingType = "consultation" | "technical_support" | "vip_session" | "workshop";

export interface ZoomMeeting {
  id: string;
  title: string;
  description?: string | null;
  meeting_type: MeetingType;
  host_name: string;
  host_email: string;
  meeting_url: string;
  join_url: string;
  meeting_id?: string | null;
  passcode?: string | null;
  scheduled_start: string; // ISO string
  duration_minutes: number;
  max_participants: number;
  status: MeetingStatus;
  created_at?: string;
  updated_at?: string;
  registrations_count?: number;
}

export interface ZoomRegistration {
  id: string;
  meeting_id: string;
  user_id?: string | null;
  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string | null;
  topic_notes?: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at?: string;
  meeting?: ZoomMeeting;
}
