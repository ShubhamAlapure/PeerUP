import React, { useState, useEffect } from 'react';
import { getAssignments, getContentList, getInstitutions } from '../services/api';
import type { ContentItem, Institution } from '../types';
import { AcademicIntegrityNotice } from '../components/AcademicIntegrityNotice';
import { PdfPreviewModal } from '../components/PdfPreviewModal';
import { FolderKanban, Search, Download, Eye, Filter, FileText, CheckCircle } from 'lucide-react';

export const RepositoryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  const [assignments, setAssignments] = useState<ContentItem[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<{ fileName: string; fileUrl: string } | null>(null);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const insts = await getInstitutions();
        setInstitutions(insts);
      } catch (err) {
        console.error('Error loading institutions:', err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadAllFreeResources() {
      try {
        setLoading(true);

        // 1. Fetch free assignment references
        let baseAssignments: ContentItem[] = [];
        try {
          baseAssignments = await getAssignments({ search: searchQuery });
        } catch (e) {
          console.warn('getAssignments notice:', e);
        }

        // 2. Fetch all free explanations from general content list
        let freeContent: ContentItem[] = [];
        try {
          const allContent = await getContentList({});
          freeContent = allContent.filter((c: any) => c.is_free || c.price === 0 || c.content_type === 'pdf_explanation');
        } catch (e) {
          console.warn('getContentList notice:', e);
        }

        // 3. Read locally published resources from localStorage
        let localUploaded: ContentItem[] = [];
        try {
          const raw = localStorage.getItem('peerup_user_uploaded_resources');
          if (raw) localUploaded = JSON.parse(raw);
        } catch (e) {}

        // Combine all free resources uniquely
        const existingIds = new Set<string>();
        const combined: ContentItem[] = [];

        [...localUploaded, ...freeContent, ...baseAssignments].forEach(item => {
          if (!existingIds.has(item.id)) {
            existingIds.add(item.id);
            combined.push(item);
          }
        });

        setAssignments(combined);
      } catch (err) {
        console.error('Free repository load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAllFreeResources();
  }, [searchQuery]);

  // Filtering logic
  const filteredAssignments = assignments.filter(item => {
    if (selectedInstId !== 'all' && item.institution_id !== selectedInstId) return false;
    if (selectedYear !== 'all' && item.year && item.year !== Number(selectedYear)) return false;
    if (selectedSemester !== 'all' && item.semester && item.semester !== Number(selectedSemester)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = (item.title || '').toLowerCase().includes(q);
      const descMatch = (item.description || '').toLowerCase().includes(q);
      const subjMatch = (item.subject_name || '').toLowerCase().includes(q);
      return titleMatch || descMatch || subjMatch;
    }
    return true;
  });

  return (
    <div className="page-container py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-300 text-[#6d28d9] text-xs font-bold shadow-xs">
          <FolderKanban className="w-4 h-4 text-[#6d28d9]" />
          <span>Free Student Repository</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2e1065] tracking-tight">
          Free Assignment & PDF Reference Repository
        </h1>

        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed font-medium">
          Browse previous year assignment references, worked practice problems, lab screenshots, and PDF study guides uploaded by verified senior peers. Accessible to everyone at ₹0.
        </p>

        {/* Mandatory Academic Integrity Notice */}
        <AcademicIntegrityNotice />
      </div>

      {/* Dynamic Academic Filter Bar (University, Year, Semester, Search) */}
      <div className="violet-panel p-5 bg-white border-2 border-purple-200 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-purple-200">
          <Filter className="w-4 h-4 text-[#6d28d9]" />
          <h3 className="font-extrabold text-[#2e1065] text-xs uppercase tracking-wider">Filter Content by University & Academic Level</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* University Filter Dropdown */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#2e1065] mb-1">University / College</label>
            <select
              value={selectedInstId}
              onChange={(e) => setSelectedInstId(e.target.value)}
              className="w-full p-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
            >
              <option value="all">All Pune Institutions</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
              <option value="inst-mit-adt">MIT ADT University</option>
              <option value="inst-coep">COEP Technological University</option>
              <option value="inst-symbiosis">Symbiosis International</option>
              <option value="inst-mit-wpu">MIT World Peace University</option>
              <option value="inst-cummins">Cummins College of Engineering</option>
              <option value="inst-dypu">D Y Patil International University</option>
            </select>
          </div>

          {/* Academic Year Filter Dropdown */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#2e1065] mb-1">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
            >
              <option value="all">All Years (1st - 4th Year)</option>
              <option value="1">Year 1 (FE)</option>
              <option value="2">Year 2 (SE)</option>
              <option value="3">Year 3 (TE)</option>
              <option value="4">Year 4 (BE)</option>
            </select>
          </div>

          {/* Semester Filter Dropdown */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#2e1065] mb-1">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full p-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
            >
              <option value="all">All Semesters (Sem 1 - 8)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={String(s)}>Semester {s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Keyword Search Input */}
        <div className="bg-[#f8f6ff] p-3 rounded-xl border border-purple-200 flex items-center gap-3">
          <Search className="w-4 h-4 text-purple-400 ml-1" />
          <input
            type="text"
            placeholder="Search assignment references by topic name, subject, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-xs focus:outline-none font-medium"
          />
        </div>
      </div>

      {/* Assignment Reference Cards List */}
      <div className="space-y-5">
        {filteredAssignments.length === 0 ? (
          <div className="py-12 bg-purple-50 rounded-2xl border border-purple-200 text-center text-slate-600 font-medium text-xs">
            No free resources found matching your filters. Use <strong>+ Create Explanation</strong> to upload a PDF!
          </div>
        ) : (
          filteredAssignments.map(item => {
            const hasFiles = item.files && item.files.length > 0;
            const targetFile = hasFiles ? item.files![0] : {
              file_name: `${item.title}.pdf`,
              file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
            };

            return (
              <div key={item.id} className="violet-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 border-l-[#6d28d9] shadow-md">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[11px] px-2.5 py-1 rounded-md border border-emerald-300 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      FREE REFERENCE (₹0)
                    </span>
                    <span className="text-xs font-bold text-slate-600">{item.institution_name || 'MIT ADT University'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-extrabold text-[#6d28d9]">{item.subject_name || 'General Academic'}</span>
                  </div>

                  <h3 className="font-extrabold text-[#2e1065] text-xl hover:text-[#6d28d9] transition-colors flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#6d28d9] shrink-0" />
                    <span>{item.title}</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl font-medium">{item.description}</p>

                  <div className="text-[11px] text-amber-900 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 inline-block">
                    ⚠️ For reference and learning purposes only. Do not submit another student's work as your own.
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setSelectedPdf({ fileName: targetFile.file_name, fileUrl: targetFile.file_url })}
                    className="btn-violet-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-2 shadow-xs"
                  >
                    <Eye className="w-4 h-4 text-[#6d28d9]" />
                    <span>Preview PDF</span>
                  </button>

                  <a
                    href={targetFile.file_url}
                    download={targetFile.file_name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-violet-primary text-xs py-2.5 px-4 font-bold flex items-center gap-2 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PDF Modal Viewer */}
      {selectedPdf && (
        <PdfPreviewModal
          fileName={selectedPdf.fileName}
          fileUrl={selectedPdf.fileUrl}
          onClose={() => setSelectedPdf(null)}
        />
      )}
    </div>
  );
};
