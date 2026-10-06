import {
  SurveyResponse,
  Department,
  AcademicYear,
  RelevantDrivesOption,
  NeedsMetOption,
  TimelinessOption,
  TrainingUsefulnessOption,
  BarrierOption,
  UrgentSupportOption,
  SatisfactionOption,
  SurveyQuestion,
} from '../types/survey';

// Standard 12 Core Survey Questions
export const DEFAULT_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'Q1',
    number: 1,
    text: 'Which department or course are you studying in?',
    type: 'select',
    options: [
      'Computer Science (CS)',
      'Information Technology (IT)',
      'Data Science (DS)',
    ],
  },
  {
    id: 'Q2',
    number: 2,
    text: 'What is your current year of study?',
    type: 'select',
    options: ['First', 'Second', 'Third', 'Fourth', 'Other'],
  },
  {
    id: 'Q3',
    number: 3,
    text: 'What job role or career domain are you mainly interested in?',
    type: 'text',
    helpText: 'e.g. Software Engineer, Design Engineer, Site Engineer, Financial Analyst',
  },
  {
    id: 'Q4',
    number: 4,
    text: 'How many campus recruitment drives offered roles relevant to your preferred domain during the current academic year?',
    type: 'select',
    options: ['0', '1–2', '3 or more', 'Not sure'],
  },
  {
    id: 'Q5',
    number: 5,
    text: 'Is the placement cell currently meeting your placement-related needs?',
    type: 'select',
    options: ['Yes', 'Partly', 'No', 'Not enough experience to judge'],
  },
  {
    id: 'Q6',
    number: 6,
    text: 'How often do you receive placement information early enough to prepare and apply?',
    type: 'select',
    options: ['Always', 'Sometimes', 'Rarely', 'Never', 'Not applicable'],
  },
  {
    id: 'Q7',
    number: 7,
    text: 'How useful has the placement training you attended been for your preferred role?',
    type: 'select',
    options: ['1', '2', '3', '4', '5', 'Have not attended'],
    helpText: '1 = Not useful, 5 = Very useful',
  },
  {
    id: 'Q8',
    number: 8,
    text: 'What is the biggest barrier you face in getting a suitable placement?',
    type: 'select',
    options: [
      'Limited relevant roles',
      'Eligibility restrictions',
      'Skill gaps',
      'Late information',
      'Interview preparation',
      'Location or pay mismatch',
      'Other',
      'No major barrier',
    ],
  },
  {
    id: 'Q9',
    number: 9,
    text: 'Which placement support do you need most urgently?',
    type: 'select',
    options: [
      'Relevant employer connections',
      'Technical training',
      'Aptitude preparation',
      'Resume and interview help',
      'Career guidance',
      'Timely alerts',
      'Internship support',
      'Other',
    ],
  },
  {
    id: 'Q10',
    number: 10,
    text: 'How satisfied are you with overall placement support?',
    type: 'select',
    options: ['1', '2', '3', '4', '5', 'Not enough experience to judge'],
    helpText: '1 = Very dissatisfied, 5 = Very satisfied',
  },
  {
    id: 'Q11',
    number: 11,
    text: 'Briefly describe your experience with the placement process.',
    type: 'textarea',
  },
  {
    id: 'Q12',
    number: 12,
    text: 'What one change would most improve placement support for you?',
    type: 'textarea',
  },
];

// Seeded pseudo-random generator (Mulberry32)
function createPRNG(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSeedDataset(): SurveyResponse[] {
  const prng = createPRNG(20261001); // deterministic seed

  const deptCounts: { dept: Department; count: number }[] = [
    { dept: 'Computer Science (CS)', count: 80 },
    { dept: 'Information Technology (IT)', count: 60 },
    { dept: 'Data Science (DS)', count: 60 },
  ];

  const rolesByDept: Record<Department, string[]> = {
    'Computer Science (CS)': [
      'Frontend Developer',
      'Full Stack Developer',
      'Backend Microservices Engineer',
      'Systems Software Engineer',
      'Cybersecurity Analyst',
      'Cloud Solutions Architect',
      'DevOps Engineer',
      'Algorithm & Competitive Programmer',
    ],
    'Information Technology (IT)': [
      'Web Application Developer',
      'Mobile App Developer (Flutter/React Native)',
      'Cloud Infrastructure Specialist',
      'Database Administrator (SQL/NoSQL)',
      'Network Security Engineer',
      'IT Systems Support Engineer',
      'Site Reliability Engineer (SRE)',
      'Enterprise Solutions Consultant',
    ],
    'Data Science (DS)': [
      'Machine Learning Engineer',
      'Data Analyst',
      'Business Intelligence Developer',
      'Big Data Pipeline Engineer',
      'Deep Learning & AI Researcher',
      'NLP & LLM Engineer',
      'Computer Vision Specialist',
      'Quantitative Data Scientist',
    ],
  };

  const years: AcademicYear[] = ['Third', 'Fourth', 'Fourth', 'Third', 'Second', 'Fourth'];

  const responses: SurveyResponse[] = [];
  let globalIdCounter = 1;

  for (const { dept, count } of deptCounts) {
    const roles = rolesByDept[dept];

    for (let i = 0; i < count; i++) {
      const id = `S${String(globalIdCounter).padStart(3, '0')}`;
      globalIdCounter++;

      const year = years[Math.floor(prng() * years.length)];
      const preferredRole = roles[Math.floor(prng() * roles.length)];

      let relevantDrives: RelevantDrivesOption;
      let needsMet: NeedsMetOption;
      let informationTimeliness: TimelinessOption;
      let trainingUsefulness: TrainingUsefulnessOption;
      let biggestBarrier: BarrierOption;
      let urgentSupport: UrgentSupportOption;
      let satisfaction: SatisfactionOption;

      // Realistic Department Dynamics for CS, IT, and DS
      const randVal = prng();

      if (dept === 'Computer Science (CS)') {
        if (randVal < 0.35) {
          // Positive experience
          relevantDrives = '3 or more';
          needsMet = 'Yes';
          informationTimeliness = 'Always';
          trainingUsefulness = (4 + (prng() > 0.5 ? 1 : 0)) as TrainingUsefulnessOption;
          biggestBarrier = prng() > 0.6 ? 'Interview preparation' : 'No major barrier';
          urgentSupport = 'Technical training';
          satisfaction = (4 + (prng() > 0.4 ? 1 : 0)) as SatisfactionOption;
        } else if (randVal < 0.75) {
          // Moderate/Partly met
          relevantDrives = prng() > 0.4 ? '1–2' : '3 or more';
          needsMet = 'Partly';
          informationTimeliness = 'Sometimes';
          trainingUsefulness = (3 + (prng() > 0.5 ? 1 : 0)) as TrainingUsefulnessOption;
          biggestBarrier = prng() > 0.5 ? 'Skill gaps' : 'Eligibility restrictions';
          urgentSupport = prng() > 0.5 ? 'Technical training' : 'Resume and interview help';
          satisfaction = 3;
        } else {
          // Dissatisfied / Unmet
          relevantDrives = '1–2';
          needsMet = 'No';
          informationTimeliness = 'Rarely';
          trainingUsefulness = (2 + (prng() > 0.6 ? 1 : 0)) as TrainingUsefulnessOption;
          biggestBarrier = prng() > 0.5 ? 'Eligibility restrictions' : 'Late information';
          urgentSupport = 'Relevant employer connections';
          satisfaction = (2 + (prng() > 0.5 ? -1 : 0)) as SatisfactionOption;
        }
      } else if (dept === 'Information Technology (IT)') {
        if (randVal < 0.30) {
          relevantDrives = '3 or more';
          needsMet = 'Yes';
          informationTimeliness = 'Always';
          trainingUsefulness = 4;
          biggestBarrier = 'Interview preparation';
          urgentSupport = 'Technical training';
          satisfaction = 4;
        } else if (randVal < 0.70) {
          relevantDrives = prng() > 0.4 ? '1–2' : '3 or more';
          needsMet = 'Partly';
          informationTimeliness = 'Sometimes';
          trainingUsefulness = 3;
          biggestBarrier = prng() > 0.5 ? 'Skill gaps' : 'Late information';
          urgentSupport = prng() > 0.5 ? 'Technical training' : 'Timely alerts';
          satisfaction = 3;
        } else {
          relevantDrives = '1–2';
          needsMet = 'No';
          informationTimeliness = 'Rarely';
          trainingUsefulness = 2;
          biggestBarrier = 'Limited relevant roles';
          urgentSupport = 'Relevant employer connections';
          satisfaction = 2;
        }
      } else {
        // Data Science (DS)
        if (randVal < 0.25) {
          relevantDrives = '1–2';
          needsMet = 'Yes';
          informationTimeliness = 'Always';
          trainingUsefulness = (4 + (prng() > 0.5 ? 1 : 0)) as TrainingUsefulnessOption;
          biggestBarrier = 'No major barrier';
          urgentSupport = 'Internship support';
          satisfaction = 4;
        } else if (randVal < 0.65) {
          relevantDrives = prng() > 0.5 ? '1–2' : '0';
          needsMet = 'Partly';
          informationTimeliness = 'Sometimes';
          trainingUsefulness = 3;
          biggestBarrier = prng() > 0.5 ? 'Limited relevant roles' : 'Skill gaps';
          urgentSupport = prng() > 0.5 ? 'Technical training' : 'Relevant employer connections';
          satisfaction = 3;
        } else {
          relevantDrives = '0';
          needsMet = 'No';
          informationTimeliness = prng() > 0.5 ? 'Rarely' : 'Never';
          trainingUsefulness = prng() > 0.3 ? 2 : 'Have not attended';
          biggestBarrier = 'Limited relevant roles';
          urgentSupport = 'Relevant employer connections';
          satisfaction = (1 + (prng() > 0.5 ? 1 : 0)) as SatisfactionOption;
        }
      }

      // Consistent Narrative Review and Suggestion based on ratings & barriers
      const { review, suggestion } = generateConsistentReview(
        dept,
        preferredRole,
        needsMet,
        biggestBarrier,
        satisfaction,
        informationTimeliness,
        i + 1
      );

      responses.push({
        id,
        department: dept,
        year,
        preferredRole,
        relevantDrives,
        needsMet,
        informationTimeliness,
        trainingUsefulness,
        biggestBarrier,
        urgentSupport,
        satisfaction,
        review,
        suggestion,
        sourceType: 'simulated',
        collectionDate: '2026-09-18',
        questionnaireVersion: 'v1.0',
      });
    }
  }

  return responses;
}

function generateConsistentReview(
  dept: Department,
  role: string,
  needsMet: NeedsMetOption,
  barrier: BarrierOption,
  satisfaction: SatisfactionOption,
  timeliness: TimelinessOption,
  index: number
): { review: string; suggestion: string } {
  const satNum = typeof satisfaction === 'number' ? satisfaction : 3;

  if (satNum >= 4) {
    const positiveReviews = [
      `Overall coordination for ${role} has been proactive this term. Drive schedules were shared with clear guidance and the initial orientation sessions helped clarify technical expectations.`,
      `The placement cell organized useful mock test sessions that gave a realistic view of technical assessments for ${dept} students. Information reached us with sufficient time to review requirements.`,
      `I experienced an organized process with multiple corporate presentations. The communication channels were responsive whenever clarifications on JD details were sought.`,
      `Appreciate the dedicated efforts taken to bring reputed recruiters for ${role}. The aptitude refresher modules directly complemented the written rounds.`,
    ];
    const positiveSuggestions = [
      `Introduce domain-specific problem solving sessions in smaller batches alongside broad company talks.`,
      `Share preliminary test patterns and sample question banks two weeks prior to drive dates.`,
      `Facilitate direct interaction with recent alumni working in similar ${role} profiles.`,
      `Offer advanced track electives or lab workshops mapped to industry software packages.`,
    ];
    return {
      review: positiveReviews[index % positiveReviews.length],
      suggestion: positiveSuggestions[index % positiveSuggestions.length],
    };
  } else if (satNum === 3) {
    const neutralReviews = [
      `The placement process provides periodic notifications, but options for specialized ${role} positions are moderate. General IT roles dominate while niche technical opportunities remain limited.`,
      `Notices arrive reliably on social messaging channels, but the turn-around window between notification and drive registration is occasionally only 24 hours.`,
      `Training modules cover general aptitude reasonably well, but practical hands-on preparation specifically for ${dept} core competency is missing.`,
      `While several companies visit, strict aggregate criteria eliminate students who possess strong project work in ${role} but fell short on earlier semester cutoffs.`,
    ];
    const neutralSuggestions = [
      `Provide at least 48 to 72 hours window between posting vacancy circulars and deadline closure.`,
      `Partner with core sector enterprises and regional engineering firms to balance software drive dominance.`,
      `Differentiate training syllabus based on core branch competencies rather than generic classroom modules.`,
      `Establish a formal appeal or skill-test waiver mechanism for students marginally below rigid academic cutoffs.`,
    ];
    return {
      review: neutralReviews[index % neutralReviews.length],
      suggestion: neutralSuggestions[index % neutralSuggestions.length],
    };
  } else {
    // Low satisfaction (1 or 2)
    const negativeReviews = [
      `For ${dept} students interested in ${role}, very few companies with relevant job descriptions were brought to campus. Most announced drives were completely outside our domain.`,
      `Placement notices frequently reach us with less than 24 hours to review eligibility and prepare technical resumes. This rush compromises interview readiness.`,
      `The current placement support heavily prioritizes generic mass recruiters while offering negligible assistance for core engineering or specialized business roles.`,
      `Rigid eligibility criteria prevent capable students from participating even when their project portfolios directly match the advertised role profile.`,
    ];
    const negativeSuggestions = [
      `Actively reach out to mid-sized specialized firms and domain startups rather than depending on traditional mass recruiters.`,
      `Publish a unified placement calendar at the start of each month so applicants can systematically prepare.`,
      `Conduct branch-specific technical clinics led by experienced industry mentors rather than general lecture talks.`,
      `Clarify job descriptions, expected compensation break-ups, and actual work locations prior to registration deadlines.`,
    ];
    return {
      review: negativeReviews[index % negativeReviews.length],
      suggestion: negativeSuggestions[index % negativeSuggestions.length],
    };
  }
}
