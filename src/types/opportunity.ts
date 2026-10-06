import { Department } from './survey';

export type OpportunityType = 'Job' | 'Internship' | 'Full-time Placement';
export type WorkMode = 'On-site' | 'Hybrid' | 'Remote';

export interface DemoOpportunity {
  id: string; // e.g. "OPP-001"
  title: string;
  employer: string;
  type: OpportunityType;
  relevantDepartments: Department[];
  subdomain?: string;
  skills: string[];
  explicitEligibility: string;
  location: string;
  workMode: WorkMode;
  fixedPayOrStipend: string;
  incentives?: string;
  deadline: string; // YYYY-MM-DD
  description: string;
  postedDate: string;
  sourceStatus: 'Demo Opportunity' | 'Verified Live Vacancy';
  isExpired?: boolean;
  isArchived?: boolean;
}

export function isOpportunityExpired(opp: { deadline?: string; isExpired?: boolean }): boolean {
  if (opp.isExpired) return true;
  if (!opp.deadline) return false;
  const deadlineDate = new Date(`${opp.deadline}T23:59:59`);
  return !isNaN(deadlineDate.getTime()) && deadlineDate.getTime() < Date.now();
}

export interface ApplicationRecord {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  employer: string;
  studentName: string;
  department: Department;
  appliedDate: string;
  status: 'Submitted' | 'Under Review' | 'Shortlisted' | 'Feedback Pending';
  notes?: string;
}
