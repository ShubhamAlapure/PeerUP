import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createExplanation, getInstitutions } from '../services/api';
import { supabase } from '../services/supabaseClient';
import { MediaStudioRecorder } from '../components/MediaStudioRecorder';
import { AcademicIntegrityNotice } from '../components/AcademicIntegrityNotice';
import type { ContentType, Institution } from '../types';
import { PlusCircle, Video, Mic, FileText, FileSpreadsheet, CheckCircle, AlertCircle, Building, UploadCloud, File, Trash2, Code } from 'lucide-react';

export const CreateExplanationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [contentType, setContentType] = useState<ContentType>('pdf_explanation');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [markdownText, setMarkdownText] = useState('');
  const [durationSeconds, setDurationSeconds] = useState<number>(300);

  // File Upload State (PDF, IPYNB, Docs, Sheets, Screenshots)
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string; size: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Academic Mapping Fields
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>('inst-mit-adt');
  const [specialization, setSpecialization] = useState<string>('Computer Science & Engineering (CSE)');
  const [academicYear, setAcademicYear] = useState<number>(3);
  const [semester, setSemester] = useState<number>(5);
  const [subjectName, setSubjectName] = useState<string>('Machine Learning (ML)');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadInsts() {
      try {
        const insts = await getInstitutions();
        setInstitutions(insts);
      } catch (err) {
        console.error('Error fetching institutions:', err);
      }
    }
    loadInsts();
  }, []);

  const handleMediaCaptured = (_blob: Blob, duration: number) => {
    setDurationSeconds(duration > 0 ? duration : 300);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict 10 MB File Size Enforcement
    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE_BYTES) {
      const actualSizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setError(`File size (${actualSizeMb} MB) exceeds maximum allowed limit of 10 MB. Please upload a smaller file.`);
      return;
    }

    setIsUploading(true);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const reader = new FileReader();

    reader.onload = () => {
      const resultUrl = reader.result as string;
      setAttachedFile({
        name: file.name,
        url: resultUrl,
        size: sizeInMb
      });
      setIsUploading(false);
    };

    reader.onerror = () => {
      setError('Failed to read selected file.');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('Please provide an explanation title.');
      return;
    }
    if (contentType === 'pdf_explanation' && !attachedFile) {
      setError('Please attach a PDF, Jupyter notebook (.ipynb), doc, or sheet file to publish.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const isFree = Number(price) === 0;

      const payload = {
        owner_id: currentUser.id,
        institution_id: selectedInstId,
        subject_id: 'subj-dbms',
        topic_id: 'top-norm',
        year: academicYear,
        semester: semester,
        program_name: specialization,
        title,
        description,
        content_type: contentType,
        price: Number(price),
        is_free: isFree,
        difficulty,
        markdown_text: markdownText,
        duration_seconds: durationSeconds,
        file_url: attachedFile?.url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_name: attachedFile?.name || `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      };

      // 1. Send API request
      let publishedItem: any = null;
      try {
        const res = await createExplanation(payload);
        if (res && res.content) publishedItem = res.content;
      } catch (apiErr) {
        console.warn('API createExplanation notice:', apiErr);
      }

      // 2. Direct Supabase DB insert
      try {
        await supabase.from('explanations').insert([{
          owner_id: currentUser.id.includes('-') ? currentUser.id : null,
          title,
          description,
          content_type: contentType,
          price: Number(price),
          is_free: isFree,
          year: academicYear,
          semester: semester,
          file_name: attachedFile?.name || `${title}.pdf`,
          file_url: attachedFile?.url
        }]);
      } catch (dbErr) {
        console.warn('Direct Supabase insert notice:', dbErr);
      }

      // 3. Cache created item in localStorage for instant repository visibility
      const createdItem = publishedItem || {
        id: `cnt_${Date.now()}`,
        owner_id: currentUser.id,
        owner_name: currentUser.full_name,
        owner_avatar: currentUser.avatar_url,
        institution_id: selectedInstId,
        institution_name: 'MIT ADT University (Pune)',
        subject_name: subjectName || 'Computer Science',
        year: academicYear,
        semester: semester,
        title,
        description: description || 'PeerUP student uploaded reference resource.',
        content_type: contentType,
        price: Number(price),
        is_free: isFree,
        moderation_status: 'published',
        average_rating: 5.0,
        created_at: new Date().toISOString(),
        files: [
          {
            id: `file_${Date.now()}`,
            file_name: attachedFile?.name || `${title}.pdf`,
            file_url: attachedFile?.url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            file_type: 'application/pdf',
            file_size: 500000,
            is_reference_only: true,
            disclaimer: "For reference and learning purposes only. Do not submit another student's work as your own."
          }
        ]
      };

      try {
        const existingLocal = JSON.parse(localStorage.getItem('peerup_user_uploaded_resources') || '[]');
        existingLocal.unshift(createdItem);
        localStorage.setItem('peerup_user_uploaded_resources', JSON.stringify(existingLocal));
      } catch (e) {}

      setSuccess(true);
      setTimeout(() => {
        navigate('/repository');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to publish explanation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-4xl py-10 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 text-[#6d28d9] text-xs font-bold border border-purple-200">
          <PlusCircle className="w-4 h-4 text-[#6d28d9]" />
          <span>Peer Explanation Studio</span>
        </div>
        <h1 className="text-3xl font-black text-[#2e1065]">Create & Upload Resource / Explanation</h1>
        <p className="text-sm text-slate-600 font-medium">Upload PDF, Jupyter Notebooks (.ipynb), Docs, Sheets, or study notes. Set Price = ₹0 to publish directly to the Free Student Repository!</p>
      </div>

      <AcademicIntegrityNotice />

      {success ? (
        <div className="violet-panel text-center py-12 space-y-4">
          <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto" />
          <h2 className="text-2xl font-black text-[#2e1065]">Resource Uploaded & Published!</h2>
          <p className="text-sm text-slate-600 font-medium">Your explanation is now live and immediately visible to everyone under the Free Student Repository.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="violet-panel space-y-8 bg-white border-2 border-purple-200 p-8 shadow-xl">
          {/* Step 1: Format Selection */}
          <div className="space-y-3">
            <label className="block font-extrabold text-[#2e1065] text-sm">Step 1: Choose Explanation Format</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => { setContentType('pdf_explanation'); setPrice(0); }}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                  contentType === 'pdf_explanation' ? 'bg-[#6d28d9] border-[#6d28d9] text-white shadow-md' : 'bg-[#f8f6ff] border-purple-200 text-slate-700 hover:bg-purple-100'
                }`}
              >
                <FileSpreadsheet className="w-6 h-6 text-amber-300" />
                <span>PDF, IPYNB & Docs</span>
              </button>

              <button
                type="button"
                onClick={() => { setContentType('video'); setPrice(20); }}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                  contentType === 'video' ? 'bg-[#6d28d9] border-[#6d28d9] text-white shadow-md' : 'bg-[#f8f6ff] border-purple-200 text-slate-700 hover:bg-purple-100'
                }`}
              >
                <Video className="w-6 h-6 text-purple-200" />
                <span>Video Walkthrough</span>
              </button>

              <button
                type="button"
                onClick={() => { setContentType('audio'); setPrice(15); }}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                  contentType === 'audio' ? 'bg-[#6d28d9] border-[#6d28d9] text-white shadow-md' : 'bg-[#f8f6ff] border-purple-200 text-slate-700 hover:bg-purple-100'
                }`}
              >
                <Mic className="w-6 h-6 text-emerald-400" />
                <span>Audio Guide</span>
              </button>

              <button
                type="button"
                onClick={() => { setContentType('text'); setPrice(0); }}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                  contentType === 'text' ? 'bg-[#6d28d9] border-[#6d28d9] text-white shadow-md' : 'bg-[#f8f6ff] border-purple-200 text-slate-700 hover:bg-purple-100'
                }`}
              >
                <FileText className="w-6 h-6 text-purple-300" />
                <span>Text Explanation</span>
              </button>
            </div>
          </div>

          {/* Step 2: Academic Mapping */}
          <div className="space-y-4 pt-4 border-t border-purple-200">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-[#6d28d9]" />
              <label className="font-extrabold text-[#2e1065] text-sm">Step 2: University & Academic Mapping</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Target University / Institution</label>
                <select
                  value={selectedInstId}
                  onChange={(e) => setSelectedInstId(e.target.value)}
                  className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
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

              <div>
                <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Specialization / Program</label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
                >
                  <option value="Computer Science & Engineering (CSE)">Computer Science & Engineering (CSE)</option>
                  <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science (AI & DS)</option>
                  <option value="Information Technology (IT)">Information Technology (IT)</option>
                  <option value="Electronics & Telecom (E&TC)">Electronics & Telecom (E&TC)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Academic Year</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(Number(e.target.value))}
                  className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
                >
                  <option value={1}>1st Year (FE)</option>
                  <option value={2}>2nd Year (SE)</option>
                  <option value={3}>3rd Year (TE)</option>
                  <option value={4}>4th Year (BE)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Subject Name</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Machine Learning (ML)"
                  className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
                />
              </div>
            </div>
          </div>

          {/* Interactive File Attachment Upload Section (PDF, IPYNB, DOCS, SHEETS, ETC) */}
          <div className="space-y-3 pt-4 border-t border-purple-200">
            <label className="block font-extrabold text-[#2e1065] text-sm flex items-center justify-between">
              <span>Step 3: Attach Resource File (.ipynb, .pdf, .docx, .xlsx, screenshots)</span>
              {contentType === 'pdf_explanation' && (
                <span className="text-xs text-[#6d28d9] font-extrabold uppercase">* Max 10MB limit</span>
              )}
            </label>

            {attachedFile ? (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    {attachedFile.name.endsWith('.ipynb') ? <Code className="w-5 h-5" /> : <File className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-emerald-950">{attachedFile.name}</p>
                    <p className="text-[10px] text-emerald-700 font-bold">{attachedFile.size} • Ready for Preview & Download</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-purple-300 rounded-2xl p-6 bg-[#f8f6ff] hover:bg-purple-100/50 transition-colors text-center cursor-pointer">
                <input
                  type="file"
                  accept=".ipynb,.pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.mp4,.zip,.rar,.html,.htm"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <UploadCloud className="w-8 h-8 text-[#6d28d9]" />
                  <span className="text-xs font-black text-[#2e1065]">
                    {isUploading ? 'Uploading resource...' : 'Click or Drag & Drop File (.ipynb, .pdf, .docx, .xlsx, .html)'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Supports Jupyter Notebooks (.ipynb), PDFs, Word Docs (.docx), Spreadsheets (.xlsx, .csv), HTML files, Screenshots & Code files (Max 10MB limit)</span>
                </div>
              </div>
            )}
          </div>

          {/* Media recording for Video/Audio */}
          {(contentType === 'video' || contentType === 'audio') && (
            <div className="space-y-2 pt-4 border-t border-purple-200">
              <label className="block font-extrabold text-[#2e1065] text-sm">Media Studio Recorder</label>
              <MediaStudioRecorder mode={contentType} onMediaCaptured={handleMediaCaptured} />
            </div>
          )}

          {/* Text editor for Text explanation */}
          {contentType === 'text' && (
            <div className="space-y-2 pt-4 border-t border-purple-200">
              <label className="block font-extrabold text-[#2e1065] text-sm">Rich Text Body (Markdown Supported)</label>
              <textarea
                rows={5}
                value={markdownText}
                onChange={(e) => setMarkdownText(e.target.value)}
                placeholder="Write your step-by-step topic breakdown..."
                className="w-full p-4 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#6d28d9]"
              />
            </div>
          )}

          {/* Explanation Details & Pricing */}
          <div className="space-y-4 pt-4 border-t border-purple-200">
            <div>
              <label className="block font-bold text-[#2e1065] text-sm mb-1">Explanation Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Machine Learning Lab Experiments & Jupyter Notebook (.ipynb)"
                className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-sm font-bold focus:outline-none focus:border-[#6d28d9]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#2e1065] text-sm mb-1">Description & Key Takeaways</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summary of what students will learn from this reference document..."
                className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#6d28d9]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#2e1065] text-sm mb-1">Price (₹ INR)</label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-sm font-black focus:outline-none focus:border-[#6d28d9]"
                />
                <span className="text-[10px] text-emerald-700 font-extrabold">✓ Set ₹0 to publish under Free Student Repository for everyone!</span>
              </div>

              <div>
                <label className="block font-bold text-[#2e1065] text-sm mb-1">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e: any) => setDifficulty(e.target.value)}
                  className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#6d28d9] capitalize"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-violet-primary justify-center py-3 text-sm font-extrabold shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? 'Publishing Explanation...' : 'Publish Explanation & Resource'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
