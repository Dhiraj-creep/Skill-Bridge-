import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  apiService,
  UserSession,
  AuthResponse,
  StudentApplicationItem,
  CoordinatorApplicationItem,
  StudentEnrollmentItem,
  CoordinatorMetrics,
  RegisteredStudentOverview,
  DatabaseStatus,
} from '../services/apiService';
import { UserRole } from '../utils/permissions';
import { SurveyResponse, SurveyQuestion, SurveyResponsesSummary } from '../types/survey';
import { DEFAULT_SITE_CONTENT } from '../data/defaultContent';
import { DemoOpportunity } from '../types/opportunity';
import { TrainingSession } from '../types/training';
import {
  ThreeDayStudyData,
  CommunityVisitsDocument,
  CommunityVisit1Data,
  CommunityVisit2Data,
  CommunityVisit3Data,
  TraceabilityItem,
  ActionPlanItem,
  GapAnalysisItem,
} from '../types/study';
import { FeedbackSubmission, GuidanceRequest } from '../types/feedback';
import {
  SiteGeneralContent,
  ProblemSolutionItem,
  EmployerOutreachRecord,
  StudentProfile,
} from '../types/content';
import { ThemePreset } from '../types/theme';
import {
  StorageService,
  initializeRepository,
  resetToDefaults,
  FullBackupPayload,
} from '../utils/storage';

interface NotificationToast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

export interface AppContextType {
  // Authentication & Identity
  user: UserSession | null;
  role: UserRole;
  authLoading: boolean;
  login: (username: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  register: (params: {
    username: string;
    password: string;
    fullName: string;
    department: string;
    year?: string;
    skills?: string[];
    preferredRoles?: string[];
  }) => Promise<AuthResponse>;

  // Theme & Notifications
  theme: ThemePreset;
  previewTheme: (theme: ThemePreset) => void;
  saveTheme: (theme: ThemePreset) => void;
  resetTheme: () => void;
  notifications: NotificationToast[];
  addNotification: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissNotification: (id: string) => void;

  // Student Workspace Operations (Authoritative Server State)
  studentProfile: StudentProfile | null;
  updateStudentProfile: (profile: Partial<StudentProfile>) => Promise<boolean>;
  studentApplications: StudentApplicationItem[];
  applyToOpportunity: (opportunityId: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
  savedOpportunityIds: string[];
  toggleSaveOpportunity: (opportunityId: string) => Promise<void>;
  studentEnrollments: StudentEnrollmentItem[];
  enrollInSession: (workshopId: string) => Promise<{ success: boolean; error?: string }>;
  cancelEnrollment: (workshopId: string) => Promise<boolean>;
  studentFeedbackList: FeedbackSubmission[];
  submitFeedback: (data: { category: string; description: string; suggestedImprovement?: string }) => Promise<{ success: boolean; error?: string }>;
  studentGuidanceList: GuidanceRequest[];
  submitGuidanceRequest: (data: { preferredRole?: string; topic: string; preferredTimeSlot: string; additionalNotes?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshStudentData: () => Promise<void>;

  // Coordinator Workspace Operations (Authoritative Server State)
  coordinatorMetrics: CoordinatorMetrics | null;
  coordinatorApplications: CoordinatorApplicationItem[];
  refreshCoordinatorApplications: (filters?: { opportunityId?: string; department?: string; status?: string }) => Promise<void>;
  updateApplicationStatus: (id: string, status: string, feedback?: string) => Promise<{ success: boolean; error?: string }>;
  createOpportunity: (opp: Partial<DemoOpportunity>) => Promise<{ success: boolean; error?: string }>;
  updateOpportunity: (id: string, opp: Partial<DemoOpportunity>) => Promise<{ success: boolean; error?: string }>;
  setOpportunityArchiveStatus: (id: string, isArchived: boolean, isExpired?: boolean) => Promise<boolean>;
  coordinatorFeedbackList: FeedbackSubmission[];
  respondToFeedback: (id: string, status: string, response: string) => Promise<boolean>;
  coordinatorGuidanceList: GuidanceRequest[];
  scheduleGuidance: (id: string, status: string, scheduledTime?: string, note?: string) => Promise<boolean>;
  coordinatorStudentsList: RegisteredStudentOverview[];
  markWorkshopAttendance: (enrollmentId: string, status: 'Attended' | 'Absent' | 'Enrolled') => Promise<boolean>;
  createWorkshop: (workshop: Partial<TrainingSession>) => Promise<{ success: boolean; error?: string }>;
  updateWorkshop: (id: string, workshop: Partial<TrainingSession>) => Promise<{ success: boolean; error?: string }>;
  refreshCoordinatorData: () => Promise<void>;

  // Shared Listings & Research (200 Responses across CS, IT, DS)
  opportunities: DemoOpportunity[];
  refreshOpportunities: () => Promise<void>;
  trainingSessions: TrainingSession[];
  refreshTrainingSessions: () => Promise<void>;
  responses: SurveyResponse[];
  responsesSummary: SurveyResponsesSummary | null;
  refreshResponses: () => Promise<void>;
  refreshResponsesSummary: (filters?: { department?: string; year?: string; sourceType?: string }) => Promise<void>;
  addResponse: (resp: SurveyResponse) => Promise<void>;
  updateResponse: (resp: SurveyResponse) => Promise<void>;
  deleteResponse: (id: string) => Promise<void>;
  importResponses: (newResponses: SurveyResponse[], mode: 'replace' | 'merge') => Promise<void>;
  questions: SurveyQuestion[];
  updateQuestion: (q: SurveyQuestion) => Promise<void>;
  addQuestion: (q: SurveyQuestion) => Promise<void>;

  // Community Visits & Study Documentation
  communityVisits: CommunityVisitsDocument;
  refreshSystemDocuments: () => Promise<void>;
  updateCommunityVisits: (doc: CommunityVisitsDocument) => Promise<boolean>;
  updateVisit1: (data: CommunityVisit1Data) => Promise<boolean>;
  updateVisit2: (data: CommunityVisit2Data) => Promise<boolean>;
  updateVisit3: (data: CommunityVisit3Data) => Promise<boolean>;
  updateTraceability: (items: TraceabilityItem[]) => Promise<boolean>;
  studyData: ThreeDayStudyData;
  updateStudyData: (data: ThreeDayStudyData) => Promise<boolean>;
  updateActionPlanItem: (item: ActionPlanItem) => Promise<boolean>;
  updateGapItem: (item: GapAnalysisItem) => Promise<boolean>;
  problemMatrix: ProblemSolutionItem[];
  updateProblemMatrix: (matrix: ProblemSolutionItem[]) => Promise<boolean>;

  // Outreach & Site Content
  employerOutreach: EmployerOutreachRecord[];
  refreshEmployerOutreach: () => Promise<void>;
  addEmployerOutreach: (record: EmployerOutreachRecord) => Promise<void>;
  updateEmployerOutreach: (id: string, record: Partial<EmployerOutreachRecord>) => Promise<boolean>;
  deleteEmployerOutreach: (id: string) => Promise<boolean>;
  siteContent: SiteGeneralContent;
  updateSiteContent: (content: SiteGeneralContent) => Promise<boolean>;

  // Maintenance & Database
  dbStatus: DatabaseStatus | null;
  refreshDbStatus: () => Promise<void>;
  resetDatabase: () => Promise<boolean>;
  resetAllDemoData: () => void;
  restoreFromBackup: (payload: FullBackupPayload) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication State
  const [user, setUser] = useState<UserSession | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Theme & Notifications
  const [theme, setThemeState] = useState<ThemePreset>(() => StorageService.getThemePreset());
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);

  // Student Workspace State
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [studentApplications, setStudentApplications] = useState<StudentApplicationItem[]>([]);
  const [savedOpportunityIds, setSavedOpportunityIds] = useState<string[]>([]);
  const [studentEnrollments, setStudentEnrollments] = useState<StudentEnrollmentItem[]>([]);
  const [studentFeedbackList, setStudentFeedbackList] = useState<FeedbackSubmission[]>([]);
  const [studentGuidanceList, setStudentGuidanceList] = useState<GuidanceRequest[]>([]);

  // Coordinator Workspace State
  const [coordinatorMetrics, setCoordinatorMetrics] = useState<CoordinatorMetrics | null>(null);
  const [coordinatorApplications, setCoordinatorApplications] = useState<CoordinatorApplicationItem[]>([]);
  const [coordinatorFeedbackList, setCoordinatorFeedbackList] = useState<FeedbackSubmission[]>([]);
  const [coordinatorGuidanceList, setCoordinatorGuidanceList] = useState<GuidanceRequest[]>([]);
  const [coordinatorStudentsList, setCoordinatorStudentsList] = useState<RegisteredStudentOverview[]>([]);

  // Shared Opportunities, Training, Survey Responses & Site Content
  const [opportunities, setOpportunities] = useState<DemoOpportunity[]>(() => StorageService.getOpportunities());
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>(() => StorageService.getTrainingSessions());
  const [responses, setResponsesState] = useState<SurveyResponse[]>([]);
  const [responsesSummary, setResponsesSummaryState] = useState<SurveyResponsesSummary | null>(null);
  const [questions, setQuestionsState] = useState<SurveyQuestion[]>(() => StorageService.getQuestions());
  const [communityVisits, setCommunityVisitsState] = useState<CommunityVisitsDocument>(() => StorageService.getCommunityVisits());
  const [studyData, setStudyDataState] = useState<ThreeDayStudyData>(() => StorageService.getStudyData());
  const [problemMatrix, setProblemMatrixState] = useState<ProblemSolutionItem[]>(() => StorageService.getProblemMatrix());
  const [employerOutreach, setOutreachState] = useState<EmployerOutreachRecord[]>(() => StorageService.getEmployerOutreach());
  const [siteContent, setSiteContentState] = useState<SiteGeneralContent>(() => StorageService.getSiteContent());

  // Database Diagnostics
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);

  // Derived role
  const role: UserRole = user ? user.role : 'Public';

  const addNotification = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  /* ======================================================================== */
  /* DATA FETCHING: STUDENT & COORDINATOR                                     */
  /* ======================================================================== */

  const refreshStudentData = useCallback(async () => {
    try {
      const [prof, apps, saved, enrs, fb, gd] = await Promise.all([
        apiService.getStudentProfile(),
        apiService.getStudentApplications(),
        apiService.getStudentSavedOpportunities(),
        apiService.getStudentEnrollments(),
        apiService.getStudentFeedback(),
        apiService.getStudentGuidance(),
      ]);

      if (prof) setStudentProfile(prof);
      setStudentApplications(apps);
      setSavedOpportunityIds(saved);
      setStudentEnrollments(enrs);
      setStudentFeedbackList(fb);
      setStudentGuidanceList(gd);
    } catch (err) {
      console.error('[refreshStudentData Error]', err);
    }
  }, []);

  const refreshCoordinatorData = useCallback(async () => {
    try {
      const [metrics, apps, fb, gd, studs, outreach] = await Promise.all([
        apiService.getCoordinatorMetrics(),
        apiService.getCoordinatorApplications(),
        apiService.getCoordinatorFeedback(),
        apiService.getCoordinatorGuidance(),
        apiService.getCoordinatorStudents(),
        apiService.getEmployerOutreach(),
      ]);

      if (metrics) setCoordinatorMetrics(metrics);
      setCoordinatorApplications(apps);
      setCoordinatorFeedbackList(fb);
      setCoordinatorGuidanceList(gd);
      setCoordinatorStudentsList(studs);
      if (Array.isArray(outreach)) {
        setOutreachState(outreach);
        StorageService.setEmployerOutreach(outreach);
      }
    } catch (err) {
      console.error('[refreshCoordinatorData Error]', err);
    }
  }, []);

  const refreshOpportunities = useCallback(async () => {
    try {
      const opps = await apiService.getOpportunities();
      if (Array.isArray(opps)) {
        setOpportunities(opps);
        StorageService.setOpportunities(opps);
      }
    } catch {
      // offline fallback
    }
  }, []);

  const refreshTrainingSessions = useCallback(async () => {
    try {
      const sessions = await apiService.getTrainingSessions();
      if (Array.isArray(sessions)) {
        setTrainingSessions(sessions);
        StorageService.setTrainingSessions(sessions);
      }
    } catch {
      // offline fallback
    }
  }, []);

  const refreshResponses = useCallback(async () => {
    try {
      const res = await apiService.getResponses();
      if (Array.isArray(res)) {
        setResponsesState(res);
        StorageService.setResponses(res);
      }
    } catch {
      // offline fallback or 401/403 for non-coordinators
    }
  }, []);

  const refreshResponsesSummary = useCallback(async (filters?: { department?: string; year?: string; sourceType?: string }) => {
    try {
      const summary = await apiService.getResponsesSummary(filters);
      if (summary) {
        setResponsesSummaryState(summary);
      }
    } catch {
      // offline fallback
    }
  }, []);

  const refreshEmployerOutreach = useCallback(async () => {
    try {
      const res = await apiService.getEmployerOutreach();
      if (Array.isArray(res)) {
        setOutreachState(res);
        StorageService.setEmployerOutreach(res);
      }
    } catch {
      // offline fallback
    }
  }, []);

  const refreshSystemDocuments = useCallback(async () => {
    try {
      const [cv, sd, pm, sc, sq] = await Promise.all([
        apiService.getSystemDocument<CommunityVisitsDocument>('community_visits'),
        apiService.getSystemDocument<ThreeDayStudyData>('study_data'),
        apiService.getSystemDocument<ProblemSolutionItem[]>('problem_matrix'),
        apiService.getSystemDocument<SiteGeneralContent>('site_content'),
        apiService.getSystemDocument<SurveyQuestion[]>('survey_questions'),
      ]);

      if (cv && typeof cv === 'object') {
        setCommunityVisitsState(cv);
        StorageService.setCommunityVisits(cv);
      }
      if (sd && typeof sd === 'object') {
        setStudyDataState(sd);
        StorageService.setStudyData(sd);
      }
      if (pm && Array.isArray(pm)) {
        setProblemMatrixState(pm);
        StorageService.setProblemMatrix(pm);
      }
      if (sc && typeof sc === 'object') {
        const safeSc = { ...DEFAULT_SITE_CONTENT, ...sc };
        setSiteContentState(safeSc);
        StorageService.setSiteContent(safeSc);
      }
      if (Array.isArray(sq)) {
        setQuestionsState(sq);
        StorageService.setQuestions(sq);
      }
    } catch {
      // offline fallback
    }
  }, []);

  const refreshDbStatus = useCallback(async () => {
    try {
      const status = await apiService.getDatabaseStatus();
      setDbStatus(status);
    } catch {
      setDbStatus(null);
    }
  }, []);

  /* ======================================================================== */
  /* SESSION INITIALIZATION ON MOUNT                                          */
  /* ======================================================================== */

  useEffect(() => {
    initializeRepository();

    async function initSession() {
      setAuthLoading(true);
      try {
        const session = await apiService.getCurrentSession();
        if (session.user) {
          setUser(session.user);
          if (session.user.role === 'Student') {
            if (session.profile) setStudentProfile(session.profile);
            setResponsesState([]);
            StorageService.clearResponses();
            await refreshStudentData();
          } else if (session.user.role === 'Placement Coordinator' || session.user.role === 'Admin') {
            await refreshCoordinatorData();
            await refreshResponses();
          }
        } else {
          setResponsesState([]);
          StorageService.clearResponses();
        }
      } catch (err) {
        console.warn('Session check failed, running as guest.', err);
        setResponsesState([]);
        StorageService.clearResponses();
      } finally {
        setAuthLoading(false);
      }

      // Initial shared data load from SQLite authoritative database
      refreshOpportunities();
      refreshTrainingSessions();
      refreshResponsesSummary();
      refreshSystemDocuments();
      refreshDbStatus();
    }

    initSession();
  }, [
    refreshStudentData,
    refreshCoordinatorData,
    refreshOpportunities,
    refreshTrainingSessions,
    refreshResponses,
    refreshResponsesSummary,
    refreshSystemDocuments,
    refreshDbStatus,
  ]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  /* ======================================================================== */
  /* AUTHENTICATION ACTIONS                                                   */
  /* ======================================================================== */

  const login = async (username: string, password: string): Promise<AuthResponse> => {
    const res = await apiService.login(username, password);
    if (res.success && res.user) {
      setUser(res.user);
      if (res.user.role === 'Student') {
        if (res.profile) setStudentProfile(res.profile);
        setResponsesState([]);
        StorageService.clearResponses();
        await refreshStudentData();
      } else if (res.user.role === 'Placement Coordinator' || res.user.role === 'Admin') {
        await refreshCoordinatorData();
        await refreshResponses();
      }
      refreshResponsesSummary();
      refreshOpportunities();
      refreshTrainingSessions();
    }
    return res;
  };

  const logout = async (): Promise<void> => {
    await apiService.logout();
    setUser(null);
    setResponsesState([]);
    StorageService.clearResponses();
    // Clear student-specific state on logout
    setStudentProfile(null);
    setStudentApplications([]);
    setSavedOpportunityIds([]);
    setStudentEnrollments([]);
    setStudentFeedbackList([]);
    setStudentGuidanceList([]);
    // Clear coordinator-specific state
    setCoordinatorMetrics(null);
    setCoordinatorApplications([]);
    setCoordinatorFeedbackList([]);
    setCoordinatorGuidanceList([]);
    setCoordinatorStudentsList([]);
    refreshResponsesSummary();
    addNotification('You have been signed out successfully.', 'info');
  };

  const register = async (params: {
    username: string;
    password: string;
    fullName: string;
    department: string;
    year?: string;
    skills?: string[];
    preferredRoles?: string[];
  }): Promise<AuthResponse> => {
    const res = await apiService.registerStudent(params);
    if (res.success && res.user) {
      setUser(res.user);
      if (res.profile) setStudentProfile(res.profile);
      await refreshStudentData();
      refreshOpportunities();
    }
    return res;
  };

  /* ======================================================================== */
  /* STUDENT ACTIONS                                                          */
  /* ======================================================================== */

  const updateStudentProfile = async (profile: Partial<StudentProfile>): Promise<boolean> => {
    const success = await apiService.updateStudentProfile(profile);
    if (success) {
      setStudentProfile((prev) => (prev ? { ...prev, ...profile } : (profile as StudentProfile)));
      addNotification('Profile preferences updated successfully.', 'success');
      return true;
    }
    addNotification('Failed to update profile.', 'error');
    return false;
  };

  const applyToOpportunity = async (opportunityId: string, notes?: string): Promise<{ success: boolean; error?: string }> => {
    const res = await apiService.applyToOpportunity(opportunityId, notes);
    if (res.success) {
      await refreshStudentData();
      addNotification('Application submitted successfully to placement desk.', 'success');
      return { success: true };
    }
    addNotification(res.error || 'Application failed.', 'error');
    return { success: false, error: res.error };
  };

  const toggleSaveOpportunity = async (opportunityId: string): Promise<void> => {
    if (savedOpportunityIds.includes(opportunityId)) {
      const res = await apiService.unsaveOpportunity(opportunityId);
      if (res.success) {
        setSavedOpportunityIds((prev) => prev.filter((id) => id !== opportunityId));
        addNotification('Opportunity removed from saved listings.', 'info');
      } else {
        addNotification(res.error || 'Failed to remove saved opportunity.', 'error');
      }
    } else {
      const res = await apiService.saveOpportunity(opportunityId);
      if (res.success) {
        setSavedOpportunityIds((prev) => [...prev, opportunityId]);
        addNotification('Opportunity saved to your dashboard.', 'success');
      } else {
        addNotification(res.error || 'Failed to save opportunity.', 'error');
      }
    }
  };

  const enrollInSession = async (workshopId: string): Promise<{ success: boolean; error?: string }> => {
    const res = await apiService.enrollInWorkshop(workshopId);
    if (res.success) {
      await refreshStudentData();
      await refreshTrainingSessions();
      addNotification('Enrolled in workshop session successfully!', 'success');
      return { success: true };
    }
    addNotification(res.error || 'Enrollment failed.', 'error');
    return { success: false, error: res.error };
  };

  const cancelEnrollment = async (workshopId: string): Promise<boolean> => {
    const success = await apiService.cancelWorkshopEnrollment(workshopId);
    if (success) {
      await refreshStudentData();
      await refreshTrainingSessions();
      addNotification('Workshop enrollment cancelled.', 'info');
      return true;
    }
    addNotification('Failed to cancel enrollment.', 'error');
    return false;
  };

  const submitStudentFeedback = async (data: { category: string; description: string; suggestedImprovement?: string }): Promise<{ success: boolean; error?: string }> => {
    const res = await apiService.submitFeedback(data);
    if (res.success) {
      await refreshStudentData();
      addNotification('Feedback submitted anonymously to placement desk.', 'success');
      return { success: true };
    }
    addNotification(res.error || 'Failed to submit feedback.', 'error');
    return { success: false, error: res.error };
  };

  const requestStudentGuidance = async (data: { preferredRole?: string; topic: string; preferredTimeSlot: string; additionalNotes?: string }): Promise<{ success: boolean; error?: string }> => {
    const res = await apiService.requestGuidance(data);
    if (res.success) {
      await refreshStudentData();
      addNotification('Guidance session requested. Placement coordinator will confirm your slot.', 'success');
      return { success: true };
    }
    addNotification(res.error || 'Failed to request guidance session.', 'error');
    return { success: false, error: res.error };
  };

  /* ======================================================================== */
  /* COORDINATOR ACTIONS                                                      */
  /* ======================================================================== */

  const refreshCoordinatorApplications = async (filters?: { opportunityId?: string; department?: string; status?: string }): Promise<void> => {
    const apps = await apiService.getCoordinatorApplications(filters);
    setCoordinatorApplications(apps);
  };

  const updateApplicationStatus = async (id: string, status: string, feedback?: string): Promise<{ success: boolean; error?: string }> => {
    const res = await apiService.updateApplicationStatus(id, status, feedback);
    if (res.success) {
      await refreshCoordinatorData();
      addNotification(`Applicant status updated to "${status}".`, 'success');
      return { success: true };
    }
    addNotification(res.error || 'Failed to update applicant status.', 'error');
    return { success: false, error: res.error };
  };

  const createOpportunity = async (opp: Partial<DemoOpportunity>): Promise<{ success: boolean; error?: string }> => {
    const res = await apiService.createOpportunity(opp);
    if (res.success) {
      await refreshOpportunities();
      if (user?.role === 'Placement Coordinator' || user?.role === 'Admin') {
        await refreshCoordinatorData();
      }
      addNotification(`Opportunity "${opp.title}" published!`, 'success');
      return { success: true };
    }
    addNotification(res.error || 'Failed to create opportunity.', 'error');
    return { success: false, error: res.error };
  };

  const updateOpportunity = async (id: string, opp: Partial<DemoOpportunity>): Promise<{ success: boolean; error?: string }> => {
    const res = await apiService.updateOpportunity(id, opp);
    if (res.success) {
      await refreshOpportunities();
      addNotification(`Opportunity "${opp.title || id}" updated.`, 'success');
      return { success: true };
    }
    addNotification(res.error || 'Failed to update opportunity.', 'error');
    return { success: false, error: res.error };
  };

  const setOpportunityArchiveStatus = async (id: string, isArchived: boolean, isExpired?: boolean): Promise<boolean> => {
    const success = await apiService.setOpportunityArchiveStatus(id, isArchived, isExpired);
    if (success) {
      await refreshOpportunities();
      addNotification(`Opportunity status updated.`, 'info');
      return true;
    }
    addNotification('Failed to update status.', 'error');
    return false;
  };

  const markWorkshopAttendance = async (enrollmentId: string, attendanceStatus: 'Attended' | 'Absent' | 'Enrolled'): Promise<boolean> => {
    const success = await apiService.markAttendance(enrollmentId, attendanceStatus);
    if (success) {
      addNotification(`Attendance marked as "${attendanceStatus}".`, 'success');
      return true;
    }
    addNotification('Failed to update attendance.', 'error');
    return false;
  };

  const createWorkshop = async (workshop: Partial<TrainingSession>): Promise<{ success: boolean; error?: string }> => {
    const res = await apiService.createWorkshop(workshop);
    if (res.success) {
      await refreshTrainingSessions();
      addNotification(`Workshop "${workshop.title}" scheduled!`, 'success');
      return { success: true };
    }
    addNotification(res.error || 'Failed to create workshop.', 'error');
    return { success: false, error: res.error };
  };

  const updateWorkshop = async (id: string, workshop: Partial<TrainingSession>): Promise<{ success: boolean; error?: string }> => {
    const res = await apiService.updateWorkshop(id, workshop);
    if (res.success) {
      await refreshTrainingSessions();
      addNotification(`Workshop "${workshop.title || id}" updated!`, 'success');
      return { success: true };
    }
    addNotification(res.error || 'Failed to update workshop.', 'error');
    return { success: false, error: res.error };
  };

  const respondToFeedback = async (id: string, status: string, response: string): Promise<boolean> => {
    const success = await apiService.respondToFeedback(id, status, response);
    if (success) {
      await refreshCoordinatorData();
      addNotification(`Feedback response saved.`, 'success');
      return true;
    }
    addNotification('Failed to save feedback response.', 'error');
    return false;
  };

  const scheduleGuidance = async (id: string, status: string, scheduledTime?: string, note?: string): Promise<boolean> => {
    const success = await apiService.scheduleGuidance(id, status, scheduledTime, note);
    if (success) {
      await refreshCoordinatorData();
      addNotification(`Guidance appointment updated.`, 'success');
      return true;
    }
    addNotification('Failed to update appointment.', 'error');
    return false;
  };

  const addEmployerOutreach = async (record: EmployerOutreachRecord): Promise<void> => {
    const success = await apiService.saveEmployerOutreach(record);
    if (success) {
      const updated = [record, ...employerOutreach];
      setOutreachState(updated);
      StorageService.setEmployerOutreach(updated);
      addNotification(`Outreach record for "${record.employer}" saved.`, 'success');
    }
  };

  const updateEmployerOutreach = async (id: string, record: Partial<EmployerOutreachRecord>): Promise<boolean> => {
    const success = await apiService.updateEmployerOutreach(id, record);
    if (success) {
      const updated = employerOutreach.map((eo) => (eo.id === id ? { ...eo, ...record } : eo));
      setOutreachState(updated);
      StorageService.setEmployerOutreach(updated);
      addNotification(`Outreach record for "${record.employer || id}" updated.`, 'success');
      return true;
    }
    addNotification('Failed to update outreach record.', 'error');
    return false;
  };

  const deleteEmployerOutreach = async (id: string): Promise<boolean> => {
    const success = await apiService.deleteEmployerOutreach(id);
    if (success) {
      const updated = employerOutreach.filter((eo) => eo.id !== id);
      setOutreachState(updated);
      StorageService.setEmployerOutreach(updated);
      addNotification('Outreach record removed.', 'info');
      return true;
    }
    addNotification('Failed to remove outreach record.', 'error');
    return false;
  };

  /* ======================================================================== */
  /* RESEARCH, REPOSITORY & GENERAL SETTINGS                                  */
  /* ======================================================================== */

  const previewTheme = (newTheme: ThemePreset) => {
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const saveTheme = (newTheme: ThemePreset) => {
    setThemeState(newTheme);
    StorageService.setThemePreset(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    addNotification(`Theme preset saved: ${newTheme}`, 'success');
  };

  const resetTheme = () => {
    document.documentElement.setAttribute('data-theme', theme);
  };

  const addResponse = async (resp: SurveyResponse): Promise<void> => {
    const res = await apiService.createResponse(resp);
    if (res.success && res.data) {
      const finalResp = res.data;
      const updated = [finalResp, ...responses.filter((r) => r.id !== finalResp.id)];
      setResponsesState(updated);
      StorageService.setResponses(updated);
      addNotification(`Survey response ${finalResp.id} saved to SQLite.`, 'success');
    } else {
      addNotification(res.error || 'Failed to save survey response.', 'error');
    }
  };

  const updateResponse = async (resp: SurveyResponse): Promise<void> => {
    const res = await apiService.updateResponse(resp.id, resp);
    if (res.success) {
      const updated = responses.map((r) => (r.id === resp.id ? resp : r));
      setResponsesState(updated);
      StorageService.setResponses(updated);
      addNotification(`Survey response ${resp.id} updated.`, 'success');
    } else {
      addNotification(res.error || 'Failed to update survey response.', 'error');
    }
  };

  const deleteResponse = async (id: string): Promise<void> => {
    const res = await apiService.deleteResponse(id);
    if (res.success) {
      const updated = responses.filter((r) => r.id !== id);
      setResponsesState(updated);
      StorageService.setResponses(updated);
      addNotification(`Survey response ${id} removed.`, 'info');
    } else {
      addNotification(res.error || 'Failed to delete survey response.', 'error');
    }
  };

  const importResponses = async (newResponses: SurveyResponse[], mode: 'replace' | 'merge'): Promise<void> => {
    const res = await apiService.importResponsesBatch(newResponses, mode);
    if (res.success) {
      let finalResponses: SurveyResponse[];
      if (mode === 'replace') {
        finalResponses = newResponses;
      } else {
        const existingMap = new Map(responses.map((r) => [r.id, r]));
        newResponses.forEach((r) => existingMap.set(r.id, r));
        finalResponses = Array.from(existingMap.values());
      }
      setResponsesState(finalResponses);
      StorageService.setResponses(finalResponses);
      addNotification(`Import complete: ${res.count || newResponses.length} records saved to database.`, 'success');
    } else {
      addNotification(res.error || 'Batch import failed.', 'error');
    }
  };

  const updateQuestion = async (q: SurveyQuestion): Promise<void> => {
    const updated = questions.map((item) => (item.id === q.id ? q : item));
    const res = await apiService.updateSystemDocument('survey_questions', updated);
    if (res.success) {
      setQuestionsState(updated);
      StorageService.setQuestions(updated);
      addNotification(`Question ${q.id} updated.`, 'success');
    } else {
      addNotification(res.error || `Failed to update question ${q.id}.`, 'error');
    }
  };

  const addQuestion = async (q: SurveyQuestion): Promise<void> => {
    const updated = [...questions, q];
    const res = await apiService.updateSystemDocument('survey_questions', updated);
    if (res.success) {
      setQuestionsState(updated);
      StorageService.setQuestions(updated);
      addNotification(`Custom question ${q.id} added.`, 'success');
    } else {
      addNotification(res.error || `Failed to add question ${q.id}.`, 'error');
    }
  };

  const updateCommunityVisits = async (doc: CommunityVisitsDocument): Promise<boolean> => {
    const updated = { ...doc, lastSaved: new Date().toISOString() };
    const res = await apiService.updateSystemDocument('community_visits', updated);
    if (res.success) {
      setCommunityVisitsState(updated);
      StorageService.setCommunityVisits(updated);
      addNotification('Community visit records saved.', 'success');
      return true;
    }
    addNotification(res.error || 'Failed to save community visit records.', 'error');
    return false;
  };

  const updateVisit1 = async (data: CommunityVisit1Data): Promise<boolean> => {
    const updated: CommunityVisitsDocument = {
      ...communityVisits,
      visit1: data,
      lastSaved: new Date().toISOString(),
    };
    const res = await apiService.updateSystemDocument('community_visits', updated);
    if (res.success) {
      setCommunityVisitsState(updated);
      StorageService.setCommunityVisits(updated);
      addNotification('Visit 1 — Needs Assessment saved.', 'success');
      return true;
    }
    addNotification(res.error || 'Failed to save Visit 1 data.', 'error');
    return false;
  };

  const updateVisit2 = async (data: CommunityVisit2Data): Promise<boolean> => {
    const updated: CommunityVisitsDocument = {
      ...communityVisits,
      visit2: data,
      lastSaved: new Date().toISOString(),
    };
    const res = await apiService.updateSystemDocument('community_visits', updated);
    if (res.success) {
      setCommunityVisitsState(updated);
      StorageService.setCommunityVisits(updated);
      addNotification('Visit 2 — Prototype Testing saved.', 'success');
      return true;
    }
    addNotification(res.error || 'Failed to save Visit 2 data.', 'error');
    return false;
  };

  const updateVisit3 = async (data: CommunityVisit3Data): Promise<boolean> => {
    const updated: CommunityVisitsDocument = {
      ...communityVisits,
      visit3: data,
      lastSaved: new Date().toISOString(),
    };
    const res = await apiService.updateSystemDocument('community_visits', updated);
    if (res.success) {
      setCommunityVisitsState(updated);
      StorageService.setCommunityVisits(updated);
      addNotification('Visit 3 — Improved Prototype Evaluation saved.', 'success');
      return true;
    }
    addNotification(res.error || 'Failed to save Visit 3 data.', 'error');
    return false;
  };

  const updateTraceability = async (items: TraceabilityItem[]): Promise<boolean> => {
    const updated: CommunityVisitsDocument = {
      ...communityVisits,
      traceability: items,
      lastSaved: new Date().toISOString(),
    };
    const res = await apiService.updateSystemDocument('community_visits', updated);
    if (res.success) {
      setCommunityVisitsState(updated);
      StorageService.setCommunityVisits(updated);
      addNotification('Traceability matrix updated.', 'success');
      return true;
    }
    addNotification(res.error || 'Failed to update traceability matrix.', 'error');
    return false;
  };

  const updateStudyData = async (data: ThreeDayStudyData): Promise<boolean> => {
    const res = await apiService.updateSystemDocument('study_data', data);
    if (res.success) {
      setStudyDataState(data);
      StorageService.setStudyData(data);
      addNotification('Study information updated.', 'success');
      return true;
    }
    addNotification(res.error || 'Failed to update study data.', 'error');
    return false;
  };

  const updateActionPlanItem = async (item: ActionPlanItem): Promise<boolean> => {
    const updatedPlan = studyData.actionPlan.map((p) => (p.id === item.id ? item : p));
    const updated = { ...studyData, actionPlan: updatedPlan };
    const res = await apiService.updateSystemDocument('study_data', updated);
    if (res.success) {
      setStudyDataState(updated);
      StorageService.setStudyData(updated);
      addNotification(`Action item ${item.id} updated.`, 'success');
      return true;
    }
    addNotification(res.error || `Failed to update action item ${item.id}.`, 'error');
    return false;
  };

  const updateGapItem = async (item: GapAnalysisItem): Promise<boolean> => {
    const updatedGaps = studyData.gapAnalysis.map((g) => (g.id === item.id ? item : g));
    const updated = { ...studyData, gapAnalysis: updatedGaps };
    const res = await apiService.updateSystemDocument('study_data', updated);
    if (res.success) {
      setStudyDataState(updated);
      StorageService.setStudyData(updated);
      addNotification(`Gap analysis item ${item.id} updated.`, 'success');
      return true;
    }
    addNotification(res.error || `Failed to update gap item ${item.id}.`, 'error');
    return false;
  };

  const updateProblemMatrix = async (matrix: ProblemSolutionItem[]): Promise<boolean> => {
    const res = await apiService.updateSystemDocument('problem_matrix', matrix);
    if (res.success) {
      setProblemMatrixState(matrix);
      StorageService.setProblemMatrix(matrix);
      addNotification('Problem-Solution matrix updated.', 'success');
      return true;
    }
    addNotification(res.error || 'Failed to update problem matrix.', 'error');
    return false;
  };

  const updateSiteContent = async (content: SiteGeneralContent): Promise<boolean> => {
    const res = await apiService.updateSystemDocument('site_content', content);
    if (res.success) {
      setSiteContentState(content);
      StorageService.setSiteContent(content);
      addNotification('Site content preferences updated.', 'success');
      return true;
    }
    addNotification(res.error || 'Failed to update site content.', 'error');
    return false;
  };

  const resetDatabase = async (): Promise<boolean> => {
    const success = await apiService.resetDatabase();
    if (success) {
      await refreshDbStatus();
      await refreshOpportunities();
      await refreshTrainingSessions();
      addNotification('SQLite Database reset to factory seed state.', 'success');
      return true;
    }
    return false;
  };

  const resetAllDemoData = () => {
    resetToDefaults();
    setResponsesState(StorageService.getResponses());
    setQuestionsState(StorageService.getQuestions());
    setOpportunities(StorageService.getOpportunities());
    setTrainingSessions(StorageService.getTrainingSessions());
    setCommunityVisitsState(StorageService.getCommunityVisits());
    setStudyDataState(StorageService.getStudyData());
    setProblemMatrixState(StorageService.getProblemMatrix());
    setOutreachState(StorageService.getEmployerOutreach());
    setSiteContentState(StorageService.getSiteContent());
    addNotification('All local demo data reset to default seed.', 'info');
  };

  const restoreFromBackup = async (payload: FullBackupPayload): Promise<boolean> => {
    try {
      const res = await apiService.restoreDatabaseBackup(payload);
      if (!res.success) {
        addNotification(res.error || 'Failed to restore backup to database.', 'error');
        return false;
      }
      if (payload.responses) {
        setResponsesState(payload.responses);
        StorageService.setResponses(payload.responses);
      }
      if (payload.opportunities) {
        setOpportunities(payload.opportunities);
        StorageService.setOpportunities(payload.opportunities);
      }
      if (payload.trainingSessions) {
        setTrainingSessions(payload.trainingSessions);
        StorageService.setTrainingSessions(payload.trainingSessions);
      }
      if (payload.studyData) {
        setStudyDataState(payload.studyData);
        StorageService.setStudyData(payload.studyData);
      }
      if (payload.problemMatrix) {
        setProblemMatrixState(payload.problemMatrix);
        StorageService.setProblemMatrix(payload.problemMatrix);
      }
      if (payload.employerOutreach) {
        setOutreachState(payload.employerOutreach);
        StorageService.setEmployerOutreach(payload.employerOutreach);
      }
      if (payload.siteContent) {
        setSiteContentState(payload.siteContent);
        StorageService.setSiteContent(payload.siteContent);
      }
      if (payload.communityVisits) {
        setCommunityVisitsState(payload.communityVisits);
        StorageService.setCommunityVisits(payload.communityVisits);
      }
      if (payload.surveyQuestions) {
        setQuestionsState(payload.surveyQuestions);
        StorageService.setQuestions(payload.surveyQuestions);
      }
      await Promise.all([
        refreshOpportunities(),
        refreshTrainingSessions(),
        refreshResponses(),
        refreshSystemDocuments(),
        refreshDbStatus(),
      ]);
      if (user?.role === 'Placement Coordinator' || user?.role === 'Admin') {
        await refreshCoordinatorData();
      }
      addNotification('Full backup restored successfully to SQLite database without data loss.', 'success');
      return true;
    } catch (err: any) {
      addNotification(`Restore failed: ${err.message}`, 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        role,
        authLoading,
        login,
        logout,
        register,
        theme,
        previewTheme,
        saveTheme,
        resetTheme,
        notifications,
        addNotification,
        dismissNotification,

        studentProfile,
        updateStudentProfile,
        studentApplications,
        applyToOpportunity,
        savedOpportunityIds,
        toggleSaveOpportunity,
        studentEnrollments,
        enrollInSession,
        cancelEnrollment,
        studentFeedbackList,
        submitFeedback: submitStudentFeedback,
        studentGuidanceList,
        submitGuidanceRequest: requestStudentGuidance,
        refreshStudentData,

        coordinatorMetrics,
        coordinatorApplications,
        refreshCoordinatorApplications,
        updateApplicationStatus,
        createOpportunity,
        updateOpportunity,
        setOpportunityArchiveStatus,
        coordinatorFeedbackList,
        respondToFeedback,
        coordinatorGuidanceList,
        scheduleGuidance,
        coordinatorStudentsList,
        markWorkshopAttendance,
        createWorkshop,
        updateWorkshop,
        refreshCoordinatorData,

        opportunities,
        refreshOpportunities,
        trainingSessions,
        refreshTrainingSessions,
        responses,
        responsesSummary,
        refreshResponses,
        refreshResponsesSummary,
        addResponse,
        updateResponse,
        deleteResponse,
        importResponses,
        questions,
        updateQuestion,
        addQuestion,

        communityVisits,
        refreshSystemDocuments,
        updateCommunityVisits,
        updateVisit1,
        updateVisit2,
        updateVisit3,
        updateTraceability,
        studyData,
        updateStudyData,
        updateActionPlanItem,
        updateGapItem,
        problemMatrix,
        updateProblemMatrix,

        employerOutreach,
        refreshEmployerOutreach,
        addEmployerOutreach,
        updateEmployerOutreach,
        deleteEmployerOutreach,
        siteContent,
        updateSiteContent,

        dbStatus,
        refreshDbStatus,
        resetDatabase,
        resetAllDemoData,
        restoreFromBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
