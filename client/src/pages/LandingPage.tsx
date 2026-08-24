import React, { useState, useEffect } from 'react';
import { getInstitutions, getPeers, getContentList } from '../services/api';
import type { Institution, PeerProfile, ContentItem } from '../types';
import { InstitutionCard } from '../components/InstitutionCard';
import { PeerCard } from '../components/PeerCard';
import { ContentCard } from '../components/ContentCard';
import { AcademicIntegrityNotice } from '../components/AcademicIntegrityNotice';
import { Search, Flame, ArrowRight, Clock, Award, BookOpen, Quote } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [peers, setPeers] = useState<PeerProfile[]>([]);
  const [featuredContent, setFeaturedContent] = useState<ContentItem[]>([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState('Courses');
  const [activeSubjectFilter, setActiveSubjectFilter] = useState('Featured');
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const insts = await getInstitutions();
        const prs = await getPeers();
        const cnts = await getContentList();
        setInstitutions(insts);
        setPeers(prs);
        setFeaturedContent(cnts);
      } catch (err) {
        console.error('Landing page data fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleGuestInteraction = (targetPath: string) => {
    if (!session) {
      navigate('/login');
    } else {
      navigate(targetPath);
    }
  };

  const filteredInstitutions = institutions.filter(inst =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-16 pb-20 bg-[#f8f6ff]">
      {/* 1. Hero Section - Deep Violet Gradient */}
      <section className="bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column Text & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none font-serif-hero">
              Back in action. <br />
              <span className="text-[#f59e0b]">Back to learning.</span>
            </h1>

            <p className="text-lg text-purple-100 max-w-xl leading-relaxed font-medium">
              It's the season to start learning something new. Understand difficult university topics, discover assignment reference materials, and learn from verified peers.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to={session ? "/repository" : "/login"} className="btn-violet-primary text-base">
                <span>Explore courses</span>
              </Link>
              <Link to={session ? "/peers" : "/signup"} className="btn-violet-secondary bg-white/10 text-white border-white/30 hover:bg-white/20 text-base">
                <span>Learn more</span>
              </Link>
            </div>

            <p className="text-xs text-purple-200 font-medium">
              Offer ends September 16th, 2026. <span className="underline cursor-pointer">ⓘ</span>
            </p>
          </div>

          {/* Right Column Featured Cards Carousel */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => handleGuestInteraction('/institution/inst-mit-adt')}
              className="violet-card bg-white text-slate-900 p-5 space-y-3 border-t-4 border-t-[#6d28d9] cursor-pointer hover:shadow-lg transition-all"
            >
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">MicroMasters</span>
              <div className="h-10 flex items-center">
                <span className="font-extrabold text-sm text-[#2e1065] bg-purple-50 px-3 py-1.5 rounded-md border border-purple-200">
                  MIT ADT University
                </span>
              </div>
              <h3 className="font-extrabold text-base text-[#2e1065] line-clamp-2">
                Database Management Systems: Essential Tools and Methods
              </h3>
              <p className="text-xs text-slate-600 font-medium">MIT ADT University • Computer Engineering</p>
              <div className="pt-2 text-xs text-slate-500 space-y-1 font-medium border-t border-slate-200">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                  <span>3 modules</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>10-minute video limit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-600" />
                  <span>Intermediate level</span>
                </div>
              </div>
            </div>

            <div
              onClick={() => handleGuestInteraction('/institution/inst-coep')}
              className="violet-card bg-white text-slate-900 p-5 space-y-3 border-t-4 border-t-[#d94d1a] cursor-pointer hover:shadow-lg transition-all"
            >
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Course</span>
              <div className="h-10 flex items-center">
                <span className="font-extrabold text-sm text-[#2e1065] bg-purple-50 px-3 py-1.5 rounded-md border border-purple-200">
                  COEP Tech University
                </span>
              </div>
              <h3 className="font-extrabold text-base text-[#2e1065] line-clamp-2">
                Process Synchronization & Semaphores for Operating Systems
              </h3>
              <p className="text-xs text-slate-600 font-medium">COEP Tech • Computer Science</p>
              <div className="pt-2 text-xs text-slate-500 space-y-1 font-medium border-t border-slate-200">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                  <span>Audio & Video</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>6 minutes duration</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-600" />
                  <span>⭐ 4.95 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Real Pune University Logos Strip */}
      <section className="bg-white border-y border-purple-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <p className="text-xs font-black text-[#6d28d9] uppercase tracking-widest text-center flex items-center justify-center gap-1.5">
            <span>Powered by</span>
            <span className="text-red-500 text-sm">❤️</span>
            <span>of Students from Popular Universities & Institutions in Pune</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5 md:gap-8">
            {/* 1. MIT ADT University */}
            <div
              onClick={() => handleGuestInteraction('/institution/inst-mit-adt')}
              className="p-3 bg-[#2e1065] hover:bg-[#3b0764] rounded-2xl border-2 border-[#6d28d9] shadow-md group transition-all flex items-center justify-center min-w-[190px] cursor-pointer"
              title="MIT ADT University"
            >
              <img
                src="/logos/mit-adt.png"
                alt="MIT ADT University"
                className="h-11 sm:h-13 object-contain group-hover:scale-105 transition-transform"
              />
            </div>

            {/* 2. Symbiosis International */}
            <div
              onClick={() => handleGuestInteraction('/institution/inst-symbiosis')}
              className="p-3 bg-white rounded-2xl shadow-xs border border-purple-200 flex items-center justify-center min-w-[160px] cursor-pointer hover:border-purple-400"
            >
              <img
                src="/logos/symbiosis.png"
                alt="Symbiosis International (Deemed University)"
                className="h-9 sm:h-11 object-contain"
              />
            </div>

            {/* 3. MIT World Peace University (MIT-WPU) */}
            <div
              onClick={() => handleGuestInteraction('/institution/inst-mit-wpu')}
              className="p-3 bg-white rounded-2xl shadow-xs border border-purple-200 flex items-center justify-center min-w-[160px] cursor-pointer hover:border-purple-400"
            >
              <img
                src="/logos/mit-wpu.png"
                alt="MIT World Peace University Pune"
                className="h-9 sm:h-11 object-contain"
              />
            </div>

            {/* 4. D Y Patil International University */}
            <div
              onClick={() => handleGuestInteraction('/institution/inst-dypu')}
              className="p-3 bg-white rounded-2xl shadow-xs border border-purple-200 flex items-center justify-center max-w-[240px] cursor-pointer hover:border-purple-400"
              title="D Y Patil International University Akurdi Pune"
            >
              <img
                src="/logos/dypu.png"
                alt="D Y Patil International University Akurdi Pune"
                className="h-10 sm:h-12 object-contain"
              />
            </div>

            {/* 5. Cummins College of Engineering */}
            <div
              onClick={() => handleGuestInteraction('/institution/inst-cummins')}
              className="p-3 bg-white rounded-2xl shadow-xs border border-purple-200 flex items-center justify-center max-w-[260px] cursor-pointer hover:border-purple-400"
            >
              <img
                src="/logos/cummins.png"
                alt="Cummins College of Engineering for Women, Pune"
                className="h-8 sm:h-10 object-contain"
              />
            </div>

            {/* 6. COEP Technological University */}
            <div
              onClick={() => handleGuestInteraction('/institution/inst-coep')}
              className="px-4 py-3 bg-[#f8f6ff] hover:bg-purple-100 rounded-2xl border border-purple-300 shadow-xs group transition-all flex items-center gap-3 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#6d28d9] text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:scale-105 transition-transform">
                COEP
              </div>
              <div className="text-left">
                <span className="block font-black text-xs text-[#2e1065] leading-tight">COEP TECH UNIV</span>
                <span className="block text-[9px] font-bold text-[#6d28d9] uppercase">Pune</span>
              </div>
            </div>

            {/* 7. JSPM Pune */}
            <div
              onClick={() => handleGuestInteraction('/institution/inst-jspm')}
              className="px-4 py-3 bg-[#f8f6ff] hover:bg-purple-100 rounded-2xl border border-purple-300 shadow-xs flex items-center gap-3 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                JSPM
              </div>
              <div className="text-left">
                <span className="block font-black text-xs text-[#2e1065] leading-tight">JSPM PUNE</span>
                <span className="block text-[9px] font-bold text-amber-700 uppercase">Institutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AcademicIntegrityNotice />
      </div>

      {/* 3. The latest on PeerUP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center gap-3">
          <span className="bg-[#6d28d9] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-xs">
            NEW
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#2e1065] font-serif-hero">
            The latest on PeerUP — Explore our newest offerings.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredContent.map(item => (
            <div key={item.id} onClick={() => handleGuestInteraction(`/content/${item.id}`)} className="cursor-pointer">
              <ContentCard content={item} />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Trending on PeerUP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-[#6d28d9]" />
          <h2 className="text-2xl sm:text-3xl font-black text-[#2e1065]">
            Trending on PeerUP
          </h2>
        </div>

        {/* Category Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-purple-200 overflow-x-auto pb-1 text-sm font-bold text-slate-700">
          {['Courses', 'Executive Education', 'Certificates', 'Master\'s Degrees', 'Bachelor\'s Degrees'].map(tab => (
            <button
              key={tab}
              onClick={() => {
                if (!session) {
                  navigate('/login');
                } else {
                  setActiveCategoryTab(tab);
                }
              }}
              className={`px-4 py-2.5 transition-colors whitespace-nowrap ${
                activeCategoryTab === tab
                  ? 'bg-[#6d28d9] text-white rounded-t-lg font-bold'
                  : 'hover:text-[#6d28d9]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Subject Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['Featured', 'Computer Science', 'Business & Management', 'Economics & Finance', 'Data Analysis & Statistics', 'Social Sciences', 'Engineering'].map(pill => (
            <button
              key={pill}
              onClick={() => {
                if (!session) {
                  navigate('/login');
                } else {
                  setActiveSubjectFilter(pill);
                }
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                activeSubjectFilter === pill
                  ? 'bg-[#6d28d9] text-white border-[#6d28d9]'
                  : 'bg-white text-slate-700 border-purple-200 hover:border-purple-400'
              }`}
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Institution Discovery Search & Grid */}
        <div className="space-y-6 pt-4">
          <div className="bg-white p-4 rounded-xl border border-purple-200 flex items-center gap-3 shadow-xs">
            <Search className="w-5 h-5 text-purple-400 ml-2" />
            <input
              type="text"
              placeholder="Search your institution by Name, City, or State (e.g. MIT ADT, COEP Pune, DYPU, Symbiosis, Cummins, JSPM)..."
              value={searchQuery}
              onClick={() => { if (!session) navigate('/login'); }}
              onChange={(e) => {
                if (!session) {
                  navigate('/login');
                } else {
                  setSearchQuery(e.target.value);
                }
              }}
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none font-medium cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredInstitutions.map(inst => (
              <div key={inst.id} onClick={() => handleGuestInteraction(`/institution/${inst.id}`)} className="cursor-pointer">
                <InstitutionCard institution={inst} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Verified Peers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-bold text-[#6d28d9] uppercase tracking-wider">Top Senior Tutors</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2e1065]">Learn from Verified Peers</h2>
          </div>
          <button onClick={() => handleGuestInteraction('/peers')} className="text-sm font-bold text-[#6d28d9] hover:underline flex items-center gap-1">
            <span>View All Tutors</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {peers.map(peer => (
            <div key={peer.id} onClick={() => handleGuestInteraction(`/peer/${peer.id}`)} className="cursor-pointer">
              <PeerCard peer={peer} />
            </div>
          ))}
        </div>
      </section>

      {/* 6. Testimonial Slider */}
      <section className="bg-white border-y border-purple-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <h2 className="text-3xl font-black text-[#2e1065] text-center font-serif-hero">
            Hear what other learners have to say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="violet-card p-6 bg-[#f8f6ff] space-y-4 relative">
              <Quote className="w-6 h-6 text-[#6d28d9]" />
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                "Understanding normalization and process synchronization was effortless thanks to concise 8-minute peer video explanations from my senior batchmates."
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-purple-200">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Kathleen B" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-xs text-[#2e1065]">Ananya S.</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">COEP Tech • Computer Engineering</p>
                </div>
              </div>
            </div>

            <div className="violet-card p-6 bg-[#f8f6ff] space-y-4 relative">
              <Quote className="w-6 h-6 text-[#6d28d9]" />
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                "As a peer tutor on PeerUP, I've earned over ₹3,400 sharing previous assignment references and explaining complex DBMS topics while helping 200+ junior students."
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-purple-200">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Shubham A" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-xs text-[#2e1065]">Shubham A.</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">MIT ADT • 3rd Year CSE</p>
                </div>
              </div>
            </div>

            <div className="violet-card p-6 bg-[#f8f6ff] space-y-4 relative">
              <Quote className="w-6 h-6 text-[#6d28d9]" />
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                "The free assignment reference repository saved my mid-sem revisions. The strict honor code label guarantees everything is for learning reference."
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-purple-200">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Rohit V" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-xs text-[#2e1065]">Rohit V.</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">2nd Year Student • Pune</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
