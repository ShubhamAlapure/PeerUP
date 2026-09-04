import React from 'react';
import type { AcademicResource } from '../types';
import {
  FileText,
  BookOpen,
  CheckCircle,
  Eye,
  Download,
  Calendar,
  Building,
  Award,
  Layers,
  HelpCircle,
  Code
} from 'lucide-react';

interface ResourceCardProps {
  resource: AcademicResource;
  onViewDetails: (resource: AcademicResource) => void;
  onPreviewPdf: (resource: AcademicResource) => void;
  onDownload: (resource: AcademicResource) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onViewDetails,
  onPreviewPdf,
  onDownload
}) => {
  // Label for Resource Type
  const getResourceTypeConfig = (type: string) => {
    switch (type) {
      case 'assignment_reference':
        return { label: 'Assignment Reference', icon: FileText, color: 'bg-purple-100 text-[#6d28d9] border-purple-300' };
      case 'assignment_solution':
        return { label: 'Assignment Solution', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'notes':
        return { label: 'Lecture Notes', icon: BookOpen, color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'study_material':
        return { label: 'Study Material', icon: Layers, color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      case 'previous_question_paper':
        return { label: 'Previous Question Paper', icon: HelpCircle, color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'lab_practical_reference':
        return { label: 'Lab & Practical Reference', icon: Code, color: 'bg-teal-100 text-teal-900 border-teal-300' };
      default:
        return { label: 'Reference & Learning Material', icon: FileText, color: 'bg-purple-100 text-[#6d28d9] border-purple-300' };
    }
  };

  const typeConfig = getResourceTypeConfig(resource.resource_type);
  const TypeIcon = typeConfig.icon;

  const formattedDate = new Date(resource.created_at || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const uploaderName = resource.uploader_name || (resource as any).owner_name || 'Verified Peer Educator';
  const uploaderAvatar = resource.uploader_avatar || (resource as any).owner_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
  const viewsCount = resource.views_count ?? (resource as any).view_count ?? 0;
  const downloadsCount = resource.downloads_count ?? (resource as any).purchases_count ?? (resource as any).purchase_count ?? 0;

  return (
    <div className="violet-card p-6 bg-white flex flex-col justify-between space-y-4 border-l-4 border-l-[#6d28d9] shadow-md hover:shadow-lg transition-all">
      {/* Top Header Metadata */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Free Badge */}
            <span className="bg-emerald-100 text-emerald-800 font-black text-[11px] px-2.5 py-1 rounded-md border border-emerald-300 uppercase tracking-wider flex items-center gap-1 shadow-2xs">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              FREE (₹0)
            </span>

            {/* Resource Type Badge */}
            <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-md border uppercase tracking-wider flex items-center gap-1 ${typeConfig.color}`}>
              <TypeIcon className="w-3 h-3" />
              {typeConfig.label}
            </span>
          </div>

          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {formattedDate}
          </span>
        </div>

        {/* Institution & Subject Line */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600 pt-1">
          <span className="flex items-center gap-1 text-[#2e1065] font-extrabold">
            <Building className="w-3.5 h-3.5 text-[#6d28d9]" />
            {resource.institution_name || 'MIT ADT University'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[#6d28d9] font-extrabold">
            {resource.subject_name || 'Database Systems'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded text-[11px]">
            Sem {resource.semester || 5} (Year {resource.year || 3})
          </span>
        </div>

        {/* Resource Title */}
        <h3
          onClick={() => onViewDetails(resource)}
          className="font-extrabold text-[#2e1065] text-lg sm:text-xl hover:text-[#6d28d9] transition-colors cursor-pointer leading-tight flex items-start gap-2 pt-1"
        >
          <span>{resource.title}</span>
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
          {resource.description}
        </p>

        {/* Mandatory Academic Integrity Disclaimer Notice */}
        <div className="text-[11px] text-amber-900 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
          ⚠️ Reference & Learning Material: Do not submit another student's work as your own.
        </div>
      </div>

      {/* Footer Info: Uploader, Views, Downloads & Actions */}
      <div className="pt-4 border-t border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Uploader info & stats */}
        <div className="flex items-center gap-3">
          <img
            src={uploaderAvatar}
            alt={uploaderName}
            className="w-8 h-8 rounded-full object-cover border border-purple-300 shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-[#2e1065]">{uploaderName}</span>
              <span className="bg-purple-100 text-[#6d28d9] text-[10px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5" title="Verified Senior Peer">
                <Award className="w-3 h-3 text-[#6d28d9]" />
                ✓ Peer
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-purple-400" />
                {viewsCount} views
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3 text-emerald-500" />
                {downloadsCount} downloads
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onPreviewPdf(resource)}
            className="btn-violet-secondary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#6d28d9]" />
            <span>Preview</span>
          </button>

          <button
            onClick={() => onDownload(resource)}
            className="btn-violet-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 shadow-md bg-[#6d28d9]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
