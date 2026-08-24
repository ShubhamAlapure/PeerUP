import React, { useState, useEffect } from 'react';
import { getAssignments, getInstitutions } from '../services/api';
import type { ContentItem, Institution } from '../types';
import { AcademicIntegrityNotice } from '../components/AcademicIntegrityNotice';
import { PdfPreviewModal } from '../components/PdfPreviewModal';
import { FolderKanban, Search, Download, Eye, Filter } from 'lucide-react';

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
    async function loadAssignments() {
      try {
        const data = await getAssignments({ search: searchQuery });
        setAssignments(data);
      } catch (err) {
        console.error('Assignment repository load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
  }, [searchQuery]);

  // Client-side filtering by University, Year, Semester
  const filteredAssignments = assignments.filter(item => {
    if (selectedInstId !== 'all' && item.institution_id !== selectedInstId) return false;
    if (selectedYear !== 'all' && item.year && item.year !== Number(selectedYear)) return false;
    if (selectedSemester !== 'all' && item.semester && item.semester !== Number(selectedSemester)) return false;
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
          Free Assignment Reference Repository
        </h1>

        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed font-medium">
          Browse previous year assignment references, worked practice problems, and study guides uploaded by verified senior peers across Pune universities & colleges.
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
              <option value="inst-jspm">JSPM Institutes</option>
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
        {filteredAssignments.map(item => (
          <div key={item.id} className="violet-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 border-l-[#6d28d9]">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-purple-100 text-[#6d28d9] font-extrabold text-[11px] px-2.5 py-1 rounded-md border border-purple-200 uppercase tracking-wider">
                  FREE REFERENCE
                </span>
                <span className="text-xs font-bold text-slate-600">{item.institution_name}</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-extrabold text-[#6d28d9]">{item.subject_name}</span>
              </div>

              <h3 className="font-extrabold text-[#2e1065] text-xl hover:text-[#6d28d9] transition-colors">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl font-medium">{item.description}</p>

              <div className="text-[11px] text-amber-900 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 inline-block">
                ⚠️ For reference and learning purposes only. Do not submit another student's work as your own.
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {item.files && item.files.length > 0 && (
                <>
                  <button
                    onClick={() => setSelectedPdf({ fileName: item.files![0].file_name, fileUrl: item.files![0].file_url })}
                    className="btn-violet-secondary text-xs py-2.5 px-4"
                  >
                    <Eye className="w-4 h-4 text-[#6d28d9]" />
                    <span>Preview PDF</span>
                  </button>

                  <a
                    href={item.files[0].file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-violet-primary text-xs py-2.5 px-4"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </a>
                </>
              )}
            </div>
          </div>
        ))}
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
