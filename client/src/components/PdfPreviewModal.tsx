import React, { useState, useEffect } from 'react';
import { AcademicIntegrityNotice } from './AcademicIntegrityNotice';
import { FileText, Download, X, ExternalLink, ZoomIn, ZoomOut, Image as ImageIcon, BookOpen, AlertCircle, Code } from 'lucide-react';

interface PdfPreviewProps {
  fileName: string;
  fileUrl: string;
  onClose: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewProps> = ({ fileName, fileUrl, onClose }) => {
  const [zoom, setZoom] = useState<number>(100);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [ipynbContent, setIpynbContent] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  const isIpynb = fileName.toLowerCase().endsWith('.ipynb') || fileUrl.includes('.ipynb');

  const isImage = fileUrl.startsWith('data:image/') || 
                  /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(fileUrl) || 
                  /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(fileName);

  const isBase64 = fileUrl.startsWith('data:');

  useEffect(() => {
    // 1. If Jupyter Notebook (.ipynb), decode and parse content
    if (isIpynb && isBase64) {
      try {
        const parts = fileUrl.split(';base64,');
        if (parts.length === 2) {
          const raw = window.atob(parts[1]);
          setIpynbContent(raw);
        }
      } catch (e) {
        console.warn('IPYNB parse error:', e);
      }
    }

    // 2. If base64 data URL PDF, convert to Blob URL
    if (isBase64 && !isImage && !isIpynb) {
      try {
        const parts = fileUrl.split(';base64,');
        if (parts.length === 2) {
          const contentType = parts[0].replace('data:', '');
          const raw = window.atob(parts[1]);
          const rawLength = raw.length;
          const uInt8Array = new Uint8Array(rawLength);
          for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
          }
          const blob = new Blob([uInt8Array], { type: contentType || 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);
          setPdfBlobUrl(blobUrl);
        }
      } catch (e) {
        console.warn('Base64 blob conversion notice:', e);
      }
    }
  }, [fileUrl, isBase64, isImage, isIpynb]);

  const activeRenderUrl = pdfBlobUrl || fileUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              {isIpynb ? <Code className="w-5 h-5 text-amber-400" /> : isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm line-clamp-1">{fileName}</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {isIpynb ? 'Jupyter Notebook (.ipynb) Code Reader' : isImage ? 'Document Screenshot Preview' : 'Reference Document Reader'}
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
              href={activeRenderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in New Tab</span>
            </a>

            <a
              href={activeRenderUrl}
              download={fileName}
              className="btn-violet-primary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </a>

            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mandatory Academic Integrity Notice */}
        <div className="p-3 bg-amber-950/40 border-b border-amber-500/20">
          <AcademicIntegrityNotice compact />
        </div>

        {/* Document Rendering Canvas */}
        <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-auto relative">
          {isIpynb ? (
            <div className="w-full h-full p-6 bg-slate-900 border border-slate-800 rounded-xl overflow-auto text-xs font-mono text-emerald-400 leading-relaxed shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400 text-xs mb-4">
                <span className="font-bold flex items-center gap-2 text-amber-400">
                  <Code className="w-4 h-4" /> Jupyter Notebook Source Preview
                </span>
                <span>Max File Limit: 10 MB</span>
              </div>
              <pre className="whitespace-pre-wrap word-break">{ipynbContent || 'Jupyter Notebook document ready for download.'}</pre>
            </div>
          ) : isImage ? (
            <div className="overflow-auto max-h-full max-w-full flex items-center justify-center">
              <img
                src={activeRenderUrl}
                alt={fileName}
                style={{ width: `${zoom}%` }}
                className="max-w-none rounded-xl border border-slate-800 shadow-2xl object-contain transition-all"
              />
            </div>
          ) : loadError ? (
            <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl max-w-md space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
              <h4 className="font-extrabold text-white text-base">{fileName}</h4>
              <p className="text-xs text-slate-400">This document reference can be downloaded directly to view on your device.</p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <a
                  href={activeRenderUrl}
                  download={fileName}
                  className="btn-violet-primary py-2 px-5 text-xs font-bold"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Document</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
              <embed
                src={activeRenderUrl}
                type="application/pdf"
                className="w-full h-full rounded-xl border border-slate-800 bg-white"
                onError={() => setLoadError(true)}
              />
              <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-2 shadow-lg">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>Interactive Document Viewer</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
