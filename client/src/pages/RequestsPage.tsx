import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRequests, createTopicRequest } from '../services/api';
import type { TopicRequest } from '../types';
import { AcademicIntegrityNotice } from '../components/AcademicIntegrityNotice';
import { MessageSquarePlus, Clock, AlertCircle, PlusCircle } from 'lucide-react';

export const RequestsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<TopicRequest[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<number>(25);

  const [_loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRequests() {
      try {
        const data = await getRequests();
        setRequests(data);
      } catch (err) {
        console.error('Requests load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Title and description are required.');
      return;
    }

    try {
      setError(null);
      const res = await createTopicRequest({
        student_id: currentUser.id,
        institution_id: currentUser.institution_id || 'inst-mit-adt',
        subject_id: 'subj-dbms',
        topic_id: 'top-norm',
        title,
        description,
        preferred_type: 'video',
        budget: Number(budget)
      });

      setRequests([res.request, ...requests]);
      setShowForm(false);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit request.');
    }
  };

  return (
    <div className="page-container py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-300 text-[#5c33cf] text-xs font-bold shadow-xs">
            <MessageSquarePlus className="w-4 h-4 text-[#5c33cf]" />
            <span>Peer Assistance Request System</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Topic Explanation Requests</h1>
          <p className="text-sm text-slate-600 font-medium">Request explanations for topics that are not currently available in the catalog.</p>
        </div>

        <button onClick={() => setShowForm(!showForm)} className="btn-purple-primary text-xs">
          <PlusCircle className="w-4 h-4" />
          <span>{showForm ? 'Close Form' : 'Request an Explanation'}</span>
        </button>
      </div>

      <AcademicIntegrityNotice />

      {/* Post Request Form */}
      {showForm && (
        <form onSubmit={handleCreateRequest} className="purple-panel space-y-4 border-l-4 border-l-[#5c33cf]">
          <h3 className="font-extrabold text-slate-900 text-base">Request Topic Explanation</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Topic Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Need B-Tree Node Splitting Explanation with Example"
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-[#5c33cf]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description & Questions</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what concept you are struggling to understand..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-[#5c33cf]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Suggested Budget (₹)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-[#5c33cf]"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-purple-primary text-xs py-2.5 px-5">
            <span>Post Request</span>
          </button>
        </form>
      )}

      {/* Requests Feed */}
      <div className="space-y-4">
        {requests.map(req => (
          <div key={req.id} className="purple-card p-6 space-y-3 border-l-4 border-l-[#5c33cf]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-900 font-extrabold text-[11px] px-2.5 py-0.5 rounded-md border border-amber-200 uppercase">
                  {req.status}
                </span>
                <span className="text-xs font-bold text-slate-600">{req.institution_name}</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-extrabold text-[#5c33cf]">{req.subject_name}</span>
              </div>
              <span className="font-black text-[#5c33cf] text-base">Budget: ₹{req.budget}</span>
            </div>

            <h3 className="font-extrabold text-slate-900 text-lg">{req.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{req.description}</p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Requested by Student: <strong className="text-slate-900">{req.student_name}</strong></span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Open for responses</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
