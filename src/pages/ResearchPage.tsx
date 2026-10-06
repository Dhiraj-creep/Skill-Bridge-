import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Department, AcademicYear, SourceType, SurveyResponse } from '../types/survey';
import { filterResponses, calculateSummaryMetrics } from '../utils/calculations';
import { exportResponsesToCSV, triggerDownload } from '../utils/csvUtils';
import { ResearchCharts } from '../components/charts/ResearchCharts';
import {
  Download,
  Filter,
  RefreshCw,
  Search,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  CheckCircle,
  Shield,
} from 'lucide-react';

export const ResearchPage: React.FC = () => {
  const { responses, responsesSummary, refreshResponsesSummary, role } = useApp();
  const isPrivileged = role === 'Placement Coordinator' || role === 'Admin';

  // Filter State
  const [selectedDept, setSelectedDept] = useState<Department | 'All'>('All');
  const [selectedYear, setSelectedYear] = useState<AcademicYear | 'All'>('All');
  const [selectedSource, setSelectedSource] = useState<SourceType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination & Review card expansion
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Load summary data for public and student viewers when filters change
  useEffect(() => {
    if (!isPrivileged) {
      refreshResponsesSummary({
        department: selectedDept,
        year: selectedYear,
        sourceType: selectedSource,
      });
    }
  }, [isPrivileged, selectedDept, selectedYear, selectedSource, refreshResponsesSummary]);

  // Filtered dataset (accessible to coordinators/admins)
  const filteredResponses = useMemo(() => {
    if (!isPrivileged) return [];
    return filterResponses(responses, {
      department: selectedDept,
      year: selectedYear,
      sourceType: selectedSource,
      searchQuery,
    });
  }, [isPrivileged, responses, selectedDept, selectedYear, selectedSource, searchQuery]);

  // Dynamic metrics on filtered dataset
  const metrics = useMemo(() => {
    if (isPrivileged) {
      return calculateSummaryMetrics(filteredResponses);
    }
    if (responsesSummary) {
      return responsesSummary;
    }
    return calculateSummaryMetrics([]);
  }, [isPrivileged, filteredResponses, responsesSummary]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredResponses.length / pageSize) || 1;
  const paginatedResponses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredResponses.slice(start, start + pageSize);
  }, [filteredResponses, currentPage]);

  const handleClearFilters = () => {
    setSelectedDept('All');
    setSelectedYear('All');
    setSelectedSource('All');
    setSearchQuery('');
    setCurrentPage(1);
    if (!isPrivileged) {
      refreshResponsesSummary();
    }
  };

  const handleExportCSV = () => {
    if (isPrivileged) {
      const csv = exportResponsesToCSV(filteredResponses);
      triggerDownload(csv, `skillbridge-research-export-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    } else if (responsesSummary) {
      const summaryRows = [
        ['Metric', 'Value'],
        ['Total Responses', responsesSummary.totalResponses],
        ['Simulated Count', responsesSummary.simulatedCount],
        ['Collected Count', responsesSummary.collectedCount],
        ['Departments Represented', responsesSummary.departmentsRepresented],
        ['Partly or Unmet Needs %', `${responsesSummary.partlyOrUnmetPercentage}%`],
        ['Late or Rare Notices %', `${responsesSummary.lateOrRareInfoPercentage}%`],
        ['Average Satisfaction (1-5)', responsesSummary.averageSatisfaction ?? 'N/A'],
        ['Average Training Usefulness (1-5)', responsesSummary.averageTrainingUsefulness ?? 'N/A'],
      ];
      const csv = summaryRows.map((r) => r.join(',')).join('\n');
      triggerDownload(csv, `skillbridge-research-summary-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    }
  };

  const handleExportJSON = () => {
    const dataToExport = isPrivileged ? filteredResponses : (responsesSummary || {});
    const json = JSON.stringify(dataToExport, null, 2);
    triggerDownload(json, `skillbridge-research-export-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-300">
      {/* Header & Disclosures */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-brand-purple uppercase tracking-wider">
              Research & Empirical Findings
            </span>
            <span className="text-[11px] bg-purple-100 text-brand-purple px-2.5 py-0.5 rounded-full font-semibold">
              CEP Fieldwork Survey • 200 Students (CS, IT & DS)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            Student Placement Experience Survey
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Analysis of 200 student responses across 12 core placement parameters. Filter by department,
            year of study, or source type to explore patterns.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs"
            title="Export filtered records as CSV with spreadsheet formula injection protection"
          >
            <Download className="w-3.5 h-3.5 text-brand-blue" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-brand-purple" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-navy text-white hover:bg-slate-800 text-xs font-semibold shadow-xs"
            title="Generate print-friendly research report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs no-print space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-brand-purple" />
            <span>Filter Responses</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Showing:</span>
            <strong className="text-brand-navy font-bold">{metrics.totalResponses}</strong>
            <span>of {isPrivileged ? responses.length : (responsesSummary?.totalResponses ?? metrics.totalResponses)} total records</span>
            {(selectedDept !== 'All' || selectedYear !== 'All' || selectedSource !== 'All' || searchQuery !== '') && (
              <button
                onClick={handleClearFilters}
                className="ml-2 text-xs text-rose-600 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-brand-purple focus:outline-none"
            >
              <option value="All">All Domains (CS, IT, DS)</option>
              <option value="Computer Science (CS)">Computer Science (CS)</option>
              <option value="Information Technology (IT)">Information Technology (IT)</option>
              <option value="Data Science (DS)">Data Science (DS)</option>
            </select>
          </div>

          {/* Academic Year Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-brand-purple focus:outline-none"
            >
              <option value="All">All Years</option>
              <option value="First">First Year</option>
              <option value="Second">Second Year</option>
              <option value="Third">Third Year</option>
              <option value="Fourth">Fourth Year</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Source Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Dataset Provenance
            </label>
            <select
              value={selectedSource}
              onChange={(e) => {
                setSelectedSource(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-brand-purple focus:outline-none"
            >
              <option value="All">All Records (Simulated & Collected)</option>
              <option value="simulated">Simulated Only (Demo)</option>
              <option value="collected">Collected Only (Fieldwork)</option>
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Search Text & Roles
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search ID, role, barrier, review..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs rounded-lg border border-slate-300 pl-8 pr-3 p-2 focus:ring-2 focus:ring-brand-purple focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Filtered Summary Denominators */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
          <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">Filtered Sample</span>
          <strong className="text-base sm:text-lg font-extrabold text-slate-900 font-sans tracking-tight block mt-0.5">
            {metrics.totalResponses} Responses
          </strong>
        </div>
        <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100">
          <span className="text-amber-700 block text-[11px] font-semibold uppercase tracking-wider">Unmet / Partly Met</span>
          <strong className="text-base sm:text-lg font-extrabold text-amber-700 font-sans tracking-tight block mt-0.5">
            {metrics.partlyOrUnmetPercentage}%
          </strong>
          <span className="text-[11px] text-amber-900/70 font-medium">({metrics.partlyOrUnmetCount}/{metrics.partlyOrUnmetDenominator} valid)</span>
        </div>
        <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-100">
          <span className="text-purple-700 block text-[11px] font-semibold uppercase tracking-wider">Avg Satisfaction</span>
          <strong className="text-base sm:text-lg font-extrabold text-purple-700 font-sans tracking-tight block mt-0.5">
            {metrics.averageSatisfaction !== null ? `${metrics.averageSatisfaction} / 5` : 'N/A'}
          </strong>
          <span className="text-[11px] text-purple-900/70 font-medium">({metrics.validSatisfactionCount} rated)</span>
        </div>
        <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-100">
          <span className="text-teal-700 block text-[11px] font-semibold uppercase tracking-wider">Avg Training Score</span>
          <strong className="text-base sm:text-lg font-extrabold text-teal-700 font-sans tracking-tight block mt-0.5">
            {metrics.averageTrainingUsefulness !== null
              ? `${metrics.averageTrainingUsefulness} / 5`
              : 'N/A'}
          </strong>
          <span className="text-[11px] text-teal-900/70 font-medium">({metrics.validTrainingCount} rated)</span>
        </div>
      </section>

      {/* Interactive Charts Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-navy">Interactive Visual Analytics</h2>
          <span className="text-xs text-slate-500 font-medium">
            Calculated strictly from {metrics.totalResponses} active responses
          </span>
        </div>
        <ResearchCharts
          responses={isPrivileged ? filteredResponses : undefined}
          summaryData={responsesSummary}
        />
      </section>

      {/* Searchable, Paginated Anonymous Response Table with Review Expanders (Coordinators & Admins Only) */}
      {isPrivileged ? (
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Anonymous Response Records</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any row to expand the student's qualitative review (Q11) and improvement suggestion (Q12).
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          {filteredResponses.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No responses match your search and filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Year</th>
                    <th className="py-2.5 px-3">Preferred Role</th>
                    <th className="py-2.5 px-3">Drives</th>
                    <th className="py-2.5 px-3">Needs Met</th>
                    <th className="py-2.5 px-3">Timeliness</th>
                    <th className="py-2.5 px-3">Satisfaction</th>
                    <th className="py-2.5 px-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedResponses.map((r) => {
                    const isExpanded = expandedRowId === r.id;
                    return (
                      <React.Fragment key={r.id}>
                        <tr
                          onClick={() => setExpandedRowId(isExpanded ? null : r.id)}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="py-2.5 px-3 font-mono font-semibold text-brand-purple">
                            {r.id}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {r.department}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{r.year}</td>
                          <td className="py-2.5 px-3 text-slate-700 max-w-[140px] truncate" title={r.preferredRole}>
                            {r.preferredRole}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                r.relevantDrives === '0'
                                  ? 'bg-rose-100 text-rose-700'
                                  : r.relevantDrives === '3 or more'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {r.relevantDrives}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                r.needsMet === 'Yes'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : r.needsMet === 'Partly'
                                  ? 'bg-amber-100 text-amber-700'
                                  : r.needsMet === 'No'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {r.needsMet}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{r.informationTimeliness}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {typeof r.satisfaction === 'number' ? `${r.satisfaction} / 5` : 'Not Judged'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              className="p-1 text-slate-400 hover:text-brand-purple"
                              aria-label={isExpanded ? 'Collapse review' : 'Expand review'}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </td>
                        </tr>

                        {/* Expandable Review Card */}
                        {isExpanded && (
                          <tr className="bg-purple-50/40">
                            <td colSpan={9} className="p-4 space-y-3 border-b border-purple-100">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                    Q11. Qualitative Experience Review
                                  </span>
                                  <p className="text-slate-700 leading-relaxed italic">
                                    "{r.review}"
                                  </p>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                    Q12. Suggested Improvement
                                  </span>
                                  <p className="text-slate-700 leading-relaxed italic">
                                    "{r.suggestion}"
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                                <span><strong>Reported Barrier:</strong> {r.biggestBarrier}</span>
                                <span>•</span>
                                <span><strong>Urgent Support:</strong> {r.urgentSupport}</span>
                                <span>•</span>
                                <span><strong>Training Score:</strong> {r.trainingUsefulness}</span>
                                <span>•</span>
                                <span><strong>Dataset Type:</strong> {r.sourceType}</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 no-print">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <span className="text-xs text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-purple flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Participant Microdata Protected</h3>
                <span className="text-[10px] font-semibold bg-purple-100 text-brand-purple px-2 py-0.5 rounded-full">
                  Institutional Governance
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                In accordance with institutional academic ethics and student privacy policies, individual survey submissions, open-ended reviews, and qualitative participant responses are accessible exclusively to authenticated Placement Coordinators and College Administrators.
              </p>
              <div className="pt-2 text-xs text-slate-500 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  <CheckCircle className="w-3.5 h-3.5" />
                  All 6 analytical charts above are computed live from all {metrics.totalResponses} active responses
                </span>
                <span className="text-slate-400">•</span>
                <span>Coordinators may log in to access the qualitative review table and full dataset export</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Key Research Insights & Strategic Interventions */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-brand-teal font-bold text-base">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>Key Fieldwork Insights & Strategic Interventions</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Findings from the 200 student survey responses directly informed the design of Skill Bridge's four core architectural pillars:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <li className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <span className="font-bold text-white block">1. Dedicated Domain Recruitment Tracks</span>
            <span>
              Data indicates severe under-representation of dedicated drives for specialized roles (AI/ML, DevOps, Cloud). Skill Bridge tags opportunities by technical subdomains to provide targeted access.
            </span>
          </li>
          <li className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <span className="font-bold text-white block">2. Notice Latency Mitigation</span>
            <span>
              Over 70% of respondents identified short registration deadlines as a critical barrier. The portal enforces mandatory 48-hour broadcast windows with automated in-app countdown timers.
            </span>
          </li>
          <li className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <span className="font-bold text-white block">3. Practical Hands-On Preparation</span>
            <span>
              Surveyed cohorts reported standard aptitude training is insufficient for specialized technical screening. Skill Bridge introduces departmental clinics in Docker, PyTorch ML, and DSA coding.
            </span>
          </li>
          <li className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <span className="font-bold text-white block">4. Closed-Loop Grievance Governance</span>
            <span>
              Establishes anonymous ticketing with tracked unique IDs, ensuring student placement concerns receive formal, auditable responses from departmental placement coordinators.
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
};
