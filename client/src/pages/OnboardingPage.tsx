import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInstitutions } from '../services/api';
import type { Institution } from '../types';
import { Building, CheckCircle2, ChevronRight, ArrowLeft, GraduationCap, ShieldCheck } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { updateProfileData } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [_loadingInsts, setLoadingInsts] = useState(true);

  // Onboarding Form State
  const [selectedInstId, setSelectedInstId] = useState('inst-mit-adt');
  const [department, setDepartment] = useState('Computer Engineering (CSE)');
  const [program, setProgram] = useState('B.Tech Computer Science & Engineering');
  const [year, setYear] = useState<number>(2);
  const [semester, setSemester] = useState<number>(3);
  const [isPeer, setIsPeer] = useState<boolean>(false);
  const [peerBio, setPeerBio] = useState<string>('Senior student passionate about explaining DBMS, SQL, and Algorithms.');
  const [idCardUrl, setIdCardUrl] = useState<string>('https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadInstitutions() {
      try {
        const insts = await getInstitutions();
        setInstitutions(insts);
      } catch (err) {
        console.error('Error loading institutions for onboarding:', err);
      } finally {
        setLoadingInsts(false);
      }
    }
    loadInstitutions();
  }, []);

  const handleFinishOnboarding = async () => {
    try {
      setSaving(true);
      await updateProfileData({
        institution_id: selectedInstId,
        year,
        semester,
        role: isPeer ? 'peer' : 'student',
        verification_status: isPeer ? 'pending' : 'unverified',
        is_onboarded: true,
        bio: peerBio
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container max-w-2xl py-12">
      <div className="violet-panel space-y-8 shadow-xl border-2 border-purple-200">
        {/* Step Progress Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#6d28d9] text-white flex items-center justify-center font-black text-sm shadow-md">
                {step}
              </div>
              <div>
                <span className="block text-[10px] font-black text-[#6d28d9] uppercase tracking-wider">Step {step} of 4</span>
                <h1 className="text-xl font-black text-[#2e1065]">
                  {step === 1 && 'Select Your Institution'}
                  {step === 2 && 'Select Department & Program'}
                  {step === 3 && 'Academic Year & Semester'}
                  {step === 4 && 'Become a Peer Educator'}
                </h1>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-500">{Math.round((step / 4) * 100)}% Completed</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6d28d9] to-purple-500 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Select Institution */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs font-medium text-slate-600">Choose your university or engineering college in Pune & Maharashtra:</p>
            <div className="space-y-3">
              {institutions.map((inst) => (
                <button
                  key={inst.id}
                  type="button"
                  onClick={() => setSelectedInstId(inst.id)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    selectedInstId === inst.id
                      ? 'bg-purple-50 border-2 border-[#6d28d9] shadow-xs'
                      : 'bg-[#f8f6ff] border-purple-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-purple-200 flex items-center justify-center overflow-hidden shrink-0">
                      <Building className="w-5 h-5 text-[#6d28d9]" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#2e1065]">{inst.name}</h3>
                      <p className="text-[11px] font-semibold text-slate-500">{inst.city}, {inst.state} • {inst.type}</p>
                    </div>
                  </div>
                  {selectedInstId === inst.id && <CheckCircle2 className="w-5 h-5 text-[#6d28d9]" />}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="w-full btn-violet-primary py-3 justify-center text-xs font-extrabold">
              <span>Next: Department & Program</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Select Department & Program */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
              >
                <option value="Computer Engineering (CSE)">Computer Engineering (CSE)</option>
                <option value="Information Technology (IT)">Information Technology (IT)</option>
                <option value="Electronics & Telecom (E&TC)">Electronics & Telecom (E&TC)</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Design & Innovation">School of Design & Fine Arts</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Degree Program / Course</label>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
              >
                <option value="B.Tech Computer Science & Engineering">B.Tech Computer Science & Engineering</option>
                <option value="B.Tech Artificial Intelligence & Data Science">B.Tech Artificial Intelligence & Data Science</option>
                <option value="B.Tech Information Technology">B.Tech Information Technology</option>
                <option value="B.Des User Experience Design">B.Des User Experience Design</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => setStep(1)} className="btn-violet-secondary py-3 px-4 text-xs font-bold">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button onClick={() => setStep(3)} className="flex-1 btn-violet-primary py-3 justify-center text-xs font-extrabold">
                <span>Next: Academic Year & Semester</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Academic Year & Semester */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-extrabold text-[#2e1065] mb-2">Current Academic Year</label>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((yrNum) => (
                  <button
                    key={yrNum}
                    type="button"
                    onClick={() => setYear(yrNum)}
                    className={`p-3 rounded-xl border text-center font-black text-xs transition-all ${
                      year === yrNum ? 'bg-[#6d28d9] text-white border-[#6d28d9] shadow-sm' : 'bg-[#f8f6ff] border-purple-200 text-slate-700 hover:bg-purple-100'
                    }`}
                  >
                    Year {yrNum}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#2e1065] mb-2">Current Semester</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((semNum) => (
                  <button
                    key={semNum}
                    type="button"
                    onClick={() => setSemester(semNum)}
                    className={`p-2.5 rounded-xl border text-center font-black text-xs transition-all ${
                      semester === semNum ? 'bg-[#6d28d9] text-white border-[#6d28d9] shadow-sm' : 'bg-[#f8f6ff] border-purple-200 text-slate-700 hover:bg-purple-100'
                    }`}
                  >
                    Sem {semNum}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => setStep(2)} className="btn-violet-secondary py-3 px-4 text-xs font-bold">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button onClick={() => setStep(4)} className="flex-1 btn-violet-primary py-3 justify-center text-xs font-extrabold">
                <span>Next: Peer Educator Option</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Become a Peer Tutor Option */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="p-5 bg-purple-50 rounded-2xl border-2 border-purple-200 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#6d28d9] text-white flex items-center justify-center font-bold shadow-xs">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[#2e1065]">Become a Verified Peer Tutor</h3>
                    <p className="text-xs text-slate-600 font-medium">Earn money sharing video explanations & assignment solutions</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPeer}
                    onChange={(e) => setIsPeer(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6d28d9]"></div>
                </label>
              </div>

              {isPeer && (
                <div className="space-y-3 pt-3 border-t border-purple-200">
                  <div>
                    <label className="block text-xs font-bold text-[#2e1065] mb-1">Tutor Bio & Subject Specialties</label>
                    <textarea
                      rows={3}
                      value={peerBio}
                      onChange={(e) => setPeerBio(e.target.value)}
                      placeholder="Share your expertise in DBMS, OS, Java, or Math..."
                      className="w-full p-3 bg-white border border-purple-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2e1065] mb-1">Student ID Card / Proof URL</label>
                    <input
                      type="text"
                      value={idCardUrl}
                      onChange={(e) => setIdCardUrl(e.target.value)}
                      className="w-full p-3 bg-white border border-purple-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 font-bold">Verification takes ~24 hours by campus admin</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setStep(3)} className="btn-violet-secondary py-3 px-4 text-xs font-bold">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={handleFinishOnboarding}
                disabled={saving}
                className="flex-1 btn-violet-primary py-3 justify-center text-xs font-extrabold"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{saving ? 'Saving Profile...' : 'Complete Onboarding & Enter Dashboard'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
