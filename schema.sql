-- PeerUP PostgreSQL Database Schema
-- Supabase Compatible Script

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

-- 2. USER & PEER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    year INTEGER,
    semester INTEGER,
    role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'peer', 'admin')),
    verification_status VARCHAR(50) DEFAULT 'unverified' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended', 'unverified')),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.peer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_email VARCHAR(255),
    student_id_card_url TEXT,
    bio TEXT,
    total_earnings NUMERIC(10,2) DEFAULT 0.00,
    available_balance NUMERIC(10,2) DEFAULT 0.00,
    learners_helped INTEGER DEFAULT 0,
    average_rating NUMERIC(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    helpful_percentage INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.peer_expertise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    peer_id UUID NOT NULL REFERENCES public.peer_profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CONTENT & ASSIGNMENT REPOSITORY
CREATE TABLE IF NOT EXISTS public.content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('text', 'audio', 'video', 'pdf_explanation')),
    price NUMERIC(10,2) DEFAULT 0.00,
    is_free BOOLEAN DEFAULT true,
    moderation_status VARCHAR(50) DEFAULT 'published' CHECK (moderation_status IN ('pending', 'published', 'rejected', 'removed')),
    difficulty VARCHAR(50) DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    view_count INTEGER DEFAULT 0,
    purchase_count INTEGER DEFAULT 0,
    average_rating NUMERIC(3,2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.content_text (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID UNIQUE NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    body_markdown TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.content_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    assignment_number VARCHAR(50),
    is_reference_only BOOLEAN DEFAULT true,
    disclaimer VARCHAR(255) DEFAULT 'For reference and learning purposes only. Do not submit another student''s work as your own.'
);

CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID UNIQUE NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    mux_asset_id VARCHAR(255),
    mux_playback_id VARCHAR(255),
    video_url TEXT,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds <= 600), -- Hard limit 10 minutes (600s)
    file_size INTEGER,
    thumbnail_url TEXT,
    status VARCHAR(50) DEFAULT 'ready'
);

CREATE TABLE IF NOT EXISTS public.audio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID UNIQUE NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    audio_url TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    file_size INTEGER
);

-- 4. MARKETPLACE, REQUESTS & TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    preferred_type VARCHAR(50) DEFAULT 'any',
    budget NUMERIC(10,2) DEFAULT 0.00,
    deadline TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.request_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    peer_id UUID NOT NULL REFERENCES public.peer_profiles(id) ON DELETE CASCADE,
    content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    amount_paid NUMERIC(10,2) NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, content_id)
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    razorpay_order_id VARCHAR(255) NOT NULL,
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    amount NUMERIC(10,2) NOT NULL,
    platform_fee NUMERIC(10,2) NOT NULL,
    gateway_fee NUMERIC(10,2) DEFAULT 0.00,
    tutor_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'captured' CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    peer_id UUID NOT NULL REFERENCES public.peer_profiles(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
    gross_amount NUMERIC(10,2) NOT NULL,
    platform_commission NUMERIC(10,2) NOT NULL,
    gateway_fee NUMERIC(10,2) DEFAULT 0.00,
    net_earnings NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('pending', 'available', 'paid_out')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    peer_id UUID NOT NULL REFERENCES public.peer_profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 250.00), -- Minimum payout threshold ₹250
    status VARCHAR(50) DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'processed', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID UNIQUE REFERENCES public.purchases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
    is_helpful BOOLEAN DEFAULT true,
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, content_id)
);

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('content', 'user', 'peer', 'assignment')),
    target_id UUID NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected', 'processed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'system',
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR MAXIMUM QUERY EFFICIENCY
CREATE INDEX IF NOT EXISTS idx_institutions_city_state ON public.institutions(city, state);
CREATE INDEX IF NOT EXISTS idx_departments_institution ON public.departments(institution_id);
CREATE INDEX IF NOT EXISTS idx_programs_department ON public.programs(department_id);
CREATE INDEX IF NOT EXISTS idx_years_program ON public.years(program_id);
CREATE INDEX IF NOT EXISTS idx_semesters_year ON public.semesters(year_id);
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON public.subjects(semester_id);
CREATE INDEX IF NOT EXISTS idx_topics_subject ON public.topics(subject_id);

CREATE INDEX IF NOT EXISTS idx_profiles_institution ON public.profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_content_institution_subject ON public.content(institution_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_content_topic ON public.content(topic_id);
CREATE INDEX IF NOT EXISTS idx_content_owner ON public.content(owner_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_content ON public.purchases(user_id, content_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(razorpay_order_id);

-- ROW LEVEL SECURITY POLICIES (RLS)
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to academic structures and published content
CREATE POLICY "Public academic structures access" ON public.institutions FOR SELECT USING (true);
CREATE POLICY "Public departments access" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Public programs access" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Public years access" ON public.years FOR SELECT USING (true);
CREATE POLICY "Public semesters access" ON public.semesters FOR SELECT USING (true);
CREATE POLICY "Public subjects access" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Public topics access" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Published content public access" ON public.content FOR SELECT USING (moderation_status = 'published');
