import { SiteGeneralContent, StudentProfile } from '../types/content';

export const DEFAULT_SITE_CONTENT: SiteGeneralContent = {
  siteTitle: 'Skill Bridge — Community Employment and Skill Matching Portal',
  subtitle: 'Connecting student aspirations, verified placement opportunities, practical training, and continuous feedback',
  heroHeadline: 'Find opportunities that fit your skills and goals.',
  heroSupportingText: 'Skill Bridge brings student needs, placement opportunities, training, and feedback together in one place.',
  collegeName: '', // initially blank per prompt instructions
  contactEmail: '', // initially blank per prompt instructions
  contactOffice: '', // initially blank per prompt instructions
  projectDescription: 'Skill Bridge is a college Community Engagement Project (CEP) created to explore student placement experiences, bridge information gaps between academic departments and placement cells, and demonstrate an interactive, transparent framework for opportunity discovery, role-specific practical preparation, and accountable feedback handling.',
  aboutMission: 'Empowering students across diverse disciplines with transparent opportunity discovery, tailored practical preparation clinics, and an accountable, data-informed placement coordination mechanism.',
  aboutProblemStatement: 'Students across different domains may face uneven access to relevant opportunities, practical preparation, and timely placement information. Skill Bridge explores these needs and demonstrates a shared platform for opportunities, training, and feedback.',
  aboutObjectives: [
    'Understand student placement needs and document department-wise variations.',
    'Present department-wise concerns transparently to placement coordinators and college leadership.',
    'Improve opportunity discovery with granular skill-based and eligibility-transparent matching.',
    'Centralize placement information to eliminate notice delays and missed corporate deadlines.',
    'Connect identified skill gaps with practical, discipline-specific training workshops.',
    'Support personalized guidance requests for resume review, technical preparation, and career direction.',
    'Track operational feedback and proposed institutional actions with measurable accountability.',
  ],
};

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  displayName: 'Aditya Sharma',
  department: 'Computer Science (CS)',
  year: 'Fourth',
  preferredRoles: ['Frontend Developer', 'Full Stack Developer'],
  skills: ['React', 'JavaScript', 'Tailwind CSS', 'Node.js', 'REST APIs'],
  preferredLocations: ['Pune', 'Mumbai', 'Remote'],
  trainingInterests: ['Technical Interview & Coding Practice Clinic'],
  academicPercentage: 68,
  activeBacklogs: 0,
};
