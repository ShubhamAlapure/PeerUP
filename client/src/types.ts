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

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  description?: string;
}

export type ResourceType =
  | 'assignment_reference'
  | 'assignment_solution'
  | 'notes'
  | 'study_material'
  | 'previous_question_paper'
  | 'lab_practical_reference';

export interface AcademicResource {
  id: string;
  title: string;
  description: string;
  institution_id: string;
  department_id?: string;
  program_id?: string;
  year: number;
  semester: number;
  subject_id?: string;
  topic_id?: string;
  resource_type: ResourceType;
  uploader_id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
  thumbnail_url?: string;
  tags?: string[];
  is_free: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'removed';
  views_count: number;
  downloads_count: number;
  created_at: string;
  updated_at?: string;

  // Hydrated fields
  uploader_name?: string;
  uploader_avatar?: string;
  uploader_role?: UserRole;
  uploader_verification_status?: VerificationStatus;
  is_peer_verified?: boolean;
  institution_name?: string;
  department_name?: string;
  program_name?: string;
  subject_name?: string;
  subject_code?: string;
  topic_name?: string;
  academic_integrity_notice?: string;
}

export interface ResourceReport {
  id: string;
  reporter_id: string;
  resource_id: string;
  reason:
    | 'incorrect_information'
    | 'copyright_concern'
    | 'inappropriate_content'
    | 'spam'
    | 'academic_integrity'
    | 'other';
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  resource?: AcademicResource;
  reporter_name?: string;
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

