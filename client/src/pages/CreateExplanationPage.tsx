import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createExplanation, getInstitutions } from '../services/api';
import { MediaStudioRecorder } from '../components/MediaStudioRecorder';
import { AcademicIntegrityNotice } from '../components/AcademicIntegrityNotice';
import type { ContentType, Institution } from '../types';
import { PlusCircle, Video, Mic, FileText, FileSpreadsheet, CheckCircle, AlertCircle, Building } from 'lucide-react';

export const CreateExplanationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [contentType, setContentType] = useState<ContentType>('video');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(20);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [markdownText, setMarkdownText] = useState('');
  const [durationSeconds, setDurationSeconds] = useState<number>(300);

  // Academic Mapping Fields (University, Specialization, Year, Semester, Subject)
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>('inst-mit-adt');
  const [specialization, setSpecialization] = useState<string>('Computer Science & Engineering (CSE)');
  const [academicYear, setAcademicYear] = useState<number>(2);
  const [semester, setSemester] = useState<number>(3);
  const [subjectName, setSubjectName] = useState<string>('Database Management Systems (DBMS)');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('Please provide a title for your explanation.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

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
        difficulty,
        markdown_text: markdownText,
        duration_seconds: durationSeconds
      };

      await createExplanation(payload);
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
        <h1 className="text-3xl font-black text-[#2e1065]">Create & Publish Explanation</h1>
        <p className="text-sm text-slate-600 font-medium">Categorize your explanation by University, Specialization, Year & Semester for instant student discovery.</p>
      </div>

      <AcademicIntegrityNotice />

      {success ? (
        <div className="violet-panel text-center py-12 space-y-4">
          <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto" />
          <h2 className="text-2xl font-black text-[#2e1065]">Explanation Published!</h2>
          <p className="text-sm text-slate-600 font-medium">Your explanation is now live and filterable by students under your selected University, Program & Semester.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="violet-panel space-y-8">
          {/* Step 1: Format */}
          <div className="space-y-3">
            <label className="block font-extrabold text-[#2e1065] text-sm">Step 1: Choose Explanation Format</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => { setContentType('video'); setPrice(20); }}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                  contentType === 'video' ? 'bg-[#6d28d9] border-[#6d28d9] text-white shadow-md' : 'bg-[#f8f6ff] border-purple-200 text-slate-700 hover:bg-purple-100'
                }`}
              >
                <Video className="w-6 h-6 text-purple-200" />
                <span>Video (Max 10m)</span>
              </button>

              <button
                type="button"
                onClick={() => { setContentType('audio'); setPrice(15); }}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                  contentType === 'audio' ? 'bg-[#6d28d9] border-[#6d28d9] text-white shadow-md' : 'bg-[#f8f6ff] border-purple-200 text-slate-700 hover:bg-purple-100'
                }`}
              >
                <Mic className="w-6 h-6 text-emerald-400" />
                <span>Audio Walkthrough</span>
              </button>

              <button
                type="button"
                onClick={() => { setContentType('text'); setPrice(10); }}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                  contentType === 'text' ? 'bg-[#6d28d9] border-[#6d28d9] text-white shadow-md' : 'bg-[#f8f6ff] border-purple-200 text-slate-700 hover:bg-purple-100'
                }`}
              >
                <FileText className="w-6 h-6 text-purple-300" />
                <span>Text Explanation</span>
              </button>

              <button
                type="button"
                onClick={() => { setContentType('pdf_explanation'); setPrice(25); }}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                  contentType === 'pdf_explanation' ? 'bg-[#6d28d9] border-[#6d28d9] text-white shadow-md' : 'bg-[#f8f6ff] border-purple-200 text-slate-700 hover:bg-purple-100'
                }`}
              >
                <FileSpreadsheet className="w-6 h-6 text-amber-300" />
                <span>PDF + Explanation</span>
              </button>
            </div>
          </div>

          {/* Step 2: Academic Mapping (University, Specialization, Year, Sem, Subject) */}
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
                  <option value="inst-jspm">JSPM Institutes (Pune)</option>
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
                  <option value="User Experience & Design">User Experience & Design (B.Des)</option>
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
                  <option value={1}>1st Year (First Year Engineering)</option>
                  <option value={2}>2nd Year (Second Year / SE)</option>
                  <option value={3}>3rd Year (Third Year / TE)</option>
                  <option value={4}>4th Year (Final Year / BE)</option>
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
                  placeholder="e.g. Database Management Systems"
                  className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
                />
              </div>
            </div>
          </div>

          {/* Embedded Recording Studio for Video/Audio */}
          {(contentType === 'video' || contentType === 'audio') && (
            <div className="space-y-2 pt-4 border-t border-purple-200">
              <label className="block font-extrabold text-[#2e1065] text-sm">Step 3: Media Recording Studio</label>
              <MediaStudioRecorder mode={contentType} onMediaCaptured={handleMediaCaptured} />
            </div>
          )}

          {/* Text editor for Text explanation */}
          {contentType === 'text' && (
            <div className="space-y-2 pt-4 border-t border-purple-200">
              <label className="block font-extrabold text-[#2e1065] text-sm">Step 3: Rich Text Body (Markdown Supported)</label>
              <textarea
                rows={6}
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
                placeholder="e.g. Master Normalization (1NF to BCNF) with Examples"
                className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#6d28d9]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#2e1065] text-sm mb-1">Description & Key Takeaways</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summary of what students will learn from this explanation..."
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
                  className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#6d28d9]"
                />
                <span className="text-[10px] text-slate-500 font-bold">Set ₹0 for Free reference access</span>
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
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-violet-primary justify-center py-3 text-sm font-extrabold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? 'Publishing Explanation...' : 'Publish Explanation'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
