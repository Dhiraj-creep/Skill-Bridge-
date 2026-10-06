import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DemoOpportunity, OpportunityType, WorkMode, isOpportunityExpired } from '../types/opportunity';
import { Department } from '../types/survey';
import {
  Briefcase,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Calendar,
  MapPin,
  Clock,
  Building,
  CheckCircle,
  AlertCircle,
  X,
  Layers,
  Send,
} from 'lucide-react';
import { PageId } from '../utils/permissions';

interface OpportunitiesPageProps {
  setCurrentPage?: (page: PageId) => void;
}

export const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({ setCurrentPage }) => {
  const {
    user,
    role,
    opportunities,
    savedOpportunityIds,
    toggleSaveOpportunity,
    studentApplications,
    applyToOpportunity,
    studentProfile,
  } = useApp();

  const [applyNotes, setApplyNotes] = useState('');
  const [showApplyNotesInput, setShowApplyNotesInput] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<Department | 'All'>('All');
  const [selectedType, setSelectedType] = useState<OpportunityType | 'All'>('All');
  const [selectedMode, setSelectedMode] = useState<WorkMode | 'All'>('All');
  const [sortBy, setSortBy] = useState<'deadline' | 'postedDate' | 'title'>('deadline');
  const [showExpired, setShowExpired] = useState(false);

  // Selected Detail Modal
  const [selectedOpp, setSelectedOpp] = useState<DemoOpportunity | null>(null);

  // Filtered & Sorted Opportunities
  const filteredOpps = useMemo(() => {
    return opportunities
      .filter((opp) => {
        if (!showExpired && isOpportunityExpired(opp)) {
          return false;
        }
        if (selectedDept !== 'All' && !opp.relevantDepartments.includes(selectedDept)) {
          return false;
        }
        if (selectedType !== 'All' && opp.type !== selectedType) {
          return false;
        }
        if (selectedMode !== 'All' && opp.workMode !== selectedMode) {
          return false;
        }
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchStr = `${opp.title} ${opp.employer} ${opp.location} ${opp.skills.join(' ')} ${opp.description}`.toLowerCase();
          if (!matchStr.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') {
          return a.deadline.localeCompare(b.deadline);
        } else if (sortBy === 'postedDate') {
          return b.postedDate.localeCompare(a.postedDate);
        } else {
          return a.title.localeCompare(b.title);
        }
      });
  }, [opportunities, selectedDept, selectedType, selectedMode, searchQuery, sortBy, showExpired]);

  const hasApplied = (oppId: string) => studentApplications.some((a) => a.opportunityId === oppId);
  const getAppStatus = (oppId: string) => studentApplications.find((a) => a.opportunityId === oppId)?.status;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
            Opportunities Directory
          </span>
          <span className="text-[11px] bg-blue-100 text-brand-blue px-2 py-0.5 rounded-full font-medium">
            Demo Listings ({opportunities.length} Total)
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
          Campus Recruitment & Internship Postings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Demonstration tech recruitment and internship listings covering Computer Science (CS),
          Information Technology (IT), and Data Science (DS) domains with explicit eligibility criteria and verified work parameters.
        </p>

        {/* Demo Mode Notice */}
        <div className="mt-3 p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-brand-blue flex-shrink-0" />
          <span>
            <strong>Demo opportunity — not a live vacancy.</strong> Applications submitted through this
            portal are stored locally in your browser for workflow demonstration. No employer is contacted.
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Search Roles, Employers, Skills
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. React, Python, Full Stack, Machine Learning, Pune..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 pl-8 pr-3 p-2 focus:ring-2 focus:ring-brand-blue focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Domain</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value as any)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-brand-blue focus:outline-none"
            >
              <option value="All">All Domains (CS, IT, DS)</option>
              <option value="Computer Science (CS)">Computer Science (CS)</option>
              <option value="Information Technology (IT)">Information Technology (IT)</option>
              <option value="Data Science (DS)">Data Science (DS)</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Role Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-brand-blue focus:outline-none"
            >
              <option value="All">All Types (Job & Internship)</option>
              <option value="Job">Full-Time Job</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          {/* Work Mode */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Work Mode</label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value as any)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-brand-blue focus:outline-none"
            >
              <option value="All">All Work Modes</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>

        {/* Secondary options & sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={showExpired}
                onChange={(e) => setShowExpired(e.target.checked)}
                className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
              />
              <span>Include expired listings</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs rounded-md border border-slate-300 p-1.5 focus:ring-2 focus:ring-brand-blue"
            >
              <option value="deadline">Registration Deadline (Soonest first)</option>
              <option value="postedDate">Date Posted (Newest first)</option>
              <option value="title">Job Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Displaying {filteredOpps.length} opportunities
          </span>
        </div>

        {filteredOpps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-slate-600 font-medium">No opportunities match the selected criteria.</p>
            <p className="text-slate-400 text-xs mt-1">Try resetting the department or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOpps.map((opp) => {
              const isSaved = savedOpportunityIds.includes(opp.id);
              const applied = hasApplied(opp.id);
              const appStatus = getAppStatus(opp.id);
              const isExpired = isOpportunityExpired(opp);

              return (
                <div
                  key={opp.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs card-hover-lift flex flex-col justify-between ${
                    isExpired
                      ? 'border-slate-300 opacity-60 bg-slate-50/60'
                      : 'border-slate-200/90 hover:border-blue-400'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Type, Status & Save Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs ${
                            opp.type === 'Job'
                              ? 'bg-blue-100 text-brand-blue border border-blue-200/60'
                              : 'bg-teal-100 text-brand-teal border border-teal-200/60'
                          }`}
                        >
                          {opp.type}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200/80 px-2 py-0.5 rounded-full font-medium">
                          {opp.workMode}
                        </span>
                        {opp.subdomain && (
                          <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200/80 px-2.5 py-0.5 rounded-full font-semibold">
                            {opp.subdomain}
                          </span>
                        )}
                        {isExpired && (
                          <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-bold">
                            Expired
                          </span>
                        )}
                        {applied && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>{appStatus}</span>
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => toggleSaveOpportunity(opp.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isSaved
                            ? 'text-brand-purple bg-purple-50'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                        title={isSaved ? 'Remove from saved' : 'Save opportunity'}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-4 h-4 fill-brand-purple" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Title & Employer */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-[15px] leading-snug line-clamp-1">
                        {opp.title}
                      </h3>
                      <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{opp.employer}</span>
                      </div>
                    </div>

                    {/* Pay & Location */}
                    <div className="space-y-1 text-xs">
                      <div className="text-slate-700 font-semibold">{opp.fixedPayOrStipend}</div>
                      <div className="text-slate-500 flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{opp.location}</span>
                      </div>
                    </div>

                    {/* Relevant Departments */}
                    <div className="flex flex-wrap gap-1">
                      {opp.relevantDepartments.map((dept, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/70 px-2 py-0.5 rounded-md"
                        >
                          {dept}
                        </span>
                      ))}
                    </div>

                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1">
                      {opp.skills.slice(0, 3).map((sk, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-blue-50/80 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md font-medium"
                        >
                          {sk}
                        </span>
                      ))}
                      {opp.skills.length > 3 && (
                        <span className="text-[10px] text-slate-400 pt-0.5">
                          +{opp.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Deadline & Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Deadline: {opp.deadline}</span>
                    </div>

                    <button
                      onClick={() => setSelectedOpp(opp)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-brand-blue hover:bg-blue-600 hover:text-white font-semibold text-xs transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <span>View Details</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Opportunity Detail Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-blue-100 text-brand-blue px-2 py-0.5 rounded-md">
                    {selectedOpp.type}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                    {selectedOpp.workMode}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded-md">
                    {selectedOpp.id}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-brand-navy">{selectedOpp.title}</h2>
                <div className="text-xs font-medium text-slate-600">{selectedOpp.employer}</div>
              </div>
              <button
                onClick={() => setSelectedOpp(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[11px] text-slate-400 block">Compensation (Fixed Base):</span>
                  <strong className="text-sm text-slate-900">{selectedOpp.fixedPayOrStipend}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Separate Incentives / Perks:</span>
                  <span className="text-slate-700 font-medium">
                    {selectedOpp.incentives || 'None declared'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Location:</span>
                  <span className="text-slate-800 font-medium">{selectedOpp.location}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Registration Deadline:</span>
                  <span className="text-rose-700 font-bold">{selectedOpp.deadline}</span>
                </div>
              </div>

              {/* Explicit Eligibility */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                  Explicit Recruiter Eligibility Criteria
                </span>
                <p className="text-amber-950 font-medium leading-relaxed">
                  {selectedOpp.explicitEligibility}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Role Description & Key Responsibilities
                </span>
                <p className="text-slate-600 leading-relaxed">{selectedOpp.description}</p>
              </div>

              {/* Required Skills */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Skills & Technical Competencies
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedOpp.skills.map((sk, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-blue-50 text-brand-blue font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Target Departments */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Eligible Academic Departments
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedOpp.relevantDepartments.map((dept, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400">
                Posted on {selectedOpp.postedDate} • {selectedOpp.sourceStatus}
              </div>

              {/* Modal Actions based on Role */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {role === 'Placement Coordinator' || role === 'Admin' ? (
                  <button
                    onClick={() => {
                      setSelectedOpp(null);
                      if (setCurrentPage) setCurrentPage('placement-dashboard');
                    }}
                    className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Manage Drive in Placement Cell</span>
                    <span>→</span>
                  </button>
                ) : role === 'Student' ? (
                  <>
                    <button
                      onClick={() => toggleSaveOpportunity(selectedOpp.id)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>
                        {savedOpportunityIds.includes(selectedOpp.id) ? 'Saved ★' : 'Save'}
                      </span>
                    </button>

                    {hasApplied(selectedOpp.id) ? (
                      <button
                        disabled
                        className="px-5 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed flex-1 sm:flex-initial"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Applied ({getAppStatus(selectedOpp.id)})</span>
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          await applyToOpportunity(selectedOpp.id);
                          setSelectedOpp(null);
                        }}
                        disabled={isOpportunityExpired(selectedOpp)}
                        className="px-5 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-initial"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Apply to Opportunity</span>
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedOpp(null);
                      if (setCurrentPage) setCurrentPage('login');
                    }}
                    className="px-5 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Sign in as Student to Apply</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
