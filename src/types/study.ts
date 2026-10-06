export type VisitStatus = 'Planned' | 'In Progress' | 'Completed';

export interface EvidencePhoto {
  id: string;
  caption: string;
  dataUrl: string; // Base64 data URL or image path
  hasConsent: boolean;
  consentNotes?: string;
  timestamp: string;
}

export interface AnonymizedFeedbackItem {
  id: string;
  participantTag: string; // e.g. "Participant P1", "Community Youth 3"
  category: string;
  feedbackText: string;
  contextOrRole?: string;
}

export interface PrototypeTestTask {
  id: string;
  taskName: string;
  targetRoleOrNeed: string;
  attemptedCount: number;
  completedCount: number;
  difficultiesObserved: string;
  participantFeedback: string;
}

export interface BaseVisitRecord {
  visitNumber: 1 | 2 | 3;
  title: string;
  subtitle: string;
  status: VisitStatus;
  date: string; // YYYY-MM-DD or empty
  location: string;
  objective: string;
  teamMembers: string;
  participantCount: number | null;
  activities: string;
  findings: string;
  evidenceReferences: string;
  followUpActions: string;
  photos: EvidencePhoto[];
  anonymizedFeedback: AnonymizedFeedbackItem[];
}

export interface CommunityVisit1Data extends BaseVisitRecord {
  visitNumber: 1;
  // Specific to Visit 1 — Needs Assessment
  surveyResponsesNotes: string;
  existingSkills: string;
  employmentBarriers: string;
  employerNeeds: string;
  keyObservations: string;
}

export interface CommunityVisit2Data extends BaseVisitRecord {
  visitNumber: 2;
  // Specific to Visit 2 — Prototype Testing
  prototypeTasks: PrototypeTestTask[];
  generalDifficultiesObserved: string;
  suggestionsReceived: string;
  plannedChanges: string;
}

export interface CommunityVisit3Data extends BaseVisitRecord {
  visitNumber: 3;
  // Specific to Visit 3 — Improved Prototype Evaluation
  changesDemonstrated: string;
  taskResultsSummary: string;
  finalFeedback: string;
  remainingIssues: string;
  nextSteps: string;
}

export interface TraceabilityItem {
  id: string;
  communityNeed: string;
  featureOrChange: string;
  participantFeedback: string;
  evidenceReference: string;
  nextAction: string;
}

export interface CommunityVisitsDocument {
  statusNotice: string;
  visit1: CommunityVisit1Data;
  visit2: CommunityVisit2Data;
  visit3: CommunityVisit3Data;
  traceability: TraceabilityItem[];
  lastSaved?: string;
}

// Retain legacy interfaces for backward compatibility with existing tests and coordinator discussion tools
export interface InterviewGuideItem {
  id: number;
  question: string;
  illustrativeAnswer: string;
  evidenceNotes: string;
}

export interface GapAnalysisItem {
  id: string;
  category: string;
  studentConcern: string;
  coordinatorExplanation: string;
  supportingEvidence: string;
  remainingGap: string;
  proposedAction: string;
  suggestedOwner: string;
  proposedTimeline: string;
  evaluationMeasure: string;
}

export interface ActionPlanItem {
  id: string;
  problem: string;
  proposedAction: string;
  actionItem?: string;
  sourceVisit?: string;
  owner: string;
  assignedTo?: string;
  department?: string;
  timeline?: string;
  targetMetric?: string;
  targetDate: string;
  status: 'Proposed' | 'In progress' | 'In Progress' | 'Completed';
  evidenceOrOutcomeNotes: string;
}

export interface StudyDayInfo {
  dayNumber: 1 | 2 | 3;
  title: string;
  subtitle: string;
  actualDate?: string;
  activities: string[];
  outputs: string[];
  keyHighlights: string[];
}

export interface ThreeDayStudyData {
  status: 'Planned' | 'Simulated' | 'Conducted';
  days: StudyDayInfo[];
  interviewGuide: InterviewGuideItem[];
  gapAnalysis: GapAnalysisItem[];
  actionPlan: ActionPlanItem[];
}
