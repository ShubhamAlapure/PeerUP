import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle, ArrowRight, GraduationCap, UserCheck, Award } from 'lucide-react';
import type { UserRole } from '../types';

export const SignupPage: React.FC = () => {
  const { signUp, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [signupRole, setSignupRole] = useState<UserRole>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role') as UserRole;
    if (roleParam === 'peer' || roleParam === 'student') {
      setSignupRole(roleParam);
    }
  }, [location.search]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signUp(email, password, fullName);
      switchRole(signupRole);
      // Redirect user to onboarding wizard pre-configured for their role
      navigate(`/onboarding?role=${signupRole}`);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-md py-16">
      <div className="violet-panel space-y-6 shadow-xl border-2 border-purple-200">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#6d28d9] text-white flex items-center justify-center mx-auto shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-[#2e1065]">Create Account</h1>
          <p className="text-xs text-slate-600 font-medium">Join multi-institution peer learning marketplace</p>
        </div>

        {/* Dedicated Learner vs Peer Tutor Signup Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#f8f6ff] border border-purple-200 rounded-2xl">
          <button
            type="button"
            onClick={() => setSignupRole('student')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              signupRole === 'student'
                ? 'bg-[#6d28d9] text-white shadow-md'
                : 'text-slate-700 hover:text-[#6d28d9]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Student Learner</span>
          </button>

          <button
            type="button"
            onClick={() => setSignupRole('peer')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              signupRole === 'peer'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-700 hover:text-emerald-700'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Become a Peer</span>
          </button>
        </div>

        {signupRole === 'peer' ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-xl space-y-1">
            <p className="font-black text-sm text-emerald-800">Become a Campus Peer Educator 🎓</p>
            <p className="text-[11px] font-medium text-emerald-700">
              Share 10-min video explanations, upload reference solutions, and earn money directly to your UPI/bank account.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-purple-50 border border-purple-200 text-[#2e1065] text-xs font-medium rounded-xl">
            <strong>Student Learner Account:</strong> Access free assignment repository, explore university course trees, and unlock senior peer explanations.
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rohit Verma"
                className="w-full pl-9 pr-3 py-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-[#6d28d9]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#2e1065] mb-1">
              {signupRole === 'peer' ? 'Institutional Email (Required for Verification)' : 'University / Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={signupRole === 'peer' ? 'tutor@mitadt.edu.in' : 'student@mitadt.edu.in'}
                className="w-full pl-9 pr-3 py-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-[#6d28d9]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Create Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-[#6d28d9]"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 justify-center text-xs font-extrabold flex items-center gap-2 text-white rounded-xl shadow-md transition-all ${
              signupRole === 'peer'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-[#6d28d9] hover:bg-[#5b21b6]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : `Register as ${signupRole === 'peer' ? 'Peer Educator' : 'Student Learner'}`}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-purple-200 text-center text-xs font-medium text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-extrabold text-[#6d28d9] hover:underline inline-flex items-center gap-0.5">
            <span>Log in</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
