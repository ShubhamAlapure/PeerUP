export type UserRole = 'student' | 'peer' | 'admin';
export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: UserRole;
  institution_id?: string;
  department_id?: string;
  program_id?: string;
  year?: number;
  semester?: number;
  bio?: string;
  is_onboarded?: boolean;
  verification_status: VerificationStatus;
  created_at?: string;
  updated_at?: string;
}

export type UserProfile = Profile;

export interface PeerProfile {
  id: string;
  user_id: string;
  full_name?: string;
  user_name?: string;
  email?: string;
  avatar_url?: string;
  institution_name?: string;
  institution_email?: string;
  bio?: string;
  total_earnings: number;
  available_balance: number;
  learners_helped: number;
  average_rating: number;
  total_reviews: number;
  helpful_percentage: number;
  published_count?: number;
  verification_status?: string;
  explanations?: ContentItem[];
}

export interface Institution {
  id: string;
  name: string;
  type: 'university' | 'college' | 'school';
  logo_url: string;
  city: string;
  state: string;
  country: string;
  verification_status: string;
  description?: string;
}

export interface Department {
  id: string;
  institution_id: string;
  name: string;
  code: string;
}

export interface Program {
  id: string;
  department_id: string;
  name: string;
  code: string;
  duration_years: number;
}

export interface Year {
  id: string;
  program_id: string;
  year_number: number;
  label: string;
}

export interface Semester {
  id: string;
  year_id: string;
  semester_number: number;
  label: string;
}

export interface Subject {
  id: string;
  semester_id: string;
  name: string;
  code: string;
}

export type ContentType = 'video' | 'audio' | 'text_assignment' | 'reference_solution' | 'pdf_explanation' | 'text';

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  content_type: ContentType;
  owner_id: string;
  owner_name?: string;
  owner_avatar?: string;
  institution_id: string;
  institution_name?: string;
  subject_id?: string;
  subject_name?: string;
  year?: number;
  semester?: number;
  duration_seconds?: number;
  media_url?: string;
  preview_url?: string;
  price: number;
  is_free: boolean;
  moderation_status: 'pending' | 'published' | 'rejected';
  views_count: number;
  view_count?: number;
  purchases_count: number;
  average_rating: number;
  total_ratings?: number;
  video?: any;
  audio?: any;
  text?: any;
  files?: any[];
  created_at: string;
}

export interface TopicRequest {
  id: string;
  student_id: string;
  requested_peer_id?: string;
  student_name?: string;
  student_avatar?: string;
  institution_id: string;
  institution_name?: string;
  subject_name?: string;
  title: string;
  description: string;
  budget: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  created_at: string;
}
