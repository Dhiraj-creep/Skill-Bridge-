import { SurveyResponse } from '../types/survey';

// Protect against CSV spreadsheet formula injection (=, +, -, @, \t, \r)
export function sanitizeForCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  let str = String(value);

  // If starts with risky character, prepend a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportResponsesToCSV(responses: SurveyResponse[]): string {
  const headers = [
    'ID',
    'Department',
    'Year',
    'Preferred Role',
    'Relevant Drives',
    'Needs Met',
    'Information Timeliness',
    'Training Usefulness (1-5/Have not attended)',
    'Biggest Barrier',
    'Urgent Support',
    'Satisfaction (1-5/Not judged)',
    'Review',
    'Suggestion',
    'Source Type',
    'Collection Date',
    'Questionnaire Version',
  ];

  const rows = responses.map((r) => [
    sanitizeForCSV(r.id),
    sanitizeForCSV(r.department),
    sanitizeForCSV(r.year),
    sanitizeForCSV(r.preferredRole),
    sanitizeForCSV(r.relevantDrives),
    sanitizeForCSV(r.needsMet),
    sanitizeForCSV(r.informationTimeliness),
    sanitizeForCSV(r.trainingUsefulness),
    sanitizeForCSV(r.biggestBarrier),
    sanitizeForCSV(r.urgentSupport),
    sanitizeForCSV(r.satisfaction),
    sanitizeForCSV(r.review),
    sanitizeForCSV(r.suggestion),
    sanitizeForCSV(r.sourceType),
    sanitizeForCSV(r.collectionDate || ''),
    sanitizeForCSV(r.questionnaireVersion),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
}

export function generateCSVTemplate(): string {
  const headers = [
    'ID',
    'Department',
    'Year',
    'Preferred Role',
    'Relevant Drives',
    'Needs Met',
    'Information Timeliness',
    'Training Usefulness (1-5/Have not attended)',
    'Biggest Barrier',
    'Urgent Support',
    'Satisfaction (1-5/Not judged)',
    'Review',
    'Suggestion',
    'Source Type',
    'Collection Date',
    'Questionnaire Version',
  ];

  const sampleRows = [
    [
      'C001',
      'Computer Science (CS)',
      'Fourth',
      'Cloud DevOps Engineer',
      '1–2',
      'Partly',
      'Sometimes',
      '3',
      'Skill gaps',
      'Technical training',
      '3',
      'Good baseline exposure but core cloud labs are missing.',
      'Conduct AWS and Docker container practical clinics.',
      'collected',
      '2026-10-01',
      'v1.0',
    ],
    [
      'C002',
      'Data Science (DS)',
      'Third',
      'Machine Learning Engineer',
      '0',
      'No',
      'Rarely',
      'Have not attended',
      'Limited relevant roles',
      'Relevant employer connections',
      '2',
      'Not enough ML firms visiting campus this semester.',
      'Invite regional tech startups for campus interviews.',
      'collected',
      '2026-10-01',
      'v1.0',
    ],
  ];

  return [headers.join(','), ...sampleRows.map((r) => r.map(sanitizeForCSV).join(','))].join('\r\n');
}

// Simple RFC 4180 CSV parser
export function parseCSV(csvText: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let curVal = '';

  const cleanText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        curVal += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        curVal += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(curVal.trim());
        curVal = '';
      } else if (char === '\n') {
        row.push(curVal.trim());
        if (row.some((cell) => cell.length > 0)) {
          result.push(row);
        }
        row = [];
        curVal = '';
      } else {
        curVal += char;
      }
    }
  }

  if (curVal.length > 0 || row.length > 0) {
    row.push(curVal.trim());
    if (row.some((cell) => cell.length > 0)) {
      result.push(row);
    }
  }

  return result;
}

export function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
