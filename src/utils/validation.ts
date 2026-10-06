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
  SourceType,
} from '../types/survey';

export interface RowValidationError {
  rowNumber: number;
  field: string;
  message: string;
  rawData?: any;
}

export interface ImportValidationResult {
  validResponses: SurveyResponse[];
  errors: RowValidationError[];
  duplicateIdsInImport: string[];
  conflictingExistingIds: string[];
}

const VALID_DEPTS: Department[] = [
  'Computer Science (CS)',
  'Information Technology (IT)',
  'Data Science (DS)',
];

const VALID_YEARS: AcademicYear[] = ['First', 'Second', 'Third', 'Fourth', 'Other'];
const VALID_DRIVES: RelevantDrivesOption[] = ['0', '1–2', '3 or more', 'Not sure'];
const VALID_NEEDS: NeedsMetOption[] = ['Yes', 'Partly', 'No', 'Not enough experience to judge'];
const VALID_TIMELINESS: TimelinessOption[] = ['Always', 'Sometimes', 'Rarely', 'Never', 'Not applicable'];
const VALID_BARRIERS: BarrierOption[] = [
  'Limited relevant roles',
  'Eligibility restrictions',
  'Skill gaps',
  'Late information',
  'Interview preparation',
  'Location or pay mismatch',
  'Other',
  'No major barrier',
];
const VALID_URGENT_SUPPORT: UrgentSupportOption[] = [
  'Relevant employer connections',
  'Technical training',
  'Aptitude preparation',
  'Resume and interview help',
  'Career guidance',
  'Timely alerts',
  'Internship support',
  'Other',
];

export function validateSurveyRow(
  raw: Record<string, string>,
  rowNumber: number
): { response: SurveyResponse | null; errors: RowValidationError[] } {
  const errors: RowValidationError[] = [];

  const id = (raw.ID || raw.id || '').trim();
  if (!id) {
    errors.push({ rowNumber, field: 'id', message: 'ID is missing or empty' });
  }

  const dept = (raw.Department || raw.department || '').trim() as Department;
  if (!VALID_DEPTS.includes(dept)) {
    errors.push({
      rowNumber,
      field: 'department',
      message: `Invalid department "${dept}". Must be one of: ${VALID_DEPTS.join(', ')}`,
    });
  }

  const year = (raw.Year || raw.year || '').trim() as AcademicYear;
  if (!VALID_YEARS.includes(year)) {
    errors.push({
      rowNumber,
      field: 'year',
      message: `Invalid year "${year}". Must be one of: ${VALID_YEARS.join(', ')}`,
    });
  }

  const preferredRole = (raw['Preferred Role'] || raw.preferredRole || '').trim();
  if (!preferredRole) {
    errors.push({ rowNumber, field: 'preferredRole', message: 'Preferred role is missing' });
  }

  const relevantDrives = (raw['Relevant Drives'] || raw.relevantDrives || '').trim() as RelevantDrivesOption;
  if (!VALID_DRIVES.includes(relevantDrives)) {
    errors.push({
      rowNumber,
      field: 'relevantDrives',
      message: `Invalid drives value "${relevantDrives}". Must be: 0, 1–2, 3 or more, Not sure`,
    });
  }

  const needsMet = (raw['Needs Met'] || raw.needsMet || '').trim() as NeedsMetOption;
  if (!VALID_NEEDS.includes(needsMet)) {
    errors.push({
      rowNumber,
      field: 'needsMet',
      message: `Invalid needsMet "${needsMet}". Must be: Yes, Partly, No, Not enough experience to judge`,
    });
  }

  const informationTimeliness = (
    raw['Information Timeliness'] || raw.informationTimeliness || ''
  ).trim() as TimelinessOption;
  if (!VALID_TIMELINESS.includes(informationTimeliness)) {
    errors.push({
      rowNumber,
      field: 'informationTimeliness',
      message: `Invalid timeliness "${informationTimeliness}". Must be: Always, Sometimes, Rarely, Never, Not applicable`,
    });
  }

  // Training usefulness
  const rawTrain = (
    raw['Training Usefulness (1-5/Have not attended)'] ||
    raw.trainingUsefulness ||
    ''
  ).trim();
  let trainingUsefulness: TrainingUsefulnessOption = 'Have not attended';
  if (['1', '2', '3', '4', '5'].includes(rawTrain)) {
    trainingUsefulness = parseInt(rawTrain, 10) as 1 | 2 | 3 | 4 | 5;
  } else if (rawTrain.toLowerCase().includes('not') || rawTrain === 'Have not attended') {
    trainingUsefulness = 'Have not attended';
  } else {
    errors.push({
      rowNumber,
      field: 'trainingUsefulness',
      message: `Invalid training usefulness "${rawTrain}". Must be 1-5 or "Have not attended"`,
    });
  }

  const biggestBarrier = (raw['Biggest Barrier'] || raw.biggestBarrier || '').trim() as BarrierOption;
  if (!VALID_BARRIERS.includes(biggestBarrier)) {
    errors.push({
      rowNumber,
      field: 'biggestBarrier',
      message: `Invalid barrier "${biggestBarrier}".`,
    });
  }

  const urgentSupport = (raw['Urgent Support'] || raw.urgentSupport || '').trim() as UrgentSupportOption;
  if (!VALID_URGENT_SUPPORT.includes(urgentSupport)) {
    errors.push({
      rowNumber,
      field: 'urgentSupport',
      message: `Invalid urgent support "${urgentSupport}".`,
    });
  }

  // Satisfaction
  const rawSat = (
    raw['Satisfaction (1-5/Not judged)'] ||
    raw.satisfaction ||
    ''
  ).trim();
  let satisfaction: SatisfactionOption = 'Not enough experience to judge';
  if (['1', '2', '3', '4', '5'].includes(rawSat)) {
    satisfaction = parseInt(rawSat, 10) as 1 | 2 | 3 | 4 | 5;
  } else if (
    rawSat.toLowerCase().includes('not') ||
    rawSat.toLowerCase().includes('judge') ||
    rawSat === 'Not enough experience to judge'
  ) {
    satisfaction = 'Not enough experience to judge';
  } else {
    errors.push({
      rowNumber,
      field: 'satisfaction',
      message: `Invalid satisfaction "${rawSat}". Must be 1-5 or "Not enough experience to judge"`,
    });
  }

  const review = (raw.Review || raw.review || '').trim();
  if (!review) {
    errors.push({ rowNumber, field: 'review', message: 'Review text cannot be empty' });
  }

  const suggestion = (raw.Suggestion || raw.suggestion || '').trim();
  if (!suggestion) {
    errors.push({ rowNumber, field: 'suggestion', message: 'Suggestion text cannot be empty' });
  }

  const rawSource = (raw['Source Type'] || raw.sourceType || 'collected').trim().toLowerCase();
  const sourceType: SourceType = rawSource === 'simulated' ? 'simulated' : 'collected';

  const collectionDate = (raw['Collection Date'] || raw.collectionDate || new Date().toISOString().split('T')[0]).trim();
  const questionnaireVersion = (raw['Questionnaire Version'] || raw.questionnaireVersion || 'v1.0').trim();

  if (errors.length > 0) {
    return { response: null, errors };
  }

  return {
    response: {
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
      sourceType,
      collectionDate,
      questionnaireVersion,
    },
    errors: [],
  };
}

export function validateImportBatch(
  rows: Record<string, string>[],
  existingResponses: SurveyResponse[]
): ImportValidationResult {
  const validResponses: SurveyResponse[] = [];
  const errors: RowValidationError[] = [];
  const seenIds = new Set<string>();
  const duplicateIdsInImport: string[] = [];

  const existingIds = new Set(existingResponses.map((r) => r.id));
  const conflictingExistingIds: string[] = [];

  rows.forEach((row, idx) => {
    const rowNumber = idx + 2; // header is row 1
    const { response, errors: rowErrors } = validateSurveyRow(row, rowNumber);

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else if (response) {
      if (seenIds.has(response.id)) {
        duplicateIdsInImport.push(response.id);
        errors.push({
          rowNumber,
          field: 'id',
          message: `Duplicate ID "${response.id}" found multiple times in import file`,
        });
      } else {
        seenIds.add(response.id);
        if (existingIds.has(response.id)) {
          conflictingExistingIds.push(response.id);
        }
        validResponses.push(response);
      }
    }
  });

  return {
    validResponses,
    errors,
    duplicateIdsInImport,
    conflictingExistingIds,
  };
}
