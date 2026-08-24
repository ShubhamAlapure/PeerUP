import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';
import { AcademicIntegrityNotice } from './AcademicIntegrityNotice';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2e1065] text-white border-t border-purple-900/60 pt-14 pb-8">
      <div className="page-container space-y-10">
        <AcademicIntegrityNotice />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="PeerUP Logo" className="h-10 w-auto bg-white/90 p-1.5 rounded-xl shadow-md object-contain" />
            </div>
            <p className="text-xs text-purple-200 leading-relaxed font-medium">
              The multi-institution peer learning platform connecting students with verified peer tutors, video explanations, and study resources.
            </p>
            <div className="text-xs text-purple-300 flex items-center gap-1">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
              <span>for university students in Pune & worldwide.</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs text-purple-200 font-medium">
              <li><a href="/repository" className="hover:text-white transition-colors">Free Assignment Repository</a></li>
              <li><a href="/peers" className="hover:text-white transition-colors">Verified Campus Peers</a></li>
              <li><a href="/requests" className="hover:text-white transition-colors">Topic Requests</a></li>
              <li><a href="/create-explanation" className="hover:text-white transition-colors">Earn by Teaching</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-4">Premier Pune Institutions</h4>
            <ul className="space-y-2.5 text-xs text-purple-200 font-medium">
              <li><a href="/institution/inst-mit-adt" className="text-white font-bold hover:underline">1. MIT ADT University</a> (Pune)</li>
              <li><span className="text-white font-bold">2. COEP Technological Univ</span> (Pune)</li>
              <li><span className="text-white font-bold">3. SPPU (Univ of Pune)</span> (Pune)</li>
              <li><span className="text-white font-bold">4. Symbiosis International</span> (Pune)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-4">Academic Integrity</h4>
            <p className="text-xs text-purple-200 leading-relaxed mb-3 font-medium">
              PeerUP is committed to true conceptual understanding. We strictly prohibit ghostwriting and assignment substitution.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/40 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Honor Code Compliant</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-purple-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-purple-300 font-medium gap-4">
          <p>© {new Date().getFullYear()} PeerUP Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Honor Code</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
