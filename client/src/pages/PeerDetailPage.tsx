import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPeerDetails, requestPayout } from '../services/api';
import { ContentCard } from '../components/ContentCard';
import { Star, CheckCircle2, Users, ThumbsUp, Wallet, ArrowUpRight, AlertCircle, CheckCircle } from 'lucide-react';

export const PeerDetailPage: React.FC = () => {
  const { peerId } = useParams<{ peerId: string }>();
  const { currentUser } = useAuth();
  const [peer, setPeer] = useState<any>(null);
  const [payoutAmount, setPayoutAmount] = useState<string>('250');
  const [payoutMsg, setPayoutMsg] = useState<string | null>(null);
  const [payoutErr, setPayoutErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPeer() {
      if (!peerId) return;
      try {
        const data = await getPeerDetails(peerId);
        setPeer(data);
      } catch (err) {
        console.error('Peer detail load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPeer();
  }, [peerId]);

  if (loading || !peer) {
    return (
      <div className="page-container py-20 text-center text-slate-500 font-medium text-sm">
        <p className="animate-pulse">Loading peer profile...</p>
      </div>
    );
  }

  const isOwner = currentUser.id === peer.user_id;

  const handlePayoutRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutMsg(null);
    setPayoutErr(null);
    try {
      const res = await requestPayout(peer.id, Number(payoutAmount));
      setPayoutMsg(res.message);
      setPeer((prev: any) => ({ ...prev, available_balance: res.remainingBalance }));
    } catch (err: any) {
      setPayoutErr(err.message || 'Payout request failed.');
    }
  };

  return (
    <div className="page-container py-10 space-y-10">
      {/* Peer Profile Card Header */}
      <div className="violet-card p-8 bg-white border-l-4 border-l-[#6d28d9]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={peer.avatar_url}
                alt={peer.full_name}
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-200 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 shadow-md">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#2e1065]">{peer.full_name}</h1>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  ✓ Verified Peer
                </span>
              </div>
              <p className="text-sm font-bold text-[#6d28d9]">{peer.institution_name}</p>
              <p className="text-xs text-slate-600 max-w-xl font-medium">{peer.bio}</p>
            </div>
          </div>

          {/* Stats Badges Matrix */}
          <div className="flex items-center gap-6 bg-[#f8f6ff] p-4 rounded-2xl border border-purple-200 text-center">
            <div className="px-3">
              <div className="flex items-center justify-center gap-1 text-amber-600 font-black text-lg">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{peer.average_rating || 4.9}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rating</span>
            </div>

            <div className="w-px h-8 bg-purple-200"></div>

            <div className="px-3">
              <div className="flex items-center justify-center gap-1 text-[#2e1065] font-black text-lg">
                <Users className="w-4 h-4 text-purple-600" />
                <span>{peer.learners_helped || 127}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Learners</span>
            </div>

            <div className="w-px h-8 bg-purple-200"></div>

            <div className="px-3">
              <div className="flex items-center justify-center gap-1 text-emerald-700 font-black text-lg">
                <ThumbsUp className="w-4 h-4 text-emerald-600" />
                <span>{peer.helpful_percentage || 96}%</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Helpful</span>
            </div>
          </div>
        </div>
      </div>

      {/* Owner Financial Earnings Ledger & Payout Card */}
      {isOwner && (
        <div className="violet-panel bg-white space-y-4 border-l-4 border-l-emerald-600">
          <div className="flex items-center gap-3 border-b border-purple-200 pb-4">
            <Wallet className="w-6 h-6 text-emerald-700" />
            <div>
              <h2 className="font-extrabold text-[#2e1065] text-lg">PeerUP Earnings Ledger & Payouts</h2>
              <p className="text-xs text-slate-500 font-medium">Track sales revenue and request tutor earnings payout</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#f8f6ff] p-4 rounded-xl border border-purple-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Lifetime Earnings</span>
              <p className="text-2xl font-black text-emerald-700">₹{peer.total_earnings || 0}</p>
            </div>

            <div className="bg-[#f8f6ff] p-4 rounded-xl border border-purple-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Balance</span>
              <p className="text-2xl font-black text-[#2e1065]">₹{peer.available_balance || 0}</p>
            </div>
          </div>

          {/* Payout Form */}
          <form onSubmit={handlePayoutRequest} className="bg-[#f8f6ff] p-4 rounded-xl border border-purple-200 space-y-3">
            <h3 className="font-bold text-[#2e1065] text-sm">Request Payout (Min ₹250 Threshold)</h3>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-slate-500 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="250"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full pl-7 pr-4 py-2 bg-white border border-purple-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#6d28d9]"
                />
              </div>
              <button type="submit" className="btn-violet-primary py-2 px-4 text-xs font-bold">
                <ArrowUpRight className="w-4 h-4" />
                <span>Submit Payout</span>
              </button>
            </div>

            {payoutMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                <span>{payoutMsg}</span>
              </div>
            )}
            {payoutErr && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>{payoutErr}</span>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Published Content Catalog */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-[#2e1065]">Published Explanations ({peer.explanations?.length || 0})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {peer.explanations?.map((item: any) => (
            <ContentCard key={item.id} content={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
