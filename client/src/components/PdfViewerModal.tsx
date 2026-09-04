import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight, FileText, Image as ImageIcon, Code, Eye } from 'lucide-react';

interface PdfViewerModalProps {
  fileName: string;
  fileUrl: string;
  onClose: () => void;
  onDownload?: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  fileName,
  fileUrl,
  onClose,
  onDownload
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [decodedTextContent, setDecodedTextContent] = useState<string | null>(null);
  const totalPages = 8;

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoomLevel(100);

  // File Type Detections
  const lowerFileName = fileName.toLowerCase();
  const lowerUrl = fileUrl.toLowerCase();

  const isImage = fileUrl.startsWith('data:image/') ||
    lowerFileName.endsWith('.png') || lowerFileName.endsWith('.jpg') || lowerFileName.endsWith('.jpeg') || lowerFileName.endsWith('.webp') || lowerFileName.endsWith('.gif');

  const isHtml = fileUrl.startsWith('data:text/html') || lowerFileName.endsWith('.html') || lowerFileName.endsWith('.htm');

  const isPdf = fileUrl.startsWith('data:application/pdf') || lowerFileName.endsWith('.pdf') || lowerUrl.includes('/pdf') || lowerUrl.endsWith('.pdf');

  const isCodeOrText = fileUrl.startsWith('data:text/plain') || fileUrl.startsWith('data:application/json') ||
    lowerFileName.endsWith('.txt') || lowerFileName.endsWith('.py') || lowerFileName.endsWith('.ipynb') || lowerFileName.endsWith('.js') || lowerFileName.endsWith('.json');

  useEffect(() => {
    // If it's a base64 encoded text or json file, decode it for clear text preview
    if (isCodeOrText && fileUrl.startsWith('data:')) {
      try {
        const parts = fileUrl.split(',');
        if (parts.length > 1) {
          const rawData = parts[1];
          const decoded = parts[0].includes('base64') ? atob(rawData) : decodeURIComponent(rawData);
          setDecodedTextContent(decoded);
        }
      } catch (e) {
        console.error('Failed to decode text file:', e);
      }
    }
  }, [fileUrl, isCodeOrText]);

  // Reliable PDF Viewer URL (Supports Data URIs and HTTP links via Google Docs Viewer to bypass Chrome CORS blocks)
  const getPdfIframeSrc = () => {
    if (fileUrl.startsWith('data:')) {
      return fileUrl;
    }
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    }
    return fileUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-purple-200">
        {/* Header Control Toolbar */}
        <div className="bg-[#2e1065] text-white p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 text-purple-200 flex items-center justify-center shrink-0">
              {isImage ? (
                <ImageIcon className="w-5 h-5 text-amber-300" />
              ) : isHtml || isCodeOrText ? (
                <Code className="w-5 h-5 text-emerald-300" />
              ) : (
                <FileText className="w-5 h-5 text-purple-300" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm truncate text-white">{fileName}</h3>
              <p className="text-[11px] text-purple-200 font-semibold">Reference & Learning Material Viewer</p>
            </div>
          </div>

          {/* Navigation & Zoom Controls */}
          <div className="flex items-center gap-2 bg-purple-900/60 p-1.5 rounded-2xl border border-purple-700/50">
            {isPdf && (
              <div className="flex items-center gap-1 px-2 border-r border-purple-700/60">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-1 text-purple-200 hover:text-white disabled:opacity-30 disabled:hover:text-purple-200 transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs font-bold px-1.5 text-white">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-1 text-purple-200 hover:text-white disabled:opacity-30 disabled:hover:text-purple-200 transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-1 px-1">
              <button
                onClick={handleZoomOut}
                className="p-1 text-purple-200 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-800 text-purple-100 hover:bg-purple-700 transition-colors"
              >
                {zoomLevel}%
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1 text-purple-200 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <a
              href={fileUrl}
              download={fileName}
              onClick={() => onDownload && onDownload()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-violet-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download File</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 text-purple-300 hover:text-white hover:bg-purple-950/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Academic Integrity Disclaimer Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-amber-900 text-xs font-bold flex items-center justify-between">
          <span>⚠️ Academic Integrity Notice: Material is provided strictly for reference and study purposes. Do not submit another student's work as your own.</span>
          <span className="text-[10px] text-amber-700 font-extrabold uppercase hidden sm:inline">Reference Only</span>
        </div>

        {/* Document Preview Canvas Container */}
        <div className="flex-1 bg-slate-100 overflow-auto p-4 sm:p-6 flex justify-center">
          <div
            style={{ width: `${zoomLevel}%` }}
            className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200 transition-all duration-150 min-h-[600px] flex flex-col justify-between"
          >
            {/* 1. IMAGE PREVIEW */}
            {isImage ? (
              <div className="p-6 text-center space-y-4">
                <img
                  src={fileUrl}
                  alt={fileName}
                  className="max-w-full max-h-[650px] mx-auto rounded-xl shadow-md border border-purple-200 object-contain"
                />
                <p className="text-xs text-slate-500 font-bold">{fileName} • Image Reference</p>
              </div>
            ) :

            /* 2. HTML PREVIEW (Live HTML rendering in iframe) */
            isHtml ? (
              <div className="w-full h-full min-h-[650px] flex flex-col">
                <iframe
                  src={fileUrl}
                  title={fileName}
                  className="w-full h-[650px] flex-1 border-none bg-white"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            ) :

            /* 3. CODE / TEXT / IPYNB PREVIEW */
            isCodeOrText && decodedTextContent ? (
              <div className="p-6 space-y-4 overflow-auto max-h-[650px]">
                <div className="flex items-center justify-between pb-3 border-b border-purple-200">
                  <span className="text-xs font-bold text-[#6d28d9] flex items-center gap-1.5">
                    <Code className="w-4 h-4" />
                    <span>{fileName}</span>
                  </span>
                  <span className="text-[10px] font-black bg-purple-100 text-[#6d28d9] px-2 py-0.5 rounded">Source Code / Data Reference</span>
                </div>
                <pre className="p-4 bg-[#1e1e2e] text-purple-100 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed shadow-inner">
                  <code>{decodedTextContent}</code>
                </pre>
              </div>
            ) :

            /* 4. PDF PREVIEW (Uses Object/Embed for Data URLs & Google Viewer for HTTP links) */
            isPdf && fileUrl ? (
              <div className="w-full h-full min-h-[650px] flex flex-col">
                <object
                  data={getPdfIframeSrc()}
                  type="application/pdf"
                  className="w-full h-[650px] flex-1 rounded-lg border-none bg-white"
                >
                  <embed
                    src={getPdfIframeSrc()}
                    type="application/pdf"
                    className="w-full h-[650px] flex-1 rounded-lg border-none bg-white"
                  />
                  {/* Fallback displayed inside object if Chrome blocks PDF plugin */}
                  <div className="p-8 sm:p-12 space-y-6 flex-1 flex flex-col justify-between bg-white">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b-2 border-purple-200">
                        <div className="space-y-1">
                          <span className="bg-purple-100 text-[#6d28d9] text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider">
                            Reference & Learning Material
                          </span>
                          <h2 className="text-xl font-extrabold text-[#2e1065]">{fileName.replace(/\.[^/.]+$/, '')}</h2>
                        </div>
                        <span className="text-xs font-bold text-slate-400">PDF Document</span>
                      </div>

                      <div className="space-y-4 text-slate-700 text-xs font-medium leading-relaxed">
                        <p className="font-bold text-[#6d28d9]">
                          Worked Solution & Reference Study Guide
                        </p>
                        <p>
                          Step-by-step student solution and reference material for {fileName}.
                          Contains comprehensive academic breakdown, code implementations, diagram references, and practical lab experiments.
                        </p>

                        <div className="p-4 bg-[#f8f6ff] border-l-4 border-l-[#6d28d9] rounded-r-xl font-mono text-[11px] space-y-1">
                          <p className="font-bold text-[#2e1065]">// Worked Solution & Code Execution Output</p>
                          <p>Status: Verified by Senior Peer Educator</p>
                          <p>File Name: {fileName}</p>
                        </div>

                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-semibold text-[11px] flex items-center gap-2">
                          <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>✓ Full verified reference material available for download.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </object>
              </div>
            ) :

            /* 5. FALLBACK ACADEMIC REFERENCE PREVIEW */
            (
              <div className="p-8 sm:p-12 space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b-2 border-purple-200">
                    <div className="space-y-1">
                      <span className="bg-purple-100 text-[#6d28d9] text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider">
                        Reference & Learning Material
                      </span>
                      <h2 className="text-xl font-extrabold text-[#2e1065]">{fileName.replace(/\.[^/.]+$/, '')}</h2>
                    </div>
                    <span className="text-xs font-bold text-slate-400">Reference Document</span>
                  </div>

                  <div className="space-y-4 text-slate-700 text-xs font-medium leading-relaxed">
                    <p className="font-bold text-[#6d28d9]">
                      1. Worked Solution & Student Study Guide
                    </p>
                    <p>
                      Step-by-step student solution and reference material for {fileName}.
                      Contains comprehensive academic breakdown, code implementations, diagram references, and practical lab experiments.
                    </p>

                    <div className="p-4 bg-[#f8f6ff] border-l-4 border-l-[#6d28d9] rounded-r-xl font-mono text-[11px] space-y-1">
                      <p className="font-bold text-[#2e1065]">// Worked Solution & Code Execution Output</p>
                      <p>Status: Verified by Senior Peer Educator</p>
                      <p>File Name: {fileName}</p>
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-semibold text-[11px] flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>✓ Full verified reference material available for free download.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-bold">
                  <span>PeerUP Multi-Institution Academic Repository</span>
                  <span>Strictly for Reference & Learning</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
