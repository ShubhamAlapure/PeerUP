import React, { useState } from 'react';
import { reportAcademicResource } from '../services/api';
import { X, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface ReportResourceModalProps {
  resourceId: string;
  resourceTitle: string;
  reporterId: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const ReportResourceModal: React.FC<ReportResourceModalProps> = ({
  resourceId,
  resourceTitle,
  reporterId,
  onClose,
  onSubmitted
}) => {
  const [reason, setReason] = useState<string>('academic_integrity');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await reportAcademicResource(resourceId, {
        reporter_id: reporterId,
        reason,
        description
      });
      setSuccess(true);
      setTimeout(() => {
        if (onSubmitted) onSubmitted();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit resource report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-6 border-2 border-purple-200 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-2 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#2e1065] text-lg">Report Academic Resource</h3>
            <p className="text-xs text-slate-500 font-medium truncate max-w-[260px]">{resourceTitle}</p>
          </div>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-extrabold text-emerald-950 text-base">Report Submitted</h4>
            <p className="text-xs text-emerald-800 font-medium max-w-xs mx-auto">
              Thank you for keeping PeerUP safe. Our admin moderation team will review this report shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Reason for Report</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-[#6d28d9]"
              >
                <option value="incorrect_information">Incorrect or misleading information</option>
                <option value="copyright_concern">Copyright or authorship concern</option>
                <option value="inappropriate_content">Inappropriate content or language</option>
                <option value="spam">Spam or irrelevant document</option>
                <option value="academic_integrity">Academic integrity violation</option>
                <option value="other">Other issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#2e1065] mb-1">Additional Details (Optional)</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the specific issue with this resource..."
                className="w-full p-3 bg-[#f8f6ff] border border-purple-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-[#6d28d9]"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-bold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-violet-secondary py-2.5 px-4 text-xs font-bold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="btn-violet-primary py-2.5 px-5 text-xs font-extrabold bg-amber-600 hover:bg-amber-700 text-white border-none shadow-md"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
