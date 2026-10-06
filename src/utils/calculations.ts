import {
  SurveyResponse,
  Department,
  AcademicYear,
  SourceType,
  ChartDatum,
  ResearchSummaryMetrics,
  SurveyResponsesSummary,
  RatingDistributionItem,
} from '../types/survey';

export type { ChartDatum, ResearchSummaryMetrics, SurveyResponsesSummary, RatingDistributionItem };

export interface FilterState {
  department: Department | 'All';
  year: AcademicYear | 'All';
  sourceType: SourceType | 'All';
  searchQuery?: string;
}

export interface RatingMetric {
  average: number | null;
  validCount: number;
  excludedCount: number;
  totalCount: number;
  distribution: { rating: number; count: number; percentage: number }[];
}

export function filterResponses(
  responses: SurveyResponse[],
  filters: FilterState
): SurveyResponse[] {
  return responses.filter((item) => {
    if (filters.department !== 'All' && item.department !== filters.department) {
      return false;
    }
    if (filters.year !== 'All' && item.year !== filters.year) {
      return false;
    }
    if (filters.sourceType !== 'All' && item.sourceType !== filters.sourceType) {
      return false;
    }
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      const matchText = `${item.id} ${item.preferredRole} ${item.review} ${item.suggestion} ${item.biggestBarrier} ${item.urgentSupport}`.toLowerCase();
      if (!matchText.includes(q)) {
        return false;
      }
    }
    return true;
  });
}

export function calculateSummaryMetrics(responses: SurveyResponse[]): ResearchSummaryMetrics {
  const total = responses.length;
  if (total === 0) {
    return {
      totalResponses: 0,
      simulatedCount: 0,
      collectedCount: 0,
      departmentsRepresented: 0,
      partlyOrUnmetPercentage: 0,
      partlyOrUnmetCount: 0,
      partlyOrUnmetDenominator: 0,
      lateOrRareInfoPercentage: 0,
      lateOrRareInfoCount: 0,
      lateOrRareInfoDenominator: 0,
      averageSatisfaction: null,
      validSatisfactionCount: 0,
      averageTrainingUsefulness: null,
      validTrainingCount: 0,
    };
  }

  const simulatedCount = responses.filter((r) => r.sourceType === 'simulated').length;
  const collectedCount = responses.filter((r) => r.sourceType === 'collected').length;

  const uniqueDepts = new Set(responses.map((r) => r.department));

  // Partly or Unmet needs
  // Denominator: responses where needsMet is Yes, Partly, or No (excluding 'Not enough experience to judge' if calculating among valid judgements, or total filtered. Let's provide explicit valid denominator)
  const validNeedsResponses = responses.filter(
    (r) => r.needsMet === 'Yes' || r.needsMet === 'Partly' || r.needsMet === 'No'
  );
  const partlyOrUnmet = validNeedsResponses.filter(
    (r) => r.needsMet === 'Partly' || r.needsMet === 'No'
  );
  const partlyOrUnmetPercentage =
    validNeedsResponses.length > 0
      ? Math.round((partlyOrUnmet.length / validNeedsResponses.length) * 1000) / 10
      : 0;

  // Timeliness: Sometimes or Rarely or Never
  const validTimelinessResponses = responses.filter((r) => r.informationTimeliness !== 'Not applicable');
  const lateOrRareInfo = validTimelinessResponses.filter(
    (r) =>
      r.informationTimeliness === 'Sometimes' ||
      r.informationTimeliness === 'Rarely' ||
      r.informationTimeliness === 'Never'
  );
  const lateOrRareInfoPercentage =
    validTimelinessResponses.length > 0
      ? Math.round((lateOrRareInfo.length / validTimelinessResponses.length) * 1000) / 10
      : 0;

  // Satisfaction ratings
  const validSat = responses.filter((r) => typeof r.satisfaction === 'number') as (SurveyResponse & {
    satisfaction: number;
  })[];
  const avgSat =
    validSat.length > 0
      ? Math.round(
          (validSat.reduce((acc, cur) => acc + cur.satisfaction, 0) / validSat.length) * 100
        ) / 100
      : null;

  // Training ratings
  const validTraining = responses.filter(
    (r) => typeof r.trainingUsefulness === 'number'
  ) as (SurveyResponse & { trainingUsefulness: number })[];
  const avgTraining =
    validTraining.length > 0
      ? Math.round(
          (validTraining.reduce((acc, cur) => acc + cur.trainingUsefulness, 0) /
            validTraining.length) *
            100
        ) / 100
      : null;

  return {
    totalResponses: total,
    simulatedCount,
    collectedCount,
    departmentsRepresented: uniqueDepts.size,
    partlyOrUnmetPercentage,
    partlyOrUnmetCount: partlyOrUnmet.length,
    partlyOrUnmetDenominator: validNeedsResponses.length,
    lateOrRareInfoPercentage,
    lateOrRareInfoCount: lateOrRareInfo.length,
    lateOrRareInfoDenominator: validTimelinessResponses.length,
    averageSatisfaction: avgSat,
    validSatisfactionCount: validSat.length,
    averageTrainingUsefulness: avgTraining,
    validTrainingCount: validTraining.length,
  };
}

export function getDepartmentDistribution(responses: SurveyResponse[]): ChartDatum[] {
  const depts: Department[] = [
    'Computer Science (CS)',
    'Information Technology (IT)',
    'Data Science (DS)',
  ];
  const colors: Record<Department, string> = {
    'Computer Science (CS)': '#2563EB',
    'Information Technology (IT)': '#7C3AED',
    'Data Science (DS)': '#0F766E',
  };

  const total = responses.length;
  return depts.map((d) => {
    const count = responses.filter((r) => r.department === d).length;
    const percentage = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
    return {
      name: d,
      count,
      percentage,
      color: colors[d],
    };
  });
}

export function getNeedsMetDistribution(responses: SurveyResponse[]): ChartDatum[] {
  const options = ['Yes', 'Partly', 'No', 'Not enough experience to judge'];
  const colors: Record<string, string> = {
    'Yes': '#15803D',
    'Partly': '#B45309',
    'No': '#B91C1C',
    'Not enough experience to judge': '#64748B',
  };

  const total = responses.length;
  return options.map((opt) => {
    const count = responses.filter((r) => r.needsMet === opt).length;
    const percentage = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
    return {
      name: opt,
      count,
      percentage,
      color: colors[opt],
    };
  });
}

export function getRelevantDrivesDistribution(responses: SurveyResponse[]): ChartDatum[] {
  const options = ['0', '1–2', '3 or more', 'Not sure'];
  const colors = ['#B91C1C', '#D97706', '#2563EB', '#64748B'];
  const total = responses.length;

  return options.map((opt, i) => {
    const count = responses.filter((r) => r.relevantDrives === opt).length;
    const percentage = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
    return {
      name: opt === '3 or more' ? '3+ drives reported' : opt === '0' ? '0 drives' : opt === '1–2' ? '1–2 drives' : 'Not sure',
      count,
      percentage,
      color: colors[i],
    };
  });
}

export function getTimelinessDistribution(responses: SurveyResponse[]): ChartDatum[] {
  const options = ['Always', 'Sometimes', 'Rarely', 'Never', 'Not applicable'];
  const colors = ['#15803D', '#D97706', '#EA580C', '#B91C1C', '#64748B'];
  const total = responses.length;

  return options.map((opt, i) => {
    const count = responses.filter((r) => r.informationTimeliness === opt).length;
    const percentage = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
    return {
      name: opt,
      count,
      percentage,
      color: colors[i],
    };
  });
}

export function getBarriersDistribution(responses: SurveyResponse[]): ChartDatum[] {
  const barrierCounts: Record<string, number> = {};
  responses.forEach((r) => {
    barrierCounts[r.biggestBarrier] = (barrierCounts[r.biggestBarrier] || 0) + 1;
  });

  const total = responses.length;
  return Object.entries(barrierCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
      color: '#7C3AED',
    }));
}

export function getUrgentSupportDistribution(responses: SurveyResponse[]): ChartDatum[] {
  const supportCounts: Record<string, number> = {};
  responses.forEach((r) => {
    supportCounts[r.urgentSupport] = (supportCounts[r.urgentSupport] || 0) + 1;
  });

  const total = responses.length;
  return Object.entries(supportCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
      color: '#0F766E',
    }));
}

export function getRatingMetric(
  responses: SurveyResponse[],
  field: 'trainingUsefulness' | 'satisfaction'
): RatingMetric {
  const totalCount = responses.length;
  const validResponses = responses.filter(
    (r) => typeof r[field] === 'number'
  ) as (SurveyResponse & { [K in typeof field]: number })[];

  const validCount = validResponses.length;
  const excludedCount = totalCount - validCount;

  const average =
    validCount > 0
      ? Math.round(
          (validResponses.reduce((sum, item) => sum + (item[field] as number), 0) / validCount) * 100
        ) / 100
      : null;

  const distribution = [1, 2, 3, 4, 5].map((star) => {
    const count = validResponses.filter((r) => r[field] === star).length;
    return {
      rating: star,
      count,
      percentage: validCount > 0 ? Math.round((count / validCount) * 1000) / 10 : 0,
    };
  });

  return {
    average,
    validCount,
    excludedCount,
    totalCount,
    distribution,
  };
}
