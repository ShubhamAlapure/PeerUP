import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const AcademicIntegrityNotice: React.FC<{ compact?: boolean }> = ({ compact: _compact }) => {
  return (
    <div className="bg-amber-50 border border-amber-300/80 rounded-xl p-4 flex items-center gap-3 text-amber-900 shadow-xs">
      <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
        <ShieldAlert className="w-5 h-5 text-amber-700" />
      </div>
      <div className="text-xs font-medium leading-relaxed">
        <strong className="font-extrabold text-amber-950 uppercase tracking-wide mr-1">Academic Integrity Guarantee:</strong>
        <span className="text-amber-900">
          For reference and learning purposes only. Do not submit another student's work as your own.
        </span>
      </div>
    </div>
  );
};
