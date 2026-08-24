import React, { useState, useEffect } from 'react';
import { getAdminAnalytics, verifyPeerAdmin } from '../services/api';
import { ShieldAlert, Users, Wallet, CheckCircle, XCircle } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAdminAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Admin analytics load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="page-container py-20 text-center text-slate-500 font-medium text-sm">
        <p className="animate-pulse">Loading Admin Control Center...</p>
      </div>
    );
  }

  const { metrics } = analytics;

  const handleVerifyPeer = async (userId: string, action: 'approve' | 'reject') => {
    try {
      const res = await verifyPeerAdmin(userId, action);
      setActionMsg(res.message);
      setAnalytics((prev: any) => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          pendingVerifications: Math.max(0, prev.metrics.pendingVerifications - 1),
          verifiedPeers: action === 'approve' ? prev.metrics.verifiedPeers + 1 : prev.metrics.verifiedPeers
        }
      }));
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="page-container py-10 space-y-10">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold">
          <ShieldAlert className="w-4 h-4 text-amber-700" />
          <span>Platform Moderation & Control Center</span>
        </div>
        <h1 className="text-3xl font-black text-[#2e1065]">Admin Operations Dashboard</h1>
        <p className="text-sm text-slate-600 font-medium">Monitor multi-institution analytics, peer verifications, content moderation, and platform revenue splits.</p>
      </div>

      {actionMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-700" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="violet-card p-5 space-y-2 border-t-4 border-t-[#6d28d9]">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registered Users</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-[#2e1065]">{metrics.totalUsers}</span>
            <Users className="w-6 h-6 text-purple-400" />
          </div>
        </div>

        <div className="violet-card p-5 space-y-2 border-t-4 border-t-emerald-600">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Gross Revenue</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-700">₹{metrics.totalGrossRevenue}</span>
            <Wallet className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        <div className="violet-card p-5 space-y-2 border-t-4 border-t-[#6d28d9]">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">PeerUP Share (25%)</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-[#6d28d9]">₹{metrics.platformRevenue}</span>
            <Wallet className="w-6 h-6 text-[#6d28d9]" />
          </div>
        </div>

        <div className="violet-card p-5 space-y-2 border-t-4 border-t-amber-500">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Verifications</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-amber-700">{metrics.pendingVerifications}</span>
            <ShieldAlert className="w-6 h-6 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Peer Verification Action Queue */}
      <div className="violet-panel space-y-4">
        <h2 className="text-lg font-black text-[#2e1065]">Pending Peer Verifications</h2>
        <p className="text-xs text-slate-600 font-medium">Review student university ID cards and official institutional emails before granting ✓ Verified Peer status.</p>

        <div className="space-y-3">
          <div className="bg-[#f8f6ff] p-4 rounded-xl border border-purple-200 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-[#2e1065] text-sm">Shubham Alapure</h3>
              <p className="text-xs font-bold text-[#6d28d9]">MIT ADT University • Computer Science</p>
              <p className="text-[11px] text-slate-500 font-semibold">Email: shubham@mitadt.edu.in</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVerifyPeer('usr-shubham', 'approve')}
                className="btn-violet-primary py-1.5 px-3.5 text-xs font-bold"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleVerifyPeer('usr-shubham', 'reject')}
                className="btn-violet-outline py-1.5 px-3.5 text-xs text-red-700 border-red-300 hover:bg-red-50 font-bold"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
