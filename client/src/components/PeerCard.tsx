import React from 'react';
import type { PeerProfile } from '../types';
import { Star, CheckCircle2, Users, ThumbsUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PeerCard: React.FC<{ peer: PeerProfile }> = ({ peer }) => {
  return (
    <div className="violet-card p-5 flex flex-col justify-between space-y-4 border-t-4 border-t-[#6d28d9]">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={peer.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
              alt={peer.full_name}
              className="w-14 h-14 rounded-full object-cover border-2 border-purple-300"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5" title="Verified Peer">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-base text-[#2e1065] hover:text-[#6d28d9] transition-colors">
              {peer.full_name}
            </h3>
            <p className="text-xs font-bold text-emerald-700">✓ Verified Peer Tutor</p>
            <p className="text-xs font-medium text-slate-500">{peer.institution_name}</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
          {peer.bio || 'Peer educator helping students master difficult topics.'}
        </p>

        {/* Peer Stats Matrix */}
        <div className="grid grid-cols-3 gap-2 bg-[#f8f6ff] p-2.5 rounded-xl border border-purple-200 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-amber-600 font-extrabold text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{peer.average_rating || 5.0}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Rating</span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 text-[#2e1065] font-extrabold text-xs">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>{peer.learners_helped || 12}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Learners</span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 text-emerald-700 font-extrabold text-xs">
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>{peer.helpful_percentage || 96}%</span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Helpful</span>
          </div>
        </div>
      </div>

      <Link
        to={`/peer/${peer.id}`}
        className="w-full btn-violet-secondary justify-center py-2.5 text-xs font-bold"
      >
        <span>View Profile & Explanations</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
};
