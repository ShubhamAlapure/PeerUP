import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getContentList, getPeers, getInstitutions, getUserPurchases } from '../services/api';
import { supabase } from '../services/supabaseClient';
import type { ContentItem, PeerProfile, Institution } from '../types';
import { ContentCard } from '../components/ContentCard';
import { PeerCard } from '../components/PeerCard';
import { AcademicIntegrityNotice } from '../components/AcademicIntegrityNotice';
import { Building, BookOpen, Users, FolderKanban, ArrowRight, Sparkles, MessageSquarePlus, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const defaultFallbackPeers: any[] = [
  {
    id: 'peer_89b7789d-087d-4517-a0eb-534f8a28c0ac',
    user_id: '89b7789d-087d-4517-a0eb-534f8a28c0ac',
    user_name: 'Atharv Sadewad',
    full_name: 'Atharv Sadewad',
    email: 'atharv@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    institution_id: 'inst-mit-adt',
    institution_name: 'MIT ADT University (Pune)',
    verification_status: 'verified',
    bio: 'Cyber Security & Forensics Senior Peer Tutor.',
    average_rating: 5.0,
    learners_helped: 142,
    helpful_percentage: 100
  },
  {
    id: 'peer_a607ecb3-4508-44bd-9ed7-8206ea06b42c',
    user_id: 'a607ecb3-4508-44bd-9ed7-8206ea06b42c',
    user_name: 'Swaraj Ingle',
    full_name: 'Swaraj Ingle',
    email: 'swaraj@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    institution_id: 'inst-mit-adt',
    institution_name: 'MIT ADT University (Pune)',
    verification_status: 'verified',
    bio: 'AIA Specialist & Artificial Intelligence Senior Peer Educator.',
    average_rating: 5.0,
    learners_helped: 142,
    helpful_percentage: 100
  },
  {
    id: 'peer-3',
    user_id: 'usr-peer-3',
    user_name: 'Shubham Alapure',
    full_name: 'Shubham Alapure',
    email: 'shubham@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    institution_id: 'inst-mit-adt',
    institution_name: 'MIT ADT University (Pune)',
    verification_status: 'verified',
    bio: 'Specializing in DBMS, SQL Optimization, and System Architecture.',
    average_rating: 4.9,
    learners_helped: 127,
    helpful_percentage: 96
  },
  {
    id: 'peer-2',
    user_id: 'usr-peer-2',
    user_name: 'Ananya Sharma',
    full_name: 'Ananya Sharma',
    email: 'ananya@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    institution_id: 'inst-coep',
    institution_name: 'COEP Technological University (Pune)',
    verification_status: 'verified',
    bio: 'Data Structures, Algorithms & Operating Systems.',
    average_rating: 4.95,
    learners_helped: 310,
    helpful_percentage: 98
  }
];

export const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [recommendedContent, setRecommendedContent] = useState<ContentItem[]>([]);
  const [peers, setPeers] = useState<PeerProfile[]>(defaultFallbackPeers);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'recommended' | 'peers' | 'purchases'>('recommended');
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const insts = await getInstitutions();
        const foundInst = insts.find(i => i.id === currentUser.institution_id) || insts[0];
        setInstitution(foundInst);

        const cnts = await getContentList({});
        setRecommendedContent(cnts);

        // Fetch real-time peers from DB to calculate exact tutor count
        let dbPeers: any[] = [];
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .or('role.eq.peer,email.eq.atharv@gmail.com,email.eq.swaraj@gmail.com');

          if (data && data.length > 0) {
            dbPeers = data.map((p: any) => ({
              id: `peer_${p.id}`,
              user_id: p.id,
              user_name: p.full_name || (p.email?.includes('swaraj') ? 'Swaraj Ingle' : 'Atharv Sadewad'),
              full_name: p.full_name || (p.email?.includes('swaraj') ? 'Swaraj Ingle' : 'Atharv Sadewad'),
              email: p.email,
              avatar_url: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
              institution_id: p.institution_id || 'inst-mit-adt',
              institution_name: 'MIT ADT University (Pune)',
              verification_status: 'verified',
              bio: p.bio || 'Verified Senior Peer Educator on PeerUP Marketplace.',
              average_rating: 5.0,
              learners_helped: 142,
              helpful_percentage: 100
            }));
          }
        } catch (e) {
          console.warn('DB peers count notice:', e);
        }

        let apiPeers: any[] = [];
        try {
          apiPeers = await getPeers();
        } catch (e) {
          console.warn('API peers notice:', e);
        }

        const existingEmails = new Set(dbPeers.map(dp => dp.email?.toLowerCase()));
        const mergedApi = apiPeers.filter(ap => !existingEmails.has(ap.email?.toLowerCase()));
        mergedApi.forEach(ap => existingEmails.add(ap.email?.toLowerCase()));

        const mergedFallback = defaultFallbackPeers.filter(fp => !existingEmails.has(fp.email?.toLowerCase()));

        const finalPeersList = [...dbPeers, ...mergedApi, ...mergedFallback];
        setPeers(finalPeersList);

        const prchs = await getUserPurchases(currentUser.id);
        setPurchases(prchs);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [currentUser]);

  const isPeerRole = currentUser.role === 'peer';

  return (
    <div className="page-container py-8 space-y-8">
      {/* Modern Sleek Greeting Header */}
      <div className="bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#8b5cf6] text-white p-8 rounded-3xl shadow-lg border border-purple-300/30 relative overflow-hidden">
        {/* Decorative Backdrop Elements */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div className="absolute right-40 top-0 w-32 h-32 rounded-full bg-purple-300/20 blur-xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/80 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white" title="Active Learning Status">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-3 py-0.5 rounded-full border border-white/30">
                  Year {currentUser.year || 3} • Semester {currentUser.semester || 5}
                </span>
                <span className="bg-emerald-400/20 text-emerald-200 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-400/30 capitalize">
                  {currentUser.role === 'peer' ? 'Verified Peer Tutor' : 'Enrolled Student'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Welcome back, {currentUser.full_name.split(' ')[0]} 👋
              </h1>

              {institution && (
                <p className="text-xs text-purple-100 font-semibold flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-purple-200" />
                  <span>{institution.name} ({institution.city})</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick Metrics & Actions Pills */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shrink-0">
            <div className="px-4 py-2 text-center border-r border-white/20">
              <span className="text-[10px] font-extrabold text-purple-200 uppercase tracking-wider block">Unlocked</span>
              <span className="text-xl font-black text-white">{purchases.length} Items</span>
            </div>

            <div className="px-4 py-2 text-center">
              <span className="text-[10px] font-extrabold text-purple-200 uppercase tracking-wider block">Tutors</span>
              <span className="text-xl font-black text-white">{peers.length} Peers</span>
            </div>

            {isPeerRole ? (
              <Link to="/create-explanation" className="btn-purple-primary bg-white text-[#6d28d9] hover:bg-purple-50 text-xs py-2.5 px-4 font-black shadow-md border-0 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-[#6d28d9]" />
                <span>+ Create Explanation</span>
              </Link>
            ) : (
              <Link to="/requests" className="btn-purple-primary bg-white text-[#6d28d9] hover:bg-purple-50 text-xs py-2.5 px-4 font-black shadow-md border-0 flex items-center gap-1.5">
                <MessageSquarePlus className="w-4 h-4 text-[#6d28d9]" />
                <span>⚡ Request Topic</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <AcademicIntegrityNotice />

      {/* Modern 4-Column Quick Hub Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-[#2e1065] tracking-tight">Learning Hub & Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Action 1 */}
          <Link to="/repository" className="violet-card p-5 bg-white hover:border-[#6d28d9] transition-all group flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6d28d9] flex items-center justify-center font-extrabold group-hover:scale-110 transition-transform">
                <FolderKanban className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">FREE</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2e1065] group-hover:text-[#6d28d9] transition-colors">Free Repository</h3>
              <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1">Previous year worked solutions & study guides.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#6d28d9] pt-2">
              <span>Browse Materials</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Action 2 */}
          <Link to={institution ? `/institution/${institution.id}` : '/'} className="violet-card p-5 bg-white hover:border-[#6d28d9] transition-all group flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">CURRICULUM</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2e1065] group-hover:text-[#6d28d9] transition-colors">Course Tree</h3>
              <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1">Structured topics by Department & Semester.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-blue-600 pt-2">
              <span>Explore Subjects</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Action 3 */}
          <Link to="/peers" className="violet-card p-5 bg-white hover:border-[#6d28d9] transition-all group flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-extrabold group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">VERIFIED</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2e1065] group-hover:text-[#6d28d9] transition-colors">Campus Tutors</h3>
              <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1">Senior students ready for video & audio help.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-purple-600 pt-2">
              <span>Find Peer Tutors</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Action 4 */}
          <Link to="/requests" className="violet-card p-5 bg-white hover:border-[#6d28d9] transition-all group flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-extrabold group-hover:scale-110 transition-transform">
                <MessageSquarePlus className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">REQUEST</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#2e1065] group-hover:text-[#6d28d9] transition-colors">Topic Requests</h3>
              <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1">Ask senior peers to explain missing topics.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 pt-2">
              <span>Ask a Question</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Modern Filter Tabs Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('recommended')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'recommended'
                  ? 'bg-[#6d28d9] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-purple-50'
              }`}
            >
              Recommended Explanations
            </button>
            <button
              onClick={() => setActiveTab('peers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'peers'
                  ? 'bg-[#6d28d9] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-purple-50'
              }`}
            >
              Verified Campus Peers ({peers.length})
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'purchases'
                  ? 'bg-[#6d28d9] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-purple-50'
              }`}
            >
              My Unlocked Content ({purchases.length})
            </button>
          </div>

          <Link to="/repository" className="text-xs font-bold text-[#6d28d9] hover:underline flex items-center gap-1">
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tab 1: Recommended Content */}
        {activeTab === 'recommended' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedContent.map(item => (
              <ContentCard key={item.id} content={item} />
            ))}
          </div>
        )}

        {/* Tab 2: Campus Peers */}
        {activeTab === 'peers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {peers.map(peer => (
              <PeerCard key={peer.id} peer={peer} />
            ))}
          </div>
        )}

        {/* Tab 3: My Unlocked Content */}
        {activeTab === 'purchases' && (
          <div>
            {purchases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchases.map(p => p.content && <ContentCard key={p.id} content={p.content} />)}
              </div>
            ) : (
              <div className="violet-panel text-center text-slate-500 text-xs py-12 font-medium">
                No purchases yet. Explore paid explanations above to unlock video & audio topics.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
