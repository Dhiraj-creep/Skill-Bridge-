import { Department } from './survey';

export type FeedbackCategory =
  | 'Opportunity Access'
  | 'Notice Timeliness'
  | 'Training Relevance'
  | 'Eligibility Criteria'
  | 'Interview Preparation'
  | 'Portal Functionality'
  | 'Other';

export type FeedbackStatus =
  | 'Received'
  | 'Under review'
  | 'Under Review'
  | 'Action planned'
  | 'Resolved'
  | 'Addressed'
  | 'Archived'
  | 'Submitted';

export interface FeedbackSubmission {
  id: string; // e.g. "FB-101"
  department: Department;
  category: FeedbackCategory;
  description: string;
  suggestedImprovement: string;
  submittedAt: string;
  status: FeedbackStatus;
  coordinatorResponse?: string;
  resolutionDate?: string;
  isDemoNotice?: boolean;
}

export type GuidanceTopic =
  | 'Resume & Profile Review'
  | 'Technical Guidance for Core Roles'
  | 'Aptitude & Coding Assessment Prep'
  | 'Mock Interview & Feedback'
  | 'Non-IT Domain Placement Strategy'
  | 'Off-Campus & Internship Guidance';

export type GuidanceStatus = 'Pending' | 'Scheduled' | 'Completed' | 'Cancelled' | 'Requested';

export interface GuidanceRequest {
  id: string; // e.g. "GD-201"
  studentName: string;
  department: Department;
  studentDepartment?: Department;
  preferredRole: string;
  targetRole?: string;
  topic: GuidanceTopic;
  preferredTimeSlot: string;
  additionalNotes?: string;
  submittedAt: string;
  status: GuidanceStatus;
  scheduledTime?: string;
  coordinatorNote?: string;
  isDemoNotice?: boolean;
}
