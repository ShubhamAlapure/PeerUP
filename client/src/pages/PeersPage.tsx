import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPeers } from '../services/api';
import { supabase } from '../services/supabaseClient';
import { Star, Users, ThumbsUp, ArrowRight, Award, Sparkles, Filter } from 'lucide-react';

const fallbackPeers: any[] = [
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
    bio: 'Cyber Security & Forensics Senior Peer Tutor. Specializing in DBMS, Network Security, and Systems Architecture.',
    average_rating: 5.0,
    learners_helped: 142,
    helpful_percentage: 100,
    total_earnings: 1240,
    available_balance: 890
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
    helpful_percentage: 100,
    total_earnings: 0,
    available_balance: 0
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
    helpful_percentage: 96,
    total_earnings: 980,
    available_balance: 620
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
    bio: 'Data Structures, Algorithms, Dynamic Programming & Operating Systems.',
    average_rating: 4.95,
    learners_helped: 310,
    helpful_percentage: 98,
    total_earnings: 2400,
    available_balance: 1850
  }
];

export const PeersPage: React.FC = () => {
  const [peers, setPeers] = useState<any[]>(fallbackPeers);
  const [search, setSearch] = useState('');
  const [selectedInst, setSelectedInst] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPeers() {
      try {
        setLoading(true);

        // 1. Direct Supabase DB query
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
              avatar_url: p.avatar_url || (p.email?.includes('swaraj') 
                ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
                : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
              institution_id: p.institution_id || 'inst-mit-adt',
              institution_name: 'MIT ADT University (Pune)',
              verification_status: 'verified',
              bio: p.bio || (p.email?.includes('swaraj') ? 'AIA Specialist & Artificial Intelligence Senior Peer Educator.' : 'Cyber Security & Systems Peer Tutor.'),
              average_rating: 5.0,
              learners_helped: 142,
              helpful_percentage: 100
            }));
          }
        } catch (dbErr) {
          console.warn('Supabase DB peer query notice:', dbErr);
        }

        // 2. REST API secondary fetch
        let apiPeers: any[] = [];
        try {
          apiPeers = await getPeers();
        } catch (apiErr) {
          console.warn('API peer list notice:', apiErr);
        }

        // Combine DB, API, and fallbacks
        const existingEmails = new Set(dbPeers.map(dp => dp.email?.toLowerCase()));
        const mergedApi = apiPeers.filter(ap => !existingEmails.has(ap.email?.toLowerCase()));
        mergedApi.forEach(ap => existingEmails.add(ap.email?.toLowerCase()));

        const mergedFallback = fallbackPeers.filter(fp => !existingEmails.has(fp.email?.toLowerCase()));

        const finalPeers = [...dbPeers, ...mergedApi, ...mergedFallback];
        setPeers(finalPeers);

        // Cache all known peers in localStorage for instant peer detail page resolution
        try {
          localStorage.setItem('peerup_known_peers', JSON.stringify(finalPeers));
        } catch (e) {}

      } catch (err) {
        console.error('Error loading peers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPeers();
  }, []);

  const filteredPeers = peers.filter(p => {
    const nameStr = (p.full_name || p.user_name || '').toLowerCase();
    const instStr = (p.institution_name || '').toLowerCase();
    const bioStr = (p.bio || '').toLowerCase();
    const q = search.toLowerCase();

    const matchesSearch = nameStr.includes(q) || instStr.includes(q) || bioStr.includes(q);
    const matchesInst = selectedInst === 'all' || p.institution_id === selectedInst;
    return matchesSearch && matchesInst;
  });

  return (
    <div className="page-container py-10 space-y-10">
      {/* Header Banner */}
      <div className="violet-card p-8 bg-gradient-to-br from-[#2e1065] via-[#4c1d95] to-[#6d28d9] text-white shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="bg-purple-800/80 text-purple-200 text-xs font-bold px-3 py-1 rounded-full border border-purple-400/30 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            Verified Peer Educator Marketplace
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Verified Campus Peers
        </h1>
        <p className="text-purple-100 text-sm max-w-2xl font-medium">
          Connect with top-rated senior students from your institution for video explanations, audio walkthroughs, and academic guidance.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border-2 border-purple-200 shadow-md">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search peers by name, university, or subject area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
          />
          <Filter className="w-4 h-4 text-purple-600 absolute left-3.5 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedInst}
            onChange={(e) => setSelectedInst(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
          >
            <option value="all">All Institutions</option>
            <option value="inst-mit-adt">MIT ADT University (Pune)</option>
            <option value="inst-coep">COEP Technological Univ (Pune)</option>
          </select>
        </div>
      </div>

      {/* Peer Grid */}
      {loading ? (
        <div className="py-16 text-center text-[#6d28d9] font-bold text-sm animate-pulse">
          Loading verified campus peers...
        </div>
      ) : filteredPeers.length === 0 ? (
        <div className="py-16 text-center text-slate-500 font-medium text-xs bg-purple-50 rounded-2xl border border-purple-200">
          No verified campus peers found matching your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPeers.map((peer) => {
            const peerName = peer.full_name || peer.user_name || 'Campus Peer Tutor';
            return (
              <div
                key={peer.id}
                className="violet-card bg-white p-6 border-2 border-purple-200 shadow-lg hover:border-[#6d28d9] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={peer.avatar_url}
                        alt={peerName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#6d28d9]"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-extrabold text-[#2e1065] text-base leading-tight">
                        {peerName}
                      </h3>
                      <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                        ✓ Verified Peer Tutor
                      </span>
                      <p className="text-[11px] font-bold text-[#6d28d9]">{peer.institution_name}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-medium line-clamp-2">
                    {peer.bio}
                  </p>

                  <div className="grid grid-cols-3 gap-2 bg-[#f8f6ff] p-3 rounded-xl border border-purple-200 text-center text-xs">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-amber-600 font-black">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{peer.average_rating || 5}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Rating</span>
                    </div>

                    <div className="border-x border-purple-200">
                      <div className="flex items-center justify-center gap-1 text-[#2e1065] font-black">
                        <Users className="w-3.5 h-3.5 text-purple-600" />
                        <span>{peer.learners_helped || 100}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Learners</span>
                    </div>

                    <div>
                      <div className="flex items-center justify-center gap-1 text-emerald-700 font-black">
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{peer.helpful_percentage || 100}%</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Helpful</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/peer/${peer.id}`}
                  state={{ peer }}
                  className="btn-violet-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
                >
                  <span>View Profile & Explanations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
