import { ProblemSolutionItem } from '../types/content';

export const DEFAULT_PROBLEM_MATRIX: ProblemSolutionItem[] = [
  {
    id: 'A',
    title: 'Limited Relevant Opportunities',
    problem: 'Disproportionate dominance of generic tech support/IT services drives with few specialised openings in tracks like AI/ML, DevOps, Cloud, and Cybersecurity.',
    action: 'Domain-specific outreach to tech startups, specialized product companies, and AI/Data research labs.',
    portalSupport: 'Track branch student career demand in real time, manage employer outreach pipeline, and index domain-specific openings across CS, IT, and DS.',
    measure: 'Count of relevant roles and active employer participation verified across Computer Science (CS), Information Technology (IT), and Data Science (DS).',
  },
  {
    id: 'B',
    title: 'Training Mismatch',
    problem: 'Centralized generic aptitude classes do not prepare students for technical domain screening rounds (DSA, System Design, SQL, Docker, ML Pipelines).',
    action: 'Diagnostic skill gap assessments followed by practical hands-on workshops aligned to industry job profiles.',
    portalSupport: 'Record training demands through student profiles, schedule modular workshops, and enable one-click demo enrollment.',
    measure: 'Student workshop participation rates and measurable performance gain on practical technical assessments.',
  },
  {
    id: 'C',
    title: 'Late Placement Information',
    problem: 'Recruitment notices forwarded through multi-tiered chat groups arrive with less than 24-48 hours before registration deadlines.',
    action: 'Direct centralized portal notice broadcasts accompanied by automated in-app countdown deadline reminders.',
    portalSupport: 'Publish complete verified listings instantly with pinned upcoming deadlines and application status logs.',
    measure: 'Reduction in notice broadcast latency and elimination of missed-deadline student grievances.',
  },
  {
    id: 'D',
    title: 'Eligibility Screening Barriers',
    problem: 'Rigid aggregate CGPA criteria screen out skilled students who have strong project portfolios without alternative avenues.',
    action: 'Explain explicit recruiter eligibility parameters clearly and curate alternative startup and portfolio-evaluated roles.',
    portalSupport: 'Display transparent eligibility requirements upfront and suggest suitable alternative vacancies for affected profiles.',
    measure: 'Number of accessible alternative opportunities actively available to students disqualified from mass corporate drives.',
  },
  {
    id: 'E',
    title: 'Incomplete Job Details',
    problem: 'Preliminary job announcements omit essential compensation structures, mandatory training bonds, shifts, or posting locations.',
    action: 'Standardize employer intake with a mandatory checklist covering base pay, incentives, bond conditions, and work mode.',
    portalSupport: 'Enforce structured listing template with required fields and explicit missing-information alerts for students.',
    measure: 'Listing completeness percentage and reduction in post-selection student offer rejections.',
  },
  {
    id: 'F',
    title: 'Limited Individual Guidance',
    problem: 'Faculty coordinators lack dedicated bandwidth to provide personalized resume feedback or career direction counseling.',
    action: 'Institutionalize scheduled guidance clinic appointments supported by departmental alumni and senior mentors.',
    portalSupport: 'Structured guidance request workflow with student topic selection, time-slot matching, and status tracking.',
    measure: 'Average waiting time for guidance sessions and student feedback satisfaction ratings.',
  },
];
