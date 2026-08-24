import React from 'react';
import type { ContentItem } from '../types';
import { Video, Mic, FileText, FileSpreadsheet, Star, Download, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ContentCard: React.FC<{ content: ContentItem; onPurchaseTrigger?: () => void }> = ({ content, onPurchaseTrigger: _onPurchaseTrigger }) => {
  const renderTypeIcon = () => {
    switch (content.content_type) {
      case 'video':
        return <Video className="w-4 h-4 text-[#5c33cf]" />;
      case 'audio':
        return <Mic className="w-4 h-4 text-emerald-600" />;
      case 'pdf_explanation':
        return <FileSpreadsheet className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="purple-card flex flex-col justify-between p-5 space-y-4 border-t-4 border-t-[#5c33cf]">
      <div className="space-y-3">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-[#5c33cf] font-extrabold text-[11px] uppercase tracking-wider border border-purple-200">
            {renderTypeIcon()}
            <span>{content.content_type.replace('_', ' ')}</span>
          </span>

          {content.is_free ? (
            <span className="bg-emerald-50 text-emerald-800 font-extrabold text-xs px-2.5 py-1 rounded-md border border-emerald-200">
              FREE
            </span>
          ) : (
            <span className="bg-purple-100 text-[#5c33cf] font-black text-sm px-2.5 py-1 rounded-md border border-purple-200">
              ₹{content.price}
            </span>
          )}
        </div>

        <Link to={`/content/${content.id}`}>
          <h3 className="font-extrabold text-base text-slate-900 hover:text-[#5c33cf] transition-colors line-clamp-2">
            {content.title}
          </h3>
        </Link>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
          {content.description}
        </p>

        {/* Peer Author & Subject Context */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <img
              src={content.owner_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
              alt={content.owner_name}
              className="w-6 h-6 rounded-full object-cover border border-purple-300"
            />
            <span className="text-slate-900 font-bold truncate max-w-[120px]">{content.owner_name}</span>
          </div>

          <div className="flex items-center gap-1 text-amber-600 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{content.average_rating || 4.9}</span>
          </div>
        </div>
      </div>

      <Link
        to={`/content/${content.id}`}
        className="w-full btn-purple-primary justify-center py-2.5 text-xs font-bold"
      >
        {content.content_type === 'video' && <PlayCircle className="w-4 h-4 text-purple-200" />}
        {content.content_type === 'pdf_explanation' && <Download className="w-4 h-4 text-amber-300" />}
        <span>{content.is_free ? 'View Free Explanation' : `Unlock Explanation (₹${content.price})`}</span>
      </Link>
    </div>
  );
};
