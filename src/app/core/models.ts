export type Role = 'admin' | 'volunteer';
export type ReqStatus = 'Pending' | 'Approved' | 'Rejected';
export type EventStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';

export interface Profile {
  id: string; num: number; full_name: string; email: string; location: string | null;
  status: 'Active' | 'Inactive'; role: Role; created_at: string;
}
export interface EventItem {
  id: string; num: number; title: string; description: string | null; event_date: string;
  location: string; image_url: string | null; status: EventStatus; hours: number; created_at: string;
}
export interface Registration {
  id: string; num: number; user_id: string; event_id: string; status: ReqStatus;
  message: string | null; admin_note: string | null; created_at: string;
  profiles?: { full_name: string; email: string; location: string | null };
  events?: { title: string; event_date: string; location: string; image_url: string | null; status: EventStatus; hours: number };
}
export interface OrgSettings { id: number; org_name: string; contact_email: string; location: string; }
