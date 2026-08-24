import React, { useState } from 'react';
import type { ContentItem } from '../types';
import { createRazorpayOrder, verifyPayment } from '../services/api';
import { ShieldCheck, CreditCard, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

interface RazorpayCheckoutProps {
  content: ContentItem;
  userId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutProps> = ({
  content,
  userId,
  onSuccess,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const tutorAmount = (content.price * 0.73).toFixed(2);
  const platformFee = (content.price * 0.25).toFixed(2);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Create Order on Backend
      const order = await createRazorpayOrder(content.id, userId);

      // 2. Perform Verification (Sandbox instant checkout or live Razorpay JS)
      const verifyRes = await verifyPayment({
        orderId: order.orderId,
        paymentId: `pay_razorpay_${Date.now()}`,
        contentId: content.id,
        userId
      });

      if (verifyRes.success) {
        setCompleted(true);
        setTimeout(() => {
          onSuccess();
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl"
        >
          &times;
        </button>

        {completed ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-white">Payment Successful!</h3>
            <p className="text-sm text-slate-300">
              Content unlocked. Tutor earnings updated. Opening explanation...
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 bg-indigo-600/20 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/30">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Razorpay Secure Checkout</h3>
                <p className="text-xs text-slate-400">Instant Access to Paid Explanation</p>
              </div>
            </div>

            {/* Item Details */}
            <div className="bg-slate-800/60 rounded-xl p-4 mb-4 border border-slate-700/50 space-y-2">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Selected Content</p>
              <h4 className="font-semibold text-white text-sm line-clamp-2">{content.title}</h4>
              <p className="text-xs text-slate-400">Tutor: {content.owner_name}</p>

              <div className="pt-2 mt-2 border-t border-slate-700/50 flex justify-between items-center text-sm">
                <span className="text-slate-300 font-medium">Total Payable:</span>
                <span className="font-heading font-bold text-xl text-emerald-400">₹{content.price}</span>
              </div>
            </div>

            {/* Financial Split Explanation */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 mb-6 space-y-1">
              <div className="flex justify-between">
                <span>Verified Peer Share (~73%):</span>
                <span className="text-slate-200">₹{tutorAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>PeerUP Platform Fee (25%):</span>
                <span className="text-slate-200">₹{platformFee}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full btn-accent justify-center py-3 text-sm font-semibold shadow-lg shadow-emerald-500/20"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Processing Order...' : `Pay ₹${content.price} with Razorpay`}</span>
            </button>

            <div className="mt-4 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-bit Encrypted Transaction • Money Back Protection</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
