import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, GraduationCap, UserCheck, Award } from 'lucide-react';
import type { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { signIn, switchRole } = useAuth();
  const navigate = useNavigate();

  const [loginRole, setLoginRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email address and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signIn(email, password);
      switchRole(loginRole);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password credentials.');
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
          <h1 className="text-2xl font-black text-[#2e1065]">Welcome Back to PeerUP</h1>
          <p className="text-xs text-slate-600 font-medium">Select your portal role to log in</p>
        </div>

        {/* Learner vs Peer Tutor Role Toggle Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#f8f6ff] border border-purple-200 rounded-2xl">
          <button
            type="button"
            onClick={() => setLoginRole('student')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              loginRole === 'student'
                ? 'bg-[#6d28d9] text-white shadow-md'
                : 'text-slate-700 hover:text-[#6d28d9]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Student Learner</span>
          </button>

          <button
            type="button"
            onClick={() => setLoginRole('peer')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              loginRole === 'peer'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-700 hover:text-emerald-700'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Peer Tutor</span>
          </button>
        </div>

        {loginRole === 'peer' && (
          <div className="p-3 bg-purple-50 border border-purple-200 text-[#2e1065] text-xs font-medium rounded-xl">
            <strong>Peer Educator Portal:</strong> Logging in as campus tutor to manage explanations & earnings.
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-[#2e1065] mb-1">
              {loginRole === 'peer' ? 'Institutional / Tutor Email' : 'Student Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={loginRole === 'peer' ? 'tutor@university.edu.in' : 'student@university.edu.in'}
                className="w-full pl-9 pr-3 py-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-[#6d28d9]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-extrabold text-[#2e1065]">Password</label>
              <Link to="/forgot-password" className="text-[11px] font-bold text-[#6d28d9] hover:underline">
                Forgot password?
              </Link>
            </div>
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
              loginRole === 'peer'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-[#6d28d9] hover:bg-[#5b21b6]'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : `Log In as ${loginRole === 'peer' ? 'Peer Educator' : 'Student'}`}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-purple-200 text-center text-xs font-medium text-slate-600">
          Don't have an account?{' '}
          <Link to={`/signup?role=${loginRole}`} className="font-extrabold text-[#6d28d9] hover:underline inline-flex items-center gap-0.5">
            <span>Register as {loginRole === 'peer' ? 'Peer Tutor' : 'Student'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
