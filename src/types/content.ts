import { Department, AcademicYear } from './survey';

export interface ProblemSolutionItem {
  id: string; // 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  title: string;
  problem: string;
  action: string;
  portalSupport: string;
  measure: string;
}

export type OutreachStatus =
  | 'Initial Inquiry'
  | 'Discussion Ongoing'
  | 'Drive Scheduled'
  | 'Declined for this Season'
  | 'Follow-up Needed';

export interface EmployerOutreachRecord {
  id: string;
  employer: string;
  relevantDepartments: Department[];
  intendedRoles: string;
  contactStatus: OutreachStatus;
  followUpDate: string;
  notes: string;
  provenance: 'Demonstration Record' | 'Actual College Contact';
}

export interface SiteGeneralContent {
  siteTitle: string;
  subtitle: string;
  heroHeadline: string;
  heroSupportingText: string;
  collegeName: string; // initially blank
  contactEmail: string; // initially blank
  contactOffice: string; // initially blank
  projectDescription: string;
  aboutMission: string;
  aboutProblemStatement: string;
  aboutObjectives: string[];
}

export interface StudentProfile {
  displayName: string;
  department: Department;
  year: AcademicYear;
  preferredRoles: string[];
  skills: string[];
  preferredLocations: string[];
  trainingInterests: string[];
  academicPercentage?: number;
  activeBacklogs?: number;
}
