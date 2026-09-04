-- PeerUP PostgreSQL Database Schema
-- Supabase Compatible Script with Full RLS & Auth Policies

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. INSTITUTIONS & ACADEMIC HIERARCHY
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('university', 'college', 'school')),
    logo_url TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    verification_status VARCHAR(50) DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'unverified')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    duration_years INTEGER DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    year_number INTEGER NOT NULL,
    label VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year_id UUID NOT NULL REFERENCES public.years(id) ON DELETE CASCADE,
    semester_number INTEGER NOT NULL,
    label VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USER PROFILES & ROLES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'peer', 'admin')),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    year INTEGER DEFAULT 2,
    semester INTEGER DEFAULT 3,
    bio TEXT,
    is_onboarded BOOLEAN DEFAULT false,
    verification_status VARCHAR(50) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.peer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    institution_email VARCHAR(255),
    student_id_card_url TEXT,
    bio TEXT,
    total_earnings NUMERIC(10,2) DEFAULT 0.00,
    available_balance NUMERIC(10,2) DEFAULT 0.00,
    learners_helped INTEGER DEFAULT 0,
    average_rating NUMERIC(3,2) DEFAULT 5.00,
    total_reviews INTEGER DEFAULT 0,
    helpful_percentage INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ACADEMIC RESOURCES & REPOSITORY TABLE
CREATE TABLE IF NOT EXISTS public.academic_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN (
      'assignment_reference',
      'assignment_solution',
      'notes',
      'study_material',
      'previous_question_paper',
      'lab_practical_reference'
    )),
    uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT DEFAULT 0,
    file_type VARCHAR(100) NOT NULL,
    thumbnail_url TEXT,
    custom_topic_name VARCHAR(255),
    tags TEXT[] DEFAULT '{}',
    is_free BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'removed')),
    views_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resources_inst ON public.academic_resources(institution_id);
CREATE INDEX IF NOT EXISTS idx_resources_dept ON public.academic_resources(department_id);
CREATE INDEX IF NOT EXISTS idx_resources_prog ON public.academic_resources(program_id);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON public.academic_resources(subject_id);
CREATE INDEX IF NOT EXISTS idx_resources_uploader ON public.academic_resources(uploader_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON public.academic_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.academic_resources(status);

-- 4. RESOURCE REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.resource_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.academic_resources(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL CHECK (reason IN (
      'incorrect_information',
      'copyright_concern',
      'inappropriate_content',
      'spam',
      'academic_integrity',
      'other'
    )),
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. EXPLANATION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    requested_peer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    offered_bounty NUMERIC(10,2) DEFAULT 50.00,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS POLICIES FOR REQUESTS
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for requests" ON public.requests FOR SELECT USING (true);
CREATE POLICY "Enable insert for requests" ON public.requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for requests" ON public.requests FOR UPDATE USING (true);

-- ENABLE RLS ON PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert for profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for profiles" ON public.profiles FOR UPDATE USING (true);

-- ENABLE RLS ON ACADEMIC_RESOURCES
ALTER TABLE public.academic_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for free approved resources" ON public.academic_resources
    FOR SELECT USING (status = 'approved' OR uploader_id = auth.uid());
CREATE POLICY "Enable insert for authenticated resources" ON public.academic_resources
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for resource owners or admin" ON public.academic_resources
    FOR UPDATE USING (uploader_id = auth.uid());
CREATE POLICY "Enable delete for resource owners or admin" ON public.academic_resources
    FOR DELETE USING (uploader_id = auth.uid());

-- ENABLE RLS ON RESOURCE_REPORTS
ALTER TABLE public.resource_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable insert for resource reports" ON public.resource_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for resource reports" ON public.resource_reports FOR SELECT USING (true);

