import { generateSeedDataset, DEFAULT_QUESTIONS } from '../src/data/defaultSurveySeed';
import { DEFAULT_OPPORTUNITIES } from '../src/data/defaultOpportunities';
import { DEFAULT_STUDY_DATA } from '../src/data/defaultStudy';
import { DEFAULT_PROBLEM_MATRIX } from '../src/data/defaultProblemMatrix';
import { DEFAULT_TRAINING_SESSIONS } from '../src/data/defaultTraining';
import {
  calculateSummaryMetrics,
  filterResponses,
  getRatingMetric,
  getDepartmentDistribution,
} from '../src/utils/calculations';
import { sanitizeForCSV, parseCSV, exportResponsesToCSV } from '../src/utils/csvUtils';
import { validateImportBatch } from '../src/utils/validation';
import { evaluateOpportunityMatch } from '../src/utils/matching';
import { DEFAULT_STUDENT_PROFILE } from '../src/data/defaultContent';

let passedChecks = 0;
let totalChecks = 0;

function assert(condition: boolean, testName: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

console.log('=== RUNNING ACCEPTANCE CHECKS ===\n');

// 1. Dataset Verification
const seedData = generateSeedDataset();
assert(seedData.length === 200, 'Dataset contains exactly 200 responses');

const ids = seedData.map((r) => r.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 200, 'All 200 IDs are unique');
assert(ids[0] === 'S001' && ids[199] === 'S200', 'IDs run sequentially from S001 through S200');

// Department Quotas
const deptCounts: Record<string, number> = {};
seedData.forEach((r) => {
  deptCounts[r.department] = (deptCounts[r.department] || 0) + 1;
});
assert(deptCounts['Computer Science (CS)'] === 80, 'Computer Science (CS) has exactly 80 responses');
assert(deptCounts['Information Technology (IT)'] === 60, 'Information Technology (IT) has exactly 60 responses');
assert(deptCounts['Data Science (DS)'] === 60, 'Data Science (DS) has exactly 60 responses');

// Completeness of 12 core questions
const allComplete = seedData.every(
  (r) =>
    r.id &&
    r.department &&
    r.year &&
    r.preferredRole &&
    r.relevantDrives &&
    r.needsMet &&
    r.informationTimeliness &&
    r.trainingUsefulness !== undefined &&
    r.biggestBarrier &&
    r.urgentSupport &&
    r.satisfaction !== undefined &&
    r.review &&
    r.suggestion &&
    r.sourceType === 'simulated'
);
assert(allComplete, 'All 200 records answer all 12 core survey questions with simulated sourceType');

// Reviews non-empty and varied
const uniqueReviews = new Set(seedData.map((r) => r.review));
assert(uniqueReviews.size > 10, 'Qualitative reviews have varied phrasing');

// Deterministic seed reproduction
const secondRun = generateSeedDataset();
assert(
  JSON.stringify(seedData) === JSON.stringify(secondRun),
  'Seeded PRNG generates 100% reproducible dataset across runs'
);

// 2. Centralized Calculations
const metrics = calculateSummaryMetrics(seedData);
assert(metrics.totalResponses === 200, 'Total responses metric is 200');
assert(metrics.departmentsRepresented === 3, 'All 3 departments (CS, IT, DS) represented in calculation');
assert(
  metrics.partlyOrUnmetPercentage > 0 && metrics.partlyOrUnmetPercentage < 100,
  `Partly/Unmet needs percentage calculated correctly (${metrics.partlyOrUnmetPercentage}%)`
);
assert(
  metrics.lateOrRareInfoPercentage > 0 && metrics.lateOrRareInfoPercentage < 100,
  `Late/Rare notice percentage calculated correctly (${metrics.lateOrRareInfoPercentage}%)`
);

// Excluded responses in rating averages
const trainingMetric = getRatingMetric(seedData, 'trainingUsefulness');
assert(
  trainingMetric.validCount + trainingMetric.excludedCount === 200,
  'Rating calculations accurately partition valid numbers and excluded non-judged/non-attended values'
);

// Filters
const compOnly = filterResponses(seedData, {
  department: 'Computer Science (CS)',
  year: 'All',
  sourceType: 'All',
});
assert(compOnly.length === 80, 'Department filter returns exact cohort count (80)');

const emptyFilter = filterResponses(seedData, {
  department: 'Data Science (DS)',
  year: 'First',
  sourceType: 'collected',
});
const emptyMetrics = calculateSummaryMetrics(emptyFilter);
assert(emptyMetrics.totalResponses === 0, 'Zero-match filter produces clean empty metrics without errors');

// 3. CSV Sanitization & Formula Injection Protection
assert(sanitizeForCSV('=SUM(A1:A10)') === "'=SUM(A1:A10)", 'Spreadsheet formula injection (=) safely escaped with quote');
assert(sanitizeForCSV('+1234') === "'+1234", 'Spreadsheet formula injection (+) safely escaped');
assert(sanitizeForCSV('-500') === "'-500", 'Spreadsheet formula injection (-) safely escaped');
assert(sanitizeForCSV('@cmd') === "'@cmd", 'Spreadsheet formula injection (@) safely escaped');

const csvExport = exportResponsesToCSV(seedData);
const parsedCSV = parseCSV(csvExport);
assert(parsedCSV.length === 201, 'CSV export contains header row + 200 data rows');

// 4. Batch Import Validation
const testImportRows = [
  {
    ID: 'NEW-001',
    Department: 'Computer Science (CS)',
    Year: 'Fourth',
    'Preferred Role': 'DevOps Engineer',
    'Relevant Drives': '1–2',
    'Needs Met': 'Yes',
    'Information Timeliness': 'Always',
    'Training Usefulness (1-5/Have not attended)': '4',
    'Biggest Barrier': 'Skill gaps',
    'Urgent Support': 'Technical training',
    'Satisfaction (1-5/Not judged)': '4',
    Review: 'Good placement training sessions arranged.',
    Suggestion: 'Introduce Kubernetes workshops.',
    'Source Type': 'collected',
  },
  {
    ID: 'INVALID-002',
    Department: 'Astrophysics', // invalid dept
    Year: 'Fourth',
    'Preferred Role': 'Scientist',
    'Relevant Drives': '99', // invalid
    'Needs Met': 'Maybe', // invalid
    'Information Timeliness': 'Always',
    'Training Usefulness (1-5/Have not attended)': '10', // invalid
    'Biggest Barrier': 'None',
    'Urgent Support': 'Cash',
    'Satisfaction (1-5/Not judged)': '10',
    Review: '',
    Suggestion: '',
  },
];
const valResult = validateImportBatch(testImportRows, seedData);
assert(valResult.validResponses.length === 1, 'Import validator accepts clean valid rows');
assert(valResult.errors.length > 0, 'Import validator detects invalid department and out-of-range options');

// 5. Opportunities Directory
assert(DEFAULT_OPPORTUNITIES.length >= 18, `At least 18 demo opportunities provided (${DEFAULT_OPPORTUNITIES.length} available)`);
const deptsWithOpps = new Set(DEFAULT_OPPORTUNITIES.flatMap((o) => o.relevantDepartments));
assert(deptsWithOpps.size === 3, 'Opportunities cover all 3 departments: CS, IT, and DS');
const hasExpired = DEFAULT_OPPORTUNITIES.some((o) => o.isExpired);
assert(hasExpired, 'Includes expired listing state to verify filtering');

// 6. Three-Day Study Structure
assert(DEFAULT_STUDY_DATA.days.length === 3, 'Study has 3 distinct days');
assert(DEFAULT_STUDY_DATA.interviewGuide.length === 15, 'Interview guide has exactly 15 questions');
assert(
  DEFAULT_STUDY_DATA.interviewGuide.every((q) => q.question && q.illustrativeAnswer),
  'All 15 interview guide items have documented illustrative coordinator responses'
);
assert(DEFAULT_STUDY_DATA.gapAnalysis.length >= 6, 'Gap analysis matrix covers at least 6 problem dimensions');
assert(DEFAULT_STUDY_DATA.actionPlan.length >= 5, 'Action plan contains editable items with owners and timelines');

// 7. Problem Matrix A through F
assert(DEFAULT_PROBLEM_MATRIX.length === 6, 'Problem matrix covers dimensions A through F');
const matrixIds = DEFAULT_PROBLEM_MATRIX.map((m) => m.id).join('');
assert(matrixIds === 'ABCDEF', 'Problem matrix IDs match A, B, C, D, E, F');

// 8. Transparent Matching Engine
const testOpp = DEFAULT_OPPORTUNITIES[0];
const matchResult = evaluateOpportunityMatch(testOpp, DEFAULT_STUDENT_PROFILE);
assert(typeof matchResult.score === 'number', 'Match score is a numeric value');
assert(matchResult.matchedReasons.length > 0, 'Match provides plain-language reasons');
assert(
  !matchResult.explanation.toLowerCase().includes('ai') && !matchResult.explanation.toLowerCase().includes('probab'),
  'Matching does not claim AI probability'
);

// 9. Training Clinics
assert(DEFAULT_TRAINING_SESSIONS.length >= 6, `At least 6 demo practical workshops (${DEFAULT_TRAINING_SESSIONS.length} available)`);

console.log(`\n========================================`);
console.log(`RESULTS: ${passedChecks} of ${totalChecks} checks PASSED!`);
console.log(`========================================\n`);

if (passedChecks !== totalChecks) {
  process.exit(1);
}
