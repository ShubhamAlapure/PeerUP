import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle, ArrowRight, GraduationCap } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all fields.');
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
      // Redirect new user to 5-step onboarding wizard
      navigate('/onboarding');
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
          <h1 className="text-2xl font-black text-[#2e1065]">Create Student Account</h1>
          <p className="text-xs text-slate-600 font-medium">Join multi-institution peer learning marketplace</p>
        </div>

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
            <label className="block text-xs font-extrabold text-[#2e1065] mb-1">University / Institutional Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@mitadt.edu.in"
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
            className="w-full btn-violet-primary py-3 justify-center text-xs font-extrabold"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : 'Continue to Academic Onboarding'}</span>
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
