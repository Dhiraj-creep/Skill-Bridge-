import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Department, AcademicYear } from '../types/survey';
import { evaluateOpportunityMatch } from '../utils/matching';
import { DemoOpportunity, isOpportunityExpired } from '../types/opportunity';
import {
  User,
  CheckCircle2,
  Clock,
  Briefcase,
  Bookmark,
  Calendar,
  Layers,
  Edit2,
  Save,
  X,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Send,
  MessageSquare,
  Sparkles,
  MapPin,
  GraduationCap,
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const {
    user,
    studentProfile,
    updateStudentProfile,
    opportunities,
    savedOpportunityIds,
    toggleSaveOpportunity,
    studentApplications,
    applyToOpportunity,
    trainingSessions,
    studentEnrollments,
    enrollInSession,
    cancelEnrollment,
    studentGuidanceList,
    studentFeedbackList,
  } = useApp();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'all' | 'matches' | 'applications' | 'workshops' | 'support'>('all');

  // Active Profile Fallback
  const profile = studentProfile || {
    displayName: user?.fullName || 'Student',
    department: (user?.department as Department) || 'Computer Science (CS)',
    year: 'Final Year' as AcademicYear,
    preferredRoles: ['Full-Stack Developer', 'Software Engineer'],
    skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
    preferredLocations: ['Pune', 'Mumbai', 'Remote / Hybrid'],
    trainingInterests: ['Technical Interview Prep', 'DSA Problem Solving'],
    academicPercentage: 78.5,
    activeBacklogs: 0,
  };

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(profile);
  const [newSkill, setNewSkill] = useState('');
  const [newRole, setNewRole] = useState('');

  // Application Modal State
  const [applyingOpp, setApplyingOpp] = useState<DemoOpportunity | null>(null);
  const [studentNotes, setStudentNotes] = useState('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  // Calculate matching evaluations for all active opportunities
  const matchedOpps = opportunities
    .filter((opp) => !isOpportunityExpired(opp) && !opp.isArchived)
    .map((opp) => evaluateOpportunityMatch(opp, profile))
    .sort((a, b) => b.score - a.score);

  // Profile completion score
  const completionFields = [
    Boolean(profile.displayName),
    Boolean(profile.department),
    Boolean(profile.year),
    profile.preferredRoles.length > 0,
    profile.skills.length > 0,
    profile.preferredLocations.length > 0,
    profile.academicPercentage !== undefined,
  ];
  const completionPercentage = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  const handleSaveProfile = async () => {
    await updateStudentProfile(profileForm);
    setIsEditingProfile(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profileForm.skills.includes(newSkill.trim())) {
      setProfileForm({
        ...profileForm,
        skills: [...profileForm.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfileForm({
      ...profileForm,
      skills: profileForm.skills.filter((s) => s !== skill),
    });
  };

  const handleAddRole = () => {
    if (newRole.trim() && !profileForm.preferredRoles.includes(newRole.trim())) {
      setProfileForm({
        ...profileForm,
        preferredRoles: [...profileForm.preferredRoles, newRole.trim()],
      });
      setNewRole('');
    }
  };

  const handleRemoveRole = (role: string) => {
    setProfileForm({
      ...profileForm,
      preferredRoles: profileForm.preferredRoles.filter((r) => r !== role),
    });
  };

  const handleConfirmApply = async () => {
    if (!applyingOpp) return;
    setIsSubmittingApp(true);
    await applyToOpportunity(applyingOpp.id, studentNotes.trim() || undefined);
    setIsSubmittingApp(false);
    setApplyingOpp(null);
    setStudentNotes('');
  };

  // Saved Opportunities
  const savedListings = opportunities.filter((o) => savedOpportunityIds.includes(o.id));

  const hasApplied = (oppId: string) => studentApplications.some((a) => a.opportunityId === oppId);
  const getApplication = (oppId: string) => studentApplications.find((a) => a.opportunityId === oppId);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">
              Student Workspace
            </span>
            <span className="text-[11px] bg-teal-100 text-brand-teal px-2.5 py-0.5 rounded-full font-semibold">
              {profile.displayName} ({profile.department})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            Placement Readiness & Opportunity Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Transparent opportunity matching with verifiable explanations, live campus applications,
            practical workshop registrations, and placement guidance appointments.
          </p>
        </div>

        <button
          onClick={() => {
            setProfileForm(profile);
            setIsEditingProfile(!isEditingProfile);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-teal text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs self-start md:self-auto"
        >
          {isEditingProfile ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          <span>{isEditingProfile ? 'Cancel Edit' : 'Edit My Profile'}</span>
        </button>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {[
          { id: 'all', label: 'Complete Overview' },
          { id: 'matches', label: `Matching Opportunities (${matchedOpps.length})` },
          { id: 'applications', label: `My Applications (${studentApplications.length})` },
          { id: 'workshops', label: `Training Clinics (${studentEnrollments.length} Active)` },
          { id: 'support', label: `Feedback & Guidance (${studentGuidanceList.length + studentFeedbackList.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-brand-teal text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-teal to-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-brand-teal/20 flex-shrink-0">
              {profile.displayName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-navy">{profile.displayName}</h2>
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                <span>{profile.department}</span>
                <span>•</span>
                <span>{profile.year} Year</span>
                <span>•</span>
                <span>Score: {profile.academicPercentage !== undefined ? `${profile.academicPercentage}%` : 'Not set'}</span>
                <span>•</span>
                <span className={profile.activeBacklogs && profile.activeBacklogs > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-semibold'}>
                  {profile.activeBacklogs && profile.activeBacklogs > 0 ? `${profile.activeBacklogs} Active Backlog(s)` : '0 Backlogs'}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Completion Bar */}
          <div className="w-full md:w-64 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-600">Profile Readiness</span>
              <span className="font-bold text-brand-teal">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-teal h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {completionPercentage < 100
                ? 'Update target roles and aggregate to refine matching rules.'
                : 'Profile complete for deterministic rule-based matching.'}
            </p>
          </div>
        </div>

        {/* Profile Details Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-100">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Target Roles:</span>
            <div className="flex flex-wrap gap-1">
              {profile.preferredRoles.map((r, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[11px]">
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Declared Skills:</span>
            <div className="flex flex-wrap gap-1">
              {profile.skills.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium text-[11px]">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Preferred Locations:</span>
            <div className="flex flex-wrap gap-1">
              {profile.preferredLocations.map((loc, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                  {loc}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Edit Drawer Form */}
        {isEditingProfile && (
          <div className="p-5 bg-teal-50/50 rounded-2xl border border-teal-200 space-y-4 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-teal-200 pb-2">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Edit Institutional Student Profile
              </h3>
              <span className="text-[11px] text-teal-800 font-medium">
                Changes update your persistent account record in the database
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={profileForm.displayName}
                  onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={profileForm.department}
                  onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value as Department })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Computer Science (CS)">Computer Science (CS)</option>
                  <option value="Information Technology (IT)">Information Technology (IT)</option>
                  <option value="Data Science (DS)">Data Science (DS)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Year of Study
                </label>
                <select
                  value={profileForm.year}
                  onChange={(e) => setProfileForm({ ...profileForm, year: e.target.value as AcademicYear })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="First">First</option>
                  <option value="Second">Second</option>
                  <option value="Third">Third</option>
                  <option value="Fourth">Fourth</option>
                  <option value="Final Year">Final Year</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Aggregate Percentage (%)
                </label>
                <input
                  type="number"
                  min="35"
                  max="100"
                  step="0.1"
                  value={profileForm.academicPercentage ?? ''}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      academicPercentage: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Active Backlogs
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={profileForm.activeBacklogs ?? 0}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      activeBacklogs: e.target.value ? parseInt(e.target.value, 10) : 0,
                    })
                  }
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Target Roles & Skills input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Target Roles
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Backend Developer"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="flex-1 text-xs p-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <button
                    onClick={handleAddRole}
                    className="px-3 py-1.5 rounded-lg bg-brand-teal text-white font-semibold text-xs"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {profileForm.preferredRoles.map((role, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] flex items-center gap-1"
                    >
                      {role}
                      <button onClick={() => handleRemoveRole(role)} className="hover:text-red-700">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Key Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Python, Docker, React"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1 text-xs p-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 rounded-lg bg-brand-teal text-white font-semibold text-xs"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {profileForm.skills.map((sk, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] flex items-center gap-1"
                    >
                      {sk}
                      <button onClick={() => handleRemoveSkill(sk)} className="hover:text-red-700">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-5 py-1.5 rounded-lg bg-brand-teal text-white text-xs font-semibold hover:bg-teal-700 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 1: Matching Opportunities */}
      {(activeTab === 'all' || activeTab === 'matches') && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-xl font-bold text-brand-navy">
                Opportunity Matching (Deterministic & Explainable)
              </h2>
              <p className="text-xs text-slate-500">
                Matches calculated on branch eligibility, target role keywords, skill overlap,
                and academic aggregate. Zero opaque probabilistic AI claims.
              </p>
            </div>
            <span className="text-xs text-brand-teal font-semibold">
              {matchedOpps.filter((m) => m.score >= 50).length} Strong / Moderate Matches
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {matchedOpps.slice(0, 6).map(({ opportunity: opp, score, matchLevel, explanation, eligibilityStatus, matchedReasons, mismatchReasons }) => {
              const applied = hasApplied(opp.id);
              const appRecord = getApplication(opp.id);

              return (
                <div
                  key={opp.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-teal-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          matchLevel === 'High Fit'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : matchLevel === 'Moderate Fit'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {matchLevel} ({score}% Match)
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          eligibilityStatus === 'Appears Eligible'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : eligibilityStatus === 'Potential Ineligibility'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {eligibilityStatus}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-[15px]">{opp.title}</h3>
                      <div className="text-xs text-slate-500 font-medium">{opp.employer}</div>
                    </div>

                    {/* Matching Rationale */}
                    <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700 block text-[11px]">
                        Matching Explanation:
                      </span>
                      <p className="leading-relaxed">{explanation}</p>

                      {matchedReasons.length > 0 && (
                        <div className="text-[11px] text-emerald-700 font-medium">
                          ✓ {matchedReasons[0]}
                        </div>
                      )}

                      {mismatchReasons.length > 0 && (
                        <div className="text-[11px] text-amber-700 font-medium">
                          ⚠ {mismatchReasons[0]}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
                      <span className="font-semibold text-slate-700">{opp.fixedPayOrStipend}</span>
                      <span className="font-semibold text-rose-600">Due: {opp.deadline}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleSaveOpportunity(opp.id)}
                      className="text-xs font-semibold text-slate-600 hover:text-brand-teal"
                    >
                      {savedOpportunityIds.includes(opp.id) ? 'Saved ★' : 'Save'}
                    </button>

                    {applied ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                        Applied ({appRecord?.status})
                      </span>
                    ) : (
                      <button
                        onClick={() => setApplyingOpp(opp)}
                        className="px-3 py-1 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 2: My Applications with Placement Coordinator Feedback */}
      {(activeTab === 'all' || activeTab === 'applications') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-brand-navy">My Placement Applications</h2>
              <p className="text-xs text-slate-500">
                Track status changes and view structured feedback submitted by the college Placement Cell.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {studentApplications.length} Submissions
            </span>
          </div>

          {studentApplications.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                You haven't submitted any applications yet. Browse the Opportunities directory to submit an application.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {studentApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {app.opportunityTitle}
                      </h3>
                      <div className="text-xs text-slate-500 font-medium">{app.employer}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          app.status === 'Selected'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : app.status === 'Shortlisted'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : app.status === 'Under Review'
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : app.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {app.studentNotes && (
                    <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/60">
                      <span className="font-semibold text-slate-700">Your Submission Note: </span>
                      <span>{app.studentNotes}</span>
                    </div>
                  )}

                  {/* Placement Coordinator Feedback Block */}
                  {app.coordinatorFeedback ? (
                    <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200/80 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-purple-900 text-[11px] uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>Placement Cell Coordinator Feedback</span>
                      </div>
                      <p className="text-purple-950 font-medium leading-relaxed">
                        {app.coordinatorFeedback}
                      </p>
                      {app.reviewedBy && (
                        <div className="text-[10px] text-purple-600 pt-0.5">
                          Reviewed by: {app.reviewedBy}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">
                      Application awaiting placement coordinator review and notes.
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                    <span>Applied on: {app.appliedDate}</span>
                    <span className="font-mono">Ref ID: {app.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* SECTION 3: Practical Training Workshops & Rosters */}
      {(activeTab === 'all' || activeTab === 'workshops') && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-xl font-bold text-brand-navy">Practical Training Workshops</h2>
              <p className="text-xs text-slate-500">
                Discipline-tailored clinics addressing technical interview rounds and lab skills.
                Enrolled students are verified against capacity limits.
              </p>
            </div>
            <span className="text-xs text-brand-teal font-semibold">
              {studentEnrollments.length} Active Enrollments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trainingSessions.map((session) => {
              const enrollment = studentEnrollments.find((e) => e.workshopId === session.id);
              const isEnrolled = Boolean(enrollment);

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-brand-teal">
                        {session.department}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {session.mode}
                      </span>
                    </div>

                    <h3 className="font-bold text-brand-navy text-sm leading-snug">{session.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{session.description}</p>

                    <div className="flex flex-wrap gap-1">
                      {session.targetSkills.map((sk, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                      <div>
                        <strong>Schedule:</strong> {session.schedule}
                      </div>
                      <div>
                        <strong>Venue:</strong> {session.venue}
                      </div>
                      <div>
                        <strong>Enrolled:</strong> {session.enrolledCount} / {session.capacity} seats filled
                      </div>
                    </div>

                    {/* Attendance Status when enrolled */}
                    {isEnrolled && (
                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Attendance Status:
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-md inline-block ${
                            enrollment?.attendanceStatus === 'Attended'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : enrollment?.attendanceStatus === 'Absent'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          {enrollment?.attendanceStatus === 'Attended'
                            ? '✓ Verified Attended'
                            : enrollment?.attendanceStatus === 'Absent'
                            ? 'Marked Absent'
                            : 'Confirmed Registered'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    {isEnrolled ? (
                      <button
                        onClick={() => cancelEnrollment(session.id)}
                        className="w-full py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold transition-colors"
                      >
                        Cancel Enrollment
                      </button>
                    ) : (
                      <button
                        onClick={() => enrollInSession(session.id)}
                        disabled={session.enrolledCount >= session.capacity}
                        className="w-full py-2 rounded-xl bg-brand-teal text-white hover:bg-teal-700 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {session.enrolledCount >= session.capacity ? 'Session Full' : 'Enroll in Workshop'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 4: Feedback Grievances & 1-on-1 Guidance Appointments */}
      {(activeTab === 'all' || activeTab === 'support') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Guidance Requests History */}
          <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-brand-navy text-base">Your Guidance Appointments</h3>
              <span className="text-xs text-slate-500 font-medium">
                {studentGuidanceList.length} Requests
              </span>
            </div>

            {studentGuidanceList.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl text-center">
                No guidance requests submitted yet. Use the Feedback & Guidance page to request mock interview counseling or resume review.
              </p>
            ) : (
              <div className="space-y-3">
                {studentGuidanceList.map((g) => (
                  <div
                    key={g.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{g.topic}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          g.status === 'Scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : g.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {g.status}
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      Target Role: <strong>{g.targetRole}</strong> | Preferred Slot: <strong>{g.preferredTimeSlot}</strong>
                    </div>
                    {g.coordinatorNote && (
                      <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-200 text-purple-900 text-[11px]">
                        <strong>Coordinator Note:</strong> {g.coordinatorNote}
                        {g.scheduledTime && (
                          <div className="text-purple-700 font-semibold mt-0.5">
                            Confirmed Time: {g.scheduledTime}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Submitted Grievances & Responses */}
          <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-brand-navy text-base">Your Submitted Grievances & Feedback</h3>
              <span className="text-xs text-slate-500 font-medium">
                {studentFeedbackList.length} Submissions
              </span>
            </div>

            {studentFeedbackList.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl text-center">
                No feedback submitted yet. Use the Feedback & Guidance page to report placement barriers anonymously.
              </p>
            ) : (
              <div className="space-y-3">
                {studentFeedbackList.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{fb.category}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          fb.status === 'Addressed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : fb.status === 'Archived'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {fb.status}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{fb.description}</p>
                    {fb.coordinatorResponse && (
                      <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950 text-[11px]">
                        <strong className="text-emerald-800">Placement Cell Response:</strong>{' '}
                        {fb.coordinatorResponse}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Application Confirmation Modal */}
      {applyingOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">
                  Confirm Application
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{applyingOpp.title}</h3>
                <p className="text-xs text-slate-500">{applyingOpp.employer} • Due {applyingOpp.deadline}</p>
              </div>
              <button
                onClick={() => setApplyingOpp(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <strong className="text-slate-800">{profile.displayName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="text-slate-800">{profile.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Academic Aggregate:</span>
                <span className="text-slate-800 font-semibold">{profile.academicPercentage}%</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block font-semibold text-slate-700">
                Student Notes / Project Highlights (Optional)
              </label>
              <textarea
                rows={3}
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="e.g. Completed React & Python capstone project with 9.2 CGPA in core subjects..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setApplyingOpp(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApply}
                disabled={isSubmittingApp}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingApp ? 'Submitting...' : 'Submit Application'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
