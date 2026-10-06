import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageId } from '../components/layout/Navbar';
import { calculateSummaryMetrics } from '../utils/calculations';
import { DEFAULT_SITE_CONTENT } from '../data/defaultContent';
import {
  Briefcase,
  BarChart2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Clock,
  Building2,
  Layers,
  Sparkles,
  BookOpen,
  Shield,
  Code2,
  Cpu,
  Database,
  Network,
} from 'lucide-react';

interface HomePageProps {
  setCurrentPage: (page: PageId) => void;
}

// Lightweight intersection reveal helper respecting prefers-reduced-motion
const SectionReveal: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const HomePage: React.FC<HomePageProps> = ({ setCurrentPage }) => {
  const { responses, responsesSummary, siteContent } = useApp();
  const metrics = useMemo(() => {
    if (responses.length > 0) return calculateSummaryMetrics(responses);
    if (responsesSummary) return responsesSummary;
    return calculateSummaryMetrics([]);
  }, [responses, responsesSummary]);
  const content = { ...DEFAULT_SITE_CONTENT, ...(siteContent || {}) };

  return (
    <div className="space-y-16 lg:space-y-20 pb-16 animate-in fade-in duration-300">
      {/* ============================================================== */}
      {/* 1. HERO SECTION: BALANCED ENTERPRISE COMPOSITION               */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 lg:p-12 xl:p-14 shadow-xl border border-slate-800/80 w-full">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Left Column: Headline, Actions & Context */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/25 text-blue-300 text-xs font-semibold tracking-wide animate-hero-fade mb-5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Community Engagement Project (CEP)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[48px] font-bold text-white leading-tight sm:leading-snug lg:leading-[1.22] max-w-3xl mb-4 animate-hero-stagger-1">
              {content.heroHeadline}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl mb-7 animate-hero-stagger-2">
              {content.heroSupportingText}
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 animate-hero-stagger-3">
              <button
                onClick={() => setCurrentPage('opportunities')}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-xs sm:text-sm hover:bg-blue-500 active:scale-[0.98] transition-all duration-200 shadow-md shadow-blue-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                <Briefcase className="w-4 h-4" />
                <span>Explore Opportunities</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentPage('research')}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-slate-800/90 text-slate-200 border border-slate-700/80 font-semibold text-xs sm:text-sm hover:bg-slate-800 hover:text-white active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                <BarChart2 className="w-4 h-4 text-purple-400" />
                <span>View Research Findings</span>
              </button>
            </div>

            {/* Project Mission & Scope Credential */}
            <div className="w-full pt-4 flex items-center gap-2.5 text-xs text-slate-300 border-t border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="leading-snug">
                Community Engagement Project (CEP) • Placement Discovery, Skill Matching & Institutional Governance for CS, IT & DS.
              </span>
            </div>
          </div>

          {/* Right Column: Decorative Vector Node Diagram (Skills & Opportunities Graph) */}
          <div
            className="lg:col-span-5 relative flex items-center justify-center lg:justify-end"
            aria-hidden="true"
            role="presentation"
          >
            <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-2xl relative overflow-hidden animate-float-slow">
              {/* Top Diagram Label */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Skill-Opportunity Matrix
                </span>
                <span className="text-[10px] font-mono text-slate-400">CS • IT • DS</span>
              </div>

              {/* Connected Visual Graph */}
              <div className="relative h-48 w-full flex items-center justify-between px-2">
                {/* Connecting SVG Curves */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 320 180"
                  fill="none"
                >
                  <defs>
                    <linearGradient id="edge-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                      <stop offset="50%" stopColor="#6366F1" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="edge-teal" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0D9488" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                  {/* Left to Center Edges */}
                  <path d="M 45 40 Q 110 50 160 90" stroke="url(#edge-blue)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <path d="M 45 90 L 160 90" stroke="url(#edge-blue)" strokeWidth="2" />
                  <path d="M 45 140 Q 110 130 160 90" stroke="url(#edge-teal)" strokeWidth="1.5" strokeDasharray="3 3" />

                  {/* Center to Right Edges */}
                  <path d="M 160 90 Q 210 50 275 40" stroke="url(#edge-blue)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <path d="M 160 90 L 275 90" stroke="url(#edge-blue)" strokeWidth="2" />
                  <path d="M 160 90 Q 210 130 275 140" stroke="url(#edge-teal)" strokeWidth="1.5" strokeDasharray="3 3" />
                </svg>

                {/* Left Cluster: Technical Skills */}
                <div className="relative z-10 flex flex-col justify-between h-full py-1 space-y-2">
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/90 border border-slate-700/70 text-[10px] text-slate-200 shadow-sm">
                    <Code2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span>DSA & Code</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/90 border border-slate-700/70 text-[10px] text-slate-200 shadow-sm">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span>DevOps & Cloud</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/90 border border-slate-700/70 text-[10px] text-slate-200 shadow-sm">
                    <Database className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    <span>ML & Data SQL</span>
                  </div>
                </div>

                {/* Center Core: Nexus Hub */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 p-0.5 shadow-lg shadow-blue-500/30 flex items-center justify-center animate-pulse-slow">
                    <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                      <Network className="w-5 h-5 text-sky-400" />
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-sky-300 mt-1.5 tracking-wider uppercase">
                    Bridge Nexus
                  </span>
                </div>

                {/* Right Cluster: Curated Opportunities */}
                <div className="relative z-10 flex flex-col justify-between h-full py-1 space-y-2">
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/90 border border-slate-700/70 text-[10px] text-slate-200 shadow-sm">
                    <Briefcase className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span>Full-Stack Eng</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/90 border border-slate-700/70 text-[10px] text-slate-200 shadow-sm">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span>Cloud Associate</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/90 border border-slate-700/70 text-[10px] text-slate-200 shadow-sm">
                    <Briefcase className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    <span>ML Pipeline Eng</span>
                  </div>
                </div>
              </div>

              {/* Bottom Diagram Status */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Transparent Match Scoring
                </span>
                <span className="text-slate-500">Zero Incomplete Notices</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative subtle backdrop glows */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="absolute right-32 bottom-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl -z-0 pointer-events-none" />
      </section>

      {/* ============================================================== */}
      {/* 2. RESEARCH METRICS: COHESIVE DIVIDED BAND                     */}
      {/* ============================================================== */}
      <SectionReveal className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-brand-purple uppercase tracking-wider">
              Student Placement Fieldwork
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">
              Research Metrics at a Glance
            </h2>
          </div>
          <div className="text-xs text-purple-900 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-brand-purple" />
            <span>Student Research Cohort (N = {metrics.totalResponses} Students Across CS, IT & DS)</span>
          </div>
        </div>

        {/* Unified Refined Divided Stat Panel */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {/* Metric 1: Total Responses */}
          <div className="p-6 transition-colors hover:bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Responses
                </span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-brand-purple flex items-center justify-center">
                  <BarChart2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-navy font-sans tracking-tight">
                {metrics.totalResponses}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
              Comprehensive responses across 12 placement parameters
            </p>
          </div>

          {/* Metric 2: Departments */}
          <div className="p-6 transition-colors hover:bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Departments
                </span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-navy font-sans tracking-tight">
                {metrics.departmentsRepresented}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
              CS, IT, and DS Domains
            </p>
          </div>

          {/* Metric 3: Needs Partly or Unmet */}
          <div className="p-6 transition-colors hover:bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Unmet / Partly Met Needs
                </span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-600 font-sans tracking-tight">
                {metrics.partlyOrUnmetPercentage}%
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
              {metrics.partlyOrUnmetCount} of {metrics.partlyOrUnmetDenominator} valid student responses
            </p>
          </div>

          {/* Metric 4: Late or Rare Placement Notices */}
          <div className="p-6 transition-colors hover:bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Late / Rare Notices
                </span>
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-rose-600 font-sans tracking-tight">
                {metrics.lateOrRareInfoPercentage}%
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
              {metrics.lateOrRareInfoCount} of {metrics.lateOrRareInfoDenominator} reporting notice delays
            </p>
          </div>
        </div>
      </SectionReveal>

      {/* ============================================================== */}
      {/* 3. PLATFORM CAPABILITIES: EASY TO SCAN & ACTIONABLE GRID       */}
      {/* ============================================================== */}
      <SectionReveal className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200/90 pb-4">
          <div>
            <div className="text-xs font-bold text-brand-blue uppercase tracking-wider">
              Core Platform Capabilities
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">
              Addressing Student Needs with Tangible Solutions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Demonstrating concrete portal capabilities designed to eliminate information delays, bridge skill gaps, and balance domain access.
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('study')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:text-blue-700 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1.5 py-0.5 self-start sm:self-auto transition-colors"
          >
            <span>Full Gap Analysis & Study</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Capability 1: Opportunity Matching */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold mb-3.5 group-hover:scale-105 transition-transform duration-200">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">Domain-Specific Opportunity Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connects CS, IT, and DS students to curated roles in specialized tracks (AI/ML, Cloud Infrastructure, Full-Stack, Cybersecurity) with transparent match reasoning and upfront eligibility checks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100/90">
              <button
                onClick={() => setCurrentPage('opportunities')}
                className="text-[11px] font-semibold text-brand-blue hover:text-blue-700 inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded px-1 -mx-1 group-hover:translate-x-0.5 transition-all"
              >
                <span>Live in Opportunities Directory</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          {/* Capability 2: Training Clinics */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-teal-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center font-bold mb-3.5 group-hover:scale-105 transition-transform duration-200">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">Hands-On Technical Training Clinics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Modular departmental workshops in Docker, Kubernetes, PyTorch ML, System Design, and DSA live coding to bridge the gap between general aptitude and technical round screening.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100/90">
              <button
                onClick={() => setCurrentPage('student-dashboard')}
                className="text-[11px] font-semibold text-brand-teal hover:text-teal-700 inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 rounded px-1 -mx-1 group-hover:translate-x-0.5 transition-all"
              >
                <span>Live in Student Workspace</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          {/* Capability 3: Direct Notice Hub */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-purple-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-purple flex items-center justify-center font-bold mb-3.5 group-hover:scale-105 transition-transform duration-200">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">Direct Notice Hub & Countdown Reminders</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct official circular broadcasts with mandatory 48-hour application windows, deadline countdown timers, and pinned alerts to prevent missed opportunity deadlines.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100/90">
              <button
                onClick={() => setCurrentPage('opportunities')}
                className="text-[11px] font-semibold text-brand-purple hover:text-purple-700 inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 rounded px-1 -mx-1 group-hover:translate-x-0.5 transition-all"
              >
                <span>Broadcast Engine Active</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          {/* Capability 4: Feedback & Grievance Desk */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-pink-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-brand-pink flex items-center justify-center font-bold mb-3.5 group-hover:scale-105 transition-transform duration-200">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">Transparent Guidance & Grievance Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Anonymous student feedback ticketing with tracked ticket IDs and mandatory coordinator resolution notes, plus 1-on-1 counseling appointment scheduling.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100/90">
              <button
                onClick={() => setCurrentPage('feedback')}
                className="text-[11px] font-semibold text-pink-700 hover:text-pink-800 inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-pink-500 rounded px-1 -mx-1 group-hover:translate-x-0.5 transition-all"
              >
                <span>Live in Feedback Desk</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* ============================================================== */}
      {/* 4. THREE COMMUNITY VISITS PREVIEW                              */}
      {/* ============================================================== */}
      <SectionReveal className="bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-teal-50/50 rounded-3xl border border-slate-200/80 p-6 sm:p-10 space-y-6">
        <div className="max-w-2xl space-y-2">
          <div className="text-xs font-bold text-brand-teal uppercase tracking-wider">
            Community Engagement Fieldwork
          </div>
          <h2 className="text-2xl font-bold text-brand-navy">Three Community Visits</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            A structured framework to document real community visits: Visit 1 Needs Assessment,
            Visit 2 Prototype Testing, and Visit 3 Improved Prototype Evaluation with a traceability matrix.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Visit 1 */}
          <div className="bg-white rounded-2xl p-5 border border-blue-200/80 shadow-xs space-y-2 hover:border-blue-300 transition-colors">
            <div className="text-[11px] font-bold tracking-wide text-brand-blue uppercase">VISIT 1</div>
            <h4 className="font-bold text-slate-900 text-sm">
              Needs Assessment
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Document survey responses, existing skills, employment barriers, employer hiring needs, and key observations.
            </p>
          </div>

          {/* Visit 2 */}
          <div className="bg-white rounded-2xl p-5 border border-purple-200/80 shadow-xs space-y-2 hover:border-purple-300 transition-colors">
            <div className="text-[11px] font-bold tracking-wide text-brand-purple uppercase">VISIT 2</div>
            <h4 className="font-bold text-slate-900 text-sm">Prototype Testing</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Record tasks attempted by participants, completion status, observed difficulties, user suggestions, and planned changes.
            </p>
          </div>

          {/* Visit 3 */}
          <div className="bg-white rounded-2xl p-5 border border-teal-200/80 shadow-xs space-y-2 hover:border-teal-300 transition-colors">
            <div className="text-[11px] font-bold tracking-wide text-brand-teal uppercase">VISIT 3</div>
            <h4 className="font-bold text-slate-900 text-sm">Improved Prototype Evaluation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Demonstrate changes, log participant re-test results, gather final feedback, document remaining issues, and set next steps.
            </p>
          </div>
        </div>

        <div className="pt-2 text-center sm:text-left">
          <button
            onClick={() => setCurrentPage('study')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-teal text-white text-xs font-semibold hover:bg-teal-700 active:scale-[0.98] transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <Calendar className="w-4 h-4" />
            <span>Open Three Community Visits Documentation</span>
          </button>
        </div>
      </SectionReveal>

      {/* ============================================================== */}
      {/* 5. WORKSPACE ROLE PREVIEWS: DUAL PERSPECTIVES                  */}
      {/* ============================================================== */}
      <SectionReveal className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="text-xs font-bold text-brand-teal uppercase tracking-wider">
            Operational Workspaces
          </div>
          <h2 className="text-2xl font-bold text-brand-navy">Dual Dedicated Perspectives</h2>
          <p className="text-xs text-slate-500">
            Switch demo roles in the top bar to inspect how Skill Bridge caters to both students and coordinators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Student Perspective */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs hover:border-teal-300 transition-colors space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-brand-teal flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-brand-navy">Student Workspace</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provides students with transparent, rule-based job matching, explicit eligibility checks,
                practical training workshop enrollment, deadline reminders, and one-on-one guidance booking.
              </p>
              <ul className="text-xs text-slate-600 space-y-2.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                  <span>Transparent matching with plain-language reasons</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                  <span>Hands-on training clinics for core and non-core roles</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                  <span>Demonstration application tracking with duplicate prevention</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentPage('student-dashboard')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-teal hover:text-teal-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded px-1.5 py-0.5"
              >
                <span>Open Student Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Placement Coordinator Perspective */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs hover:border-purple-300 transition-colors space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-brand-purple flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-brand-navy">Placement Cell Dashboard</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Equips coordinators with real-time empirical research summaries, department-wise demand trends,
                employer outreach management, and transparent feedback ticket resolution.
              </p>
              <ul className="text-xs text-slate-600 space-y-2.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-purple flex-shrink-0" />
                  <span>Centralized employer outreach tracking by branch</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-purple flex-shrink-0" />
                  <span>Action plan accountability tracker with timeline milestones</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-purple flex-shrink-0" />
                  <span>Student feedback queue requiring resolution notes</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentPage('placement-dashboard')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-purple hover:text-purple-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded px-1.5 py-0.5"
              >
                <span>Open Placement Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </SectionReveal>
    </div>
  );
};
