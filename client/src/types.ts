export type UserRole = 'student' | 'peer' | 'admin';
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended' | 'unverified';
export type ContentType = 'text' | 'audio' | 'video' | 'pdf_explanation';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  institution_id?: string;
  department_id?: string;
  program_id?: string;
  year?: number;
  semester?: number;
  role: UserRole;
  verification_status: VerificationStatus;
  is_onboarded?: boolean;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

export type UserProfile = Profile;

export interface PeerProfile {
  id: string;
  user_id: string;
  full_name?: string;
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

export interface ContentItem {
  id: string;
  owner_id: string;
  owner_name?: string;
  owner_avatar?: string;
  institution_id: string;
  institution_name?: string;
  subject_id: string;
  subject_name?: string;
  topic_id: string;
  topic_name?: string;
  year?: number;
  semester?: number;
  program_name?: string;
  title: string;
  description: string;
  content_type: ContentType;
  price: number;
  is_free: boolean;
  moderation_status: 'pending' | 'published' | 'rejected' | 'removed';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  view_count: number;
  purchase_count: number;
  average_rating: number;
  total_ratings: number;
  created_at: string;
  video?: {
    id: string;
    duration_seconds: number;
    video_url?: string;
    mux_playback_id?: string;
    thumbnail_url?: string;
  };
  audio?: {
    id: string;
    audio_url: string;
    duration_seconds: number;
  };
  text?: {
    body_markdown: string;
  };
  files?: {
    id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
    assignment_number?: string;
    disclaimer?: string;
  }[];
}

export interface TopicRequest {
  id: string;
  student_id: string;
  student_name?: string;
  institution_id: string;
  institution_name?: string;
  subject_id: string;
  subject_name?: string;
  topic_id?: string;
  topic_name?: string;
  title: string;
  description: string;
  preferred_type: string;
  budget: number;
  deadline?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  created_at: string;
}
