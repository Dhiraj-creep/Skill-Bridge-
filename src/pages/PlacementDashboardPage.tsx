import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { generateId } from '../utils/id';
import { Department } from '../types/survey';
import { EmployerOutreachRecord, OutreachStatus } from '../types/content';
import { DemoOpportunity, OpportunityType, WorkMode, isOpportunityExpired } from '../types/opportunity';
import { TrainingSession } from '../types/training';
import { apiService } from '../services/apiService';
import {
  MessageSquare,
  CheckCircle2,
  Calendar,
  Plus,
  Edit2,
  X,
  Users,
  Briefcase,
  RefreshCw,
  Trash2,
} from 'lucide-react';

interface WorkshopEnrollmentRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentDepartment: string;
  studentYear: string;
  academicPercentage?: number;
  enrolledAt: string;
  attendanceStatus: 'Enrolled' | 'Attended' | 'Absent';
}

export const PlacementDashboardPage: React.FC = () => {
  const {
    user,
    coordinatorMetrics,
    coordinatorApplications,
    refreshCoordinatorApplications,
    updateApplicationStatus,
    opportunities,
    refreshOpportunities,
    createOpportunity,
    updateOpportunity,
    setOpportunityArchiveStatus,
    trainingSessions,
    refreshTrainingSessions,
    createWorkshop,
    updateWorkshop,
    markWorkshopAttendance,
    coordinatorFeedbackList,
    respondToFeedback,
    coordinatorGuidanceList,
    scheduleGuidance,
    coordinatorStudentsList,
    employerOutreach,
    addEmployerOutreach,
    updateEmployerOutreach,
    deleteEmployerOutreach,
    studyData,
    updateActionPlanItem,
    addNotification,
  } = useApp();

  // Active View Tab
  const [activeTab, setActiveTab] = useState<
    'applications' | 'opportunities' | 'workshops' | 'feedback' | 'guidance' | 'outreach' | 'actions'
  >('applications');
  const [updatingActionId, setUpdatingActionId] = useState<string | null>(null);

  /* ======================================================================== */
  /* TAB 1: APPLICANT REVIEW STATE                                            */
  /* ======================================================================== */
  const [appDeptFilter, setAppDeptFilter] = useState<string>('All');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('All');
  const [reviewingAppId, setReviewingAppId] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string>('Under Review');
  const [reviewFeedback, setReviewFeedback] = useState<string>('');
  const [isUpdatingApp, setIsUpdatingApp] = useState(false);

  const filteredApplications = useMemo(() => {
    return coordinatorApplications.filter((app) => {
      if (appDeptFilter !== 'All' && app.studentDepartment !== appDeptFilter) return false;
      if (appStatusFilter !== 'All' && app.status !== appStatusFilter) return false;
      return true;
    });
  }, [coordinatorApplications, appDeptFilter, appStatusFilter]);

  const handleUpdateApplication = async (appId: string) => {
    setIsUpdatingApp(true);
    const res = await updateApplicationStatus(appId, reviewStatus, reviewFeedback.trim() || undefined);
    setIsUpdatingApp(false);
    if (res.success) {
      setReviewingAppId(null);
      setReviewFeedback('');
    }
  };

  /* ======================================================================== */
  /* TAB 2: OPPORTUNITY CREATION / ARCHIVE STATE                              */
  /* ======================================================================== */
  const [showAddOppModal, setShowAddOppModal] = useState(false);
  const [oppTitle, setOppTitle] = useState('');
  const [oppEmployer, setOppEmployer] = useState('');
  const [oppType, setOppType] = useState<OpportunityType>('Full-time Placement');
  const [oppMode, setOppMode] = useState<WorkMode>('On-site');
  const [oppLocation, setOppLocation] = useState('Pune, Maharashtra');
  const [oppPay, setOppPay] = useState('₹6.5 LPA - ₹8.0 LPA Base CTC');
  const [oppDepts, setOppDepts] = useState<Department[]>(['Computer Science (CS)', 'Information Technology (IT)']);
  const [oppSkills, setOppSkills] = useState('Java, Spring Boot, MySQL, REST APIs');
  const [oppDeadline, setOppDeadline] = useState('2026-11-15');
  const [oppEligibility, setOppEligibility] = useState('60% aggregate, <= 1 active backlog, BE/BTech CS/IT');
  const [oppDesc, setOppDesc] = useState('');

  const handleCreateOpp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppTitle.trim() || !oppEmployer.trim()) {
      addNotification('Please enter title and employer.', 'error');
      return;
    }

    const res = await createOpportunity({
      title: oppTitle.trim(),
      employer: oppEmployer.trim(),
      type: oppType,
      workMode: oppMode,
      location: oppLocation.trim(),
      fixedPayOrStipend: oppPay.trim(),
      relevantDepartments: oppDepts,
      skills: oppSkills.split(',').map((s) => s.trim()).filter(Boolean),
      deadline: oppDeadline,
      explicitEligibility: oppEligibility.trim(),
      description: oppDesc.trim() || 'Campus placement drive for eligible pre-final & final year students.',
    });

    if (res.success) {
      setShowAddOppModal(false);
      setOppTitle('');
      setOppEmployer('');
      setOppDesc('');
      await refreshOpportunities();
    }
  };

  /* Edit Opportunity State */
  const [editingOpp, setEditingOpp] = useState<DemoOpportunity | null>(null);
  const [editOppTitle, setEditOppTitle] = useState('');
  const [editOppEmployer, setEditOppEmployer] = useState('');
  const [editOppType, setEditOppType] = useState<OpportunityType>('Full-time Placement');
  const [editOppMode, setEditOppMode] = useState<WorkMode>('On-site');
  const [editOppLocation, setEditOppLocation] = useState('');
  const [editOppPay, setEditOppPay] = useState('');
  const [editOppDepts, setEditOppDepts] = useState<Department[]>([]);
  const [editOppSkills, setEditOppSkills] = useState('');
  const [editOppDeadline, setEditOppDeadline] = useState('');
  const [editOppEligibility, setEditOppEligibility] = useState('');
  const [editOppDesc, setEditOppDesc] = useState('');

  const openEditOppModal = (opp: DemoOpportunity) => {
    setEditingOpp(opp);
    setEditOppTitle(opp.title);
    setEditOppEmployer(opp.employer);
    setEditOppType(opp.type);
    setEditOppMode(opp.workMode);
    setEditOppLocation(opp.location);
    setEditOppPay(opp.fixedPayOrStipend);
    setEditOppDepts([...opp.relevantDepartments]);
    setEditOppSkills(opp.skills.join(', '));
    setEditOppDeadline(opp.deadline);
    setEditOppEligibility(opp.explicitEligibility);
    setEditOppDesc(opp.description || '');
  };

  const handleUpdateOpp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOpp) return;
    if (!editOppTitle.trim() || !editOppEmployer.trim()) {
      addNotification('Please enter title and employer.', 'error');
      return;
    }
    const res = await updateOpportunity(editingOpp.id, {
      title: editOppTitle.trim(),
      employer: editOppEmployer.trim(),
      type: editOppType,
      workMode: editOppMode,
      location: editOppLocation.trim(),
      fixedPayOrStipend: editOppPay.trim(),
      relevantDepartments: editOppDepts,
      skills: editOppSkills.split(',').map((s) => s.trim()).filter(Boolean),
      deadline: editOppDeadline,
      explicitEligibility: editOppEligibility.trim(),
      description: editOppDesc.trim(),
    });
    if (res.success) {
      setEditingOpp(null);
      await refreshOpportunities();
    }
  };

  /* ======================================================================== */
  /* TAB 3: WORKSHOPS & ATTENDANCE ROSTER STATE                               */
  /* ======================================================================== */
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>(
    trainingSessions[0]?.id || 'TRN-101'
  );
  const [workshopRoster, setWorkshopRoster] = useState<WorkshopEnrollmentRecord[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [showAddWorkshopModal, setShowAddWorkshopModal] = useState(false);
  const [wsTitle, setWsTitle] = useState('');
  const [wsDept, setWsDept] = useState<Department>('Computer Science (CS)');
  const [wsSchedule, setWsSchedule] = useState('Wednesday 2:00 PM – 5:00 PM');
  const [wsVenue, setWsVenue] = useState('Computer Center Lab 4');
  const [wsCapacity, setWsCapacity] = useState(30);
  const [wsSkills, setWsSkills] = useState('Data Structures, Algorithms');

  const fetchRoster = async (workshopId: string) => {
    setLoadingRoster(true);
    try {
      const res = await apiService.getWorkshopEnrollments(workshopId);
      const mapped: WorkshopEnrollmentRecord[] = res.map((r: any) => ({
        id: r.id || r.enrollment_id,
        studentId: r.student_id || r.studentId,
        studentName: r.student_name || r.studentName,
        studentDepartment: r.department || r.studentDepartment || 'Computer Science (CS)',
        studentYear: r.year || r.studentYear || 'Year 3',
        academicPercentage: r.academic_percentage ?? r.academicPercentage ?? 75,
        enrolledAt: r.enrolled_at || r.enrolledAt,
        attendanceStatus: (r.attendance_status || r.attendanceStatus || 'Enrolled') as any,
      }));
      setWorkshopRoster(mapped);
    } catch {
      setWorkshopRoster([]);
    } finally {
      setLoadingRoster(false);
    }
  };

  useEffect(() => {
    if (selectedWorkshopId) {
      fetchRoster(selectedWorkshopId);
    }
  }, [selectedWorkshopId]);

  const handleMarkAttendance = async (enrollmentId: string, status: 'Attended' | 'Absent') => {
    const success = await markWorkshopAttendance(enrollmentId, status);
    if (success && selectedWorkshopId) {
      await fetchRoster(selectedWorkshopId);
    }
  };

  const handleCreateWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsTitle.trim()) return;

    const res = await createWorkshop({
      title: wsTitle.trim(),
      department: wsDept,
      schedule: wsSchedule.trim(),
      venue: wsVenue.trim(),
      capacity: wsCapacity,
      targetSkills: wsSkills.split(',').map((s) => s.trim()).filter(Boolean),
      mode: 'In-Person Lab',
      description: `Hands-on preparation session for ${wsDept} placement cohort.`,
    });

    if (res.success) {
      setShowAddWorkshopModal(false);
      setWsTitle('');
      await refreshTrainingSessions();
    }
  };

  /* Edit Workshop State */
  const [editingWorkshop, setEditingWorkshop] = useState<TrainingSession | null>(null);
  const [editWsTitle, setEditWsTitle] = useState('');
  const [editWsDept, setEditWsDept] = useState<Department | 'All Departments'>('Computer Science (CS)');
  const [editWsSchedule, setEditWsSchedule] = useState('');
  const [editWsVenue, setEditWsVenue] = useState('');
  const [editWsCapacity, setEditWsCapacity] = useState(30);
  const [editWsSkills, setEditWsSkills] = useState('');

  const openEditWorkshopModal = (ws: TrainingSession) => {
    setEditingWorkshop(ws);
    setEditWsTitle(ws.title);
    setEditWsDept(ws.department);
    setEditWsSchedule(ws.schedule);
    setEditWsVenue(ws.venue);
    setEditWsCapacity(ws.capacity);
    setEditWsSkills(ws.targetSkills.join(', '));
  };

  const handleUpdateWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkshop) return;
    if (!editWsTitle.trim()) return;
    if (editWsCapacity < editingWorkshop.enrolledCount) {
      addNotification(`Capacity cannot be lower than current enrollment (${editingWorkshop.enrolledCount}).`, 'error');
      return;
    }
    const res = await updateWorkshop(editingWorkshop.id, {
      title: editWsTitle.trim(),
      department: editWsDept,
      schedule: editWsSchedule.trim(),
      venue: editWsVenue.trim(),
      capacity: editWsCapacity,
      targetSkills: editWsSkills.split(',').map((s) => s.trim()).filter(Boolean),
    });
    if (res.success) {
      setEditingWorkshop(null);
      await refreshTrainingSessions();
    }
  };

  /* ======================================================================== */
  /* TAB 4: ANONYMIZED FEEDBACK QUEUE STATE                                   */
  /* ======================================================================== */
  const [respondingFbId, setRespondingFbId] = useState<string | null>(null);
  const [fbResponseText, setFbResponseText] = useState('');
  const [fbTargetStatus, setFbTargetStatus] = useState('Addressed');

  const handleSendFeedbackResponse = async (fbId: string) => {
    if (!fbResponseText.trim()) return;
    await respondToFeedback(fbId, fbTargetStatus, fbResponseText.trim());
    setRespondingFbId(null);
    setFbResponseText('');
  };

  /* ======================================================================== */
  /* TAB 5: 1-ON-1 GUIDANCE APPOINTMENTS STATE                                */
  /* ======================================================================== */
  const [schedulingGdId, setSchedulingGdId] = useState<string | null>(null);
  const [schedTime, setSchedTime] = useState('');
  const [schedNote, setSchedNote] = useState('');
  const [schedStatus, setSchedStatus] = useState('Scheduled');

  const handleScheduleGuidanceSubmit = async (gdId: string) => {
    await scheduleGuidance(
      gdId,
      schedStatus,
      schedTime.trim() || undefined,
      schedNote.trim() || undefined
    );
    setSchedulingGdId(null);
    setSchedTime('');
    setSchedNote('');
  };

  /* ======================================================================== */
  /* TAB 6: EMPLOYER OUTREACH STATE                                           */
  /* ======================================================================== */
  const [showAddOutreach, setShowAddOutreach] = useState(false);
  const [newEmployer, setNewEmployer] = useState('');
  const [newDepts, setNewDepts] = useState<Department[]>(['Computer Science (CS)']);
  const [newRoles, setNewRoles] = useState('');
  const [newStatus, setNewStatus] = useState<OutreachStatus>('Initial Inquiry');
  const [newDate, setNewDate] = useState('2026-11-10');
  const [newNotes, setNewNotes] = useState('');

  const handleCreateOutreach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployer.trim()) return;

    const record: EmployerOutreachRecord = {
      id: generateId('OUT'),
      employer: newEmployer.trim(),
      relevantDepartments: newDepts,
      intendedRoles: newRoles.trim() || 'Software Engineer Trainee',
      contactStatus: newStatus,
      followUpDate: newDate,
      notes: newNotes.trim() || 'Recruiter contact initiated from placement desk.',
      provenance: 'Demonstration Record',
    };

    await addEmployerOutreach(record);
    setShowAddOutreach(false);
    setNewEmployer('');
    setNewRoles('');
    setNewNotes('');
  };

  /* Edit Outreach State */
  const [editingOutreach, setEditingOutreach] = useState<EmployerOutreachRecord | null>(null);
  const [editEmployer, setEditEmployer] = useState('');
  const [editOutreachDepts, setEditOutreachDepts] = useState<Department[]>([]);
  const [editRoles, setEditRoles] = useState('');
  const [editOutreachStatus, setEditOutreachStatus] = useState<OutreachStatus>('Initial Inquiry');
  const [editOutreachDate, setEditOutreachDate] = useState('');
  const [editOutreachNotes, setEditOutreachNotes] = useState('');

  const openEditOutreachModal = (item: EmployerOutreachRecord) => {
    setEditingOutreach(item);
    setEditEmployer(item.employer);
    setEditOutreachDepts([...item.relevantDepartments]);
    setEditRoles(item.intendedRoles);
    setEditOutreachStatus(item.contactStatus);
    setEditOutreachDate(item.followUpDate);
    setEditOutreachNotes(item.notes);
  };

  const handleUpdateOutreach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOutreach || !editEmployer.trim()) return;
    const success = await updateEmployerOutreach(editingOutreach.id, {
      employer: editEmployer.trim(),
      relevantDepartments: editOutreachDepts,
      intendedRoles: editRoles.trim(),
      contactStatus: editOutreachStatus,
      followUpDate: editOutreachDate,
      notes: editOutreachNotes.trim(),
    });
    if (success) {
      setEditingOutreach(null);
    }
  };

  const handleDeleteOutreach = async (id: string, employer: string) => {
    if (window.confirm(`Are you sure you want to delete the outreach record for "${employer}"?`)) {
      await deleteEmployerOutreach(id);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
              Placement Cell Administration
            </span>
            <span className="text-[11px] bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full font-semibold">
              Authorized Coordinator: {user?.fullName || 'TPO Officer'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            Placement Coordination & Command Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Live operations: review student applications across CS/IT/DS, write transparent feedback,
            manage recruitment drives, mark workshop attendance, and respond to anonymous grievance submissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshCoordinatorApplications()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            title="Refresh coordinator data from database"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Sync Live DB</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* LIVE OPERATIONAL METRICS (DISTINCT FROM 200 FIELDWORK SURVEY DATA)    */}
      {/* ==================================================================== */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 rounded-3xl text-white shadow-lg border border-purple-900/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-bold tracking-tight text-white uppercase font-sans">
              Live Institutional Operations Desk
            </h2>
          </div>
          <span className="text-[11px] font-medium text-purple-300 bg-purple-900/60 px-2.5 py-0.5 rounded-full border border-purple-700/50">
            Distinct from 200 Static Fieldwork Survey Records
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Registered Cohort</span>
              <Users className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {coordinatorMetrics?.registeredStudents ?? coordinatorStudentsList.length}
            </div>
            <div className="text-[10px] text-slate-500">CS • IT • DS Verified</div>
          </div>

          <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Pending Review</span>
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300">
              {coordinatorMetrics?.applicationsAwaitingReview ??
                coordinatorApplications.filter((a) => a.status === 'Submitted' || a.status === 'Under Review').length}
            </div>
            <div className="text-[10px] text-slate-500">Applications queue</div>
          </div>

          <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Open Grievances</span>
              <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
            </div>
            <div className="text-2xl font-bold text-pink-300">
              {coordinatorMetrics?.openFeedback ??
                coordinatorFeedbackList.filter((f) => f.status === 'Under Review').length}
            </div>
            <div className="text-[10px] text-slate-500">Anonymous tickets</div>
          </div>

          <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Guidance Slots</span>
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="text-2xl font-bold text-teal-300">
              {coordinatorMetrics?.pendingGuidance ??
                coordinatorGuidanceList.filter((g) => g.status === 'Requested').length}
            </div>
            <div className="text-[10px] text-slate-500">Awaiting schedule</div>
          </div>

          <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Workshop Rosters</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-300">
              {coordinatorMetrics?.totalEnrollments ?? 0}
            </div>
            <div className="text-[10px] text-slate-500">Seats allocated</div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* NAVIGATION TABS FOR COORDINATOR MODULES                              */}
      {/* ==================================================================== */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {[
          { id: 'applications', label: `Applicant Review (${coordinatorApplications.length})` },
          { id: 'opportunities', label: `Drive Postings (${opportunities.length})` },
          { id: 'workshops', label: `Workshops & Attendance (${trainingSessions.length})` },
          { id: 'feedback', label: `Anonymous Grievance Queue (${coordinatorFeedbackList.length})` },
          { id: 'guidance', label: `1-on-1 Guidance Desk (${coordinatorGuidanceList.length})` },
          { id: 'outreach', label: `Employer Outreach (${employerOutreach.length})` },
          { id: 'actions', label: `Action Plan Tracking (${studyData.actionPlan.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================================================================== */}
      {/* MODULE 1: APPLICANT REVIEW & FEEDBACK                                */}
      {/* ==================================================================== */}
      {activeTab === 'applications' && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-brand-navy">Student Application Review Queue</h2>
              <p className="text-xs text-slate-500">
                Inspect applicant profile criteria (Aggregate %, Backlogs, Skills), advance application status,
                and leave constructive feedback visible to the student.
              </p>
            </div>

            {/* Department and Status Filter controls */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <select
                value={appDeptFilter}
                onChange={(e) => setAppDeptFilter(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-300 text-xs bg-white"
              >
                <option value="All">All Departments</option>
                <option value="Computer Science (CS)">CS</option>
                <option value="Information Technology (IT)">IT</option>
                <option value="Data Science (DS)">DS</option>
              </select>

              <select
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-300 text-xs bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
              No applications match the current filter selection.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3 transition-all hover:border-purple-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{app.studentName}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {app.studentDepartment}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {app.studentYear} Year
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Applied for: <strong className="text-brand-navy">{app.opportunityTitle}</strong> ({app.employer})
                      </div>
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

                      <button
                        onClick={() => {
                          setReviewingAppId(reviewingAppId === app.id ? null : app.id);
                          setReviewStatus(app.status);
                          setReviewFeedback(app.coordinatorFeedback || '');
                        }}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                      >
                        {reviewingAppId === app.id ? 'Close' : 'Review & Feedback'}
                      </button>
                    </div>
                  </div>

                  {/* Student Academic & Profile Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200/60">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Aggregate %:</span>
                      <strong className="text-slate-800">{app.academicPercentage ?? 'N/A'}%</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Active Backlogs:</span>
                      <strong className={app.activeBacklogs && app.activeBacklogs > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                        {app.activeBacklogs ?? 0}
                      </strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-slate-400 block">Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {app.skills && app.skills.length > 0 ? (
                          app.skills.map((s, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400">None declared</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {app.studentNotes && (
                    <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/60">
                      <span className="font-semibold text-slate-700">Student Submission Note: </span>
                      <span>{app.studentNotes}</span>
                    </div>
                  )}

                  {/* Existing Coordinator Feedback Display */}
                  {app.coordinatorFeedback && reviewingAppId !== app.id && (
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-0.5">
                      <span className="font-bold text-[10px] uppercase tracking-wider text-purple-800 block">
                        Current Feedback Given to Student:
                      </span>
                      <p>{app.coordinatorFeedback}</p>
                      {app.reviewedBy && (
                        <span className="text-[10px] text-purple-500 block">Reviewed by: {app.reviewedBy}</span>
                      )}
                    </div>
                  )}

                  {/* Review Drawer Form */}
                  {reviewingAppId === app.id && (
                    <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-200 space-y-3 animate-in slide-in-from-top-2 text-xs">
                      <div className="font-bold text-purple-900 text-xs uppercase tracking-wider">
                        Update Application Status & Provide Feedback
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Status Progression
                          </label>
                          <select
                            value={reviewStatus}
                            onChange={(e) => setReviewStatus(e.target.value)}
                            className="w-full p-2 rounded-lg border border-purple-300 text-xs bg-white font-semibold"
                          >
                            <option value="Submitted">Submitted</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Selected">Selected</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Student-Visible Placement Feedback
                          </label>
                          <textarea
                            rows={2}
                            value={reviewFeedback}
                            onChange={(e) => setReviewFeedback(e.target.value)}
                            placeholder="e.g. Cleared round 1 technical screen; recommended for round 2 on Tuesday."
                            className="w-full p-2 rounded-lg border border-purple-300 text-xs bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setReviewingAppId(null)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 bg-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateApplication(app.id)}
                          disabled={isUpdatingApp}
                          className="px-4 py-1.5 rounded-lg bg-purple-700 text-white text-xs font-semibold hover:bg-purple-800 disabled:opacity-50"
                        >
                          {isUpdatingApp ? 'Saving...' : 'Save Decision & Feedback'}
                        </button>
                      </div>
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

      {/* ==================================================================== */}
      {/* MODULE 2: OPPORTUNITY CREATION & ARCHIVAL                            */}
      {/* ==================================================================== */}
      {activeTab === 'opportunities' && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-brand-navy">Recruitment Drives & Opportunity Management</h2>
              <p className="text-xs text-slate-500">
                Post new campus placement opportunities with verified branch eligibility and close expired listings.
              </p>
            </div>

            <button
              onClick={() => setShowAddOppModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-semibold hover:bg-purple-800 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Opportunity</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {opportunities.map((opp) => {
              const isExpired = isOpportunityExpired(opp);
              return (
              <div
                key={opp.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between space-y-3 ${
                  opp.isArchived || isExpired ? 'border-slate-300 opacity-75' : 'border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {opp.type}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        opp.isArchived || isExpired
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {opp.isArchived ? 'Archived' : isExpired ? 'Expired' : 'Active'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{opp.title}</h3>
                  <div className="text-xs text-slate-500">{opp.employer} • {opp.location}</div>

                  <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div><strong>Pay:</strong> {opp.fixedPayOrStipend}</div>
                    <div><strong>Deadline:</strong> {opp.deadline}</div>
                    <div className="truncate"><strong>Eligibility:</strong> {opp.explicitEligibility}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-slate-400">{opp.id}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditOppModal(opp)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setOpportunityArchiveStatus(opp.id, !opp.isArchived)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        opp.isArchived
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      }`}
                    >
                      {opp.isArchived ? 'Unarchive' : 'Archive / Close'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          {/* Create Opportunity Modal */}
          {showAddOppModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Post New Recruitment Drive</h3>
                  <button onClick={() => setShowAddOppModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateOpp} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Role Title *</label>
                      <input
                        type="text"
                        required
                        value={oppTitle}
                        onChange={(e) => setOppTitle(e.target.value)}
                        placeholder="e.g. Graduate Software Engineer"
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Employer / Company *</label>
                      <input
                        type="text"
                        required
                        value={oppEmployer}
                        onChange={(e) => setOppEmployer(e.target.value)}
                        placeholder="e.g. Tata Consultancy Services"
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Opportunity Type</label>
                      <select
                        value={oppType}
                        onChange={(e) => setOppType(e.target.value as OpportunityType)}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      >
                        <option value="Full-time Placement">Full-time Placement</option>
                        <option value="Internship leading to PPO">Internship w/ PPO</option>
                        <option value="Summer Internship">Summer Internship</option>
                        <option value="Pool Campus Drive">Pool Campus Drive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Work Mode</label>
                      <select
                        value={oppMode}
                        onChange={(e) => setOppMode(e.target.value as WorkMode)}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      >
                        <option value="On-site">On-site</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Deadline Date</label>
                      <input
                        type="date"
                        value={oppDeadline}
                        onChange={(e) => setOppDeadline(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Base CTC / Stipend</label>
                      <input
                        type="text"
                        value={oppPay}
                        onChange={(e) => setOppPay(e.target.value)}
                        placeholder="₹6.0 LPA Base CTC"
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={oppLocation}
                        onChange={(e) => setOppLocation(e.target.value)}
                        placeholder="Pune / Mumbai"
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Skills (comma separated)</label>
                    <input
                      type="text"
                      value={oppSkills}
                      onChange={(e) => setOppSkills(e.target.value)}
                      placeholder="React, Node.js, SQL"
                      className="w-full p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Departments</label>
                    <div className="flex flex-wrap gap-3 pt-1">
                      {(['Computer Science (CS)', 'Information Technology (IT)', 'Data Science (DS)'] as Department[]).map((d) => (
                        <label key={d} className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={oppDepts.includes(d)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setOppDepts([...oppDepts, d]);
                              } else {
                                setOppDepts(oppDepts.filter((x) => x !== d));
                              }
                            }}
                            className="rounded text-brand-blue"
                          />
                          <span>{d}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Explicit Eligibility Criteria</label>
                    <input
                      type="text"
                      value={oppEligibility}
                      onChange={(e) => setOppEligibility(e.target.value)}
                      placeholder="60% throughout, no live backlogs, CS/IT only"
                      className="w-full p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Role Description</label>
                    <textarea
                      rows={2}
                      value={oppDesc}
                      onChange={(e) => setOppDesc(e.target.value)}
                      placeholder="Detailed responsibilities and interview rounds..."
                      className="w-full p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddOppModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-purple-700 text-white text-xs font-semibold hover:bg-purple-800"
                    >
                      Publish Opportunity
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Opportunity Modal */}
          {editingOpp && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Edit Opportunity Listing</h3>
                    <p className="text-[11px] text-slate-500">ID: {editingOpp.id}</p>
                  </div>
                  <button onClick={() => setEditingOpp(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateOpp} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Role Title *</label>
                      <input
                        type="text"
                        required
                        value={editOppTitle}
                        onChange={(e) => setEditOppTitle(e.target.value)}
                        placeholder="e.g. Graduate Software Engineer"
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Employer / Company *</label>
                      <input
                        type="text"
                        required
                        value={editOppEmployer}
                        onChange={(e) => setEditOppEmployer(e.target.value)}
                        placeholder="e.g. Tata Consultancy Services"
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Opportunity Type</label>
                      <select
                        value={editOppType}
                        onChange={(e) => setEditOppType(e.target.value as OpportunityType)}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      >
                        <option value="Full-time Placement">Full-time Placement</option>
                        <option value="Internship leading to PPO">Internship w/ PPO</option>
                        <option value="Summer Internship">Summer Internship</option>
                        <option value="Pool Campus Drive">Pool Campus Drive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Work Mode</label>
                      <select
                        value={editOppMode}
                        onChange={(e) => setEditOppMode(e.target.value as WorkMode)}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      >
                        <option value="On-site">On-site</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Deadline Date</label>
                      <input
                        type="date"
                        value={editOppDeadline}
                        onChange={(e) => setEditOppDeadline(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Base CTC / Stipend</label>
                      <input
                        type="text"
                        value={editOppPay}
                        onChange={(e) => setEditOppPay(e.target.value)}
                        placeholder="₹6.0 LPA Base CTC"
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={editOppLocation}
                        onChange={(e) => setEditOppLocation(e.target.value)}
                        placeholder="Pune / Mumbai"
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Skills (comma separated)</label>
                    <input
                      type="text"
                      value={editOppSkills}
                      onChange={(e) => setEditOppSkills(e.target.value)}
                      placeholder="React, Node.js, SQL"
                      className="w-full p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Departments</label>
                    <div className="flex flex-wrap gap-3 pt-1">
                      {(['Computer Science (CS)', 'Information Technology (IT)', 'Data Science (DS)'] as Department[]).map((d) => (
                        <label key={d} className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editOppDepts.includes(d)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditOppDepts([...editOppDepts, d]);
                              } else {
                                setEditOppDepts(editOppDepts.filter((x) => x !== d));
                              }
                            }}
                            className="rounded text-brand-blue"
                          />
                          <span>{d}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Explicit Eligibility Criteria</label>
                    <input
                      type="text"
                      value={editOppEligibility}
                      onChange={(e) => setEditOppEligibility(e.target.value)}
                      placeholder="60% throughout, no live backlogs, CS/IT only"
                      className="w-full p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Role Description</label>
                    <textarea
                      rows={2}
                      value={editOppDesc}
                      onChange={(e) => setEditOppDesc(e.target.value)}
                      placeholder="Detailed responsibilities and interview rounds..."
                      className="w-full p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingOpp(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-purple-700 text-white text-xs font-semibold hover:bg-purple-800"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ==================================================================== */}
      {/* MODULE 3: WORKSHOPS & ATTENDANCE ROSTER                              */}
      {/* ==================================================================== */}
      {activeTab === 'workshops' && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-brand-navy">Workshop Rosters & Attendance Audit</h2>
              <p className="text-xs text-slate-500">
                View student rosters enrolled in training clinics and officially mark verified attendance.
              </p>
            </div>

            <button
              onClick={() => setShowAddWorkshopModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-semibold hover:bg-purple-800 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Workshop</span>
            </button>
          </div>

          {/* Workshop selector pill buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
            {trainingSessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedWorkshopId(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedWorkshopId === s.id
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {s.title} ({s.enrolledCount}/{s.capacity})
              </button>
            ))}
          </div>

          {/* Active Workshop Roster Table */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
              <span className="font-bold text-slate-800">
                Enrolled Students for {trainingSessions.find((s) => s.id === selectedWorkshopId)?.title}
              </span>
              <div className="flex items-center gap-2">
                {trainingSessions.find((s) => s.id === selectedWorkshopId) && (
                  <button
                    onClick={() => openEditWorkshopModal(trainingSessions.find((s) => s.id === selectedWorkshopId)!)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Clinic Details</span>
                  </button>
                )}
                <span className="text-slate-500 font-medium">{workshopRoster.length} Total Enrolled</span>
              </div>
            </div>

            {loadingRoster ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading roster...</div>
            ) : workshopRoster.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                No students currently enrolled in this workshop session.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Year</th>
                      <th className="p-3">Aggregate %</th>
                      <th className="p-3">Enrolled At</th>
                      <th className="p-3">Attendance Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workshopRoster.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-semibold text-slate-900">{r.studentName}</td>
                        <td className="p-3 text-slate-600">{r.studentDepartment}</td>
                        <td className="p-3 text-slate-600">{r.studentYear}</td>
                        <td className="p-3 font-semibold text-slate-800">{r.academicPercentage ?? 'N/A'}%</td>
                        <td className="p-3 text-slate-400 text-[11px]">{r.enrolledAt}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              r.attendanceStatus === 'Attended'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : r.attendanceStatus === 'Absent'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-blue-100 text-blue-800 border-blue-300'
                            }`}
                          >
                            {r.attendanceStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => handleMarkAttendance(r.id, 'Attended')}
                            className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-[11px] border border-emerald-200"
                          >
                            Mark Attended
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(r.id, 'Absent')}
                            className="px-2.5 py-1 rounded bg-rose-50 text-rose-800 hover:bg-rose-100 font-semibold text-[11px] border border-rose-200"
                          >
                            Mark Absent
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Schedule Workshop Modal */}
          {showAddWorkshopModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Schedule Practical Training Clinic</h3>
                  <button onClick={() => setShowAddWorkshopModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateWorkshop} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Clinic Title *</label>
                    <input
                      type="text"
                      required
                      value={wsTitle}
                      onChange={(e) => setWsTitle(e.target.value)}
                      placeholder="e.g. System Design & Distributed Systems Lab"
                      className="w-full p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Department</label>
                      <select
                        value={wsDept}
                        onChange={(e) => setWsDept(e.target.value as Department)}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      >
                        <option value="Computer Science (CS)">CS</option>
                        <option value="Information Technology (IT)">IT</option>
                        <option value="Data Science (DS)">DS</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Seat Capacity</label>
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={wsCapacity}
                        onChange={(e) => setWsCapacity(parseInt(e.target.value, 10))}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Weekly Schedule</label>
                      <input
                        type="text"
                        value={wsSchedule}
                        onChange={(e) => setWsSchedule(e.target.value)}
                        placeholder="Friday 3:00 PM – 5:00 PM"
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Venue / Lab</label>
                      <input
                        type="text"
                        value={wsVenue}
                        onChange={(e) => setWsVenue(e.target.value)}
                        placeholder="Hardware Lab 2"
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Skills</label>
                    <input
                      type="text"
                      value={wsSkills}
                      onChange={(e) => setWsSkills(e.target.value)}
                      placeholder="Microservices, Docker, Kafka"
                      className="w-full p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddWorkshopModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-purple-700 text-white text-xs font-semibold hover:bg-purple-800"
                    >
                      Create Workshop
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Workshop Modal */}
          {editingWorkshop && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Edit Practical Training Clinic</h3>
                    <p className="text-[11px] text-slate-500">
                      ID: {editingWorkshop.id} • Currently {editingWorkshop.enrolledCount} Enrolled
                    </p>
                  </div>
                  <button onClick={() => setEditingWorkshop(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateWorkshop} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Clinic Title *</label>
                    <input
                      type="text"
                      required
                      value={editWsTitle}
                      onChange={(e) => setEditWsTitle(e.target.value)}
                      placeholder="e.g. System Design & Distributed Systems Lab"
                      className="w-full p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Department</label>
                      <select
                        value={editWsDept}
                        onChange={(e) => setEditWsDept(e.target.value as any)}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      >
                        <option value="All Departments">All Departments</option>
                        <option value="Computer Science (CS)">CS</option>
                        <option value="Information Technology (IT)">IT</option>
                        <option value="Data Science (DS)">DS</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Seat Capacity (min {editingWorkshop.enrolledCount})
                      </label>
                      <input
                        type="number"
                        min={editingWorkshop.enrolledCount || 1}
                        max="200"
                        value={editWsCapacity}
                        onChange={(e) => setEditWsCapacity(parseInt(e.target.value, 10))}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Weekly Schedule</label>
                      <input
                        type="text"
                        value={editWsSchedule}
                        onChange={(e) => setEditWsSchedule(e.target.value)}
                        placeholder="Friday 3:00 PM – 5:00 PM"
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Venue / Lab</label>
                      <input
                        type="text"
                        value={editWsVenue}
                        onChange={(e) => setEditWsVenue(e.target.value)}
                        placeholder="Hardware Lab 2"
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Skills</label>
                    <input
                      type="text"
                      value={editWsSkills}
                      onChange={(e) => setEditWsSkills(e.target.value)}
                      placeholder="Microservices, Docker, Kafka"
                      className="w-full p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingWorkshop(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-purple-700 text-white text-xs font-semibold hover:bg-purple-800"
                    >
                      Save Clinic Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ==================================================================== */}
      {/* MODULE 4: ANONYMIZED GRIEVANCE / FEEDBACK QUEUE                     */}
      {/* ==================================================================== */}
      {activeTab === 'feedback' && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-brand-navy">Anonymous Student Grievance Queue</h2>
              <p className="text-xs text-slate-500">
                Institutional complaints and feedback submitted by students. Student identity is omitted to protect anonymity.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-pink-100 text-pink-800">
              {coordinatorFeedbackList.length} Total Submissions
            </span>
          </div>

          <div className="space-y-4">
            {coordinatorFeedbackList.map((fb) => (
              <div
                key={fb.id}
                className="p-5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{fb.category}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {fb.department}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Anonymous Submission
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
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

                <p className="text-slate-700 leading-relaxed">{fb.description}</p>

                {fb.suggestedImprovement && (
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/70 text-slate-600">
                    <strong>Student Suggestion:</strong> {fb.suggestedImprovement}
                  </div>
                )}

                {/* Coordinator Official Response */}
                {fb.coordinatorResponse ? (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
                    <span className="font-bold text-[10px] uppercase text-emerald-800 block">
                      Official Institutional Response:
                    </span>
                    <p>{fb.coordinatorResponse}</p>
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-700 italic">
                    Grievance requires official placement cell acknowledgement and resolution.
                  </div>
                )}

                {/* Respond drawer */}
                {respondingFbId === fb.id ? (
                  <div className="p-3.5 bg-white rounded-xl border border-purple-200 space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Write Institutional Response & Action Taken:
                    </label>
                    <textarea
                      rows={2}
                      value={fbResponseText}
                      onChange={(e) => setFbResponseText(e.target.value)}
                      placeholder="e.g. Scheduled additional DSA interview clinics starting next Monday in Lab 3."
                      className="w-full p-2 text-xs rounded-lg border border-slate-300"
                    />
                    <div className="flex items-center justify-between pt-1">
                      <select
                        value={fbTargetStatus}
                        onChange={(e) => setFbTargetStatus(e.target.value)}
                        className="p-1 rounded text-xs border border-slate-300"
                      >
                        <option value="Addressed">Status: Addressed</option>
                        <option value="Under Review">Status: Under Review</option>
                        <option value="Archived">Status: Archived</option>
                      </select>
                      <div className="space-x-1">
                        <button
                          onClick={() => setRespondingFbId(null)}
                          className="px-3 py-1 rounded text-xs border border-slate-300 text-slate-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSendFeedbackResponse(fb.id)}
                          className="px-4 py-1 rounded bg-purple-700 text-white text-xs font-semibold hover:bg-purple-800"
                        >
                          Send Official Response
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        setRespondingFbId(fb.id);
                        setFbResponseText(fb.coordinatorResponse || '');
                        setFbTargetStatus(fb.status === 'Submitted' ? 'Addressed' : fb.status);
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-800 hover:bg-purple-200"
                    >
                      {fb.coordinatorResponse ? 'Update Response' : 'Respond to Student'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* MODULE 5: 1-ON-1 GUIDANCE APPOINTMENTS DESK                           */}
      {/* ==================================================================== */}
      {activeTab === 'guidance' && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-brand-navy">1-on-1 Placement Guidance Desk</h2>
              <p className="text-xs text-slate-500">
                Confirm counseling slots, conduct mock interviews, and provide individualized career preparation.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800">
              {coordinatorGuidanceList.length} Guidance Appointments
            </span>
          </div>

          <div className="space-y-4">
            {coordinatorGuidanceList.map((g) => (
              <div
                key={g.id}
                className="p-5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{g.topic}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {g.studentName || 'Student'} ({g.studentDepartment || 'All'})
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Target Role: <strong>{g.targetRole}</strong> | Requested Slot: <strong>{g.preferredTimeSlot}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        g.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : g.status === 'Scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {g.status}
                    </span>
                    <button
                      onClick={() => {
                        setSchedulingGdId(schedulingGdId === g.id ? null : g.id);
                        setSchedTime(g.scheduledTime || g.preferredTimeSlot);
                        setSchedNote(g.coordinatorNote || '');
                        setSchedStatus(g.status === 'Requested' ? 'Scheduled' : g.status);
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700"
                    >
                      {schedulingGdId === g.id ? 'Close' : 'Schedule / Note'}
                    </button>
                  </div>
                </div>

                {g.additionalNotes && (
                  <div className="text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/60">
                    <span className="font-semibold text-slate-700">Student Note: </span>
                    <span>{g.additionalNotes}</span>
                  </div>
                )}

                {g.coordinatorNote && (
                  <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-xs">
                    <strong>Placement Cell Confirmation:</strong> {g.coordinatorNote}
                    {g.scheduledTime && (
                      <div className="text-purple-700 font-semibold mt-0.5">
                        Scheduled Slot: {g.scheduledTime}
                      </div>
                    )}
                  </div>
                )}

                {/* Scheduling Drawer */}
                {schedulingGdId === g.id && (
                  <div className="p-4 bg-white rounded-xl border border-purple-200 space-y-3">
                    <div className="font-bold text-purple-900 text-xs uppercase tracking-wider">
                      Appointment Confirmation & Guidance Prep Note
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Confirmed Slot / Venue / Link
                        </label>
                        <input
                          type="text"
                          value={schedTime}
                          onChange={(e) => setSchedTime(e.target.value)}
                          placeholder="e.g. Tuesday 3:30 PM, TPO Office Room 102"
                          className="w-full p-2 text-xs rounded-lg border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Appointment Status
                        </label>
                        <select
                          value={schedStatus}
                          onChange={(e) => setSchedStatus(e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-slate-300 font-semibold"
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Completed">Completed</option>
                          <option value="Requested">Requested (Pending)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Coordinator Preparation / Guidance Notes
                      </label>
                      <textarea
                        rows={2}
                        value={schedNote}
                        onChange={(e) => setSchedNote(e.target.value)}
                        placeholder="Please bring updated resume copy with project github links..."
                        className="w-full p-2 text-xs rounded-lg border border-slate-300"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setSchedulingGdId(null)}
                        className="px-3 py-1 text-xs border border-slate-300 rounded-lg text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleScheduleGuidanceSubmit(g.id)}
                        className="px-4 py-1 text-xs font-semibold rounded-lg bg-purple-700 text-white hover:bg-purple-800"
                      >
                        Save Appointment Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* MODULE 6: EMPLOYER OUTREACH & RECRUITER ENGAGEMENT                   */}
      {/* ==================================================================== */}
      {activeTab === 'outreach' && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-brand-navy">Recruiter & Employer Outreach Log</h2>
              <p className="text-xs text-slate-500">
                Track formal corporate outreach, follow-up timelines, and recruiting commitments.
              </p>
            </div>

            <button
              onClick={() => setShowAddOutreach(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-semibold hover:bg-purple-800 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Recruiter Outreach Record</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {employerOutreach.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                      {item.contactStatus}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.id}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{item.employer}</h3>
                  <div className="text-xs text-slate-600">Roles: {item.intendedRoles}</div>

                  <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {item.notes}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Next Follow-up: <strong>{item.followUpDate}</strong></span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditOutreachModal(item)}
                      className="p-1 rounded text-purple-600 hover:bg-purple-50 transition-colors"
                      title="Edit Outreach Record"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteOutreach(item.id, item.employer)}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Delete Outreach Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Outreach Modal */}
          {showAddOutreach && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Add Recruiter Outreach Record</h3>
                  <button onClick={() => setShowAddOutreach(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateOutreach} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Company / Organization *</label>
                    <input
                      type="text"
                      required
                      value={newEmployer}
                      onChange={(e) => setNewEmployer(e.target.value)}
                      placeholder="e.g. Infosys Ltd."
                      className="w-full p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Intended Roles</label>
                      <input
                        type="text"
                        value={newRoles}
                        onChange={(e) => setNewRoles(e.target.value)}
                        placeholder="Systems Engineer Trainee"
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Status</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as OutreachStatus)}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      >
                        <option value="Initial Inquiry">Initial Inquiry</option>
                        <option value="Discussion Scheduled">Discussion Scheduled</option>
                        <option value="JD Awaited">JD Awaited</option>
                        <option value="Drive Confirmed">Drive Confirmed</option>
                        <option value="Deferred">Deferred</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Departments</label>
                    <div className="flex flex-wrap gap-3 pt-1">
                      {(['Computer Science (CS)', 'Information Technology (IT)', 'Data Science (DS)'] as Department[]).map((d) => (
                        <label key={d} className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newDepts.includes(d)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewDepts([...newDepts, d]);
                              } else {
                                setNewDepts(newDepts.filter((x) => x !== d));
                              }
                            }}
                            className="rounded text-purple-700"
                          />
                          <span>{d}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Follow-up Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Notes / Action Points</label>
                    <textarea
                      rows={2}
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="Sent college placement brochure and statistics..."
                      className="w-full p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddOutreach(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-purple-700 text-white text-xs font-semibold hover:bg-purple-800"
                    >
                      Save Outreach
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Outreach Modal */}
          {editingOutreach && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Edit Recruiter Outreach Record</h3>
                    <p className="text-[11px] text-slate-500">ID: {editingOutreach.id}</p>
                  </div>
                  <button onClick={() => setEditingOutreach(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateOutreach} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Company / Organization *</label>
                    <input
                      type="text"
                      required
                      value={editEmployer}
                      onChange={(e) => setEditEmployer(e.target.value)}
                      placeholder="e.g. Infosys Ltd."
                      className="w-full p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Intended Roles</label>
                      <input
                        type="text"
                        value={editRoles}
                        onChange={(e) => setEditRoles(e.target.value)}
                        placeholder="Systems Engineer Trainee"
                        className="w-full p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Status</label>
                      <select
                        value={editOutreachStatus}
                        onChange={(e) => setEditOutreachStatus(e.target.value as OutreachStatus)}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      >
                        <option value="Initial Inquiry">Initial Inquiry</option>
                        <option value="Discussion Scheduled">Discussion Scheduled</option>
                        <option value="JD Awaited">JD Awaited</option>
                        <option value="Drive Confirmed">Drive Confirmed</option>
                        <option value="Deferred">Deferred</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Departments</label>
                    <div className="flex flex-wrap gap-3 pt-1">
                      {(['Computer Science (CS)', 'Information Technology (IT)', 'Data Science (DS)'] as Department[]).map((d) => (
                        <label key={d} className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editOutreachDepts.includes(d)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditOutreachDepts([...editOutreachDepts, d]);
                              } else {
                                setEditOutreachDepts(editOutreachDepts.filter((x) => x !== d));
                              }
                            }}
                            className="rounded text-purple-700"
                          />
                          <span>{d}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Follow-up Date</label>
                    <input
                      type="date"
                      value={editOutreachDate}
                      onChange={(e) => setEditOutreachDate(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Notes / Action Points</label>
                    <textarea
                      rows={2}
                      value={editOutreachNotes}
                      onChange={(e) => setEditOutreachNotes(e.target.value)}
                      placeholder="Sent college placement brochure and statistics..."
                      className="w-full p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingOutreach(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-purple-700 text-white text-xs font-semibold hover:bg-purple-800"
                    >
                      Save Outreach
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ==================================================================== */}
      {/* MODULE 7: COMMUNITY VISITS ACTION PLAN TRACKING                      */}
      {/* ==================================================================== */}
      {activeTab === 'actions' && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-brand-navy">Three Community Visits Action Plan</h2>
              <p className="text-xs text-slate-500">
                Institutional corrective actions derived directly from the Three Community Visits field studies.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {studyData.actionPlan.map((action) => (
              <div
                key={action.id}
                className="p-5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {action.problem || action.actionItem}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {action.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={action.status}
                      disabled={updatingActionId === action.id}
                      onChange={async (e) => {
                        const newStatus = e.target.value as any;
                        setUpdatingActionId(action.id);
                        await updateActionPlanItem({ ...action, status: newStatus });
                        setUpdatingActionId(null);
                      }}
                      className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-slate-300 bg-white text-slate-800 shadow-2xs hover:border-slate-400 focus:outline-hidden focus:ring-1 focus:ring-brand-blue disabled:opacity-50"
                    >
                      <option value="Proposed">Proposed</option>
                      <option value="In progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        action.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : action.status === 'In progress' || action.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {action.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-500 text-[11px] pt-1">
                  <div><strong>Owner / Assigned:</strong> {action.owner || action.assignedTo || 'Placement Committee'}</div>
                  <div><strong>Target Horizon:</strong> {action.targetDate || action.timeline || 'Upcoming cycle'}</div>
                </div>

                <div className="text-slate-600 bg-white p-3 rounded-xl border border-slate-200/60 text-[11px] space-y-1.5">
                  <div>
                    <strong className="text-slate-800">Proposed Corrective Action:</strong> {action.proposedAction}
                  </div>
                  {(action.evidenceOrOutcomeNotes || action.targetMetric) && (
                    <div className="text-slate-500 pt-1.5 border-t border-slate-100">
                      <strong className="text-slate-700">Evidence &amp; Outcome Notes:</strong>{' '}
                      {action.evidenceOrOutcomeNotes || action.targetMetric}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
