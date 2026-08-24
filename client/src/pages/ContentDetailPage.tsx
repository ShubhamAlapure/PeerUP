import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getContentDetails, checkAccess, submitRating } from '../services/api';
import type { ContentItem } from '../types';
import { RazorpayCheckoutModal } from '../components/RazorpayCheckoutModal';
import { AcademicIntegrityNotice } from '../components/AcademicIntegrityNotice';
import { Mic, Star, Lock, Eye, Download, CheckCircle2, AlertCircle } from 'lucide-react';

export const ContentDetailPage: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const { currentUser } = useAuth();

  const [content, setContent] = useState<ContentItem | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // Rating State
  const [stars, setStars] = useState(5);
  const [isHelpful, _setIsHelpful] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!contentId) return;
      try {
        const data = await getContentDetails(contentId);
        setContent(data);

        const accessRes = await checkAccess(currentUser.id, contentId);
        setHasAccess(accessRes.hasAccess || data.is_free);
      } catch (err) {
        console.error('Content detail error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [contentId, currentUser]);

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentId) return;
    try {
      setRatingError(null);
      await submitRating({
        user_id: currentUser.id,
        content_id: contentId,
        stars,
        is_helpful: isHelpful,
        review_text: reviewText
      });
      setRatingSubmitted(true);
    } catch (err: any) {
      setRatingError(err.message || 'Rating submission failed.');
    }
  };

  if (loading || !content) {
    return (
      <div className="page-container py-20 text-center text-slate-500 font-medium text-sm">
        <p className="animate-pulse">Loading explanation module...</p>
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-[#6d28d9] font-extrabold text-[11px] px-2.5 py-1 rounded-md uppercase border border-purple-200">
              {content.content_type.replace('_', ' ')}
            </span>
            <span className="text-xs font-bold text-slate-600">{content.institution_name}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-extrabold text-[#6d28d9]">{content.subject_name}</span>
          </div>

          {content.is_free ? (
            <span className="bg-emerald-100 text-emerald-800 font-extrabold text-sm px-3 py-1 rounded-md border border-emerald-200">
              FREE
            </span>
          ) : (
            <span className="bg-purple-100 text-[#6d28d9] font-black text-sm px-3 py-1 rounded-md border border-purple-200">
              ₹{content.price}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-[#2e1065]">{content.title}</h1>

        <div className="flex items-center justify-between text-xs text-slate-600 pb-4 border-b border-purple-200">
          <div className="flex items-center gap-3">
            <img
              src={content.owner_avatar}
              alt={content.owner_name}
              className="w-9 h-9 rounded-full object-cover border border-purple-300"
            />
            <div>
              <p className="font-extrabold text-[#2e1065]">{content.owner_name}</p>
              <p className="text-[10px] text-slate-500 font-bold">Verified Senior Peer Educator</p>
            </div>
          </div>

          <div className="flex items-center gap-4 font-semibold">
            <div className="flex items-center gap-1 text-amber-600 font-bold">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{content.average_rating || 4.9} ({content.total_ratings || 38} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <Eye className="w-4 h-4" />
              <span>{content.view_count || 342} Views</span>
            </div>
          </div>
        </div>
      </div>

      <AcademicIntegrityNotice />

      {/* Main Content Player Container */}
      <div className="violet-panel space-y-6">
        {hasAccess ? (
          <div className="space-y-6">
            {/* Video Stream Player */}
            {content.content_type === 'video' && content.video && (
              <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-purple-300">
                <video
                  src={content.video.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Audio Stream Player */}
            {content.content_type === 'audio' && content.audio && (
              <div className="bg-[#f8f6ff] p-8 rounded-xl border border-purple-200 text-center space-y-4">
                <Mic className="w-12 h-12 text-[#6d28d9] mx-auto" />
                <h3 className="font-extrabold text-[#2e1065] text-lg">Audio Explanation Stream</h3>
                <audio src={content.audio.audio_url} controls className="w-full max-w-md mx-auto" />
              </div>
            )}

            {/* Text Body */}
            {content.text && (
              <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {content.text.body_markdown}
              </div>
            )}

            {/* File Downloads */}
            {content.files && content.files.length > 0 && (
              <div className="bg-[#f8f6ff] p-4 rounded-xl border border-purple-200 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-[#2e1065] text-sm">{content.files[0].file_name}</h4>
                  <p className="text-xs text-slate-500 font-medium">PDF Reference Material</p>
                </div>
                <a href={content.files[0].file_url} target="_blank" rel="noopener noreferrer" className="btn-violet-primary py-2 px-4 text-xs">
                  <Download className="w-4 h-4" />
                  <span>Download File</span>
                </a>
              </div>
            )}

            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Unlocked. Unlimited playback granted to your account.</span>
            </div>
          </div>
        ) : (
          /* Gated Locked Access State */
          <div className="py-12 px-6 text-center space-y-6 bg-[#f8f6ff] rounded-xl border border-purple-200">
            <div className="w-16 h-16 bg-[#6d28d9] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-2xl font-black text-[#2e1065]">Paid Explanation Locked</h2>
              <p className="text-xs text-slate-600 font-medium">
                Unlock full access to this peer video explanation and supporting reference material.
              </p>
            </div>

            <button
              onClick={() => setShowCheckout(true)}
              className="btn-violet-primary py-3 px-8 text-sm font-extrabold"
            >
              <span>Unlock Explanation for ₹{content.price}</span>
            </button>
          </div>
        )}
      </div>

      {/* Ratings & Reviews Section */}
      <div className="violet-panel space-y-4">
        <h3 className="font-extrabold text-[#2e1065] text-lg">Leave Feedback & Rating</h3>

        {ratingSubmitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Thank you! Your feedback helps other students on PeerUP.</span>
          </div>
        ) : (
          <form onSubmit={handleRatingSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setStars(num)}
                    className="p-1"
                  >
                    <Star className={`w-5 h-5 ${num <= stars ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Was this explanation clear? Write a short review..."
              className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#6d28d9]"
            />

            {ratingError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{ratingError}</span>
              </div>
            )}

            <button type="submit" className="btn-violet-secondary py-2 px-4 text-xs font-bold">
              <span>Submit Review</span>
            </button>
          </form>
        )}
      </div>

      {/* Razorpay Checkout Modal */}
      {showCheckout && (
        <RazorpayCheckoutModal
          content={content}
          userId={currentUser.id}
          onSuccess={() => {
            setHasAccess(true);
            setShowCheckout(false);
          }}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
};
