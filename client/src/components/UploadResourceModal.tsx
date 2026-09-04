import React, { useState, useEffect } from 'react';
import {
  getInstitutions,
  getDepartments,
  getPrograms,
  getYears,
  getSemesters,
  getSubjects,
  getTopics,
  uploadAcademicResource
} from '../services/api';
import type { Institution, Department, Program, Year, Semester, Subject, Topic } from '../types';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Building,
  Tag,
  Trash2,
  File,
  Layers,
  BookOpen
} from 'lucide-react';

interface UploadResourceModalProps {
  uploaderId: string;
  uploaderRole: string;
  onClose: () => void;
  onSuccess: () => void;
}

// Preset Fallback Hierarchies for MIT ADT & Indian Universities
const PRESET_PROGRAMS: Program[] = [
  { id: 'prog-btech-cse', department_id: 'dept-cse', name: 'B.Tech Computer Science & Engineering (CSE)', code: 'CSE', duration_years: 4 },
  { id: 'prog-btech-aids', department_id: 'dept-cse', name: 'B.Tech Artificial Intelligence & Data Science (AI & DS)', code: 'AI & DS', duration_years: 4 },
  { id: 'prog-btech-cyber', department_id: 'dept-cse', name: 'B.Tech Cyber Security & Digital Forensics', code: 'Cyber', duration_years: 4 },
  { id: 'prog-btech-it', department_id: 'dept-cse', name: 'B.Tech Information Technology (IT)', code: 'IT', duration_years: 4 },
  { id: 'prog-btech-entc', department_id: 'dept-ece', name: 'B.Tech Electronics & Telecommunication (E&TC)', code: 'E&TC', duration_years: 4 },
  { id: 'prog-btech-robotics', department_id: 'dept-ece', name: 'B.Tech Robotics & Automation', code: 'Robotics', duration_years: 4 },
  { id: 'prog-btech-mech', department_id: 'dept-cse', name: 'B.Tech Mechanical Engineering', code: 'Mech', duration_years: 4 },
  { id: 'prog-btech-civil', department_id: 'dept-cse', name: 'B.Tech Civil & Environmental Engineering', code: 'Civil', duration_years: 4 },
  { id: 'prog-btech-aero', department_id: 'dept-cse', name: 'B.Tech Aerospace Engineering', code: 'Aero', duration_years: 4 },
  { id: 'prog-bdes', department_id: 'dept-cse', name: 'B.Des Design & User Experience', code: 'B.Des', duration_years: 4 },
  { id: 'prog-bba-mba', department_id: 'dept-cse', name: 'BBA / MBA Business Administration', code: 'BBA', duration_years: 3 },
  { id: 'prog-biotech', department_id: 'dept-cse', name: 'B.Tech Bioengineering & Biotechnology', code: 'BioTech', duration_years: 4 }
];

const PRESET_YEARS: Year[] = [
  { id: 'yr-1', program_id: 'prog-btech-cse', year_number: 1, label: 'First Year (FY / FE)' },
  { id: 'yr-2', program_id: 'prog-btech-cse', year_number: 2, label: 'Second Year (SY / SE)' },
  { id: 'yr-3', program_id: 'prog-btech-cse', year_number: 3, label: 'Third Year (TY / TE)' },
  { id: 'yr-4', program_id: 'prog-btech-cse', year_number: 4, label: 'Fourth Year (LY / BE)' }
];

const PRESET_SEMESTERS: Semester[] = [
  { id: 'sem-1', year_id: 'yr-1', semester_number: 1, label: 'Semester 1 (FY / FE)' },
  { id: 'sem-2', year_id: 'yr-1', semester_number: 2, label: 'Semester 2 (FY / FE)' },
  { id: 'sem-3', year_id: 'yr-2', semester_number: 3, label: 'Semester 3 (SY / SE)' },
  { id: 'sem-4', year_id: 'yr-2', semester_number: 4, label: 'Semester 4 (SY / SE)' },
  { id: 'sem-5', year_id: 'yr-3', semester_number: 5, label: 'Semester 5 (TY / TE)' },
  { id: 'sem-6', year_id: 'yr-3', semester_number: 6, label: 'Semester 6 (TY / TE)' },
  { id: 'sem-7', year_id: 'yr-4', semester_number: 7, label: 'Semester 7 (LY / BE)' },
  { id: 'sem-8', year_id: 'yr-4', semester_number: 8, label: 'Semester 8 (LY / BE)' }
];

const PRESET_SUBJECTS: Subject[] = [
  { id: 'subj-ml', semester_id: 'sem-5', name: 'Machine Learning (CS501 / ML)', code: 'CS501' },
  { id: 'subj-dbms', semester_id: 'sem-3', name: 'Database Management Systems (CS301 / DBMS)', code: 'CS301' },
  { id: 'subj-dsa', semester_id: 'sem-3', name: 'Data Structures & Algorithms (CS201 / DSA)', code: 'CS201' },
  { id: 'subj-cn', semester_id: 'sem-5', name: 'Computer Networks & Security (CS401 / CN)', code: 'CS401' },
  { id: 'subj-os', semester_id: 'sem-4', name: 'Operating Systems (CS302 / OS)', code: 'CS302' },
  { id: 'subj-cyber', semester_id: 'sem-5', name: 'Cyber Security & Cryptography (CS502)', code: 'CS502' },
  { id: 'subj-ai', semester_id: 'sem-5', name: 'Artificial Intelligence & Deep Learning (AI501)', code: 'AI501' },
  { id: 'subj-cloud', semester_id: 'sem-6', name: 'Cloud Computing & DevOps (CS601)', code: 'CS601' },
  { id: 'subj-web', semester_id: 'sem-3', name: 'Web Technology & Full Stack MERN (CS303)', code: 'CS303' },
  { id: 'subj-oops', semester_id: 'sem-3', name: 'Object Oriented Programming Java / C++ (CS202)', code: 'CS202' },
  { id: 'subj-se', semester_id: 'sem-4', name: 'Software Engineering & Agile (CS402)', code: 'CS402' },
  { id: 'subj-math', semester_id: 'sem-1', name: 'Discrete Mathematics & Logic (MA201)', code: 'MA201' },
  { id: 'subj-daa', semester_id: 'sem-4', name: 'Design & Analysis of Algorithms (CS304)', code: 'CS304' },
  { id: 'subj-toc', semester_id: 'sem-4', name: 'Theory of Computation (CS403 / TOC)', code: 'CS403' }
];

export const UploadResourceModal: React.FC<UploadResourceModalProps> = ({
  uploaderId,
  uploaderRole: _uploaderRole,
  onClose,
  onSuccess
}) => {
  // 1. Resource Type Selection
  const [resourceType, setResourceType] = useState<string>('assignment_reference');

  // Dynamic Academic Hierarchy States
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>('inst-mit-adt');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('dept-cse');

  const [programs, setPrograms] = useState<Program[]>(PRESET_PROGRAMS);
  const [selectedProgId, setSelectedProgId] = useState<string>('prog-btech-cse');

  const [years, setYears] = useState<Year[]>(PRESET_YEARS);
  const [selectedYearId, setSelectedYearId] = useState<string>('yr-2');
  const [selectedYearNum, setSelectedYearNum] = useState<number>(2);

  // NO AUTO-SELECT FOR SEMESTER (User must pick explicitly from Sems 1 to 8)
  const [semesters, setSemesters] = useState<Semester[]>(PRESET_SEMESTERS);
  const [selectedSemId, setSelectedSemId] = useState<string>('');
  const [selectedSemNum, setSelectedSemNum] = useState<number>(0);

  const [subjects, setSubjects] = useState<Subject[]>(PRESET_SUBJECTS);
  const [selectedSubjId, setSelectedSubjId] = useState<string>('subj-dbms');

  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [customTopicName, setCustomTopicName] = useState<string>('');

  // Metadata Inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsText, setTagsText] = useState('MIT ADT, Reference, Worked Solution');

  // File Upload State & Progress
  const [attachedFile, setAttachedFile] = useState<{
    fileObj: File;
    name: string;
    sizeMb: string;
    dataUrl: string;
    type: string;
  } | null>(null);

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load Institutions on Mount
  useEffect(() => {
    async function loadInsts() {
      try {
        const insts = await getInstitutions();
        setInstitutions(insts);
        if (insts.length > 0) setSelectedInstId(insts[0].id);
      } catch (err) {
        console.error('Error loading institutions:', err);
      }
    }
    loadInsts();
  }, []);

  // Cascade 1: Load Departments when Institution changes
  useEffect(() => {
    async function loadDepts() {
      if (!selectedInstId) return;
      try {
        const depts = await getDepartments(selectedInstId);
        setDepartments(depts);
        if (depts.length > 0) setSelectedDeptId(depts[0].id);
      } catch (err) {
        console.error('Error loading departments:', err);
      }
    }
    loadDepts();
  }, [selectedInstId]);

  // Cascade 2: Load Programs when Department changes
  useEffect(() => {
    async function loadProgs() {
      if (!selectedDeptId) return;
      try {
        const progs = await getPrograms(selectedDeptId);
        if (progs && progs.length > 0) setPrograms(progs);
        else setPrograms(PRESET_PROGRAMS);
      } catch (err) {
        setPrograms(PRESET_PROGRAMS);
      }
    }
    loadProgs();
  }, [selectedDeptId]);

  // Cascade 3: Load Years when Program changes
  useEffect(() => {
    async function loadYrs() {
      if (!selectedProgId) return;
      try {
        const yrs = await getYears(selectedProgId);
        if (yrs && yrs.length > 0) setYears(yrs);
        else setYears(PRESET_YEARS);
      } catch (err) {
        setYears(PRESET_YEARS);
      }
    }
    loadYrs();
  }, [selectedProgId]);

  // Cascade 4: Load Semesters when Year changes (DO NOT AUTO SELECT SEMESTER)
  useEffect(() => {
    async function loadSems() {
      if (!selectedYearId) return;
      try {
        const sems = await getSemesters(selectedYearId);
        if (sems && sems.length > 0) setSemesters(sems);
        else setSemesters(PRESET_SEMESTERS);
      } catch (err) {
        setSemesters(PRESET_SEMESTERS);
      }
    }
    loadSems();
  }, [selectedYearId]);

  // Cascade 5: Load Subjects when Semester changes
  useEffect(() => {
    async function loadSubjs() {
      if (!selectedSemId) return;
      try {
        const subjs = await getSubjects(selectedSemId);
        if (subjs && subjs.length > 0) setSubjects(subjs);
        else setSubjects(PRESET_SUBJECTS);
      } catch (err) {
        setSubjects(PRESET_SUBJECTS);
      }
    }
    loadSubjs();
  }, [selectedSemId]);

  // Cascade 6: Load Topics when Subject changes
  useEffect(() => {
    async function loadTops() {
      if (!selectedSubjId) return;
      try {
        const tops = await getTopics(selectedSubjId);
        setTopics(tops);
      } catch (err) {
        console.error('Error loading topics:', err);
      }
    }
    loadTops();
  }, [selectedSubjId]);

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = [
      '.ipynb', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv',
      '.ppt', '.pptx', '.txt', '.png', '.jpg', '.jpeg', '.webp',
      '.gif', '.mp4', '.zip', '.rar', '.html', '.htm', '.js', '.py'
    ];
    const fileNameLower = file.name.toLowerCase();
    const isAllowedExt = allowedExtensions.some(ext => fileNameLower.endsWith(ext));
    if (!isAllowedExt) {
      setError('Invalid file format. Supported files: PDF, IPYNB, DOCX, XLSX, HTML, PPTX, TXT, ZIP, Images, and Code files.');
      return;
    }

    const MAX_SIZE_BYTES = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setError(`File size (${sizeMb} MB) exceeds maximum allowed limit of 25 MB. Please select a smaller file.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const reader = new FileReader();

    reader.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const percent = Math.round((evt.loaded / evt.total) * 90);
        setUploadProgress(percent);
      }
    };

    reader.onload = () => {
      setUploadProgress(100);
      setAttachedFile({
        fileObj: file,
        name: file.name,
        sizeMb,
        dataUrl: reader.result as string,
        type: file.type || 'application/pdf'
      });
      setIsUploading(false);
    };

    reader.onerror = () => {
      setError('Failed to read selected file.');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSemId) {
      setError('Please select a Semester (Semester 1 to 8).');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a title for the academic resource.');
      return;
    }
    if (selectedTopicId === 'custom' && !customTopicName.trim()) {
      setError('Please type your custom topic name.');
      return;
    }
    if (!attachedFile) {
      setError('Please attach a file (.ipynb, .pdf, .docx, .html, .xlsx, .zip, etc.) to upload.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const parsedTags = tagsText
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const finalTopicName = selectedTopicId === 'custom' ? customTopicName.trim() : '';

      const payload = {
        title: title.trim(),
        description: description.trim() || 'Academic reference material uploaded for learning purposes.',
        institution_id: selectedInstId,
        department_id: selectedDeptId,
        program_id: selectedProgId,
        year: selectedYearNum,
        semester: selectedSemNum || 3,
        subject_id: selectedSubjId,
        topic_id: selectedTopicId === 'custom' ? null : (selectedTopicId || null),
        custom_topic_name: finalTopicName,
        resource_type: resourceType,
        uploader_id: uploaderId,
        file_path: attachedFile.dataUrl || `academic_resources/${attachedFile.name}`,
        file_name: attachedFile.name,
        file_size: attachedFile.fileObj.size,
        file_type: attachedFile.type,
        tags: parsedTags
      };

      const res = await uploadAcademicResource(payload);

      // Save locally to localStorage for immediate UI fallback
      try {
        const localUploaded = JSON.parse(localStorage.getItem('peerup_user_uploaded_resources') || '[]');
        localUploaded.unshift(res.resource || payload);
        localStorage.setItem('peerup_user_uploaded_resources', JSON.stringify(localUploaded));
      } catch (e) {}

      setSuccessMsg("Resource uploaded successfully.");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to upload resource.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-200 relative my-8">
        {/* Modal Header */}
        <div className="bg-[#2e1065] text-white p-6 sm:p-8 space-y-2 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-purple-300 hover:text-white p-2 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-800/80 border border-purple-600 text-purple-200 text-xs font-bold">
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span>Academic Resource Studio</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">+ Upload Academic Resource</h2>
          <p className="text-xs text-purple-200 font-medium">
            Upload assignment references, worked solutions, lecture notes, question papers, or lab practicals for students at ₹0.
          </p>
        </div>

        {/* Success Alert Banner */}
        {successMsg ? (
          <div className="p-12 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto" />
            <h3 className="text-2xl font-black text-[#2e1065]">{successMsg}</h3>
            <p className="text-xs text-slate-600 font-medium">Your reference material is live and available in the Academic Repository.</p>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Step 1: Select Resource Type */}
            <div className="space-y-3">
              <label className="block font-extrabold text-[#2e1065] text-xs uppercase tracking-wider">
                Step 1: Select Resource Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'assignment_reference', label: 'Previous Assignment', icon: FileText },
                  { id: 'assignment_solution', label: 'Assignment Solution', icon: CheckCircle },
                  { id: 'notes', label: 'Lecture Notes', icon: BookOpen },
                  { id: 'study_material', label: 'Study Material', icon: Layers },
                  { id: 'previous_question_paper', label: 'Question Paper', icon: File },
                  { id: 'lab_practical_reference', label: 'Lab & Practical Ref', icon: UploadCloud }
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = resourceType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setResourceType(item.id)}
                      className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all text-left ${
                        isSelected
                          ? 'bg-[#6d28d9] border-[#6d28d9] text-white shadow-sm'
                          : 'bg-[#f8f6ff] border-purple-200 text-slate-800 hover:bg-purple-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-300' : 'text-[#6d28d9]'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Dynamic Academic Hierarchy Selectors */}
            <div className="space-y-4 pt-4 border-t border-purple-200">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#6d28d9]" />
                <label className="font-extrabold text-[#2e1065] text-xs uppercase tracking-wider">
                  Step 2: Dynamic Academic Hierarchy (Institution → Dept → Prog → Year → Sem → Subject)
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Institution Selector */}
                <div>
                  <label className="block text-[11px] font-extrabold text-[#2e1065] mb-1">Target Institution</label>
                  <select
                    value={selectedInstId}
                    onChange={(e) => setSelectedInstId(e.target.value)}
                    className="w-full p-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
                  >
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name} ({inst.city})</option>
                    ))}
                    <option value="inst-mit-adt">MIT ADT University (Pune)</option>
                    <option value="inst-symbiosis">Symbiosis International (Pune)</option>
                    <option value="inst-mit-wpu">MIT World Peace University (Pune)</option>
                    <option value="inst-coep">COEP Technological University (Pune)</option>
                    <option value="inst-cummins">Cummins College of Engineering (Pune)</option>
                    <option value="inst-dypu">D Y Patil International University (Pune)</option>
                  </select>
                </div>

                {/* Department Selector */}
                <div>
                  <label className="block text-[11px] font-extrabold text-[#2e1065] mb-1">Department</label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full p-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
                  >
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                    ))}
                    <option value="dept-cse">Computer Science & Engineering (CSE)</option>
                    <option value="dept-[#6d28d9]">Information Technology (IT)</option>
                    <option value="dept-ece">Electronics & Telecommunication (E&TC)</option>
                    <option value="dept-mech">Mechanical Engineering</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Program / Popular Branches Selector */}
                <div>
                  <label className="block text-[11px] font-extrabold text-[#2e1065] mb-1">Program / Branch</label>
                  <select
                    value={selectedProgId}
                    onChange={(e) => setSelectedProgId(e.target.value)}
                    className="w-full p-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
                  >
                    {programs.map(prog => (
                      <option key={prog.id} value={prog.id}>{prog.name}</option>
                    ))}
                  </select>
                </div>

                {/* Year Selector: FY, SY, TY, LY / BE */}
                <div>
                  <label className="block text-[11px] font-extrabold text-[#2e1065] mb-1">Academic Year</label>
                  <select
                    value={selectedYearId}
                    onChange={(e) => {
                      setSelectedYearId(e.target.value);
                      const yrObj = years.find(y => y.id === e.target.value);
                      if (yrObj) setSelectedYearNum(yrObj.year_number);
                    }}
                    className="w-full p-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
                  >
                    {years.map(yr => (
                      <option key={yr.id} value={yr.id}>{yr.label}</option>
                    ))}
                  </select>
                </div>

                {/* Semester Selector: DONT AUTO SELECT SEMESTER! */}
                <div>
                  <label className="block text-[11px] font-extrabold text-[#6d28d9] mb-1">Semester (Sem 1 to 8) *</label>
                  <select
                    value={selectedSemId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedSemId(val);
                      const semObj = semesters.find(s => s.id === val);
                      if (semObj) {
                        setSelectedSemNum(semObj.semester_number);
                      } else {
                        const numMatch = val.match(/\d+/);
                        setSelectedSemNum(numMatch ? parseInt(numMatch[0]) : 0);
                      }
                    }}
                    className={`w-full p-2.5 border rounded-xl text-slate-900 text-xs font-bold focus:outline-none ${
                      !selectedSemId ? 'bg-amber-50 border-amber-400 text-amber-900 font-extrabold' : 'bg-[#f8f6ff] border-purple-200'
                    }`}
                  >
                    <option value="">Select Semester (1-8)...</option>
                    {semesters.map(sem => (
                      <option key={sem.id} value={sem.id}>{sem.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Popular MIT ADT & University Subjects */}
                <div>
                  <label className="block text-[11px] font-extrabold text-[#2e1065] mb-1">Subject</label>
                  <select
                    value={selectedSubjId}
                    onChange={(e) => setSelectedSubjId(e.target.value)}
                    className="w-full p-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
                  >
                    {subjects.map(subj => (
                      <option key={subj.id} value={subj.id}>{subj.name}</option>
                    ))}
                  </select>
                </div>

                {/* Topic Selector with "Add Your Own Topic" Option */}
                <div>
                  <label className="block text-[11px] font-extrabold text-[#2e1065] mb-1">Topic</label>
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="w-full p-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
                  >
                    <option value="">General Topic / Full Subject</option>
                    {topics.map(top => (
                      <option key={top.id} value={top.id}>{top.name}</option>
                    ))}
                    <option value="custom">➕ Add Your Own Custom Topic...</option>
                  </select>

                  {/* Custom Topic Name Input Box */}
                  {selectedTopicId === 'custom' && (
                    <div className="pt-2 animate-in fade-in duration-150">
                      <label className="block text-[10px] font-extrabold text-[#6d28d9] mb-1">
                        Type Custom Topic Name *
                      </label>
                      <input
                        type="text"
                        value={customTopicName}
                        onChange={(e) => setCustomTopicName(e.target.value)}
                        placeholder="e.g. Logistic Regression Lab Exp 4, B-Trees & Indexing..."
                        className="w-full p-2 bg-purple-50 border-2 border-[#6d28d9] rounded-xl text-slate-900 text-xs font-bold focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 9 - 10: Metadata Inputs */}
            <div className="space-y-4 pt-4 border-t border-purple-200">
              <div>
                <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Resource Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. DBMS Lab Assignment 3 — Normalization & 3NF Schema Reference"
                  className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Description & Study Overview</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a summary of what students will learn from this reference document..."
                  className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-[#6d28d9]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Tags (Comma-Separated)</label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                    placeholder="MIT ADT, Reference, Worked Solution"
                    className="w-full pl-9 p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-[#6d28d9]"
                  />
                </div>
              </div>
            </div>

            {/* Step 11 - 15: File Attachment & Validation Section */}
            <div className="space-y-3 pt-4 border-t border-purple-200">
              <label className="block font-extrabold text-[#2e1065] text-xs uppercase tracking-wider flex items-center justify-between">
                <span>Step 3: Upload File (.ipynb, .pdf, .docx, .html, .xlsx, .zip, etc.)</span>
                <span className="text-[11px] text-[#6d28d9] font-bold">* Max 25 MB file limit</span>
              </label>

              {attachedFile ? (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <File className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-emerald-950">{attachedFile.name}</p>
                      <p className="text-[10px] text-emerald-700 font-bold">{attachedFile.sizeMb} • Ready for Upload</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-purple-300 rounded-2xl p-6 bg-[#f8f6ff] hover:bg-purple-100/50 transition-colors text-center cursor-pointer">
                  <input
                    type="file"
                    accept=".ipynb,.pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp,.gif,.mp4,.zip,.rar,.html,.htm,.js,.py"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <UploadCloud className="w-8 h-8 text-[#6d28d9]" />
                    <span className="text-xs font-black text-[#2e1065]">
                      {isUploading ? 'Validating file...' : 'Click or Drag & Drop File (.ipynb, .pdf, .docx, .html, .xlsx, .zip)'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Supports Jupyter Notebooks (.ipynb), PDFs, Word Docs (.docx), Spreadsheets (.xlsx, .csv), HTML files, Presentations (.pptx), Screenshots & Code files (Max 25 MB)</span>
                  </div>
                </div>
              )}

              {/* Progress Indicator */}
              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-purple-700">
                    <span>Reading file...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#6d28d9] transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Academic Integrity Disclaimer Banner */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-semibold">
              ⚠️ Academic Integrity Notice: By submitting, you confirm that this material is provided for reference and learning purposes. Do not submit another student's work as your own.
            </div>

            {/* Modal Submit Footer */}
            <div className="pt-4 border-t border-purple-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-violet-secondary py-2.5 px-4 text-xs font-bold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || isUploading}
                className="btn-violet-primary py-2.5 px-6 text-xs font-extrabold shadow-md bg-[#6d28d9]"
              >
                {submitting ? 'Publishing Resource...' : 'Submit & Publish Resource (₹0 FREE)'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
