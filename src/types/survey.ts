export type Department =
  | 'Computer Science (CS)'
  | 'Information Technology (IT)'
  | 'Data Science (DS)';

export const ALL_DEPARTMENTS: Department[] = [
  'Computer Science (CS)',
  'Information Technology (IT)',
  'Data Science (DS)',
];

export const SUBDOMAINS_BY_DEPARTMENT: Record<Department, string[]> = {
  'Computer Science (CS)': [
    'Software Engineering',
    'Full-Stack Development',
    'Systems & Cloud Computing',
    'Cybersecurity & Network Defense',
    'Algorithms & Core CS',
  ],
  'Information Technology (IT)': [
    'Web & Mobile App Engineering',
    'DevOps & Cloud Infrastructure',
    'Database & Information Systems',
    'Network Administration & Security',
    'Enterprise IT & Cloud Services',
  ],
  'Data Science (DS)': [
    'Machine Learning & AI',
    'Data Analytics & Business Intelligence',
    'Big Data Engineering & Pipelines',
    'Natural Language Processing (NLP)',
    'Computer Vision & Deep Learning',
  ],
};

export type AcademicYear = 'First' | 'Second' | 'Third' | 'Fourth' | 'Other';

export type RelevantDrivesOption = '0' | '1–2' | '3 or more' | 'Not sure';

export type NeedsMetOption = 'Yes' | 'Partly' | 'No' | 'Not enough experience to judge';

export type TimelinessOption = 'Always' | 'Sometimes' | 'Rarely' | 'Never' | 'Not applicable';

export type TrainingUsefulnessOption = 1 | 2 | 3 | 4 | 5 | 'Have not attended';

export type BarrierOption =
  | 'Limited relevant roles'
  | 'Eligibility restrictions'
  | 'Skill gaps'
  | 'Late information'
  | 'Interview preparation'
  | 'Location or pay mismatch'
  | 'Other'
  | 'No major barrier';

export type UrgentSupportOption =
  | 'Relevant employer connections'
  | 'Technical training'
  | 'Aptitude preparation'
  | 'Resume and interview help'
  | 'Career guidance'
  | 'Timely alerts'
  | 'Internship support'
  | 'Other';

export type SatisfactionOption = 1 | 2 | 3 | 4 | 5 | 'Not enough experience to judge';

export type SourceType = 'simulated' | 'collected';

export interface SurveyResponse {
  id: string;
  department: Department;
  year: AcademicYear;
  preferredRole: string;
  relevantDrives: RelevantDrivesOption;
  needsMet: NeedsMetOption;
  informationTimeliness: TimelinessOption;
  trainingUsefulness: TrainingUsefulnessOption;
  biggestBarrier: BarrierOption;
  urgentSupport: UrgentSupportOption;
  satisfaction: SatisfactionOption;
  review: string;
  suggestion: string;
  sourceType: SourceType;
  collectionDate?: string;
  timestamp?: string;
  questionnaireVersion: string;
}

export interface SurveyQuestion {
  id: string; // e.g. Q1, Q2, ...
  number: number;
  text: string;
  type: 'select' | 'rating' | 'text' | 'textarea';
  options?: string[];
  helpText?: string;
  isCustom?: boolean;
  archived?: boolean;
}

export interface ChartDatum {
  name: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface RatingDistributionItem {
  rating: number;
  count: number;
  percentage: number;
}

export interface ResearchSummaryMetrics {
  totalResponses: number;
  simulatedCount: number;
  collectedCount: number;
  departmentsRepresented: number;
  partlyOrUnmetPercentage: number;
  partlyOrUnmetCount: number;
  partlyOrUnmetDenominator: number;
  lateOrRareInfoPercentage: number;
  lateOrRareInfoCount: number;
  lateOrRareInfoDenominator: number;
  averageSatisfaction: number | null;
  validSatisfactionCount: number;
  satisfactionExcludedCount?: number;
  averageTrainingUsefulness: number | null;
  validTrainingCount: number;
  trainingExcludedCount?: number;
}

export interface SurveyResponsesSummary extends ResearchSummaryMetrics {
  departmentDistribution: ChartDatum[];
  needsMetDistribution: ChartDatum[];
  relevantDrivesDistribution: ChartDatum[];
  timelinessDistribution: ChartDatum[];
  barriersDistribution: ChartDatum[];
  urgentSupportDistribution: ChartDatum[];
  satisfactionDistribution?: RatingDistributionItem[];
  trainingDistribution?: RatingDistributionItem[];
}
