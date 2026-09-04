import React, { useState, useEffect } from 'react';
import {
  getAdminAnalytics,
  verifyPeerAdmin,
  getAdminResources,
  moderateAcademicResourceAdmin,
  getAdminResourceReports,
  actionAdminResourceReport,
  getInstitutions
} from '../services/api';
import type { AcademicResource, ResourceReport, Institution } from '../types';
import {
  ShieldAlert,
  Users,
  Wallet,
  CheckCircle,
  XCircle,
  FolderKanban,
  AlertTriangle,
  RotateCcw,
  Trash2
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [adminResources, setAdminResources] = useState<AcademicResource[]>([]);
  const [adminReports, setAdminReports] = useState<ResourceReport[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const analyticsData = await getAdminAnalytics();
      setAnalytics(analyticsData);

      const insts = await getInstitutions();
      setInstitutions(insts);

      const resList = await getAdminResources({
        institution_id: selectedInstId,
        status: statusFilter
      });
      setAdminResources(resList);

      const reportsList = await getAdminResourceReports();
      setAdminReports(reportsList);
    } catch (err) {
      console.error('Admin data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedInstId, statusFilter]);

  if (loading || !analytics) {
    return (
      <div className="page-container py-20 text-center text-slate-500 font-medium text-sm">
        <p className="animate-pulse">Loading Admin Operations Center...</p>
      </div>
    );
  }

  const { metrics } = analytics;

  const handleVerifyPeer = async (userId: string, action: 'approve' | 'reject') => {
    try {
      const res = await verifyPeerAdmin(userId, action);
      setActionMsg(res.message);
      loadData();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleModerateResource = async (resourceId: string, action: 'approve' | 'reject' | 'remove' | 'restore') => {
    try {
      const res = await moderateAcademicResourceAdmin(resourceId, action);
      setActionMsg(res.message);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to moderate resource.');
    }
  };

  const handleReportAction = async (reportId: string, action: 'resolve' | 'dismiss', removeResource = false) => {
    try {
      const res = await actionAdminResourceReport(reportId, action, removeResource);
      setActionMsg(res.message);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to process report action.');
    }
  };

  return (
    <div className="page-container py-10 space-y-10">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold">
          <ShieldAlert className="w-4 h-4 text-amber-700" />
          <span>Platform Moderation & Control Center</span>
        </div>
        <h1 className="text-3xl font-black text-[#2e1065]">Admin Operations Dashboard</h1>
        <p className="text-sm text-slate-600 font-medium">
          Monitor multi-institution analytics, peer verifications, academic resource moderation, and reported content.
        </p>
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
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Resources</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-700">{adminResources.length}</span>
            <FolderKanban className="w-6 h-6 text-emerald-600" />
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
      <div className="violet-panel space-y-4 bg-white border border-purple-200">
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

      {/* SECTION 15: ADMIN ACADEMIC RESOURCE MANAGEMENT */}
      <div className="violet-panel space-y-6 bg-white border border-purple-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-200 pb-4">
          <div>
            <h2 className="text-xl font-black text-[#2e1065] flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-[#6d28d9]" />
              <span>Academic Resource Moderation Queue</span>
            </h2>
            <p className="text-xs text-slate-600 font-medium">Approve, reject, remove, or restore academic resources uploaded across institutions.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter by Institution */}
            <select
              value={selectedInstId}
              onChange={(e) => setSelectedInstId(e.target.value)}
              className="p-2 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none"
            >
              <option value="all">All Institutions</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="removed">Removed</option>
            </select>
          </div>
        </div>

        {adminResources.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-medium">
            No resources matching the selected admin filters.
          </div>
        ) : (
          <div className="space-y-4">
            {adminResources.map(res => (
              <div key={res.id} className="p-4 bg-[#f8f6ff] rounded-2xl border border-purple-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                      res.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      res.status === 'pending' ? 'bg-amber-100 text-amber-900' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {res.status}
                    </span>
                    <span className="text-xs font-bold text-slate-600">{res.institution_name}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-extrabold text-[#6d28d9]">{res.subject_name}</span>
                  </div>

                  <h3 className="font-extrabold text-[#2e1065] text-base">{res.title}</h3>
                  <p className="text-xs text-slate-600 font-medium">Uploader: <strong>{res.uploader_name}</strong> • File: {res.file_name}</p>
                </div>

                {/* Moderation Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {res.status !== 'approved' && (
                    <button
                      onClick={() => handleModerateResource(res.id, 'approve')}
                      className="btn-violet-primary py-1.5 px-3 text-xs font-bold"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {res.status !== 'rejected' && (
                    <button
                      onClick={() => handleModerateResource(res.id, 'reject')}
                      className="btn-violet-outline text-xs text-red-700 border-red-300 hover:bg-red-50 py-1.5 px-3 font-bold"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

                  {res.status !== 'removed' ? (
                    <button
                      onClick={() => handleModerateResource(res.id, 'remove')}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                      title="Remove Resource"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleModerateResource(res.id, 'restore')}
                      className="btn-violet-secondary text-xs py-1.5 px-3 font-bold"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 15: RESOURCE REPORTS QUEUE */}
      <div className="violet-panel space-y-4 bg-white border border-purple-200 p-6">
        <h2 className="text-lg font-black text-[#2e1065] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>Student Resource Reports Queue</span>
        </h2>

        {adminReports.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 font-medium">
            No active flagged resource reports. Platform academic integrity clear!
          </div>
        ) : (
          <div className="space-y-3">
            {adminReports.map(report => (
              <div key={report.id} className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-200 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                      Reason: {report.reason.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-bold text-slate-600">Reported by {report.reporter_name}</span>
                  </div>

                  <h3 className="font-extrabold text-[#2e1065] text-sm">
                    Resource: {report.resource ? report.resource.title : report.resource_id}
                  </h3>
                  <p className="text-xs text-slate-700 font-medium">{report.description || 'No additional details.'}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleReportAction(report.id, 'resolve', true)}
                    className="btn-violet-outline text-xs text-red-700 border-red-300 hover:bg-red-100 py-1.5 px-3 font-bold"
                  >
                    <span>Remove Resource</span>
                  </button>

                  <button
                    onClick={() => handleReportAction(report.id, 'dismiss')}
                    className="btn-violet-secondary py-1.5 px-3 text-xs font-bold"
                  >
                    <span>Dismiss Report</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
