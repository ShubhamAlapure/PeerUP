import React from 'react';
import type { Institution } from '../types';
import { MapPin, Building, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const InstitutionCard: React.FC<{ institution: Institution }> = ({ institution }) => {
  return (
    <div className="violet-card p-5 flex flex-col justify-between space-y-4 border-t-4 border-t-[#6d28d9]">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <img
            src={institution.logo_url}
            alt={institution.name}
            className="w-14 h-14 rounded-xl object-cover border border-purple-200 shadow-xs"
          />
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Verified</span>
          </span>
        </div>

        <h3 className="font-extrabold text-base text-[#2e1065] hover:text-[#6d28d9] transition-colors line-clamp-2">
          {institution.name}
        </h3>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-[#6d28d9]" />
          <span>{institution.city}, {institution.state}</span>
          <span>•</span>
          <Building className="w-3.5 h-3.5 text-purple-400" />
          <span className="capitalize">{institution.type}</span>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
          {institution.description || 'Comprehensive institution curriculum & student learning environment.'}
        </p>
      </div>

      <Link
        to={`/institution/${institution.id}`}
        className="w-full btn-violet-secondary justify-center py-2.5 text-xs font-bold"
      >
        <span>Explore Environment</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
};
