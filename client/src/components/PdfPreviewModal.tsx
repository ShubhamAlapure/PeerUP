import React from 'react';
import { AcademicIntegrityNotice } from './AcademicIntegrityNotice';
import { FileText, Download, X } from 'lucide-react';

interface PdfPreviewProps {
  fileName: string;
  fileUrl: string;
  onClose: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewProps> = ({ fileName, fileUrl, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm line-clamp-1">{fileName}</h3>
              <p className="text-xs text-slate-400">PDF Reference Document Preview</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent py-1.5 px-3 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mandatory Academic Integrity Notice inside PDF Previewer */}
        <div className="p-3 bg-amber-950/40 border-b border-amber-500/20">
          <AcademicIntegrityNotice compact />
        </div>

        {/* PDF Document Container / Embedded Object */}
        <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-auto">
          <object
            data={fileUrl}
            type="application/pdf"
            className="w-full h-full rounded-xl border border-slate-800"
          >
            <div className="text-center p-8 space-y-4">
              <FileText className="w-16 h-16 text-slate-600 mx-auto" />
              <p className="text-slate-300 text-sm">PDF Preview mode available in full view.</p>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <Download className="w-4 h-4" />
                <span>Open PDF Document</span>
              </a>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
};
