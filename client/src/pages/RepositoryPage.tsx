import React, { useState, useEffect } from 'react';
import { getAssignments } from '../services/api';
import type { ContentItem } from '../types';
import { AcademicIntegrityNotice } from '../components/AcademicIntegrityNotice';
import { PdfPreviewModal } from '../components/PdfPreviewModal';
import { FolderKanban, Search, Download, Eye } from 'lucide-react';

export const RepositoryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [assignments, setAssignments] = useState<ContentItem[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<{ fileName: string; fileUrl: string } | null>(null);
  const [_loading, setLoading] = useState(true);

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

  return (
    <div className="page-container py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-300 text-[#5c33cf] text-xs font-bold shadow-xs">
          <FolderKanban className="w-4 h-4 text-[#5c33cf]" />
          <span>Free Student Acquisition Layer</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Free Assignment Reference Repository
        </h1>

        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed font-medium">
          Browse previous year assignment references, worked practice problems, and study guides uploaded by verified senior peers.
        </p>

        {/* Mandatory Academic Integrity Notice */}
        <AcademicIntegrityNotice />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-xs">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Search assignment references by topic, subject, or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none font-medium"
        />
      </div>

      {/* Assignment Reference Cards List */}
      <div className="space-y-5">
        {assignments.map(item => (
          <div key={item.id} className="purple-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 border-l-[#5c33cf]">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="bg-purple-100 text-[#5c33cf] font-extrabold text-[11px] px-2.5 py-1 rounded-md border border-purple-200 uppercase tracking-wider">
                  FREE REFERENCE
                </span>
                <span className="text-xs font-bold text-slate-600">{item.institution_name}</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-extrabold text-[#5c33cf]">{item.subject_name}</span>
              </div>

              <h3 className="font-extrabold text-slate-900 text-xl hover:text-[#5c33cf] transition-colors">{item.title}</h3>
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
                    className="btn-purple-secondary text-xs py-2.5 px-4"
                  >
                    <Eye className="w-4 h-4 text-[#5c33cf]" />
                    <span>Preview PDF</span>
                  </button>

                  <a
                    href={item.files[0].file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-purple-dark text-xs py-2.5 px-4"
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
