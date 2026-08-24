// PeerUP Initial Seed Data
// Rich multi-institution academic structures, verified peers, free assignment repository, & sample explanations

export const seedInstitutions = [
  {
    id: "inst-mit-adt",
    name: "MIT ADT University",
    type: "university",
    logo_url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=120&q=80",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    verification_status: "verified",
    description: "Premier university specializing in Engineering, Design, Technology, and Fine Arts."
  },
  {
    id: "inst-coep",
    name: "COEP Technological University",
    type: "university",
    logo_url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=120&q=80",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    verification_status: "verified",
    description: "One of Asia's oldest autonomous engineering institutions known for academic excellence."
  },
  {
    id: "inst-sppu",
    name: "Savitribai Phule Pune University (SPPU)",
    type: "university",
    logo_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=120&q=80",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    verification_status: "verified",
    description: "Oxford of the East - premier state university in Pune."
  },
  {
    id: "inst-symbiosis",
    name: "Symbiosis International University",
    type: "university",
    logo_url: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=120&q=80",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    verification_status: "verified",
    description: "Deemed university famed for Management, Computer Studies, and Law."
  },
  {
    id: "inst-pict",
    name: "PICT Pune (Pune Inst of Computer Tech)",
    type: "college",
    logo_url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=120&q=80",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    verification_status: "verified",
    description: "Elite engineering institution focused exclusively on Computer Science & IT."
  },
  {
    id: "inst-vit-pune",
    name: "VIT Pune (Vishwakarma Inst of Tech)",
    type: "college",
    logo_url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=120&q=80",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    verification_status: "verified",
    description: "Autonomous engineering institute affiliated with SPPU."
  },
  {
    id: "inst-iit-bombay",
    name: "IIT Bombay",
    type: "university",
    logo_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=120&q=80",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    verification_status: "verified",
    description: "Institute of National Importance for Higher Technological Education and Research."
  },
  {
    id: "inst-du",
    name: "University of Delhi",
    type: "university",
    logo_url: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=120&q=80",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    verification_status: "verified",
    description: "Collegiate public central university in New Delhi known for Arts, Science and Commerce."
  }
];

export const seedDepartments = [
  { id: "dept-cse", institution_id: "inst-mit-adt", name: "Computer Science & Engineering", code: "CSE" },
  { id: "dept-ece", institution_id: "inst-mit-adt", name: "Electronics & Communication", code: "ECE" },
  { id: "dept-coep-comp", institution_id: "inst-coep", name: "Computer Engineering", code: "COMP" },
  { id: "dept-iitb-cs", institution_id: "inst-iit-bombay", name: "Computer Science & Engineering", code: "CS" }
];

export const seedPrograms = [
  { id: "prog-btech-cse", department_id: "dept-cse", name: "B.Tech Computer Science & Engineering", code: "B.Tech CSE", duration_years: 4 },
  { id: "prog-btech-ece", department_id: "dept-ece", name: "B.Tech Electronics & Communication", code: "B.Tech ECE", duration_years: 4 },
  { id: "prog-coep-btech", department_id: "dept-coep-comp", name: "B.Tech Computer Engineering", code: "B.Tech COMP", duration_years: 4 }
];

export const seedYears = [
  { id: "yr-1", program_id: "prog-btech-cse", year_number: 1, label: "First Year (FE)" },
  { id: "yr-2", program_id: "prog-btech-cse", year_number: 2, label: "Second Year (SE)" },
  { id: "yr-3", program_id: "prog-btech-cse", year_number: 3, label: "Third Year (TE)" },
  { id: "yr-4", program_id: "prog-btech-cse", year_number: 4, label: "Final Year (BE)" }
];

export const seedSemesters = [
  { id: "sem-3", year_id: "yr-2", semester_number: 3, label: "Semester 3" },
  { id: "sem-4", year_id: "yr-2", semester_number: 4, label: "Semester 4" },
  { id: "sem-5", year_id: "yr-3", semester_number: 5, label: "Semester 5" }
];

export const seedSubjects = [
  { id: "subj-dbms", semester_id: "sem-3", name: "Database Management Systems", code: "CS301" },
  { id: "subj-dsa", semester_id: "sem-3", name: "Data Structures & Algorithms", code: "CS302" },
  { id: "subj-os", semester_id: "sem-4", name: "Operating Systems", code: "CS401" },
  { id: "subj-cn", semester_id: "sem-5", name: "Computer Networks", code: "CS501" }
];

export const seedTopics = [
  { id: "top-norm", subject_id: "subj-dbms", name: "Database Normalization (1NF, 2NF, 3NF, BCNF)", description: "Step-by-step process of organizing data to reduce redundancy and improve data integrity." },
  { id: "top-sql-join", subject_id: "subj-dbms", name: "Complex SQL Joins & Subqueries", description: "INNER, LEFT, RIGHT, FULL OUTER joins and correlated subqueries with practical examples." },
  { id: "top-btree", subject_id: "subj-dsa", name: "B-Trees & B+ Trees Indexing", description: "Self-balancing search trees for disk storage indexing and database performance tuning." },
  { id: "top-sync", subject_id: "subj-os", name: "Process Synchronization & Semaphores", description: "Mutex, Peterson's algorithm, Semaphores, and solving the Dining Philosophers Problem." }
];

export const seedProfiles = [
  {
    id: "usr-shubham",
    full_name: "Shubham Alapure",
    email: "shubham@mitadt.edu.in",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    institution_id: "inst-mit-adt",
    department_id: "dept-cse",
    program_id: "prog-btech-cse",
    year: 3,
    semester: 5,
    role: "peer",
    verification_status: "verified",
    bio: "3rd Year CSE Student at MIT ADT. Passionate about DBMS, Systems & Web Architecture. Top 1% Peer Educator."
  },
  {
    id: "usr-ananya",
    full_name: "Ananya Sharma",
    email: "ananya.sharma@coep.ac.in",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    institution_id: "inst-coep",
    department_id: "dept-coep-comp",
    program_id: "prog-coep-btech",
    year: 4,
    semester: 7,
    role: "peer",
    verification_status: "verified",
    bio: "Final Year COMP Student at COEP. DSA & OS Teaching Assistant. Helped 200+ students crack placements."
  },
  {
    id: "usr-rohit",
    full_name: "Rohit Verma",
    email: "rohit.student@mitadt.edu.in",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    institution_id: "inst-mit-adt",
    department_id: "dept-cse",
    program_id: "prog-btech-cse",
    year: 2,
    semester: 3,
    role: "student",
    verification_status: "verified",
    bio: "2nd Year CSE student eager to master Database Systems and Operating Systems."
  },
  {
    id: "usr-admin",
    full_name: "PeerUP Administrator",
    email: "admin@peerup.edu",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    institution_id: "inst-mit-adt",
    role: "admin",
    verification_status: "verified",
    bio: "Platform Administrator maintaining academic integrity and moderation."
  }
];

export const seedPeerProfiles = [
  {
    id: "peer-shubham",
    user_id: "usr-shubham",
    institution_email: "shubham@mitadt.edu.in",
    bio: "Specializing in DBMS, SQL Optimization, and System Architecture.",
    total_earnings: 1240.00,
    available_balance: 890.00,
    learners_helped: 127,
    average_rating: 4.9,
    total_reviews: 42,
    helpful_percentage: 96
  },
  {
    id: "peer-ananya",
    user_id: "usr-ananya",
    institution_email: "ananya.sharma@coep.ac.in",
    bio: "Data Structures, Algorithms, Dynamic Programming & Operating Systems.",
    total_earnings: 3450.00,
    available_balance: 1420.00,
    learners_helped: 310,
    average_rating: 4.95,
    total_reviews: 98,
    helpful_percentage: 98
  }
];

export const seedContent = [
  {
    id: "cnt-dbms-norm-video",
    owner_id: "usr-shubham",
    institution_id: "inst-mit-adt",
    subject_id: "subj-dbms",
    topic_id: "top-norm",
    title: "Mastering Database Normalization (1NF to BCNF) with Real Examples",
    description: "A complete 9-minute video explanation walking through functional dependencies, candidate keys, and step-by-step decomposition without data loss.",
    content_type: "video",
    price: 20.00,
    is_free: false,
    moderation_status: "published",
    difficulty: "intermediate",
    view_count: 342,
    purchase_count: 89,
    average_rating: 4.9,
    total_ratings: 38,
    created_at: "2026-08-15T10:30:00Z",
    video: {
      id: "vid-1",
      duration_seconds: 520, // 8m 40s (under 10 min hard limit)
      mux_playback_id: "demo_playback_dbms_norm",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnail_url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80"
    }
  },
  {
    id: "cnt-dbms-assgn-ref",
    owner_id: "usr-shubham",
    institution_id: "inst-mit-adt",
    subject_id: "subj-dbms",
    topic_id: "top-sql-join",
    title: "DBMS Lab Assignment 3 — SQL Queries & Joins Reference",
    description: "Previous year's worked practice reference for relational algebra and complex subqueries. Provided strictly for study and reference.",
    content_type: "pdf_explanation",
    price: 0.00,
    is_free: true,
    moderation_status: "published",
    difficulty: "beginner",
    view_count: 1250,
    purchase_count: 0,
    average_rating: 4.8,
    total_ratings: 54,
    created_at: "2026-08-10T14:15:00Z",
    files: [
      {
        id: "file-1",
        file_name: "DBMS_Assignment_3_Reference_2025.pdf",
        file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        file_type: "application/pdf",
        file_size: 450000,
        assignment_number: "Assignment 3",
        is_reference_only: true,
        disclaimer: "For reference and learning purposes only. Do not submit another student's work as your own."
      }
    ]
  },
  {
    id: "cnt-os-sync-audio",
    owner_id: "usr-ananya",
    institution_id: "inst-coep",
    subject_id: "subj-os",
    topic_id: "top-sync",
    title: "Process Synchronization & Semaphores Explained in Simple Terms",
    description: "Clear 6-minute audio walkthrough explaining Producer-Consumer problem, Mutex locks vs Counting Semaphores.",
    content_type: "audio",
    price: 15.00,
    is_free: false,
    moderation_status: "published",
    difficulty: "intermediate",
    view_count: 210,
    purchase_count: 45,
    average_rating: 5.0,
    total_ratings: 20,
    created_at: "2026-08-18T09:00:00Z",
    audio: {
      id: "aud-1",
      audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      duration_seconds: 360,
      file_size: 3200000
    }
  }
];

export const seedRequests = [
  {
    id: "req-1",
    student_id: "usr-rohit",
    institution_id: "inst-mit-adt",
    subject_id: "subj-dbms",
    topic_id: "top-btree",
    title: "Request for B-Tree vs B+ Tree Index Insertion Walkthrough",
    description: "I am having trouble understanding node splitting during B+ Tree insertions. Need a concise audio or video explanation with a step-by-step numerical example.",
    preferred_type: "video",
    budget: 25.00,
    deadline: "2026-08-28T18:00:00Z",
    status: "open",
    created_at: "2026-08-22T11:00:00Z"
  }
];
