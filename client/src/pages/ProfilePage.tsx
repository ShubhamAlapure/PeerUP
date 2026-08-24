import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, CheckCircle2, Award, BookOpen, Clock, Building, Edit3, Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateProfileData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(currentUser.full_name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfileData({ full_name: fullName, bio });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container py-12 space-y-8">
      {/* Profile Header Banner */}
      <div className="violet-panel p-8 bg-white border-2 border-purple-200 shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={currentUser.full_name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-[#6d28d9] shadow-md"
            />
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
                <span>MIT ADT University • Year {currentUser.year}, Sem {currentUser.semester}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={saving}
            className="btn-violet-primary text-xs px-4 py-2.5"
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </>
            )}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-4 pt-4 border-t border-purple-200">
            <div>
              <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Academic Bio & Specialties</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-700 leading-relaxed font-medium pt-4 border-t border-purple-200">
            {currentUser.bio || 'No bio specified yet.'}
          </p>
        )}
      </div>

      {/* Grid Status Cards */}
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
            <span>Year {currentUser.year} • Sem {currentUser.semester}</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Verified institution enrollment</p>
        </div>
      </div>
    </div>
  );
};
