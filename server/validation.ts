/**
 * Skill Bridge Centralized Validation Engine
 * Reusable validation schemas for system documents, relational entities,
 * and database backup/restore payloads.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const VALID_DEPARTMENTS = [
  'Computer Science (CS)',
  'Information Technology (IT)',
  'Data Science (DS)',
] as const;

export const VALID_DEPARTMENTS_WITH_ALL = [
  ...VALID_DEPARTMENTS,
  'All Departments',
] as const;

/**
 * Validates date strings in YYYY-MM-DD or ISO 8601 format with strict calendar boundary checks.
 * Prevents calendar overflows such as 2026-02-30 or 2026-13-45.
 */
export function isValidDate(dateStr: unknown): boolean {
  if (typeof dateStr !== 'string') return false;
  const s = dateStr.trim();
  if (s.length < 8 || s.length > 35) return false;

  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/);
  if (!match) {
    const parsed = Date.parse(s);
    return !isNaN(parsed);
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (year < 1970 || year > 2100) return false;
  if (month < 1 || month > 12) return false;

  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const daysInMonth = [0, 31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day < 1 || day > daysInMonth[month]) return false;

  if (match[4] !== undefined) {
    const hours = parseInt(match[4], 10);
    const minutes = parseInt(match[5], 10);
    const seconds = match[6] !== undefined ? parseInt(match[6], 10) : 0;
    if (hours < 0 || hours > 23) return false;
    if (minutes < 0 || minutes > 59) return false;
    if (seconds < 0 || seconds > 59) return false;
  }

  return true;
}

/**
 * Validates recurring or point-in-time schedule strings.
 * Distinguishes 12-hour and 24-hour formats and strictly rejects impossible times like 'Monday 99:99 pm'.
 */
export function isValidSchedule(scheduleStr: unknown): boolean {
  if (typeof scheduleStr !== 'string') return false;
  const s = scheduleStr.trim();
  if (s.length < 5 || s.length > 150) return false;

  // Case 1: Point-in-time date / datetime (e.g. "2026-10-15 14:00" or ISO 8601)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    return isValidDate(s);
  }

  // Case 2: Recurring schedule pattern
  const dayPattern = /\b(mon(days?)?|tues?(days?)?|wed(nesdays?)?|thurs?(days?)?|fri(days?)?|sat(urdays?)?|sun(days?)?|daily|weekly|bi-?weekly|weekdays?|weekends?|everyday)\b/i;
  if (!dayPattern.test(s)) {
    return false;
  }

  // Find all time substrings in the schedule
  const timeRegex = /\b(\d{1,3})(?::(\d{1,3}))?\s*(am|pm)?\b/gi;
  let match: RegExpExecArray | null;
  let foundValidTime = false;

  while ((match = timeRegex.exec(s)) !== null) {
    const rawHours = parseInt(match[1], 10);
    const rawMinutes = match[2] !== undefined ? parseInt(match[2], 10) : 0;
    const meridian = match[3] ? match[3].toLowerCase() : null;

    if (meridian === 'am' || meridian === 'pm') {
      // 12-hour format: 1 <= hour <= 12, 0 <= minute <= 59
      if (rawHours < 1 || rawHours > 12 || rawMinutes < 0 || rawMinutes > 59) {
        return false;
      }
      foundValidTime = true;
    } else if (match[2] !== undefined) {
      // 24-hour format: 0 <= hour <= 23, 0 <= minute <= 59
      if (rawHours < 0 || rawHours > 23 || rawMinutes < 0 || rawMinutes > 59) {
        return false;
      }
      foundValidTime = true;
    }
  }

  return foundValidTime;
}

/**
 * Validates satisfaction score (integer 1-5 or non-rated text)
 */
export function parseSatisfaction(val: unknown): { valid: boolean; value: any } {
  if (val === null || val === undefined) {
    return { valid: true, value: 3 };
  }
  if (typeof val === 'number') {
    if (Number.isInteger(val) && val >= 1 && val <= 5) return { valid: true, value: val };
    return { valid: false, value: 'Satisfaction rating must be an integer between 1 and 5.' };
  }
  const str = String(val).trim();
  if (['1', '2', '3', '4', '5'].includes(str)) {
    return { valid: true, value: parseInt(str, 10) };
  }
  const lower = str.toLowerCase();
  if (lower.includes('not') || lower.includes('experience') || lower.includes('judge')) {
    return { valid: true, value: 'Not enough experience to judge' };
  }
  if (lower.includes('very satisfied') || lower.includes('highly')) {
    return { valid: true, value: 5 };
  }
  if (lower === 'satisfied') {
    return { valid: true, value: 4 };
  }
  if (lower.includes('neutral') || lower.includes('average')) {
    return { valid: true, value: 3 };
  }
  if (lower.includes('dissatisfied') && !lower.includes('very')) {
    return { valid: true, value: 2 };
  }
  if (lower.includes('very dissatisfied')) {
    return { valid: true, value: 1 };
  }
  return { valid: false, value: 'Satisfaction rating must be an integer between 1 and 5 or "Not enough experience to judge".' };
}

/**
 * Validates training usefulness score (integer 1-5 or non-rated text)
 */
export function parseTrainingUsefulness(val: unknown): { valid: boolean; value: any } {
  if (val === null || val === undefined) {
    return { valid: true, value: 3 };
  }
  if (typeof val === 'number') {
    if (Number.isInteger(val) && val >= 1 && val <= 5) return { valid: true, value: val };
    return { valid: false, value: 'Training usefulness must be an integer between 1 and 5.' };
  }
  const str = String(val).trim();
  if (['1', '2', '3', '4', '5'].includes(str)) {
    return { valid: true, value: parseInt(str, 10) };
  }
  const lower = str.toLowerCase();
  if (lower.includes('have not') || lower.includes('not attended') || lower.includes('none')) {
    return { valid: true, value: 'Have not attended' };
  }
  if (lower.includes('very useful') || lower.includes('extremely useful')) {
    return { valid: true, value: 5 };
  }
  if (lower === 'useful' || lower.includes('quite useful')) {
    return { valid: true, value: 4 };
  }
  if (lower.includes('moderately') || lower.includes('neutral') || lower.includes('average')) {
    return { valid: true, value: 3 };
  }
  if (lower.includes('slightly') || lower.includes('rarely')) {
    return { valid: true, value: 2 };
  }
  if (lower.includes('not useful') || lower.includes('poor')) {
    return { valid: true, value: 1 };
  }
  return { valid: false, value: 'Training usefulness must be an integer between 1 and 5 or "Have not attended".' };
}

/* ========================================================================== */
/* SYSTEM DOCUMENTS VALIDATORS                                                */
/* ========================================================================== */

/**
 * Validates site_content document
 */
export function validateSiteContent(content: unknown): ValidationResult {
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return { valid: false, error: 'siteContent must be a non-empty configuration object, not an array or null.' };
  }

  const c = { ...(content as Record<string, any>) };
  if (c.portalTitle && !c.siteTitle) {
    c.siteTitle = c.portalTitle;
  }
  const requiredStringKeys = [
    'siteTitle',
    'subtitle',
    'heroHeadline',
    'heroSupportingText',
    'projectDescription',
    'aboutMission',
    'aboutProblemStatement',
  ];

  for (const key of requiredStringKeys) {
    if (typeof c[key] !== 'string' || c[key].trim().length === 0) {
      return { valid: false, error: `siteContent.${key} is required and must be a non-empty string.` };
    }
  }

  if (!Array.isArray(c.aboutObjectives) || c.aboutObjectives.length === 0) {
    return { valid: false, error: 'siteContent.aboutObjectives must be a non-empty array of objective strings.' };
  }

  for (let i = 0; i < c.aboutObjectives.length; i++) {
    if (typeof c.aboutObjectives[i] !== 'string' || c.aboutObjectives[i].trim().length === 0) {
      return { valid: false, error: `siteContent.aboutObjectives[${i}] must be a non-empty string.` };
    }
  }

  return { valid: true };
}

/**
 * Validates study_data document.
 * Requires status, days, interviewGuide, gapAnalysis, and actionPlan.
 */
export function validateStudyData(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, error: 'studyData must be a non-null object.' };
  }

  const s = data as Record<string, any>;
  if (Object.keys(s).length === 0) {
    return { valid: false, error: 'studyData cannot be an empty object; required study sections are missing.' };
  }

  if (s.status !== undefined && typeof s.status !== 'string') {
    return { valid: false, error: 'studyData.status must be a string.' };
  }

  // days is required to be an array
  if (!Array.isArray(s.days)) {
    return { valid: false, error: 'studyData.days must be an array of day records.' };
  }
  for (let i = 0; i < s.days.length; i++) {
    const day = s.days[i];
    if (!day || typeof day !== 'object' || typeof day.dayNumber !== 'number' || typeof day.title !== 'string') {
      return { valid: false, error: `studyData.days[${i}] requires dayNumber and title.` };
    }
    if (day.activities !== undefined && !Array.isArray(day.activities)) {
      return { valid: false, error: `studyData.days[${i}].activities must be an array of strings.` };
    }
  }

  // interviewGuide is required to be an array
  if (!Array.isArray(s.interviewGuide)) {
    return { valid: false, error: 'studyData.interviewGuide must be an array of interview guide questions.' };
  }
  for (let i = 0; i < s.interviewGuide.length; i++) {
    const item = s.interviewGuide[i];
    if (!item || typeof item !== 'object' || item.id === undefined || typeof item.question !== 'string' || typeof item.illustrativeAnswer !== 'string') {
      return { valid: false, error: `studyData.interviewGuide[${i}] requires id, question, and illustrativeAnswer strings.` };
    }
  }

  // gapAnalysis is required
  if (!Array.isArray(s.gapAnalysis)) {
    return { valid: false, error: 'studyData.gapAnalysis must be an array.' };
  }
  for (let i = 0; i < s.gapAnalysis.length; i++) {
    const item = s.gapAnalysis[i];
    if (!item || typeof item !== 'object' || !item.id || !item.category || !item.studentConcern) {
      return { valid: false, error: `studyData.gapAnalysis[${i}] requires id, category, and studentConcern strings.` };
    }
  }

  // actionPlan is required
  if (!Array.isArray(s.actionPlan)) {
    return { valid: false, error: 'studyData.actionPlan must be an array.' };
  }
  for (let i = 0; i < s.actionPlan.length; i++) {
    const item = s.actionPlan[i];
    if (!item || typeof item !== 'object' || !item.id || !item.problem || !item.proposedAction) {
      return { valid: false, error: `studyData.actionPlan[${i}] requires id, problem, and proposedAction strings.` };
    }
  }

  return { valid: true };
}

/**
 * Validates community_visits document.
 * Requires visit1, visit2, visit3, and traceability.
 */
export function validateCommunityVisits(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, error: 'communityVisits must be a non-null object.' };
  }

  const v = data as Record<string, any>;
  if (Object.keys(v).length === 0) {
    return { valid: false, error: 'communityVisits cannot be an empty object.' };
  }

  const visits = ['visit1', 'visit2', 'visit3'] as const;

  for (const vKey of visits) {
    const visit = v[vKey];
    if (!visit || typeof visit !== 'object' || Array.isArray(visit)) {
      return { valid: false, error: `communityVisits.${vKey} must be a valid visit record object.` };
    }
    if (!visit.title || typeof visit.title !== 'string' || visit.title.trim().length === 0) {
      return { valid: false, error: `communityVisits.${vKey}.title is required and must be a non-empty string.` };
    }
    if (!visit.status || typeof visit.status !== 'string') {
      return { valid: false, error: `communityVisits.${vKey}.status is required ('Planned', 'In Progress', or 'Completed').` };
    }
    if (visit.objective === undefined || typeof visit.objective !== 'string') {
      return { valid: false, error: `communityVisits.${vKey}.objective is required.` };
    }
    if (!Array.isArray(visit.photos)) {
      return { valid: false, error: `communityVisits.${vKey}.photos must be an array.` };
    }
    if (!Array.isArray(visit.anonymizedFeedback)) {
      return { valid: false, error: `communityVisits.${vKey}.anonymizedFeedback must be an array.` };
    }

    if (vKey === 'visit1') {
      if (visit.surveyResponsesNotes === undefined && visit.existingSkills === undefined) {
        return { valid: false, error: 'communityVisits.visit1 requires needs assessment fields (e.g. existingSkills, employerNeeds).' };
      }
    } else if (vKey === 'visit2') {
      if (!Array.isArray(visit.prototypeTasks)) {
        return { valid: false, error: 'communityVisits.visit2.prototypeTasks must be an array of prototype testing tasks.' };
      }
    } else if (vKey === 'visit3') {
      if (visit.changesDemonstrated === undefined && visit.taskResultsSummary === undefined) {
        return { valid: false, error: 'communityVisits.visit3 requires evaluation fields (e.g. changesDemonstrated, taskResultsSummary).' };
      }
    }
  }

  if (v.traceability !== undefined && !Array.isArray(v.traceability)) {
    return { valid: false, error: 'communityVisits.traceability must be an array of traceability items.' };
  }

  return { valid: true };
}

/**
 * Validates problem_matrix document
 */
export function validateProblemMatrix(data: unknown): ValidationResult {
  if (!Array.isArray(data) || data.length === 0) {
    return { valid: false, error: 'problemMatrix must be a non-empty array of problem dimensions.' };
  }

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (!item || typeof item !== 'object' || !item.id || !item.title || !item.problem || !item.action) {
      return { valid: false, error: `problemMatrix[${i}] requires id, title, problem, and action strings.` };
    }
  }

  return { valid: true };
}

/**
 * Validates survey_questions document
 */
export function validateSurveyQuestions(data: unknown): ValidationResult {
  if (!Array.isArray(data) || data.length === 0) {
    return { valid: false, error: 'surveyQuestions must be a non-empty array of survey questions.' };
  }

  for (let i = 0; i < data.length; i++) {
    const q = data[i];
    if (!q || typeof q !== 'object' || !q.id || !q.text || typeof q.text !== 'string') {
      return { valid: false, error: `surveyQuestions[${i}] requires string id and text.` };
    }
  }

  return { valid: true };
}

/* ========================================================================== */
/* RELATIONAL ENTITY VALIDATORS                                               */
/* ========================================================================== */

/**
 * Validates opportunities array
 */
export function validateOpportunitiesList(opportunities: unknown): ValidationResult {
  if (!Array.isArray(opportunities)) {
    return { valid: false, error: 'opportunities must be an array.' };
  }

  for (let i = 0; i < opportunities.length; i++) {
    const o = opportunities[i];
    if (!o || typeof o !== 'object' || !o.id || typeof o.id !== 'string' || !o.title || typeof o.title !== 'string') {
      return { valid: false, error: `Invalid opportunity at index ${i}: string id and title are required.` };
    }
    if (!o.employer || typeof o.employer !== 'string') {
      return { valid: false, error: `Invalid opportunity at index ${i}: employer string is required.` };
    }
    if (o.deadline !== undefined && !isValidDate(o.deadline)) {
      return { valid: false, error: `Invalid opportunity at index ${i}: deadline must be a valid date string (e.g. YYYY-MM-DD).` };
    }
    if (o.relevantDepartments !== undefined) {
      if (!Array.isArray(o.relevantDepartments) || o.relevantDepartments.some((d: any) => !(VALID_DEPARTMENTS as readonly string[]).includes(d))) {
        return { valid: false, error: `Invalid opportunity at index ${i}: relevantDepartments must be an array of: ${VALID_DEPARTMENTS.join(', ')}.` };
      }
    }
  }

  return { valid: true };
}

/**
 * Validates training sessions array
 */
export function validateTrainingSessionsList(sessions: unknown): ValidationResult {
  if (!Array.isArray(sessions)) {
    return { valid: false, error: 'trainingSessions must be an array.' };
  }

  for (let i = 0; i < sessions.length; i++) {
    const t = sessions[i];
    if (!t || typeof t !== 'object' || !t.id || typeof t.id !== 'string' || !t.title || typeof t.title !== 'string') {
      return { valid: false, error: `Invalid training session at index ${i}: string id and title are required.` };
    }
    const dept = t.department || t.targetDepartment;
    if (dept && !(VALID_DEPARTMENTS_WITH_ALL as readonly string[]).includes(dept)) {
      return { valid: false, error: `Invalid training session at index ${i}: department must be one of: ${VALID_DEPARTMENTS_WITH_ALL.join(', ')}.` };
    }
    const sched = t.schedule || t.scheduledAt;
    if (sched !== undefined && !isValidSchedule(sched)) {
      return { valid: false, error: `Invalid training session at index ${i}: schedule must be a valid date or recurring schedule.` };
    }
    if (t.capacity !== undefined) {
      const cap = Number(t.capacity);
      if (isNaN(cap) || !Number.isInteger(cap) || cap <= 0) {
        return { valid: false, error: `Invalid training session at index ${i}: capacity must be a positive integer.` };
      }
    }
  }

  return { valid: true };
}

/**
 * Validates survey responses array
 */
export function validateSurveyResponsesList(responses: unknown): ValidationResult {
  if (!Array.isArray(responses)) {
    return { valid: false, error: 'surveyResponses must be an array.' };
  }

  for (let i = 0; i < responses.length; i++) {
    const r = responses[i];
    if (!r || typeof r !== 'object' || !r.id || typeof r.id !== 'string') {
      return { valid: false, error: `Invalid survey response at index ${i}: string id is required.` };
    }
    if (r.department && !(VALID_DEPARTMENTS as readonly string[]).includes(r.department)) {
      return { valid: false, error: `Invalid survey response at index ${i}: department must be one of: ${VALID_DEPARTMENTS.join(', ')}.` };
    }
    if (r.satisfaction !== undefined) {
      const sat = parseSatisfaction(r.satisfaction);
      if (!sat.valid) {
        return { valid: false, error: `Invalid survey response at index ${i}: ${sat.value}` };
      }
    }
    if (r.trainingUsefulness !== undefined || r.training_usefulness !== undefined) {
      const train = parseTrainingUsefulness(r.trainingUsefulness ?? r.training_usefulness);
      if (!train.valid) {
        return { valid: false, error: `Invalid survey response at index ${i}: ${train.value}` };
      }
    }
  }

  return { valid: true };
}

/**
 * Validates employer outreach records
 */
export function validateEmployerOutreachList(outreach: unknown): ValidationResult {
  if (!Array.isArray(outreach)) {
    return { valid: false, error: 'employerOutreach must be an array.' };
  }

  for (let i = 0; i < outreach.length; i++) {
    const eo = outreach[i];
    if (!eo || typeof eo !== 'object' || !eo.id || !eo.employer) {
      return { valid: false, error: `Invalid employer outreach at index ${i}: id and employer are required.` };
    }
  }

  return { valid: true };
}

/**
 * Validates student applications with referential integrity
 */
export function validateApplicationsList(
  applications: unknown,
  existingOpportunityIds: Set<string>,
  existingStudentIds?: Set<string>
): ValidationResult {
  if (!Array.isArray(applications)) {
    return { valid: false, error: 'applications must be an array.' };
  }

  for (let i = 0; i < applications.length; i++) {
    const a = applications[i];
    if (!a || typeof a !== 'object' || !a.id) {
      return { valid: false, error: `Invalid application at index ${i}: id is required.` };
    }
    const oppId = a.opportunityId || a.opportunity_id;
    const studentId = a.studentId || a.student_id;
    if (!oppId || typeof oppId !== 'string') {
      return { valid: false, error: `Invalid application at index ${i}: opportunityId is required.` };
    }
    if (!studentId || typeof studentId !== 'string') {
      return { valid: false, error: `Invalid application at index ${i}: studentId is required.` };
    }
    if (!existingOpportunityIds.has(oppId)) {
      return {
        valid: false,
        error: `Referential Integrity Error: Application "${a.id}" references nonexistent opportunity "${oppId}".`,
      };
    }
    if (existingStudentIds && !existingStudentIds.has(studentId)) {
      return {
        valid: false,
        error: `Referential Integrity Error: Application "${a.id}" references nonexistent student "${studentId}".`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validates workshop enrollments with referential integrity
 */
export function validateWorkshopEnrollmentsList(
  enrollments: unknown,
  existingWorkshopIds: Set<string>,
  existingStudentIds?: Set<string>
): ValidationResult {
  if (!Array.isArray(enrollments)) {
    return { valid: false, error: 'workshopEnrollments must be an array.' };
  }

  for (let i = 0; i < enrollments.length; i++) {
    const w = enrollments[i];
    if (!w || typeof w !== 'object' || !w.id) {
      return { valid: false, error: `Invalid workshop enrollment at index ${i}: id is required.` };
    }
    const workshopId = w.workshopId || w.workshop_id;
    const studentId = w.studentId || w.student_id;
    if (!workshopId || typeof workshopId !== 'string') {
      return { valid: false, error: `Invalid workshop enrollment at index ${i}: workshopId is required.` };
    }
    if (!studentId || typeof studentId !== 'string') {
      return { valid: false, error: `Invalid workshop enrollment at index ${i}: studentId is required.` };
    }
    if (!existingWorkshopIds.has(workshopId)) {
      return {
        valid: false,
        error: `Referential Integrity Error: Workshop enrollment "${w.id}" references nonexistent workshop "${workshopId}".`,
      };
    }
    if (existingStudentIds && !existingStudentIds.has(studentId)) {
      return {
        valid: false,
        error: `Referential Integrity Error: Workshop enrollment "${w.id}" references nonexistent student "${studentId}".`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validates student profiles list
 */
export function validateStudentProfilesList(profiles: unknown): ValidationResult {
  if (!Array.isArray(profiles)) {
    return { valid: false, error: 'studentProfiles must be an array.' };
  }

  for (let i = 0; i < profiles.length; i++) {
    const p = profiles[i];
    if (!p || typeof p !== 'object' || !(p.studentId || p.student_id)) {
      return { valid: false, error: `Invalid student profile at index ${i}: studentId is required.` };
    }
  }

  return { valid: true };
}

/* ========================================================================== */
/* COMPREHENSIVE BACKUP RESTORE VALIDATOR                                     */
/* ========================================================================== */

/**
 * Pre-flight validator for full database backup restoration payloads.
 * Validates structural types, field-level constraints, and referential integrity.
 */
export function validateFullBackupPayload(
  payload: any,
  dbHelper?: {
    getOpportunityIds: () => string[];
    getWorkshopIds: () => string[];
    getUserIds: () => string[];
  }
): ValidationResult {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { valid: false, error: 'Backup payload must be a non-null JSON object.' };
  }

  // System documents validation
  const siteContent = payload.siteContent || payload.content;
  if (siteContent !== undefined) {
    const res = validateSiteContent(siteContent);
    if (!res.valid) return res;
  }

  const studyData = payload.studyData || payload.study;
  if (studyData !== undefined) {
    const res = validateStudyData(studyData);
    if (!res.valid) return res;
  }

  const communityVisits = payload.communityVisits;
  if (communityVisits !== undefined) {
    const res = validateCommunityVisits(communityVisits);
    if (!res.valid) return res;
  }

  const problemMatrix = payload.problemMatrix || payload.matrix;
  if (problemMatrix !== undefined) {
    const res = validateProblemMatrix(problemMatrix);
    if (!res.valid) return res;
  }

  const surveyQuestions = payload.surveyQuestions || payload.questions;
  if (surveyQuestions !== undefined) {
    const res = validateSurveyQuestions(surveyQuestions);
    if (!res.valid) return res;
  }

  // Relational entity validation
  const opportunities = payload.opportunities;
  if (opportunities !== undefined) {
    const res = validateOpportunitiesList(opportunities);
    if (!res.valid) return res;
  }

  const trainingSessions = payload.trainingSessions || payload.training;
  if (trainingSessions !== undefined) {
    const res = validateTrainingSessionsList(trainingSessions);
    if (!res.valid) return res;
  }

  const surveyResponses = payload.surveyResponses || payload.responses;
  if (surveyResponses !== undefined) {
    const res = validateSurveyResponsesList(surveyResponses);
    if (!res.valid) return res;
  }

  const employerOutreach = payload.employerOutreach || payload.outreach;
  if (employerOutreach !== undefined) {
    const res = validateEmployerOutreachList(employerOutreach);
    if (!res.valid) return res;
  }

  const studentProfiles = payload.studentProfiles;
  if (studentProfiles !== undefined) {
    const res = validateStudentProfilesList(studentProfiles);
    if (!res.valid) return res;
  }

  // Referential Integrity: Collect all available Opportunity, Workshop, and Student IDs
  const availableOpportunityIds = new Set<string>();
  const availableWorkshopIds = new Set<string>();
  const availableStudentIds = new Set<string>();

  if (dbHelper) {
    try {
      dbHelper.getOpportunityIds().forEach((id) => availableOpportunityIds.add(id));
      dbHelper.getWorkshopIds().forEach((id) => availableWorkshopIds.add(id));
      dbHelper.getUserIds().forEach((id) => availableStudentIds.add(id));
    } catch {
      // Graceful fallback if dbHelper encounters error
    }
  }

  if (Array.isArray(opportunities)) {
    opportunities.forEach((o: any) => {
      if (o?.id) availableOpportunityIds.add(o.id);
    });
  }

  if (Array.isArray(trainingSessions)) {
    trainingSessions.forEach((t: any) => {
      if (t?.id) availableWorkshopIds.add(t.id);
    });
  }

  // Applications referential check
  const applications = payload.applications;
  if (applications !== undefined) {
    const res = validateApplicationsList(applications, availableOpportunityIds, availableStudentIds.size > 0 ? availableStudentIds : undefined);
    if (!res.valid) return res;
  }

  // Workshop enrollments referential check
  const workshopEnrollments = payload.workshopEnrollments;
  if (workshopEnrollments !== undefined) {
    const res = validateWorkshopEnrollmentsList(workshopEnrollments, availableWorkshopIds, availableStudentIds.size > 0 ? availableStudentIds : undefined);
    if (!res.valid) return res;
  }

  return { valid: true };
}
