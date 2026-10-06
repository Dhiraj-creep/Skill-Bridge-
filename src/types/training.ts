import { Department } from './survey';

export interface TrainingSession {
  id: string;
  title: string;
  department: Department | 'All Departments';
  description: string;
  targetSkills: string[];
  mode: 'Hands-on Workshop' | 'Mock Practice' | 'Laboratory Clinic' | 'Interactive Seminar' | 'In-Person Lab';
  schedule: string;
  capacity: number;
  enrolledCount: number;
  trainer: string;
  venue: string;
  sourceStatus: 'Demo Training Session' | 'Official Schedule';
}

export interface EnrollmentRecord {
  id: string;
  sessionId: string;
  sessionTitle: string;
  enrolledAt: string;
  status: 'Enrolled' | 'Attended' | 'Cancelled';
}
