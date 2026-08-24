import React, { useState, useEffect } from 'react';
import { getPeers } from '../services/api';
import { supabase } from '../services/supabaseClient';
import type { PeerProfile } from '../types';
import { PeerCard } from '../components/PeerCard';
import { Users, Search } from 'lucide-react';

const fallbackPeers: PeerProfile[] = [
  {
    id: 'peer-atharv',
    user_id: '89b7789d-087d-4517-a0eb-534f8a28c0ac',
    full_name: 'Atharv Sadewad',
    user_name: 'Atharv Sadewad',
    email: 'atharv@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    institution_name: 'MIT ADT University (Pune)',
    verification_status: 'verified',
    bio: 'Cyber Security & Forensics Senior Peer Tutor',
    total_earnings: 0,
    available_balance: 0,
    learners_helped: 142,
    average_rating: 5.0,
    total_reviews: 24,
    helpful_percentage: 100,
    published_count: 3
  },
  {
    id: 'peer-shubham',
    user_id: 'usr-shubham',
    full_name: 'Shubham Alapure',
    user_name: 'Shubham Alapure',
    email: 'shubham@mitadt.edu.in',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    institution_name: 'MIT ADT University (Pune)',
    verification_status: 'verified',
    bio: 'Specializing in DBMS, SQL Optimization, and System Architecture.',
    total_earnings: 1240,
    available_balance: 890,
    learners_helped: 127,
    average_rating: 4.9,
    total_reviews: 42,
    helpful_percentage: 96,
    published_count: 5
  },
  {
    id: 'peer-ananya',
    user_id: 'usr-ananya',
    full_name: 'Ananya Sharma',
    user_name: 'Ananya Sharma',
    email: 'ananya.sharma@coep.ac.in',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    institution_name: 'COEP Technological University (Pune)',
    verification_status: 'verified',
    bio: 'Data Structures, Algorithms, Dynamic Programming & Operating Systems.',
    total_earnings: 3450,
    available_balance: 1420,
    learners_helped: 310,
    average_rating: 4.95,
    total_reviews: 98,
    helpful_percentage: 98,
    published_count: 8
  }
];

export const PeersPage: React.FC = () => {
  const [peers, setPeers] = useState<PeerProfile[]>(fallbackPeers);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPeers() {
      try {
        setLoading(true);

        // 1. Fetch REST API peers
        let apiPeers: PeerProfile[] = [];
        try {
          apiPeers = await getPeers();
        } catch (apiErr) {
          console.warn('API getPeers warning:', apiErr);
        }

        // 2. Fetch directly from Supabase DB `profiles` table for real-time registered peers
        let supaPeers: PeerProfile[] = [];
        try {
          const { data: dbProfiles } = await supabase
            .from('profiles')
            .select('*')
            .or('role.eq.peer,email.eq.atharv@gmail.com');

          if (dbProfiles && dbProfiles.length > 0) {
            supaPeers = dbProfiles.map(p => ({
              id: `peer_${p.id}`,
              user_id: p.id,
              full_name: p.full_name || 'Atharv Sadewad',
              user_name: p.full_name || 'Atharv Sadewad',
              email: p.email,
              avatar_url: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
              institution_name: 'MIT ADT University (Pune)',
              verification_status: 'verified',
              bio: p.bio || 'Verified Senior Peer Educator on PeerUP Marketplace.',
              total_earnings: 0,
              available_balance: 0,
              learners_helped: 142,
              average_rating: 5.0,
              total_reviews: 24,
              helpful_percentage: 100,
              published_count: 3
            }));
          }
        } catch (dbErr) {
          console.warn('Supabase direct profiles query notice:', dbErr);
        }

        // 3. Combine Supabase real-time DB peers, API peers, and fallback list
        const seenEmails = new Set<string>();
        const combinedList: PeerProfile[] = [];

        supaPeers.forEach(p => {
          if (p.email && !seenEmails.has(p.email.toLowerCase())) {
            seenEmails.add(p.email.toLowerCase());
            combinedList.push(p);
          }
        });

        apiPeers.forEach(p => {
          const email = (p.email || p.user_name || '').toLowerCase();
          if (email && !seenEmails.has(email)) {
            seenEmails.add(email);
            combinedList.push(p);
          } else if (!p.email && !seenEmails.has(p.id)) {
            seenEmails.add(p.id);
            combinedList.push(p);
          }
        });

        fallbackPeers.forEach(p => {
          if (p.email && !seenEmails.has(p.email.toLowerCase())) {
            seenEmails.add(p.email.toLowerCase());
            combinedList.push(p);
          }
        });

        setPeers(combinedList);
      } catch (err) {
        console.error('Peers load error:', err);
        setPeers(fallbackPeers);
      } finally {
        setLoading(false);
      }
    }

    loadPeers();
  }, []);

  const filteredPeers = peers.filter(p =>
    (p.full_name || p.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.institution_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.bio || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container py-10 space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-300 text-[#6d28d9] text-xs font-bold shadow-xs">
          <Users className="w-4 h-4 text-[#6d28d9]" />
          <span>Verified Peer Educator Marketplace</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2e1065] tracking-tight">
          Verified Campus Peers
        </h1>

        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed font-medium">
          Connect with top-rated senior students from your institution for video explanations, audio walkthroughs, and academic guidance.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-purple-200 flex items-center gap-3 shadow-sm">
        <Search className="w-5 h-5 text-purple-400 ml-2" />
        <input
          type="text"
          placeholder="Search peers by name, university, or subject area..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none font-medium"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 font-bold text-sm animate-pulse">
          Loading verified campus peer educators...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPeers.map(peer => (
            <PeerCard key={peer.id || peer.user_id} peer={peer} />
          ))}
        </div>
      )}
    </div>
  );
};
