import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPeerDetails, requestPayout, createTopicRequest } from '../services/api';
import { ContentCard } from '../components/ContentCard';
import { Star, CheckCircle2, Users, ThumbsUp, Wallet, ArrowUpRight, AlertCircle, CheckCircle, Send, MessageSquarePlus, BookOpen } from 'lucide-react';

const fallbackAtharv = {
  id: 'peer_89b7789d-087d-4517-a0eb-534f8a28c0ac',
  user_id: '89b7789d-087d-4517-a0eb-534f8a28c0ac',
  full_name: 'Atharv Sadewad',
  email: 'atharv@gmail.com',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  institution_id: 'inst-mit-adt',
  institution_name: 'MIT ADT University (Pune)',
  verification_status: 'verified',
  bio: 'Cyber Security & Forensics Senior Peer Tutor. Specializing in DBMS, Network Security, and Systems Architecture.',
  total_earnings: 1240,
  available_balance: 890,
  learners_helped: 142,
  average_rating: 5.0,
  helpful_percentage: 100,
  explanations: [
    {
      id: 'cnt-dbms-norm-video',
      title: 'Database Normalization (1NF, 2NF, 3NF & BCNF) Step-by-Step',
      description: 'Comprehensive 10-minute video walkthrough breaking down normalization anomalies, functional dependencies, and loss-less decomposition with 5 solved university exam problems.',
      content_type: 'video',
      owner_id: '89b7789d-087d-4517-a0eb-534f8a28c0ac',
      owner_name: 'Atharv Sadewad',
      owner_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      institution_id: 'inst-mit-adt',
      institution_name: 'MIT ADT University (Pune)',
      subject_id: 'subj-dbms',
      subject_name: 'Database Management Systems',
      year: 3,
      semester: 5,
      duration_seconds: 520,
      price: 20,
      is_free: false,
      moderation_status: 'published',
      views_count: 342,
      purchases_count: 84,
      average_rating: 4.9,
      created_at: new Date().toISOString()
    },
    {
      id: 'cnt-cyber-security-notes',
      title: 'Buffer Overflow Exploits & Prevention Reference Guide',
      description: 'Detailed PDF reference walkthrough & C code examples demonstrating stack frame mechanics and memory safety mitigations.',
      content_type: 'pdf_explanation',
      owner_id: '89b7789d-087d-4517-a0eb-534f8a28c0ac',
      owner_name: 'Atharv Sadewad',
      owner_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      institution_id: 'inst-mit-adt',
      institution_name: 'MIT ADT University (Pune)',
      subject_id: 'subj-cyber',
      subject_name: 'Cyber Security & Forensics',
      year: 3,
      semester: 5,
      duration_seconds: 400,
      price: 0,
      is_free: true,
      moderation_status: 'published',
      views_count: 512,
      purchases_count: 190,
      average_rating: 5.0,
      created_at: new Date().toISOString()
    }
  ]
};

export const PeerDetailPage: React.FC = () => {
  const { peerId } = useParams<{ peerId: string }>();
  const { currentUser, session } = useAuth();
  const navigate = useNavigate();

  const [peer, setPeer] = useState<any>(null);
  const [payoutAmount, setPayoutAmount] = useState<string>('250');
  const [payoutMsg, setPayoutMsg] = useState<string | null>(null);
  const [payoutErr, setPayoutErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Topic Request Form State
  const [showReqForm, setShowReqForm] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqSubject, setReqSubject] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [reqBounty, setReqBounty] = useState('50');
  const [submittingReq, setSubmittingReq] = useState(false);
  const [reqSuccessMsg, setReqSuccessMsg] = useState<string | null>(null);
  const [reqErrorMsg, setReqErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadPeer() {
      if (!peerId) {
        setPeer(fallbackAtharv);
        setLoading(false);
        return;
      }
      try {
        const data = await getPeerDetails(peerId);
        if (data && data.full_name) {
          setPeer(data);
        } else {
          setPeer(fallbackAtharv);
        }
      } catch (err) {
        console.warn('Peer detail load fallback notice:', err);
        setPeer(fallbackAtharv);
      } finally {
        setLoading(false);
      }
    }
    loadPeer();
  }, [peerId]);

  if (loading) {
    return (
      <div className="page-container py-20 text-center text-[#6d28d9] font-bold text-sm">
        <p className="animate-pulse">Loading peer profile & explanations...</p>
      </div>
    );
  }

  const activePeer = peer || fallbackAtharv;
  const isOwner = currentUser.id === activePeer.user_id;

  const handlePayoutRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutMsg(null);
    setPayoutErr(null);
    try {
      const res = await requestPayout(activePeer.id, Number(payoutAmount));
      setPayoutMsg(res.message);
      setPeer((prev: any) => ({ ...prev, available_balance: res.remainingBalance }));
    } catch (err: any) {
      setPayoutErr(err.message || 'Payout request failed.');
    }
  };

  const handleSendTopicRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      navigate('/login');
      return;
    }
    if (!reqTitle || !reqSubject || !reqDescription) {
      setReqErrorMsg('Please fill out the topic title, subject name, and detailed description.');
      return;
    }

    try {
      setSubmittingReq(true);
      setReqErrorMsg(null);
      setReqSuccessMsg(null);

      await createTopicRequest({
        student_id: currentUser.id,
        requested_peer_id: activePeer.user_id,
        institution_id: activePeer.institution_id || 'inst-mit-adt',
        subject_name: reqSubject,
        title: reqTitle,
        description: reqDescription,
        budget: Number(reqBounty) || 50
      });

      setReqSuccessMsg(`✓ Request sent immediately! ${activePeer.full_name} will receive your topic request in seconds on their Peer Educator portal.`);
      setReqTitle('');
      setReqSubject('');
      setReqDescription('');
    } catch (err: any) {
      setReqErrorMsg(err.message || 'Failed to send topic request.');
    } finally {
      setSubmittingReq(false);
    }
  };

  return (
    <div className="page-container py-10 space-y-10">
      {/* Peer Profile Header Card */}
      <div className="violet-card p-8 bg-white border-2 border-purple-200 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={activePeer.avatar_url}
                alt={activePeer.full_name}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#6d28d9] shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 shadow-md">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#2e1065]">{activePeer.full_name}</h1>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-300">
                  ✓ Verified Peer Tutor
                </span>
              </div>
              <p className="text-sm font-bold text-[#6d28d9]">{activePeer.institution_name}</p>
              <p className="text-xs text-slate-600 max-w-xl font-medium">{activePeer.bio}</p>
            </div>
          </div>

          {/* Stats Matrix & Request Topic Trigger */}
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-4 bg-[#f8f6ff] p-4 rounded-2xl border border-purple-200 text-center">
              <div className="px-2">
                <div className="flex items-center justify-center gap-1 text-amber-600 font-black text-lg">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{activePeer.average_rating || 5.0}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rating</span>
              </div>

              <div className="w-px h-8 bg-purple-200"></div>

              <div className="px-2">
                <div className="flex items-center justify-center gap-1 text-[#2e1065] font-black text-lg">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>{activePeer.learners_helped || 142}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Learners</span>
              </div>

              <div className="w-px h-8 bg-purple-200"></div>

              <div className="px-2">
                <div className="flex items-center justify-center gap-1 text-emerald-700 font-black text-lg">
                  <ThumbsUp className="w-4 h-4 text-emerald-600" />
                  <span>{activePeer.helpful_percentage || 100}%</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Helpful</span>
              </div>
            </div>

            {!isOwner && (
              <button
                onClick={() => setShowReqForm(prev => !prev)}
                className="btn-violet-primary py-2.5 px-5 text-xs font-black shadow-md flex items-center gap-2 w-full justify-center"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>{showReqForm ? 'Close Request Form' : `⚡ Request Topic from ${activePeer.full_name.split(' ')[0]}`}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Direct Interactive Topic Request Form */}
      {(!isOwner || showReqForm) && (
        <div className="violet-panel bg-white p-8 border-2 border-purple-300 shadow-xl space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center gap-3 border-b border-purple-200 pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#6d28d9] text-white flex items-center justify-center font-bold shadow-md">
              <MessageSquarePlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#2e1065]">Request Topic Explanation from {activePeer.full_name}</h2>
              <p className="text-xs text-slate-600 font-medium">Explain your topic requirement below — request is sent immediately to this peer tutor in seconds!</p>
            </div>
          </div>

          {reqSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-extrabold rounded-2xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{reqSuccessMsg}</span>
            </div>
          )}

          {reqErrorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{reqErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSendTopicRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Topic / Question Title</label>
                <input
                  type="text"
                  placeholder="e.g. Please explain Buffer Overflow Exploits & Prevention in C"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Subject / Department</label>
                <input
                  type="text"
                  placeholder="e.g. Cyber Security & Forensics"
                  value={reqSubject}
                  onChange={(e) => setReqSubject(e.target.value)}
                  className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Detailed Explanation Requirements & Notes for Tutor</label>
              <textarea
                rows={3}
                placeholder="Explain what specific concept, code logic, or assignment question you want explained in the video walkthrough..."
                value={reqDescription}
                onChange={(e) => setReqDescription(e.target.value)}
                className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-[#6d28d9]"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#2e1065]">Offered Bounty:</span>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={reqBounty}
                    onChange={(e) => setReqBounty(e.target.value)}
                    className="w-24 pl-7 pr-3 py-1.5 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingReq}
                className="btn-violet-primary py-3 px-8 text-xs font-extrabold shadow-md w-full sm:w-auto"
              >
                <Send className="w-4 h-4" />
                <span>{submittingReq ? 'Sending Request...' : `Send Topic Request to ${activePeer.full_name}`}</span>
              </button>
            </div>
          </form>
        </div>
      )}

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
              <p className="text-2xl font-black text-emerald-700">₹{activePeer.total_earnings || 0}</p>
            </div>

            <div className="bg-[#f8f6ff] p-4 rounded-xl border border-purple-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Balance</span>
              <p className="text-2xl font-black text-[#2e1065]">₹{activePeer.available_balance || 0}</p>
            </div>
          </div>

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

      {/* Peer Contributions & Video Explanations Catalog */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-purple-200 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#6d28d9]" />
            <h2 className="text-2xl font-black text-[#2e1065]">
              {activePeer.full_name}'s Contributions & Explanations ({activePeer.explanations?.length || 0})
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500">Includes free walkthroughs & unlockable premium explanations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePeer.explanations?.map((item: any) => (
            <ContentCard key={item.id} content={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
