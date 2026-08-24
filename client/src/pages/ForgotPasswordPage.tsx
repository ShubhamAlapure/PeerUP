import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-md py-16">
      <div className="violet-panel space-y-6 shadow-xl border-2 border-purple-200">
        <div className="space-y-2">
          <Link to="/login" className="inline-flex items-center gap-1 text-xs font-bold text-[#6d28d9] hover:underline mb-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
          <h1 className="text-2xl font-black text-[#2e1065]">Reset Your Password</h1>
          <p className="text-xs text-slate-600 font-medium">Enter your registered email address to receive password reset instructions.</p>
        </div>

        {sent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span className="text-sm font-black">Reset Email Sent!</span>
            </div>
            <p className="font-medium text-emerald-800">
              Check your inbox at <strong>{email}</strong> for the password reset link.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu.in"
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
              <span>{loading ? 'Sending Link...' : 'Send Password Reset Link'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
