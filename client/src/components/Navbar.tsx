import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Search, X, Sparkles, PlusCircle, LayoutDashboard, FolderKanban, Users, MessageSquarePlus, ShieldAlert, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, session, signOut, switchRole } = useAuth();
  const location = useLocation();
  const [showBanner, setShowBanner] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white text-[#2e1065] shadow-xs border-b border-purple-200">
      {/* Top Banner Announcement */}
      {showBanner && (
        <div className="bg-[#f5f3ff] border-b border-purple-200 text-[#6d28d9] py-2 px-4 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto">
            <Sparkles className="w-4 h-4 text-[#6d28d9]" />
            <span>
              <strong>PeerUP Academic Marketplace.</strong> Save up to 20% on explanations with code <span className="font-bold underline text-[#6d28d9]">PEERUP2026</span>.{' '}
              <a href="#" className="underline font-bold hover:text-[#5b21b6]">Learn more</a>.
            </span>
          </div>
          <button onClick={() => setShowBanner(false)} className="text-purple-400 hover:text-[#6d28d9] ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Pure White Navbar Bar */}
      <div className="page-container h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6d28d9] to-purple-500 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-[#2e1065] font-sans">
              Peer<span className="text-[#6d28d9]">UP</span>
            </span>
            <span className="block text-[10px] text-[#6d28d9] font-bold tracking-wider uppercase">Academic Marketplace</span>
          </div>
        </Link>

        {/* Global Search Input */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search subjects, topics, or assignment references..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-purple-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#6d28d9] focus:ring-1 focus:ring-[#6d28d9] transition-all"
            />
            <button className="absolute right-3 top-2.5 text-purple-600 hover:text-[#6d28d9]">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          <nav className="hidden lg:flex items-center gap-2">
            <Link
              to="/dashboard"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/dashboard') ? 'bg-[#6d28d9] text-white shadow-md' : 'text-slate-700 hover:text-[#6d28d9] hover:bg-[#f5f3ff]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              to="/repository"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/repository') ? 'bg-[#6d28d9] text-white shadow-md' : 'text-slate-700 hover:text-[#6d28d9] hover:bg-[#f5f3ff]'
              }`}
            >
              <FolderKanban className="w-4 h-4 text-emerald-600" />
              Free Repository
            </Link>

            <Link
              to="/peers"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/peers') ? 'bg-[#6d28d9] text-white shadow-md' : 'text-slate-700 hover:text-[#6d28d9] hover:bg-[#f5f3ff]'
              }`}
            >
              <Users className="w-4 h-4 text-purple-600" />
              Verified Peers
            </Link>

            <Link
              to="/requests"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/requests') ? 'bg-[#6d28d9] text-white shadow-md' : 'text-slate-700 hover:text-[#6d28d9] hover:bg-[#f5f3ff]'
              }`}
            >
              <MessageSquarePlus className="w-4 h-4 text-amber-600" />
              Requests
            </Link>

            {currentUser.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive('/admin') ? 'bg-amber-600 text-white' : 'text-amber-700 hover:bg-amber-100'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          {/* User Pill & Role Switcher */}
          <div className="bg-[#f5f3ff] p-1 rounded-xl border border-purple-200 text-xs font-bold flex items-center">
            <button
              onClick={() => switchRole('student')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                currentUser.role === 'student' ? 'bg-[#6d28d9] text-white shadow-xs' : 'text-[#6d28d9] hover:text-[#5b21b6]'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => switchRole('peer')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                currentUser.role === 'peer' ? 'bg-emerald-600 text-white shadow-xs' : 'text-[#6d28d9] hover:text-[#5b21b6]'
              }`}
            >
              Peer
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                currentUser.role === 'admin' ? 'bg-amber-600 text-white shadow-xs' : 'text-[#6d28d9] hover:text-[#5b21b6]'
              }`}
            >
              Admin
            </button>
          </div>

          <Link to="/onboarding" className="btn-violet-primary text-xs py-2 px-3.5 hidden sm:inline-flex">
            <PlusCircle className="w-4 h-4" />
            <span>Become a Peer</span>
          </Link>

          {/* Auth Controls / User Profile */}
          {session ? (
            <div className="flex items-center gap-2 pl-2 border-l border-purple-200">
              <Link to="/profile" className="bg-[#f5f3ff] hover:bg-purple-100 border border-purple-200 rounded-xl px-3 py-1.5 flex items-center gap-2 transition-all">
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  className="w-7 h-7 rounded-full object-cover border border-[#6d28d9]"
                />
                <div className="text-left hidden xl:block">
                  <span className="block text-xs font-extrabold text-[#2e1065] leading-none">{currentUser.full_name}</span>
                  <span className="text-[10px] text-[#6d28d9] capitalize leading-none font-bold">{currentUser.role}</span>
                </div>
              </Link>
              <button
                onClick={() => signOut()}
                className="p-2 text-slate-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-purple-200">
              <Link to="/login" className="btn-violet-secondary text-xs py-2 px-3">
                Log In
              </Link>
              <Link to="/signup" className="btn-violet-primary text-xs py-2 px-3">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
