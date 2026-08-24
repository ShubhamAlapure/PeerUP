import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getInstitutionTree, getInstitutions, getContentList } from '../services/api';
import type { Institution, ContentItem } from '../types';
import { ContentCard } from '../components/ContentCard';
import { AcademicIntegrityNotice } from '../components/AcademicIntegrityNotice';
import { Building, MapPin, ChevronRight, Folder, BookOpen, Layers } from 'lucide-react';

export const InstitutionDetailPage: React.FC = () => {
  const { institutionId } = useParams<{ institutionId: string }>();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [academicTree, setAcademicTree] = useState<any>(null);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!institutionId) return;
      try {
        const insts = await getInstitutions();
        const found = insts.find(i => i.id === institutionId) || insts[0];
        setInstitution(found);

        const treeData = await getInstitutionTree(found.id);
        setAcademicTree(treeData);

        const cnts = await getContentList({ institution_id: found.id });
        setContents(cnts);
      } catch (err) {
        console.error('Institution detail load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [institutionId]);

  if (loading || !institution) {
    return (
      <div className="page-container py-20 text-center text-slate-500 font-medium text-sm">
        <p className="animate-pulse">Loading institution academic environment...</p>
      </div>
    );
  }

  const filteredContents = selectedSubjectId
    ? contents.filter(c => c.subject_id === selectedSubjectId)
    : contents;

  return (
    <div className="page-container py-10 space-y-8">
      {/* Institution Banner */}
      <div className="violet-card p-8 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-l-4 border-l-[#6d28d9]">
        <div className="flex items-center gap-5">
          <img
            src={institution.logo_url}
            alt={institution.name}
            className="w-20 h-20 rounded-2xl object-cover border border-purple-200 shadow-xs"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                ✓ Verified Institution
              </span>
              <span className="text-xs font-semibold text-slate-500 capitalize">{institution.type}</span>
            </div>
            <h1 className="text-3xl font-black text-[#2e1065]">{institution.name}</h1>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#6d28d9]" />
                {institution.city}, {institution.state}
              </span>
              <span>•</span>
              <span>{institution.country}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#f8f6ff] p-4 rounded-xl border border-purple-200 text-center min-w-[160px]">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Explanations Catalog</span>
          <p className="text-2xl font-black text-[#2e1065]">{contents.length} Items</p>
        </div>
      </div>

      <AcademicIntegrityNotice />

      {/* Academic Structure & Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Academic Tree Hierarchy Explorer */}
        <div className="violet-panel space-y-6">
          <div className="flex items-center gap-2 border-b border-purple-200 pb-3">
            <Layers className="w-5 h-5 text-[#6d28d9]" />
            <h2 className="font-extrabold text-[#2e1065] text-base">Academic Structure Tree</h2>
          </div>

          {academicTree && academicTree.departments ? (
            <div className="space-y-4 text-xs">
              {academicTree.departments.map((dept: any) => (
                <div key={dept.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-[#2e1065] font-extrabold text-sm">
                    <Building className="w-4 h-4 text-[#6d28d9]" />
                    <span>{dept.name} ({dept.code})</span>
                  </div>

                  {dept.programs?.map((prog: any) => (
                    <div key={prog.id} className="pl-4 space-y-2 border-l border-purple-200">
                      <p className="text-slate-800 font-bold">{prog.name}</p>

                      {prog.years?.map((yr: any) => (
                        <div key={yr.id} className="pl-3 space-y-1">
                          <p className="text-slate-600 font-bold">{yr.label}</p>

                          {yr.semesters?.map((sem: any) => (
                            <div key={sem.id} className="pl-3 space-y-1">
                              <p className="text-slate-500 font-medium">{sem.label}</p>

                              <div className="space-y-1">
                                {sem.subjects?.map((subj: any) => (
                                  <button
                                    key={subj.id}
                                    onClick={() => setSelectedSubjectId(selectedSubjectId === subj.id ? null : subj.id)}
                                    className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center justify-between font-bold ${
                                      selectedSubjectId === subj.id
                                        ? 'bg-[#6d28d9] text-white shadow-xs'
                                        : 'bg-[#f8f6ff] text-slate-800 hover:bg-purple-100'
                                    }`}
                                  >
                                    <span className="flex items-center gap-1.5 truncate">
                                      <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                                      {subj.name}
                                    </span>
                                    <ChevronRight className="w-3 h-3 text-purple-400" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-medium">No departments configured yet.</p>
          )}
        </div>

        {/* Content & Explanations List for Selected Academic Subject */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-purple-200 pb-3">
            <div>
              <h2 className="font-black text-[#2e1065] text-xl">Academic Explanations & References</h2>
              <p className="text-xs text-slate-600 font-medium">
                {selectedSubjectId ? 'Filtered by selected subject' : 'All institution study resources'}
              </p>
            </div>

            {selectedSubjectId && (
              <button
                onClick={() => setSelectedSubjectId(null)}
                className="text-xs font-bold text-[#6d28d9] hover:underline"
              >
                Clear Filter
              </button>
            )}
          </div>

          {filteredContents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredContents.map(item => (
                <ContentCard key={item.id} content={item} />
              ))}
            </div>
          ) : (
            <div className="violet-panel text-center py-12 space-y-3">
              <Folder className="w-12 h-12 text-purple-400 mx-auto" />
              <h3 className="font-extrabold text-[#2e1065] text-base">Nothing here yet</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium">
                Be the first peer to upload a reference or record an explanation for this subject.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
