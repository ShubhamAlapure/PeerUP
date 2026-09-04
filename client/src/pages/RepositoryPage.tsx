import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAcademicResources,
  getContentList,
  getInstitutions,
  getDepartments,
  getPrograms,
  getYears,
  getSemesters,
  getSubjects,
  getTopics,
  trackResourceDownload
} from '../services/api';
import type { AcademicResource, Institution, Department, Program, Year, Semester, Subject, Topic } from '../types';
import { AcademicIntegrityNotice } from '../components/AcademicIntegrityNotice';
import { ResourceCard } from '../components/ResourceCard';
import { PdfViewerModal } from '../components/PdfViewerModal';
import { ResourceDetailModal } from '../components/ResourceDetailModal';
import { UploadResourceModal } from '../components/UploadResourceModal';
import { ReportResourceModal } from '../components/ReportResourceModal';
import {
  FolderKanban,
  Search,
  Filter,
  PlusCircle,
  RotateCcw,
  BookOpen
} from 'lucide-react';

export const RepositoryPage: React.FC = () => {
  const { currentUser } = useAuth();

  // Search & Debounce State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Dynamic Hierarchy Selectors
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>('all');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');

  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgId, setSelectedProgId] = useState<string>('all');

  const [years, setYears] = useState<Year[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>('all');

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemId, setSelectedSemId] = useState<string>('all');

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjId, setSelectedSubjId] = useState<string>('all');

  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');

  const [resourceType, setResourceType] = useState<string>('all');

  // Resource List & Pagination
  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals State
  const [selectedPdf, setSelectedPdf] = useState<{ fileName: string; fileUrl: string; resourceId?: string } | null>(null);
  const [selectedDetailResource, setSelectedDetailResource] = useState<AcademicResource | null>(null);
  const [reportingResource, setReportingResource] = useState<AcademicResource | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load Institutions on Mount
  useEffect(() => {
    async function loadInsts() {
      try {
        const insts = await getInstitutions();
        setInstitutions(insts);
      } catch (err) {
        console.error('Error fetching institutions:', err);
      }
    }
    loadInsts();
  }, []);

  // Cascade Departments when Institution filter changes
  useEffect(() => {
    async function loadDepts() {
      if (selectedInstId === 'all') {
        setDepartments([]);
        setSelectedDeptId('all');
        return;
      }
      try {
        const depts = await getDepartments(selectedInstId);
        setDepartments(depts);
      } catch (err) {
        console.error(err);
      }
    }
    loadDepts();
  }, [selectedInstId]);

  // Cascade Programs when Department filter changes
  useEffect(() => {
    async function loadProgs() {
      if (selectedDeptId === 'all') {
        setPrograms([]);
        setSelectedProgId('all');
        return;
      }
      try {
        const progs = await getPrograms(selectedDeptId);
        setPrograms(progs);
      } catch (err) {
        console.error(err);
      }
    }
    loadProgs();
  }, [selectedDeptId]);

  // Cascade Years when Program filter changes
  useEffect(() => {
    async function loadYrs() {
      if (selectedProgId === 'all') {
        setYears([]);
        setSelectedYearId('all');
        return;
      }
      try {
        const yrs = await getYears(selectedProgId);
        setYears(yrs);
      } catch (err) {
        console.error(err);
      }
    }
    loadYrs();
  }, [selectedProgId]);

  // Cascade Semesters when Year filter changes
  useEffect(() => {
    async function loadSems() {
      if (selectedYearId === 'all') {
        setSemesters([]);
        setSelectedSemId('all');
        return;
      }
      try {
        const sems = await getSemesters(selectedYearId);
        setSemesters(sems);
      } catch (err) {
        console.error(err);
      }
    }
    loadSems();
  }, [selectedYearId]);

  // Cascade Subjects when Semester filter changes
  useEffect(() => {
    async function loadSubjs() {
      if (selectedSemId === 'all') {
        setSubjects([]);
        setSelectedSubjId('all');
        return;
      }
      try {
        const subjs = await getSubjects(selectedSemId);
        setSubjects(subjs);
      } catch (err) {
        console.error(err);
      }
    }
    loadSubjs();
  }, [selectedSemId]);

  // Cascade Topics when Subject filter changes
  useEffect(() => {
    async function loadTops() {
      if (selectedSubjId === 'all') {
        setTopics([]);
        setSelectedTopicId('all');
        return;
      }
      try {
        const tops = await getTopics(selectedSubjId);
        setTopics(tops);
      } catch (err) {
        console.error(err);
      }
    }
    loadTops();
  }, [selectedSubjId]);

  // Load Resources from API, Content Store & LocalStorage
  const loadResourcesData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch from Academic Resources API
      let resList: AcademicResource[] = [];
      try {
        const resData = await getAcademicResources({
          institution_id: selectedInstId,
          department_id: selectedDeptId,
          program_id: selectedProgId,
          subject_id: selectedSubjId,
          topic_id: selectedTopicId,
          resource_type: resourceType,
          search: debouncedSearch,
          page,
          limit: 20
        });
        if (resData && resData.resources) resList = resData.resources;
      } catch (e) {}

      // 2. Fetch from General Content API (explanations / assignments)
      let contentList: any[] = [];
      try {
        const cnts = await getContentList({});
        contentList = cnts.filter((c: any) => c.is_free || c.price === 0 || c.content_type === 'pdf_explanation');
      } catch (e) {}

      // 3. Fetch from localStorage
      let localUploaded: any[] = [];
      try {
        const raw = localStorage.getItem('peerup_user_uploaded_resources');
        if (raw) localUploaded = JSON.parse(raw);
      } catch (e) {}

      // Combine all uniquely and normalize properties
      const existingIds = new Set<string>();
      const combined: AcademicResource[] = [];

      [...localUploaded, ...resList, ...contentList].forEach(rawItem => {
        if (!rawItem || !rawItem.id) return;
        if (existingIds.has(rawItem.id)) return;

        // Extract file URL & File Name
        const fileUrl =
          rawItem.file_path ||
          rawItem.file_url ||
          rawItem.url ||
          (rawItem.files && rawItem.files[0]?.file_url) ||
          (rawItem.files && rawItem.files[0]?.url) ||
          'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

        const fileName =
          rawItem.file_name ||
          (rawItem.files && rawItem.files[0]?.file_name) ||
          `${rawItem.title || 'Academic_Resource'}.pdf`;

        const normalized: AcademicResource = {
          id: rawItem.id,
          title: rawItem.title || 'Untitled Academic Resource',
          description: rawItem.description || 'Academic reference material.',
          institution_id: rawItem.institution_id || 'inst-mit-adt',
          department_id: rawItem.department_id || 'dept-cse',
          program_id: rawItem.program_id || 'prog-btech-cse',
          year: rawItem.year || 3,
          semester: rawItem.semester || 5,
          subject_id: rawItem.subject_id || 'subj-dbms',
          topic_id: rawItem.topic_id || 'top-norm',
          resource_type: rawItem.resource_type || (rawItem.content_type === 'pdf_explanation' ? 'assignment_reference' : 'notes'),
          uploader_id: rawItem.uploader_id || rawItem.owner_id || 'usr-shubham',
          file_path: fileUrl,
          file_name: fileName,
          file_size: rawItem.file_size || (rawItem.files && rawItem.files[0]?.file_size) || 500000,
          file_type: rawItem.file_type || (rawItem.files && rawItem.files[0]?.file_type) || 'application/pdf',
          thumbnail_url: rawItem.thumbnail_url || '',
          tags: rawItem.tags || ['Reference'],
          is_free: true,
          status: rawItem.status || rawItem.moderation_status || 'approved',
          views_count: rawItem.views_count ?? rawItem.view_count ?? 0,
          downloads_count: rawItem.downloads_count ?? rawItem.purchases_count ?? rawItem.purchase_count ?? 0,
          created_at: rawItem.created_at || new Date().toISOString(),
          uploader_name: rawItem.uploader_name || rawItem.owner_name || 'Verified Peer Educator',
          uploader_avatar: rawItem.uploader_avatar || rawItem.owner_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          uploader_role: rawItem.uploader_role || rawItem.owner_role || 'peer',
          is_peer_verified: true,
          institution_name: rawItem.institution_name || 'MIT ADT University (Pune)',
          subject_name: rawItem.subject_name || 'Machine Learning (ML)',
          academic_integrity_notice: "This material is provided for reference and learning purposes. Do not submit another student's work as your own."
        };

        // Filter checks
        if (selectedInstId !== 'all' && normalized.institution_id !== selectedInstId) return;
        if (resourceType !== 'all' && normalized.resource_type !== resourceType) return;
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          const match = normalized.title.toLowerCase().includes(q) ||
            normalized.description.toLowerCase().includes(q) ||
            (normalized.subject_name && normalized.subject_name.toLowerCase().includes(q));
          if (!match) return;
        }

        existingIds.add(normalized.id);
        combined.push(normalized);
      });

      setResources(combined);
      setTotalCount(combined.length);
      setTotalPages(Math.ceil(combined.length / 12) || 1);
    } catch (err) {
      console.error('Error fetching academic resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResourcesData();
  }, [
    selectedInstId,
    selectedDeptId,
    selectedProgId,
    selectedYearId,
    selectedSemId,
    selectedSubjId,
    selectedTopicId,
    resourceType,
    debouncedSearch,
    page
  ]);

  const handleResetFilters = () => {
    setSelectedInstId('all');
    setSelectedDeptId('all');
    setSelectedProgId('all');
    setSelectedYearId('all');
    setSelectedSemId('all');
    setSelectedSubjId('all');
    setSelectedTopicId('all');
    setResourceType('all');
    setSearchQuery('');
    setPage(1);
  };

  const handleDownload = async (resource: AcademicResource) => {
    try {
      await trackResourceDownload(resource.id).catch(() => {});

      const downloadUrl =
        resource.file_path ||
        (resource as any).file_url ||
        ((resource as any).files && (resource as any).files[0]?.file_url) ||
        ((resource as any).files && (resource as any).files[0]?.url) ||
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

      const fileName =
        resource.file_name ||
        ((resource as any).files && (resource as any).files[0]?.file_name) ||
        `${resource.title || 'Academic_Resource'}.pdf`;

      // Trigger browser download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      if (!downloadUrl.startsWith('data:')) {
        link.target = '_blank';
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Increment local count UI
      setResources(prev =>
        prev.map(r => (r.id === resource.id ? { ...r, downloads_count: (r.downloads_count || 0) + 1 } : r))
      );
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  return (
    <div className="page-container py-10 space-y-8">
      {/* Page Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-purple-200">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-100 border border-purple-300 text-[#6d28d9] text-xs font-extrabold shadow-2xs">
              <FolderKanban className="w-4 h-4 text-[#6d28d9]" />
              <span>Academic Resources Repository</span>
            </span>

            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-300">
              ₹0 FREE ACCESS FOR EVERYONE
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#2e1065] tracking-tight">
            Academic Resources
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed font-medium">
            Search and download previous year assignment references, worked solutions, lecture notes, study guides, previous question papers, and lab practical references uploaded by verified senior peers.
          </p>
        </div>

        {/* Upload Resource CTA Button */}
        <div className="shrink-0">
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-violet-primary py-3 px-6 text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg bg-[#6d28d9]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Upload Resource</span>
          </button>
        </div>
      </div>

      {/* Mandatory Academic Integrity Notice */}
      <AcademicIntegrityNotice />

      {/* Cascading Dynamic Academic Filter Bar */}
      <div className="violet-panel p-6 bg-white border-2 border-purple-200 space-y-5 shadow-lg">
        <div className="flex items-center justify-between border-b border-purple-200 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#6d28d9]" />
            <h3 className="font-extrabold text-[#2e1065] text-xs uppercase tracking-wider">
              Filter by University & Academic Hierarchy
            </h3>
          </div>

          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-[#6d28d9] hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* Row 1: Institution, Department, Program, Resource Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Institution Filter */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#2e1065] mb-1">University / College</label>
            <select
              value={selectedInstId}
              onChange={(e) => { setSelectedInstId(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
            >
              <option value="all">All Institutions</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name} ({inst.city})</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#2e1065] mb-1">Department</label>
            <select
              value={selectedDeptId}
              onChange={(e) => { setSelectedDeptId(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
              ))}
            </select>
          </div>

          {/* Program Filter */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#2e1065] mb-1">Program / Course</label>
            <select
              value={selectedProgId}
              onChange={(e) => { setSelectedProgId(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
            >
              <option value="all">All Programs</option>
              {programs.map(prog => (
                <option key={prog.id} value={prog.id}>{prog.name}</option>
              ))}
            </select>
          </div>

          {/* Resource Type Filter */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#2e1065] mb-1">Resource Category</label>
            <select
              value={resourceType}
              onChange={(e) => { setResourceType(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
            >
              <option value="all">All Resource Types</option>
              <option value="assignment_reference">Previous Assignment Reference</option>
              <option value="assignment_solution">Assignment Solution</option>
              <option value="notes">Lecture Notes</option>
              <option value="study_material">Study Material</option>
              <option value="previous_question_paper">Previous Question Paper</option>
              <option value="lab_practical_reference">Lab & Practical Reference</option>
            </select>
          </div>
        </div>

        {/* Row 2: Year, Semester, Subject, Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Year Filter */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#2e1065] mb-1">Academic Year</label>
            <select
              value={selectedYearId}
              onChange={(e) => { setSelectedYearId(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
            >
              <option value="all">All Academic Years</option>
              {years.map(yr => (
                <option key={yr.id} value={yr.id}>{yr.label}</option>
              ))}
              <option value="1">Year 1 (FE)</option>
              <option value="2">Year 2 (SE)</option>
              <option value="3">Year 3 (TE)</option>
              <option value="4">Year 4 (BE)</option>
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#2e1065] mb-1">Semester</label>
            <select
              value={selectedSemId}
              onChange={(e) => { setSelectedSemId(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
            >
              <option value="all">All Semesters (Sem 1 - 8)</option>
              {semesters.map(sem => (
                <option key={sem.id} value={sem.id}>{sem.label}</option>
              ))}
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={String(s)}>Semester {s}</option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#2e1065] mb-1">Subject</label>
            <select
              value={selectedSubjId}
              onChange={(e) => { setSelectedSubjId(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subj => (
                <option key={subj.id} value={subj.id}>{subj.name} ({subj.code})</option>
              ))}
            </select>
          </div>

          {/* Topic Filter */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#2e1065] mb-1">Topic</label>
            <select
              value={selectedTopicId}
              onChange={(e) => { setSelectedTopicId(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
            >
              <option value="all">All Topics</option>
              {topics.map(top => (
                <option key={top.id} value={top.id}>{top.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Debounced Search Bar */}
        <div className="bg-[#f8f6ff] p-3 rounded-xl border border-purple-200 flex items-center gap-3">
          <Search className="w-4 h-4 text-purple-400 ml-1" />
          <input
            type="text"
            placeholder="Debounced Search by title, subject name, topic, or tags (e.g. DBMS, Normalization, COEP, TCP/IP)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-xs focus:outline-none font-medium"
          />
        </div>
      </div>

      {/* Resource Cards Display & Results Count */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
          <span>Showing {resources.length} of {totalCount} Academic Resources</span>
          <span>Reference & Learning Material • 100% Free</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 font-bold space-y-2">
            <div className="w-8 h-8 border-4 border-[#6d28d9] border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Loading academic resources...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="violet-panel text-center py-16 space-y-4 bg-white border-2 border-purple-200">
            <BookOpen className="w-12 h-12 text-purple-400 mx-auto" />
            <h3 className="text-xl font-extrabold text-[#2e1065]">No matching resources found</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto font-medium">
              Try resetting your academic hierarchy filters or click <strong>+ Upload Resource</strong> to publish the first reference material for this topic!
            </p>
            <button
              onClick={handleResetFilters}
              className="btn-violet-secondary text-xs py-2 px-4 font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map(res => (
              <ResourceCard
                key={res.id}
                resource={res}
                onViewDetails={(item) => setSelectedDetailResource(item)}
                onPreviewPdf={(item) => setSelectedPdf({
                  fileName: item.file_name || `${item.title}.pdf`,
                  fileUrl: item.file_path || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                  resourceId: item.id
                })}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}

        {/* Pagination / Load More */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              disabled={page <= 1}
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              className="btn-violet-secondary py-2 px-4 text-xs font-bold disabled:opacity-40"
            >
              Previous Page
            </button>

            <span className="text-xs font-black text-[#2e1065] px-3">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              className="btn-violet-primary py-2 px-4 text-xs font-bold disabled:opacity-40"
            >
              Next Page
            </button>
          </div>
        )}
      </div>

      {/* PDF Previewer Modal */}
      {selectedPdf && (
        <PdfViewerModal
          fileName={selectedPdf.fileName}
          fileUrl={selectedPdf.fileUrl}
          onClose={() => setSelectedPdf(null)}
          onDownload={() => {
            if (selectedPdf.resourceId) {
              const item = resources.find(r => r.id === selectedPdf.resourceId);
              if (item) handleDownload(item);
            }
          }}
        />
      )}

      {/* Resource Detail Modal */}
      {selectedDetailResource && (
        <ResourceDetailModal
          resource={selectedDetailResource}
          currentUserId={currentUser.id}
          onClose={() => setSelectedDetailResource(null)}
          onPreviewPdf={(item) => {
            setSelectedDetailResource(null);
            setSelectedPdf({
              fileName: item.file_name,
              fileUrl: item.file_path,
              resourceId: item.id
            });
          }}
          onDownload={handleDownload}
          onReport={(item) => {
            setSelectedDetailResource(null);
            setReportingResource(item);
          }}
        />
      )}

      {/* Upload Resource Modal Flow */}
      {showUploadModal && (
        <UploadResourceModal
          uploaderId={currentUser.id}
          uploaderRole={currentUser.role}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            loadResourcesData();
          }}
        />
      )}

      {/* Report Resource Modal */}
      {reportingResource && (
        <ReportResourceModal
          resourceId={reportingResource.id}
          resourceTitle={reportingResource.title}
          reporterId={currentUser.id}
          onClose={() => setReportingResource(null)}
        />
      )}
    </div>
  );
};
