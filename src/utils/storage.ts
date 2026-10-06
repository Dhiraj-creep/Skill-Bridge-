import { SurveyResponse, SurveyQuestion } from '../types/survey';
import { DemoOpportunity, ApplicationRecord } from '../types/opportunity';
import { TrainingSession, EnrollmentRecord } from '../types/training';
import { ThreeDayStudyData, CommunityVisitsDocument } from '../types/study';
import { FeedbackSubmission, GuidanceRequest } from '../types/feedback';
import {
  SiteGeneralContent,
  ProblemSolutionItem,
  EmployerOutreachRecord,
  StudentProfile,
} from '../types/content';
import { ThemePreset } from '../types/theme';

import { generateSeedDataset, DEFAULT_QUESTIONS } from '../data/defaultSurveySeed';
import { DEFAULT_OPPORTUNITIES } from '../data/defaultOpportunities';
import { DEFAULT_TRAINING_SESSIONS } from '../data/defaultTraining';
import { DEFAULT_STUDY_DATA, DEFAULT_COMMUNITY_VISITS } from '../data/defaultStudy';
import { DEFAULT_PROBLEM_MATRIX } from '../data/defaultProblemMatrix';
import { DEFAULT_EMPLOYER_OUTREACH } from '../data/defaultEmployerOutreach';
import { DEFAULT_SITE_CONTENT, DEFAULT_STUDENT_PROFILE } from '../data/defaultContent';

const KEYS = {
  SURVEY_RESPONSES: 'skillbridge_survey_responses',
  SURVEY_QUESTIONS: 'skillbridge_survey_questions',
  OPPORTUNITIES: 'skillbridge_opportunities',
  SAVED_OPPORTUNITIES: 'skillbridge_saved_opportunities',
  APPLICATIONS: 'skillbridge_applications',
  TRAINING_SESSIONS: 'skillbridge_training_sessions',
  ENROLLMENTS: 'skillbridge_training_enrollments',
  STUDY_DATA: 'skillbridge_study_data',
  COMMUNITY_VISITS: 'skillbridge_community_visits',
  PROBLEM_MATRIX: 'skillbridge_problem_matrix',
  EMPLOYER_OUTREACH: 'skillbridge_employer_outreach',
  FEEDBACK_LIST: 'skillbridge_feedback_submissions',
  GUIDANCE_REQUESTS: 'skillbridge_guidance_requests',
  SITE_CONTENT: 'skillbridge_site_content',
  STUDENT_PROFILE: 'skillbridge_student_profile',
  THEME_PRESET: 'skillbridge_theme_preset',
  USER_ROLE: 'skillbridge_active_role',
  INITIALIZED_FLAG: 'skillbridge_is_seeded_v1',
};

export interface FullBackupPayload {
  version: string;
  timestamp?: string;
  exportedAt?: string;
  datasetInfo?: string;
  responses?: SurveyResponse[];
  surveyResponses?: SurveyResponse[];
  questions?: SurveyQuestion[];
  surveyQuestions?: SurveyQuestion[];
  opportunities?: DemoOpportunity[];
  trainingSessions?: TrainingSession[];
  studyData?: ThreeDayStudyData;
  communityVisits?: CommunityVisitsDocument;
  problemMatrix?: ProblemSolutionItem[];
  employerOutreach?: EmployerOutreachRecord[];
  siteContent?: SiteGeneralContent;
  studentProfile?: StudentProfile;
  theme?: ThemePreset;
}

// Safe storage access helper
function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Failed reading key ${key} from localStorage, using default.`, err);
    return defaultValue;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed writing key ${key} to localStorage`, err);
  }
}

// Initialize seed data once on first use
export function initializeRepository(): void {
  const isInitialized = localStorage.getItem(KEYS.INITIALIZED_FLAG);
  if (!isInitialized) {
    resetToDefaults();
    localStorage.setItem(KEYS.INITIALIZED_FLAG, 'true');
  }
}

export function resetToDefaults(): void {
  const seedResponses = generateSeedDataset();
  safeSetItem(KEYS.SURVEY_RESPONSES, seedResponses);
  safeSetItem(KEYS.SURVEY_QUESTIONS, DEFAULT_QUESTIONS);
  safeSetItem(KEYS.OPPORTUNITIES, DEFAULT_OPPORTUNITIES);
  safeSetItem(KEYS.SAVED_OPPORTUNITIES, ['OPP-101', 'OPP-102']);
  safeSetItem(KEYS.APPLICATIONS, [
    {
      id: 'APP-101',
      opportunityId: 'OPP-101',
      opportunityTitle: 'Junior Full Stack Engineer',
      employer: 'Apex Cloud Solutions (Demo)',
      studentName: DEFAULT_STUDENT_PROFILE.displayName,
      department: DEFAULT_STUDENT_PROFILE.department,
      appliedDate: '2026-09-30',
      status: 'Submitted',
      notes: 'Demonstration application recorded locally in browser.',
    },
  ]);
  safeSetItem(KEYS.TRAINING_SESSIONS, DEFAULT_TRAINING_SESSIONS);
  safeSetItem(KEYS.ENROLLMENTS, [
    {
      id: 'ENR-01',
      sessionId: 'TRN-101',
      sessionTitle: 'Technical Interview & Coding Practice Clinic',
      enrolledAt: '2026-09-29',
      status: 'Enrolled',
    },
  ]);
  safeSetItem(KEYS.STUDY_DATA, DEFAULT_STUDY_DATA);
  safeSetItem(KEYS.COMMUNITY_VISITS, DEFAULT_COMMUNITY_VISITS);
  safeSetItem(KEYS.PROBLEM_MATRIX, DEFAULT_PROBLEM_MATRIX);
  safeSetItem(KEYS.EMPLOYER_OUTREACH, DEFAULT_EMPLOYER_OUTREACH);
  safeSetItem(KEYS.FEEDBACK_LIST, [
    {
      id: 'FB-101',
      department: 'Data Science (DS)',
      category: 'Opportunity Access',
      description: 'Need more specialized AI/ML and MLOps recruitment drives instead of generic non-technical support roles.',
      suggestedImprovement: 'Reach out to tech product companies and AI startups in Bengaluru, Pune, and Hyderabad.',
      submittedAt: '2026-09-25T10:30:00Z',
      status: 'Under review',
      coordinatorResponse: 'Contacted 4 AI/ML product companies; updates will be posted on the portal.',
      isDemoNotice: true,
    },
  ]);
  safeSetItem(KEYS.GUIDANCE_REQUESTS, [
    {
      id: 'GD-201',
      studentName: 'Aditya Sharma',
      department: 'Computer Science (CS)',
      preferredRole: 'Frontend Developer',
      topic: 'Resume & Profile Review',
      preferredTimeSlot: 'Wednesday 3:30 PM – 4:30 PM',
      additionalNotes: 'Need feedback on formatting project portfolio and GitHub links.',
      submittedAt: '2026-09-29T14:15:00Z',
      status: 'Scheduled',
      scheduledTime: '2026-10-07 15:30',
      coordinatorNote: 'Confirmed for Room 204 Placement Counseling Office.',
      isDemoNotice: true,
    },
  ]);
  safeSetItem(KEYS.SITE_CONTENT, DEFAULT_SITE_CONTENT);
  safeSetItem(KEYS.STUDENT_PROFILE, DEFAULT_STUDENT_PROFILE);
  safeSetItem(KEYS.THEME_PRESET, 'campus-spectrum');
  safeSetItem(KEYS.USER_ROLE, 'Student');
}

// Storage API
export const StorageService = {
  getResponses: (): SurveyResponse[] => {
    return safeGetItem<SurveyResponse[]>(KEYS.SURVEY_RESPONSES, []);
  },
  setResponses: (responses: SurveyResponse[]): void => safeSetItem(KEYS.SURVEY_RESPONSES, responses),
  clearResponses: (): void => {
    try {
      localStorage.removeItem(KEYS.SURVEY_RESPONSES);
    } catch {}
  },

  getQuestions: (): SurveyQuestion[] => safeGetItem<SurveyQuestion[]>(KEYS.SURVEY_QUESTIONS, DEFAULT_QUESTIONS),
  setQuestions: (questions: SurveyQuestion[]): void => safeSetItem(KEYS.SURVEY_QUESTIONS, questions),

  getOpportunities: (): DemoOpportunity[] => {
    const list = safeGetItem<DemoOpportunity[]>(KEYS.OPPORTUNITIES, []);
    if (!list.length || list.some((o) => o.relevantDepartments.some((d) => !['Computer Science (CS)', 'Information Technology (IT)', 'Data Science (DS)'].includes(d)))) {
      safeSetItem(KEYS.OPPORTUNITIES, DEFAULT_OPPORTUNITIES);
      return DEFAULT_OPPORTUNITIES;
    }
    return list;
  },
  setOpportunities: (opps: DemoOpportunity[]): void => safeSetItem(KEYS.OPPORTUNITIES, opps),

  getSavedOpportunityIds: (): string[] => safeGetItem<string[]>(KEYS.SAVED_OPPORTUNITIES, []),
  setSavedOpportunityIds: (ids: string[]): void => safeSetItem(KEYS.SAVED_OPPORTUNITIES, ids),

  getApplications: (): ApplicationRecord[] => safeGetItem<ApplicationRecord[]>(KEYS.APPLICATIONS, []),
  setApplications: (apps: ApplicationRecord[]): void => safeSetItem(KEYS.APPLICATIONS, apps),

  getTrainingSessions: (): TrainingSession[] => {
    const list = safeGetItem<TrainingSession[]>(KEYS.TRAINING_SESSIONS, []);
    if (!list.length || list.some((s) => s.department !== 'All Departments' && !['Computer Science (CS)', 'Information Technology (IT)', 'Data Science (DS)'].includes(s.department as any))) {
      safeSetItem(KEYS.TRAINING_SESSIONS, DEFAULT_TRAINING_SESSIONS);
      return DEFAULT_TRAINING_SESSIONS;
    }
    return list;
  },
  setTrainingSessions: (sessions: TrainingSession[]): void => safeSetItem(KEYS.TRAINING_SESSIONS, sessions),

  getEnrollments: (): EnrollmentRecord[] => safeGetItem<EnrollmentRecord[]>(KEYS.ENROLLMENTS, []),
  setEnrollments: (enrs: EnrollmentRecord[]): void => safeSetItem(KEYS.ENROLLMENTS, enrs),

  getStudyData: (): ThreeDayStudyData => {
    const stored = safeGetItem<ThreeDayStudyData>(KEYS.STUDY_DATA, DEFAULT_STUDY_DATA);
    if (!stored || !Array.isArray(stored.days) || !Array.isArray(stored.interviewGuide) || !Array.isArray(stored.gapAnalysis) || !Array.isArray(stored.actionPlan)) {
      return DEFAULT_STUDY_DATA;
    }
    return stored;
  },
  setStudyData: (study: ThreeDayStudyData): void => safeSetItem(KEYS.STUDY_DATA, study),

  getCommunityVisits: (): CommunityVisitsDocument => {
    const stored = safeGetItem<CommunityVisitsDocument | null>(KEYS.COMMUNITY_VISITS, null);
    if (!stored || !stored.visit1 || !stored.visit1.date || !stored.visit1.teamMembers?.includes('Dhiraj')) {
      safeSetItem(KEYS.COMMUNITY_VISITS, DEFAULT_COMMUNITY_VISITS);
      return DEFAULT_COMMUNITY_VISITS;
    }
    return stored;
  },
  setCommunityVisits: (visits: CommunityVisitsDocument): void =>
    safeSetItem(KEYS.COMMUNITY_VISITS, visits),

  getProblemMatrix: (): ProblemSolutionItem[] => safeGetItem<ProblemSolutionItem[]>(KEYS.PROBLEM_MATRIX, DEFAULT_PROBLEM_MATRIX),
  setProblemMatrix: (matrix: ProblemSolutionItem[]): void => safeSetItem(KEYS.PROBLEM_MATRIX, matrix),

  getEmployerOutreach: (): EmployerOutreachRecord[] => safeGetItem<EmployerOutreachRecord[]>(KEYS.EMPLOYER_OUTREACH, DEFAULT_EMPLOYER_OUTREACH),
  setEmployerOutreach: (outreach: EmployerOutreachRecord[]): void => safeSetItem(KEYS.EMPLOYER_OUTREACH, outreach),

  getFeedbackSubmissions: (): FeedbackSubmission[] => safeGetItem<FeedbackSubmission[]>(KEYS.FEEDBACK_LIST, []),
  setFeedbackSubmissions: (list: FeedbackSubmission[]): void => safeSetItem(KEYS.FEEDBACK_LIST, list),

  getGuidanceRequests: (): GuidanceRequest[] => safeGetItem<GuidanceRequest[]>(KEYS.GUIDANCE_REQUESTS, []),
  setGuidanceRequests: (list: GuidanceRequest[]): void => safeSetItem(KEYS.GUIDANCE_REQUESTS, list),

  getSiteContent: (): SiteGeneralContent => {
    const content = safeGetItem<SiteGeneralContent>(KEYS.SITE_CONTENT, DEFAULT_SITE_CONTENT);
    return { ...DEFAULT_SITE_CONTENT, ...(content || {}) };
  },
  setSiteContent: (content: SiteGeneralContent): void => safeSetItem(KEYS.SITE_CONTENT, content),

  getStudentProfile: (): StudentProfile => safeGetItem<StudentProfile>(KEYS.STUDENT_PROFILE, DEFAULT_STUDENT_PROFILE),
  setStudentProfile: (profile: StudentProfile): void => safeSetItem(KEYS.STUDENT_PROFILE, profile),

  getThemePreset: (): ThemePreset => safeGetItem<ThemePreset>(KEYS.THEME_PRESET, 'campus-spectrum'),
  setThemePreset: (theme: ThemePreset): void => safeSetItem(KEYS.THEME_PRESET, theme),

  getUserRole: (): 'Student' | 'Placement Coordinator' | 'Admin' =>
    safeGetItem<'Student' | 'Placement Coordinator' | 'Admin'>(KEYS.USER_ROLE, 'Student'),
  setUserRole: (role: 'Student' | 'Placement Coordinator' | 'Admin'): void => safeSetItem(KEYS.USER_ROLE, role),

  // Backup & Restore
  exportFullBackup(): FullBackupPayload {
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      responses: this.getResponses(),
      questions: this.getQuestions(),
      opportunities: this.getOpportunities(),
      trainingSessions: this.getTrainingSessions(),
      studyData: this.getStudyData(),
      communityVisits: this.getCommunityVisits(),
      problemMatrix: this.getProblemMatrix(),
      employerOutreach: this.getEmployerOutreach(),
      siteContent: this.getSiteContent(),
      studentProfile: this.getStudentProfile(),
      theme: this.getThemePreset(),
    };
  },

  validateBackupPayload(payload: any): { isValid: boolean; error?: string } {
    if (!payload || typeof payload !== 'object') {
      return { isValid: false, error: 'Backup data must be a valid JSON object' };
    }
    if (!Array.isArray(payload.responses)) {
      return { isValid: false, error: 'Missing or invalid "responses" array' };
    }
    if (!Array.isArray(payload.opportunities)) {
      return { isValid: false, error: 'Missing or invalid "opportunities" array' };
    }
    return { isValid: true };
  },

  restoreFullBackup(payload: FullBackupPayload): void {
    if (payload.responses) this.setResponses(payload.responses);
    if (payload.questions) this.setQuestions(payload.questions);
    if (payload.opportunities) this.setOpportunities(payload.opportunities);
    if (payload.trainingSessions) this.setTrainingSessions(payload.trainingSessions);
    if (payload.studyData) this.setStudyData(payload.studyData);
    if (payload.communityVisits) this.setCommunityVisits(payload.communityVisits);
    if (payload.problemMatrix) this.setProblemMatrix(payload.problemMatrix);
    if (payload.employerOutreach) this.setEmployerOutreach(payload.employerOutreach);
    if (payload.siteContent) this.setSiteContent(payload.siteContent);
    if (payload.studentProfile) this.setStudentProfile(payload.studentProfile);
    if (payload.theme) this.setThemePreset(payload.theme);
  },
};
