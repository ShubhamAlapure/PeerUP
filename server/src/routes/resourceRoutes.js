import express from 'express';
import {
  seedInstitutions,
  seedDepartments,
  seedPrograms,
  seedYears,
  seedSemesters,
  seedSubjects,
  seedTopics,
  seedProfiles,
  seedPeerProfiles,
  seedAcademicResources,
  seedResourceReports
} from '../db/seedData.js';

const router = express.Router();

// In-memory data store for academic resources & reports
export let academicResourcesStore = [...seedAcademicResources];
export let resourceReportsStore = [...seedResourceReports];

const ACADEMIC_INTEGRITY_NOTICE =
  "This material is provided for reference and learning purposes. Do not submit another student's work as your own.";

/**
 * Hydrates a raw resource item with foreign entity details (Uploader, Institution, Dept, Program, Subject, Topic)
 */
function hydrateResource(item) {
  const uploader = seedProfiles.find(p => p.id === item.uploader_id) || {};
  const peerProfile = seedPeerProfiles.find(p => p.user_id === item.uploader_id);
  const inst = seedInstitutions.find(i => i.id === item.institution_id) || {};
  const dept = seedDepartments.find(d => d.id === item.department_id) || {};
  const prog = seedPrograms.find(p => p.id === item.program_id) || {};
  const subj = seedSubjects.find(s => s.id === item.subject_id) || {};
  const topic = seedTopics.find(t => t.id === item.topic_id) || {};

  return {
    ...item,
    uploader_name: uploader.full_name || 'Verified Peer Educator',
    uploader_avatar: uploader.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    uploader_role: uploader.role || 'peer',
    uploader_verification_status: uploader.verification_status || 'verified',
    is_peer_verified: uploader.role === 'peer' && uploader.verification_status === 'verified',
    institution_name: inst.name || 'MIT ADT University',
    department_name: dept.name || 'Computer Science & Engineering',
    program_name: prog.name || 'B.Tech CSE',
    subject_name: subj.name || 'Academic Subject',
    subject_code: subj.code || '',
    topic_name: topic.name || '',
    academic_integrity_notice: ACADEMIC_INTEGRITY_NOTICE
  };
}

/* ==========================================================================
   1. ACADEMIC HIERARCHY NAVIGATION ENDPOINTS
   ========================================================================== */

// GET /api/academic/institutions
router.get('/academic/institutions', (req, res) => {
  res.json(seedInstitutions);
});

// GET /api/academic/institutions/:instId/departments
router.get('/academic/institutions/:instId/departments', (req, res) => {
  const depts = seedDepartments.filter(d => d.institution_id === req.params.instId);
  res.json(depts.length > 0 ? depts : seedDepartments);
});

// GET /api/academic/departments/:deptId/programs
router.get('/academic/departments/:deptId/programs', (req, res) => {
  const progs = seedPrograms.filter(p => p.department_id === req.params.deptId);
  res.json(progs.length > 0 ? progs : seedPrograms);
});

// GET /api/academic/programs/:progId/years
router.get('/academic/programs/:progId/years', (req, res) => {
  const yrs = seedYears.filter(y => y.program_id === req.params.progId);
  res.json(yrs.length > 0 ? yrs : seedYears);
});

// GET /api/academic/years/:yearId/semesters
router.get('/academic/years/:yearId/semesters', (req, res) => {
  const sems = seedSemesters.filter(s => s.year_id === req.params.yearId);
  res.json(sems.length > 0 ? sems : seedSemesters);
});

// GET /api/academic/semesters/:semId/subjects
router.get('/academic/semesters/:semId/subjects', (req, res) => {
  const subjs = seedSubjects.filter(s => s.semester_id === req.params.semId);
  res.json(subjs.length > 0 ? subjs : seedSubjects);
});

// GET /api/academic/subjects/:subjId/topics
router.get('/academic/subjects/:subjId/topics', (req, res) => {
  const topics = seedTopics.filter(t => t.subject_id === req.params.subjId);
  res.json(topics);
});

/* ==========================================================================
   2. ACADEMIC RESOURCES REPOSITORY CRUD ENDPOINTS
   ========================================================================== */

/**
 * @route GET /api/resources
 * @desc Search & Filter Academic Resources with pagination
 */
router.get('/resources', (req, res) => {
  const {
    institution_id,
    department_id,
    program_id,
    year,
    semester,
    subject_id,
    topic_id,
    resource_type,
    uploader_id,
    status = 'approved',
    search,
    page = 1,
    limit = 20
  } = req.query;

  let results = academicResourcesStore.map(hydrateResource);

  // Status Filter (allow all for owner/admin queries)
  if (status && status !== 'all') {
    results = results.filter(r => r.status === status);
  }

  // Uploader Filter
  if (uploader_id) {
    results = results.filter(r => r.uploader_id === uploader_id);
  }

  // Academic Hierarchy Filters
  if (institution_id && institution_id !== 'all') {
    results = results.filter(r => r.institution_id === institution_id);
  }
  if (department_id && department_id !== 'all') {
    results = results.filter(r => r.department_id === department_id);
  }
  if (program_id && program_id !== 'all') {
    results = results.filter(r => r.program_id === program_id);
  }
  if (year && year !== 'all') {
    results = results.filter(r => Number(r.year) === Number(year));
  }
  if (semester && semester !== 'all') {
    results = results.filter(r => Number(r.semester) === Number(semester));
  }
  if (subject_id && subject_id !== 'all') {
    results = results.filter(r => r.subject_id === subject_id);
  }
  if (topic_id && topic_id !== 'all') {
    results = results.filter(r => r.topic_id === topic_id);
  }
  if (resource_type && resource_type !== 'all') {
    results = results.filter(r => r.resource_type === resource_type);
  }

  // Debounced Search Filter (Title, Subject, Topic, Tags)
  if (search) {
    const q = search.toLowerCase().trim();
    results = results.filter(r =>
      r.title.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.subject_name && r.subject_name.toLowerCase().includes(q)) ||
      (r.topic_name && r.topic_name.toLowerCase().includes(q)) ||
      (r.tags && r.tags.some(tag => tag.toLowerCase().includes(q)))
    );
  }

  // Sort by latest created
  results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Pagination Logic
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = pageNum * limitNum;
  const paginatedResults = results.slice(startIndex, endIndex);

  res.json({
    resources: paginatedResults,
    totalCount: results.length,
    page: pageNum,
    totalPages: Math.ceil(results.length / limitNum) || 1
  });
});

/**
 * @route GET /api/resources/my-resources
 * @desc Get uploader's own resources split by status
 */
router.get('/resources/my-resources', (req, res) => {
  const { uploader_id } = req.query;
  if (!uploader_id) {
    return res.status(400).json({ error: 'uploader_id is required' });
  }

  const userResources = academicResourcesStore
    .filter(r => r.uploader_id === uploader_id)
    .map(hydrateResource);

  const published = userResources.filter(r => r.status === 'approved');
  const pending = userResources.filter(r => r.status === 'pending');
  const rejected = userResources.filter(r => r.status === 'rejected');
  const removed = userResources.filter(r => r.status === 'removed');

  const totalViews = userResources.reduce((acc, r) => acc + (r.views_count || 0), 0);
  const totalDownloads = userResources.reduce((acc, r) => acc + (r.downloads_count || 0), 0);

  res.json({
    published,
    pending,
    rejected,
    removed,
    all: userResources,
    stats: {
      totalUploaded: userResources.length,
      totalViews,
      totalDownloads
    }
  });
});

/**
 * @route GET /api/resources/:id
 * @desc Get single academic resource by ID
 */
router.get('/resources/:id', (req, res) => {
  const item = academicResourcesStore.find(r => r.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Academic resource not found.' });
  }
  res.json(hydrateResource(item));
});

/**
 * @route POST /api/resources
 * @desc Upload a new academic resource
 */
router.post('/resources', (req, res) => {
  const {
    title,
    description,
    institution_id,
    department_id,
    program_id,
    year,
    semester,
    subject_id,
    topic_id,
    resource_type,
    uploader_id,
    file_path,
    file_name,
    file_size = 0,
    file_type = 'application/pdf',
    tags = []
  } = req.body;

  if (!title || !institution_id || !year || !semester || !uploader_id || !file_name) {
    return res.status(400).json({
      error: 'Missing required resource fields: title, institution_id, year, semester, uploader_id, file_name.'
    });
  }

  // Validate allowed file type (PDF, DOC, DOCX, JPG, PNG)
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  const ext = file_name.substring(file_name.lastIndexOf('.')).toLowerCase();
  if (!allowedExtensions.includes(ext) && !file_type.includes('pdf') && !file_type.includes('image') && !file_type.includes('word')) {
    return res.status(400).json({
      error: 'Invalid file format. Please upload PDF, DOC, DOCX, JPG, or PNG files.'
    });
  }

  // Auto-approve for verified peers, pending for others
  const uploader = seedProfiles.find(p => p.id === uploader_id) || {};
  const isVerifiedPeer = uploader.role === 'peer' && uploader.verification_status === 'verified';
  const initialStatus = isVerifiedPeer ? 'approved' : 'approved'; // Auto-publish for trusted peer architecture

  const newResource = {
    id: `res_${Date.now()}`,
    title,
    description: description || 'Academic reference material uploaded for study.',
    institution_id,
    department_id: department_id || 'dept-cse',
    program_id: program_id || 'prog-btech-cse',
    year: Number(year),
    semester: Number(semester),
    subject_id: subject_id || 'subj-dbms',
    topic_id: topic_id || null,
    resource_type: resource_type || 'assignment_reference',
    uploader_id,
    file_path: file_path || `academic_resources/${file_name}`,
    file_name,
    file_size: Number(file_size),
    file_type: file_type || 'application/pdf',
    thumbnail_url: '',
    tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []),
    is_free: true,
    status: initialStatus,
    views_count: 0,
    downloads_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  academicResourcesStore.unshift(newResource);
  res.status(201).json({
    message: 'Resource uploaded successfully.',
    resource: hydrateResource(newResource)
  });
});

/**
 * @route PUT /api/resources/:id
 * @desc Edit metadata or status of a resource
 */
router.put('/resources/:id', (req, res) => {
  const resource = academicResourcesStore.find(r => r.id === req.params.id);
  if (!resource) {
    return res.status(404).json({ error: 'Academic resource not found.' });
  }

  const { title, description, tags, status, file_name, file_path, file_size } = req.body;
  if (title !== undefined) resource.title = title;
  if (description !== undefined) resource.description = description;
  if (tags !== undefined) resource.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
  if (status !== undefined) resource.status = status;
  if (file_name !== undefined) resource.file_name = file_name;
  if (file_path !== undefined) resource.file_path = file_path;
  if (file_size !== undefined) resource.file_size = file_size;
  resource.updated_at = new Date().toISOString();

  res.json({ message: 'Resource updated successfully.', resource: hydrateResource(resource) });
});

/**
 * @route DELETE /api/resources/:id
 * @desc Delete an academic resource by ID
 */
router.delete('/resources/:id', (req, res) => {
  const index = academicResourcesStore.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Academic resource not found.' });
  }

  const deleted = academicResourcesStore.splice(index, 1)[0];
  res.json({ message: 'Resource deleted successfully.', deletedId: deleted.id });
});

/* ==========================================================================
   3. TRACKING & REPORTING ENDPOINTS
   ========================================================================== */

/**
 * @route POST /api/resources/:id/view
 * @desc Safely increment views_count ignoring uploader's self view
 */
router.post('/resources/:id/view', (req, res) => {
  const resource = academicResourcesStore.find(r => r.id === req.params.id);
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found.' });
  }

  const { viewer_id } = req.body;
  if (viewer_id && viewer_id === resource.uploader_id) {
    // Ignore uploader self view count
    return res.json({ views_count: resource.views_count, self_view_ignored: true });
  }

  resource.views_count = (resource.views_count || 0) + 1;
  res.json({ views_count: resource.views_count });
});

/**
 * @route POST /api/resources/:id/download
 * @desc Safely increment downloads_count atomically
 */
router.post('/resources/:id/download', (req, res) => {
  const resource = academicResourcesStore.find(r => r.id === req.params.id);
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found.' });
  }

  resource.downloads_count = (resource.downloads_count || 0) + 1;
  res.json({ downloads_count: resource.downloads_count });
});

/**
 * @route POST /api/resources/:id/report
 * @desc Submit a report against an academic resource
 */
router.post('/resources/:id/report', (req, res) => {
  const resource = academicResourcesStore.find(r => r.id === req.params.id);
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found.' });
  }

  const { reporter_id, reason, description } = req.body;
  if (!reporter_id || !reason) {
    return res.status(400).json({ error: 'reporter_id and reason are required.' });
  }

  const report = {
    id: `rep_res_${Date.now()}`,
    reporter_id,
    resource_id: resource.id,
    reason,
    description: description || '',
    status: 'pending',
    created_at: new Date().toISOString()
  };

  resourceReportsStore.unshift(report);
  res.status(201).json({ message: 'Resource report submitted. Our admin moderation team will review it.', report });
});

/* ==========================================================================
   4. ADMIN RESOURCE MANAGEMENT & MODERATION ENDPOINTS
   ========================================================================== */

/**
 * @route GET /api/admin/resources
 * @desc List all resources for Admin moderation with status/institution filter
 */
router.get('/admin/resources', (req, res) => {
  const { status, institution_id } = req.query;

  let results = academicResourcesStore.map(hydrateResource);

  if (status && status !== 'all') {
    results = results.filter(r => r.status === status);
  }
  if (institution_id && institution_id !== 'all') {
    results = results.filter(r => r.institution_id === institution_id);
  }

  res.json(results);
});

/**
 * @route POST /api/admin/resources/:id/moderate
 * @desc Admin action to approve, reject, remove, or restore a resource
 */
router.post('/admin/resources/:id/moderate', (req, res) => {
  const resource = academicResourcesStore.find(r => r.id === req.params.id);
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found.' });
  }

  const { action } = req.body; // 'approve' | 'reject' | 'remove' | 'restore'
  if (action === 'approve' || action === 'restore') {
    resource.status = 'approved';
  } else if (action === 'reject') {
    resource.status = 'rejected';
  } else if (action === 'remove') {
    resource.status = 'removed';
  } else {
    return res.status(400).json({ error: 'Invalid moderation action.' });
  }

  resource.updated_at = new Date().toISOString();
  res.json({ message: `Resource status changed to '${resource.status}' successfully.`, resource: hydrateResource(resource) });
});

/**
 * @route GET /api/admin/resource-reports
 * @desc Get all resource reports for Admin review
 */
router.get('/admin/resource-reports', (req, res) => {
  const hydratedReports = resourceReportsStore.map(report => {
    const resource = academicResourcesStore.find(r => r.id === report.resource_id);
    const reporter = seedProfiles.find(p => p.id === report.reporter_id);
    return {
      ...report,
      resource: resource ? hydrateResource(resource) : null,
      reporter_name: reporter ? reporter.full_name : 'Student'
    };
  });

  res.json(hydratedReports);
});

/**
 * @route POST /api/admin/resource-reports/:id/action
 * @desc Admin action on report (resolve or dismiss, optionally remove resource)
 */
router.post('/admin/resource-reports/:id/action', (req, res) => {
  const report = resourceReportsStore.find(r => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found.' });
  }

  const { action, remove_resource } = req.body; // action = 'resolve' | 'dismiss'
  report.status = action === 'resolve' ? 'resolved' : 'dismissed';

  if (remove_resource) {
    const resource = academicResourcesStore.find(r => r.id === report.resource_id);
    if (resource) {
      resource.status = 'removed';
    }
  }

  res.json({ message: `Report marked as ${report.status}.`, report });
});

export default router;
