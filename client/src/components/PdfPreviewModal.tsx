import React, { useState } from 'react';
import { AcademicIntegrityNotice } from './AcademicIntegrityNotice';
import { FileText, Download, X, ExternalLink, ZoomIn, ZoomOut, Image as ImageIcon } from 'lucide-react';

interface PdfPreviewProps {
  fileName: string;
  fileUrl: string;
  onClose: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewProps> = ({ fileName, fileUrl, onClose }) => {
  const [zoom, setZoom] = useState<number>(100);

  const isImage = fileUrl.startsWith('data:image/') || 
                  /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(fileUrl) || 
                  /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(fileName);

  const isBase64Pdf = fileUrl.startsWith('data:application/pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Navigation Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm line-clamp-1">{fileName}</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {isImage ? 'Document Screenshot / Image Preview' : 'PDF Reference Document Interactive Reader'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setZoom(prev => Math.max(prev - 20, 60))}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-300 px-2">{zoom}%</span>
              <button
                onClick={() => setZoom(prev => Math.min(prev + 20, 200))}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open Full Screen</span>
            </a>

            <a
              href={fileUrl}
              download={fileName}
              className="btn-violet-primary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>

            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mandatory Academic Integrity Notice inside PDF Previewer */}
        <div className="p-3 bg-amber-950/40 border-b border-amber-500/20">
          <AcademicIntegrityNotice compact />
        </div>

        {/* Document Render Canvas */}
        <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-auto relative">
          {isImage ? (
            <div className="overflow-auto max-h-full max-w-full flex items-center justify-center">
              <img
                src={fileUrl}
                alt={fileName}
                style={{ width: `${zoom}%` }}
                className="max-w-none rounded-xl border border-slate-800 shadow-2xl object-contain transition-all"
              />
            </div>
          ) : isBase64Pdf ? (
            <iframe
              src={fileUrl}
              title={fileName}
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              className="w-full h-full rounded-xl border border-slate-800 bg-white"
            />
          ) : (
            <iframe
              src={fileUrl.startsWith('http') 
                ? `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true` 
                : fileUrl}
              title={fileName}
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              className="w-full h-full rounded-xl border border-slate-800 bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
};
