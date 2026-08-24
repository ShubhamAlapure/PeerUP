import React, { useState, useEffect } from 'react';
import { getPeers } from '../services/api';
import type { PeerProfile } from '../types';
import { PeerCard } from '../components/PeerCard';
import { Users, Search } from 'lucide-react';

export const PeersPage: React.FC = () => {
  const [peers, setPeers] = useState<PeerProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPeers() {
      try {
        const data = await getPeers();
        setPeers(data);
      } catch (err) {
        console.error('Peers load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPeers();
  }, []);

  const filteredPeers = peers.filter(p =>
    (p.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.institution_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.bio || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container py-10 space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-300 text-[#5c33cf] text-xs font-bold shadow-xs">
          <Users className="w-4 h-4 text-[#5c33cf]" />
          <span>Verified Peer Educator Marketplace</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Verified Campus Peers
        </h1>

        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed font-medium">
          Connect with top-rated senior students from your institution for video explanations, audio walkthroughs, and academic guidance.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-xs">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Search peers by name, university, or subject area..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none font-medium"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPeers.map(peer => (
          <PeerCard key={peer.id} peer={peer} />
        ))}
      </div>
    </div>
  );
};
