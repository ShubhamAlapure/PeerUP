import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getContentList, getAssignments } from '../services/api';
import { supabase } from '../services/supabaseClient';
import { GraduationCap, Search, X, Sparkles, PlusCircle, LayoutDashboard, FolderKanban, Users, MessageSquarePlus, ShieldAlert, LogOut, Edit, ChevronDown } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, session, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [freeCount, setFreeCount] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const handleSearchClick = () => {
    if (!session) {
      navigate('/login');
    }
  };

  useEffect(() => {
    async function loadExactFreeCount() {
      try {
        const uniqueIds = new Set<string>();

        // 1. Fetch free assignment references
        try {
          const assns = await getAssignments({});
          assns.forEach(item => uniqueIds.add(item.id));
        } catch (e) {}

        // 2. Fetch free explanations
        try {
          const cnts = await getContentList({});
          cnts.filter((c: any) => c.is_free || c.price === 0 || c.content_type === 'pdf_explanation')
              .forEach(item => uniqueIds.add(item.id));
        } catch (e) {}

        // 3. Direct Supabase DB query
        try {
          const { data: dbExps } = await supabase
            .from('explanations')
            .select('*')
            .or('is_free.eq.true,price.eq.0,content_type.eq.pdf_explanation');

          if (dbExps) {
            dbExps.forEach(item => uniqueIds.add(item.id));
          }
        } catch (e) {}

        // 4. Local storage user uploads
        try {
          const raw = localStorage.getItem('peerup_user_uploaded_resources');
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.forEach((item: any) => uniqueIds.add(item.id));
          }
        } catch (e) {}

        setFreeCount(uniqueIds.size);
      } catch (e) {
        console.warn('Free count error:', e);
      }
    }
    loadExactFreeCount();
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              onClick={handleSearchClick}
              onChange={(e) => {
                if (!session) {
                  navigate('/login');
                } else {
                  setSearchQuery(e.target.value);
                }
              }}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-purple-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#6d28d9] focus:ring-1 focus:ring-[#6d28d9] transition-all cursor-pointer"
            />
            <button onClick={handleSearchClick} className="absolute right-3 top-2.5 text-purple-600 hover:text-[#6d28d9]">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          <nav className="hidden lg:flex items-center gap-2">
            {/* Dashboard Link */}
            {session && (
              <Link
                to="/dashboard"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive('/dashboard') ? 'bg-[#6d28d9] text-[#6d28d9] bg-purple-100 shadow-xs' : 'text-slate-700 hover:text-[#6d28d9] hover:bg-[#f5f3ff]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}

            {/* Free Repository with Exact Dynamic Item Count */}
            <Link
              to={session ? "/repository" : "/login"}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/repository') ? 'bg-emerald-100 text-emerald-800 shadow-xs' : 'text-slate-700 hover:text-[#6d28d9] hover:bg-[#f5f3ff]'
              }`}
            >
              <FolderKanban className="w-4 h-4 text-emerald-600" />
              <span>Free Repository ({freeCount})</span>
            </Link>

            {/* Verified Peers */}
            <Link
              to={session ? "/peers" : "/login"}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/peers') ? 'bg-purple-100 text-[#6d28d9] shadow-xs' : 'text-slate-700 hover:text-[#6d28d9] hover:bg-[#f5f3ff]'
              }`}
            >
              <Users className="w-4 h-4 text-purple-600" />
              Verified Peers
            </Link>

            {/* Requests - Hidden for Logged In Students */}
            {session && currentUser.role !== 'student' && (
              <Link
                to="/requests"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive('/requests') ? 'bg-amber-100 text-amber-800 shadow-xs' : 'text-slate-700 hover:text-[#6d28d9] hover:bg-[#f5f3ff]'
                }`}
              >
                <MessageSquarePlus className="w-4 h-4 text-amber-600" />
                Requests
              </Link>
            )}

            {session && currentUser.role === 'admin' && (
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

          {/* Become a Peer / Create Explanation Action Button - Hidden for Logged In Students */}
          {(!session || currentUser.role !== 'student') && (
            <Link
              to={session ? "/create-explanation" : "/signup?role=peer"}
              className="btn-violet-primary text-xs py-2 px-3.5 hidden sm:inline-flex"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{session ? "+ Create Explanation" : "Become a Peer"}</span>
            </Link>
          )}

          {/* Logged In User Profile Menu with Interactive Dropdown */}
          {session ? (
            <div className="relative pl-2 border-l border-purple-200" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(prev => !prev)}
                className="bg-[#f5f3ff] hover:bg-purple-100 border border-purple-200 rounded-xl px-3 py-1.5 flex items-center gap-2 transition-all cursor-pointer"
              >
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={currentUser.full_name}
                  className="w-7 h-7 rounded-full object-cover border border-[#6d28d9]"
                />
                <div className="text-left hidden xl:block">
                  <span className="block text-xs font-extrabold text-[#2e1065] leading-none">{currentUser.full_name.split(' ')[0]}</span>
                  <span className="text-[10px] text-[#6d28d9] capitalize leading-none font-bold">{currentUser.role}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#6d28d9] transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu Modal */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-purple-200 rounded-2xl shadow-xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-2.5 bg-[#f8f6ff] rounded-xl border border-purple-100">
                    <span className="block text-xs font-black text-[#2e1065]">{currentUser.full_name}</span>
                    <span className="block text-[10px] text-slate-500 truncate font-medium">{currentUser.email}</span>
                  </div>

                  {/* Option 1: Edit Profile */}
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      navigate('/profile');
                    }}
                    className="w-full p-2.5 text-left text-xs font-bold text-slate-700 hover:text-[#6d28d9] hover:bg-[#f5f3ff] rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-[#6d28d9]" />
                    <span>Edit Profile & PFP</span>
                  </button>

                  {/* Option 2: Log Out */}
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      signOut();
                      navigate('/login');
                    }}
                    className="w-full p-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors border-t border-purple-100 pt-2"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
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
