import React, { useState, useEffect } from 'react';
import { getMyAcademicResources, updateAcademicResource, deleteAcademicResource } from '../services/api';
import type { AcademicResource } from '../types';
import {
  FileText,
  Eye,
  Download,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  XCircle,
  PlusCircle
} from 'lucide-react';

interface MyResourcesTabProps {
  uploaderId: string;
  onOpenUploadModal: () => void;
}

export const MyResourcesTab: React.FC<MyResourcesTabProps> = ({ uploaderId, onOpenUploadModal }) => {
  const [activeTab, setActiveTab] = useState<'published' | 'pending' | 'rejected'>('published');
  const [resourcesData, setResourcesData] = useState<{
    published: AcademicResource[];
    pending: AcademicResource[];
    rejected: AcademicResource[];
    stats: { totalUploaded: number; totalViews: number; totalDownloads: number };
  }>({
    published: [],
    pending: [],
    rejected: [],
    stats: { totalUploaded: 0, totalViews: 0, totalDownloads: 0 }
  });

  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Edit Modal State
  const [editingResource, setEditingResource] = useState<AcademicResource | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getMyAcademicResources(uploaderId);

      // Merge locally stored uploads if any
      try {
        const raw = localStorage.getItem('peerup_user_uploaded_resources');
        if (raw) {
          const localItems: AcademicResource[] = JSON.parse(raw);
          const existingIds = new Set(data.published.concat(data.pending, data.rejected).map((r: any) => r.id));
          localItems.forEach(item => {
            if (item.uploader_id === uploaderId && !existingIds.has(item.id)) {
              if (item.status === 'approved') data.published.unshift(item);
              else if (item.status === 'pending') data.pending.unshift(item);
              else if (item.status === 'rejected') data.rejected.unshift(item);
            }
          });
        }
      } catch (e) {}

      setResourcesData(data);
    } catch (err) {
      console.error('Error loading my resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [uploaderId]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await deleteAcademicResource(id);
      setActionMsg('Resource deleted successfully.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete resource.');
    }
  };

  const handleTogglePublish = async (resource: AcademicResource) => {
    const newStatus = resource.status === 'approved' ? 'pending' : 'approved';
    try {
      await updateAcademicResource(resource.id, { status: newStatus });
      setActionMsg(`Resource status changed to ${newStatus === 'approved' ? 'published' : 'unpublished'}.`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;
    try {
      await updateAcademicResource(editingResource.id, {
        title: editTitle,
        description: editDescription,
        tags: editTags.split(',').map(t => t.trim())
      });
      setActionMsg('Resource metadata updated successfully.');
      setEditingResource(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update resource metadata.');
    }
  };

  const currentList = resourcesData[activeTab] || [];

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="violet-card p-5 bg-white space-y-1 border-t-4 border-t-[#6d28d9]">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Uploaded Resources</span>
          <p className="text-2xl font-black text-[#2e1065]">{resourcesData.stats.totalUploaded}</p>
        </div>

        <div className="violet-card p-5 bg-white space-y-1 border-t-4 border-t-purple-600">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Student Views</span>
          <p className="text-2xl font-black text-[#6d28d9] flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-400" />
            {resourcesData.stats.totalViews}
          </p>
        </div>

        <div className="violet-card p-5 bg-white space-y-1 border-t-4 border-t-emerald-600">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total File Downloads</span>
          <p className="text-2xl font-black text-emerald-700 flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-600" />
            {resourcesData.stats.totalDownloads}
          </p>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Tabs & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-200 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('published')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'published' ? 'bg-[#6d28d9] text-white shadow-xs' : 'bg-[#f8f6ff] text-slate-700 hover:bg-purple-100'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Published ({resourcesData.published.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'pending' ? 'bg-amber-600 text-white shadow-xs' : 'bg-[#f8f6ff] text-slate-700 hover:bg-purple-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending ({resourcesData.pending.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'rejected' ? 'bg-red-600 text-white shadow-xs' : 'bg-[#f8f6ff] text-slate-700 hover:bg-purple-100'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected ({resourcesData.rejected.length})</span>
          </button>
        </div>

        <button
          onClick={onOpenUploadModal}
          className="btn-violet-primary text-xs py-2.5 px-4 font-extrabold flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Upload Resource</span>
        </button>
      </div>

      {/* Resource Items List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500 font-medium animate-pulse">
          Loading your resources...
        </div>
      ) : currentList.length === 0 ? (
        <div className="violet-panel text-center py-12 space-y-3 bg-white border border-purple-200">
          <FileText className="w-10 h-10 text-purple-400 mx-auto" />
          <h4 className="font-extrabold text-[#2e1065] text-base">No {activeTab} resources found</h4>
          <p className="text-xs text-slate-600 font-medium">Click "+ Upload Resource" to add assignment references and study material.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map(item => (
            <div key={item.id} className="violet-card p-5 bg-white border-l-4 border-l-[#6d28d9] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-purple-100 text-[#6d28d9] font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                    {item.resource_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-bold text-slate-600">{item.institution_name}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-extrabold text-[#6d28d9]">{item.subject_name}</span>
                </div>

                <h3 className="font-extrabold text-[#2e1065] text-lg">{item.title}</h3>
                <p className="text-xs text-slate-600 font-medium line-clamp-2">{item.description}</p>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 font-bold">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-purple-500" />
                    {item.views_count} Views
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    {item.downloads_count} Downloads
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                <button
                  onClick={() => {
                    setEditingResource(item);
                    setEditTitle(item.title);
                    setEditDescription(item.description);
                    setEditTags((item.tags || []).join(', '));
                  }}
                  className="btn-violet-secondary text-xs py-2 px-3 font-bold flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5 text-[#6d28d9]" />
                  <span>Edit Metadata</span>
                </button>

                <button
                  onClick={() => handleTogglePublish(item)}
                  className="btn-violet-outline text-xs py-2 px-3 font-bold"
                >
                  {item.status === 'approved' ? 'Unpublish' : 'Publish'}
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete Resource"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 space-y-4 border-2 border-purple-200">
            <h3 className="font-extrabold text-[#2e1065] text-lg">Edit Resource Metadata</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Tags (Comma-Separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
                  className="btn-violet-secondary py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-violet-primary py-2 px-5 font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
