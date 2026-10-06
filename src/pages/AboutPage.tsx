import React from 'react';
import { useApp } from '../context/AppContext';
import { DEFAULT_SITE_CONTENT } from '../data/defaultContent';
import {
  Target,
  Shield,
  Layers,
  CheckCircle,
  AlertTriangle,
  Calendar,
  FileCheck,
  TrendingUp,
  Users,
  Award,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { siteContent } = useApp();
  const content = { ...DEFAULT_SITE_CONTENT, ...(siteContent || {}) };
  const objectives = Array.isArray(content.aboutObjectives) && content.aboutObjectives.length > 0
    ? content.aboutObjectives
    : DEFAULT_SITE_CONTENT.aboutObjectives;

  return (
    <div className="space-y-12 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">
            Academic Context & Governance
          </span>
          <span className="text-[11px] bg-teal-100 text-brand-teal px-2 py-0.5 rounded-full font-medium">
            Community Engagement Project (CEP)
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
          About Skill Bridge & Fieldwork Methodology
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Understanding student placement needs, demonstrating unified communication and training tools,
          and establishing accountable institutional follow-up mechanisms.
        </p>
      </div>

      {/* Purpose & Problem Statement */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-brand-navy">Project Purpose</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {content.projectDescription}
          </p>
          <div className="p-3.5 bg-teal-50/80 border border-teal-200/80 rounded-xl text-xs text-teal-900">
            <strong>Portal Value Proposition:</strong> Centralizes verified placement opportunities, provides automated skill matching, schedules modular preparation clinics, and maintains accountable grievance tracking.
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-brand-navy">Problem Statement</h2>
          <blockquote className="p-4 border-l-4 border-brand-blue bg-blue-50/50 rounded-r-xl text-slate-700 italic text-xs sm:text-sm leading-relaxed">
            "{content.aboutProblemStatement}"
          </blockquote>
          <p className="text-xs text-slate-600 leading-relaxed">
            Inter-branch imbalances between mass IT recruitment and core engineering roles require
            transparent data, proactive employer outreach, and accessible training clinics.
          </p>
        </div>
      </section>

      {/* Core Objectives */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-brand-navy">Core Academic Objectives</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {objectives.map((obj, i) => (
            <div key={i} className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-teal-100 text-brand-teal font-bold text-xs flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-xs text-slate-700 leading-relaxed">{obj}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Project Team & Domain Focus */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] bg-purple-100 text-brand-purple px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3 h-3" /> CEP Project Team
              </span>
              <span className="text-[11px] bg-blue-100 text-brand-blue px-2 py-0.5 rounded-full font-medium">
                CS &amp; IT Domain Focus
              </span>
            </div>
            <h2 className="text-xl font-bold text-brand-navy">Project Leadership &amp; Contributors</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Computer Science &amp; Information Technology Focus</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Team Leader */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 to-purple-50/70 border border-blue-200 shadow-xs card-hover-lift relative">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-blue text-white text-[10px] font-bold uppercase tracking-wider mb-2 shadow-2xs">
              Team Leader
            </span>
            <h3 className="font-extrabold text-brand-navy text-base">Dhiraj Tedndulkar</h3>
            <p className="text-xs text-slate-600 mt-1">Project Lead &amp; Architecture</p>
            <p className="text-[11px] text-brand-purple font-semibold mt-2">Computer Science &amp; IT Domain</p>
          </div>

          {/* Member 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 card-hover-lift">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-2">
              Team Member
            </span>
            <h3 className="font-bold text-brand-navy text-base">Vidhi Mahato</h3>
            <p className="text-xs text-slate-600 mt-1">Research &amp; Needs Assessment</p>
            <p className="text-[11px] text-slate-500 mt-2">Fieldwork &amp; Focus Group Lead</p>
          </div>

          {/* Member 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 card-hover-lift">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-2">
              Team Member
            </span>
            <h3 className="font-bold text-brand-navy text-base">Gaurav Mhatre</h3>
            <p className="text-xs text-slate-600 mt-1">Prototype Testing &amp; Usability</p>
            <p className="text-[11px] text-slate-500 mt-2">Testing Protocols &amp; Analytics</p>
          </div>

          {/* Member 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 card-hover-lift">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-2">
              Team Member
            </span>
            <h3 className="font-bold text-brand-navy text-base">Varun Patil</h3>
            <p className="text-xs text-slate-600 mt-1">Evaluation &amp; Coordinator Liaison</p>
            <p className="text-[11px] text-slate-500 mt-2">Traceability &amp; Documentation</p>
          </div>
        </div>
      </section>

      {/* Demonstrative Capabilities */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-brand-navy">What Skill Bridge Demonstrates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs card-hover-lift space-y-2">
            <h3 className="font-bold text-brand-navy text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-purple" />
              1. Student Needs Analysis
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Granular cross-departmental survey analytics measuring reported drive counts, barrier frequencies,
              notice timeliness, and satisfaction indices.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-brand-navy text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-blue" />
              2. Opportunity Discovery
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent, rule-based matching that explains why a vacancy fits a student profile, identifies
              missing skills, and highlights explicit eligibility criteria.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-brand-navy text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-teal" />
              3. Practical Skill Preparation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Discipline-specific training clinics for CAD modeling, PLC ladder logic, quantity surveying,
              financial modeling, and interview case studies.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-brand-navy text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              4. Placement Notice Centralization
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct web-based circulars with upcoming deadline alerts to replace fragmented, multi-tiered
              messaging forwards that introduce 24-48 hour delays.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-brand-navy text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-pink" />
              5. Accountable Feedback Loops
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Structured operational ticketing with unique IDs and mandatory coordinator resolution notes
              to track student concerns transparently.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-brand-navy text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              6. Institutional Action Tracking
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Action Plan Matrix with assigned owners, timelines, and measurable evaluation metrics,
              separating planned actions from verified outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* System Architecture & Deployment Architecture */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-teal uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Technical Architecture & Security</span>
          </div>
          <h2 className="text-2xl font-bold">System Architecture & Institutional Deployment</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              1. Modular Architecture & Data Privacy
            </h3>
            <p>
              Built using React, TypeScript, and responsive Tailwind CSS with decoupled state management.
              Student records are strictly protected with anonymous unique IDs (S001-S200), preventing demographic profiling while enabling robust statistical cohort analysis.
            </p>
            <p className="text-slate-400">
              Technical specializations are categorized into structured subdomains across Computer Science (80), Information Technology (60), and Data Science (60).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-blue" />
              2. Production Readiness & Institutional Roadmap
            </h3>
            <p>
              Designed for immediate institutional rollout across placement cycles:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>Direct CSV data import engine with formula injection sanitization.</li>
              <li>Real-time role-based navigation for Students, Coordinators, and Administrators.</li>
              <li>Pre-and-post assessment tracking across practical departmental workshops.</li>
              <li>Automated notice broadcast pipeline with in-app 48-hour countdown indicators.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
