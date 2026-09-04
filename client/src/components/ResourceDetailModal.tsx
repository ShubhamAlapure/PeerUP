import React, { useEffect } from 'react';
import type { AcademicResource } from '../types';
import { trackResourceView } from '../services/api';
import { AcademicIntegrityNotice } from './AcademicIntegrityNotice';
import {
  X,
  Building,
  Eye,
  Download,
  Award,
  AlertTriangle,
  FileText,
  BookOpen,
  Tag
} from 'lucide-react';

interface ResourceDetailModalProps {
  resource: AcademicResource;
  currentUserId?: string;
  onClose: () => void;
  onPreviewPdf: (resource: AcademicResource) => void;
  onDownload: (resource: AcademicResource) => void;
  onReport: (resource: AcademicResource) => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  currentUserId,
  onClose,
  onPreviewPdf,
  onDownload,
  onReport
}) => {
  useEffect(() => {
    // Track view cleanly on detail modal open
    trackResourceView(resource.id, currentUserId).catch(() => {});
  }, [resource.id, currentUserId]);

  const formattedDate = new Date(resource.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-200 relative my-8">
        {/* Header */}
        <div className="bg-[#2e1065] text-white p-6 sm:p-8 space-y-3 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-purple-300 hover:text-white p-2 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-500 text-white font-extrabold text-[11px] px-3 py-1 rounded-md uppercase tracking-wider">
              FREE REFERENCE (₹0)
            </span>
            <span className="bg-purple-800 text-purple-200 font-extrabold text-[11px] px-3 py-1 rounded-md uppercase tracking-wider border border-purple-700">
              Reference & Learning Material
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{resource.title}</h1>

          {/* Academic hierarchy breadcrumbs */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-purple-200 pt-1">
            <span className="flex items-center gap-1 text-white">
              <Building className="w-3.5 h-3.5 text-purple-300" />
              {resource.institution_name}
            </span>
            <span>•</span>
            <span>{resource.department_name}</span>
            <span>•</span>
            <span>{resource.program_name}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Mandatory Academic Integrity Notice */}
          <AcademicIntegrityNotice />

          {/* Key Academic Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#f8f6ff] p-3 rounded-2xl border border-purple-200">
              <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Academic Level</span>
              <span className="text-xs font-black text-[#2e1065]">Year {resource.year} • Sem {resource.semester}</span>
            </div>

            <div className="bg-[#f8f6ff] p-3 rounded-2xl border border-purple-200">
              <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Subject</span>
              <span className="text-xs font-black text-[#6d28d9] truncate block">{resource.subject_name}</span>
            </div>

            <div className="bg-[#f8f6ff] p-3 rounded-2xl border border-purple-200">
              <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Resource Type</span>
              <span className="text-xs font-black text-[#2e1065] capitalize truncate block">{resource.resource_type.replace(/_/g, ' ')}</span>
            </div>

            <div className="bg-[#f8f6ff] p-3 rounded-2xl border border-purple-200">
              <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Topic</span>
              <span className="text-xs font-black text-slate-800 truncate block">{resource.topic_name || 'General Topic'}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-[#2e1065] text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#6d28d9]" />
              <span>Description & Study Overview</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-[#f8f6ff] p-4 rounded-2xl border border-purple-100 font-medium">
              {resource.description || 'No detailed description provided.'}
            </p>
          </div>

          {/* File details & Tags */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6d28d9] flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-[#2e1065]">{resource.file_name}</p>
                <p className="text-[11px] text-slate-500 font-bold">
                  {(resource.file_size ? (resource.file_size / (1024 * 1024)).toFixed(2) + ' MB' : 'PDF Document')} • {resource.file_type}
                </p>
              </div>
            </div>

            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-400" />
                {resource.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Uploader Profile & Verification Card */}
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={resource.uploader_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={resource.uploader_name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#6d28d9]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-[#2e1065] text-xs sm:text-sm">{resource.uploader_name}</h4>
                  {resource.is_peer_verified && (
                    <span className="bg-[#6d28d9] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                      <Award className="w-3 h-3 text-amber-300" />
                      ✓ Verified Peer Educator
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 font-bold">Uploaded on {formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-purple-500" />
                {resource.views_count} Views
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-4 h-4 text-emerald-600" />
                {resource.downloads_count} Downloads
              </span>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-purple-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onReport(resource)}
            className="btn-violet-outline text-xs text-amber-800 border-amber-300 hover:bg-amber-100 font-bold py-2.5 px-4 flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Report Resource</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onPreviewPdf(resource)}
              className="btn-violet-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-2 shadow-xs"
            >
              <Eye className="w-4 h-4 text-[#6d28d9]" />
              <span>Preview PDF</span>
            </button>

            <button
              onClick={() => onDownload(resource)}
              className="btn-violet-primary py-2.5 px-6 text-xs font-extrabold flex items-center gap-2 shadow-md bg-[#6d28d9]"
            >
              <Download className="w-4 h-4" />
              <span>Download Resource</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
