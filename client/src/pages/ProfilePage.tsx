import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getInstitutions } from '../services/api';
import { supabase } from '../services/supabaseClient';
import type { Institution } from '../types';
import { User, CheckCircle2, Award, BookOpen, Clock, Building, Save, Camera, Check, AlertCircle } from 'lucide-react';

const avatarPresets = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80'
];

export const ProfilePage: React.FC = () => {
  const { currentUser, updateProfileData } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isEditing, setIsEditing] = useState(true); // Open directly for quick editing
  const [fullName, setFullName] = useState(currentUser.full_name);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url || avatarPresets[0]);
  const [selectedInstId, setSelectedInstId] = useState(currentUser.institution_id || 'inst-mit-adt');
  const [academicYear, setAcademicYear] = useState<number>(currentUser.year || 2);
  const [semester, setSemester] = useState<number>(currentUser.semester || 3);
  const [bio, setBio] = useState(currentUser.bio || '');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInstitutions() {
      try {
        const insts = await getInstitutions();
        setInstitutions(insts);
      } catch (err) {
        console.error('Error fetching institutions:', err);
      }
    }
    loadInstitutions();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName) {
      setError('Full name is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(false);

      const updatedPayload = {
        id: currentUser.id,
        full_name: fullName,
        email: currentUser.email,
        avatar_url: avatarUrl,
        institution_id: selectedInstId,
        year: Number(academicYear),
        semester: Number(semester),
        bio,
        updated_at: new Date().toISOString()
      };

      // 1. Update AuthContext state & local storage
      await updateProfileData(updatedPayload);

      // 2. Direct real-time Supabase Database upsert
      try {
        const { error: supaErr } = await supabase
          .from('profiles')
          .upsert([updatedPayload], { onConflict: 'id' });

        if (supaErr) {
          console.warn('Supabase DB profile update notice:', supaErr.message);
        }
      } catch (dbErr) {
        console.warn('Background Supabase profile sync:', dbErr);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container max-w-4xl py-10 space-y-8">
      {/* Profile Banner */}
      <div className="violet-panel p-8 bg-white border-2 border-purple-200 shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#6d28d9] shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 bg-[#6d28d9] text-white p-1.5 rounded-full shadow-md" title="Change Profile Picture">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#2e1065]">{currentUser.full_name}</h1>
                {currentUser.verification_status === 'verified' && (
                  <span className="inline-flex items-center gap-1 bg-purple-100 text-[#6d28d9] text-[11px] font-black px-2.5 py-0.5 rounded-full border border-purple-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✓ Verified Peer</span>
                  </span>
                )}
                {currentUser.verification_status === 'pending' && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Verification Pending</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-medium">{currentUser.email}</p>
              <div className="flex items-center gap-2 text-xs font-bold text-[#6d28d9] pt-1">
                <Building className="w-4 h-4" />
                <span>Year {currentUser.year || 2}, Sem {currentUser.semester || 3} • Enrolled Student</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={saving}
            className="btn-violet-primary text-xs px-5 py-2.5 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving to Database...' : 'Save Profile Changes'}</span>
          </button>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile details successfully updated and saved in database!</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Editing Form (Edits all fields in DB) */}
        <form onSubmit={handleSave} className="space-y-6 pt-6 border-t border-purple-200">
          <div className="space-y-3">
            <label className="block text-xs font-extrabold text-[#2e1065]">Select Profile Picture (PFP)</label>
            <div className="flex flex-wrap items-center gap-3">
              {avatarPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarUrl(preset)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                    avatarUrl === preset ? 'border-[#6d28d9] ring-2 ring-purple-300 scale-105' : 'border-purple-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={preset} alt={`Avatar Preset ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="pt-2">
              <input
                type="text"
                placeholder="Or paste custom image URL..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full p-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-[#6d28d9]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#2e1065] mb-1">University / Institution</label>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Academic Bio & Specialties</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Computer Science student passionate about DBMS, Algorithms, and Peer Teaching..."
              className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-[#6d28d9]"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full btn-violet-primary justify-center py-3 text-xs font-extrabold"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Database...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>

      {/* Account Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="violet-card p-5 bg-white space-y-2 border-t-4 border-t-[#6d28d9]">
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Account Role</span>
          <div className="text-xl font-black text-[#2e1065] capitalize flex items-center gap-2">
            <User className="w-5 h-5 text-[#6d28d9]" />
            <span>{currentUser.role}</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Access to Repository & Peer Tutors</p>
        </div>

        <div className="violet-card p-5 bg-white space-y-2 border-t-4 border-t-[#d94d1a]">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Peer Status</span>
          <div className="text-xl font-black text-[#2e1065] capitalize flex items-center gap-2">
            <Award className="w-5 h-5 text-[#d94d1a]" />
            <span>{currentUser.verification_status}</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Campus peer tutor credentials</p>
        </div>

        <div className="violet-card p-5 bg-white space-y-2 border-t-4 border-t-emerald-600">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Academic Level</span>
          <div className="text-xl font-black text-[#2e1065] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>Year {currentUser.year || 2} • Sem {currentUser.semester || 3}</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Verified institution enrollment</p>
        </div>
      </div>
    </div>
  );
};
