import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { SurveyResponse, SurveyResponsesSummary } from '../../types/survey';
import {
  getDepartmentDistribution,
  getNeedsMetDistribution,
  getRelevantDrivesDistribution,
  getTimelinessDistribution,
  getBarriersDistribution,
  getUrgentSupportDistribution,
  getRatingMetric,
} from '../../utils/calculations';
import { AccessibleDataTable } from './AccessibleDataTable';

interface ResearchChartsProps {
  responses?: SurveyResponse[];
  summaryData?: SurveyResponsesSummary | null;
}

export const ResearchCharts: React.FC<ResearchChartsProps> = ({ responses, summaryData }) => {
  const hasRawResponses = Array.isArray(responses) && responses.length > 0;
  const total = hasRawResponses ? responses.length : (summaryData?.totalResponses || 0);

  if (total === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
        <p className="text-slate-600 font-medium">No survey responses match the active filter criteria.</p>
        <p className="text-slate-400 text-xs mt-1">Adjust or reset your department, year, or source-type filters to view data charts.</p>
      </div>
    );
  }

  // Data calculations
  const deptData = hasRawResponses ? getDepartmentDistribution(responses) : (summaryData?.departmentDistribution || []);
  const needsData = hasRawResponses ? getNeedsMetDistribution(responses) : (summaryData?.needsMetDistribution || []);
  const drivesData = hasRawResponses ? getRelevantDrivesDistribution(responses) : (summaryData?.relevantDrivesDistribution || []);
  const timelinessData = hasRawResponses ? getTimelinessDistribution(responses) : (summaryData?.timelinessDistribution || []);
  const barriersData = hasRawResponses ? getBarriersDistribution(responses) : (summaryData?.barriersDistribution || []);
  const urgentSupportData = hasRawResponses ? getUrgentSupportDistribution(responses) : (summaryData?.urgentSupportDistribution || []);
  const trainingMetric = hasRawResponses
    ? getRatingMetric(responses, 'trainingUsefulness')
    : {
        average: summaryData?.averageTrainingUsefulness ?? null,
        validCount: summaryData?.validTrainingCount ?? 0,
        excludedCount: summaryData?.trainingExcludedCount ?? 0,
        totalCount: summaryData?.totalResponses ?? 0,
        distribution: summaryData?.trainingDistribution || [],
      };
  const satisfactionMetric = hasRawResponses
    ? getRatingMetric(responses, 'satisfaction')
    : {
        average: summaryData?.averageSatisfaction ?? null,
        validCount: summaryData?.validSatisfactionCount ?? 0,
        excludedCount: summaryData?.satisfactionExcludedCount ?? 0,
        totalCount: summaryData?.totalResponses ?? 0,
        distribution: summaryData?.satisfactionDistribution || [],
      };

  return (
    <div className="space-y-8">
      {/* Grid Row 1: Department Distribution & Needs Met */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Department Representation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-800 text-sm">Department Representation</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              N = {total}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Proportion of responses by engineering and business disciplines.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#475569' }}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} responses (${item.payload.percentage}%)`,
                    'Count',
                  ]}
                  contentStyle={{ borderRadius: 8, fontSize: 12, borderColor: '#CBD5E1' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#2563EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <AccessibleDataTable
            title="Department Representation"
            headers={['Department', 'Count', 'Percentage']}
            rows={deptData.map((d) => [d.name, d.count, `${d.percentage}%`])}
            totalRow={['Total Filtered', total, '100%']}
          />
        </div>

        {/* Chart 2: Needs Met by Placement Cell */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-800 text-sm">Placement Needs Met</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              N = {total}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Response to: "Is the placement cell currently meeting your placement-related needs?"
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={needsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {needsData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color || '#64748B'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} students (${item.payload.percentage}%)`,
                    item.payload.name,
                  ]}
                  contentStyle={{ borderRadius: 8, fontSize: 12, borderColor: '#CBD5E1' }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <AccessibleDataTable
            title="Placement Needs Met"
            headers={['Status', 'Count', 'Percentage']}
            rows={needsData.map((d) => [d.name, d.count, `${d.percentage}%`])}
            totalRow={['Total Filtered', total, '100%']}
          />
        </div>
      </div>

      {/* Grid Row 2: Relevant Drives & Information Timeliness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Relevant Drives Reported */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-800 text-sm">Relevant Recruitment Drives Reported</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              N = {total}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Reported campus drives offering roles aligned with student target domain this academic year.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={drivesData} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} responses (${item.payload.percentage}%)`,
                    'Count',
                  ]}
                  contentStyle={{ borderRadius: 8, fontSize: 12, borderColor: '#CBD5E1' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {drivesData.map((entry, index) => (
                    <Cell key={`drives-cell-${index}`} fill={entry.color || '#2563EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <AccessibleDataTable
            title="Relevant Drives Reported"
            headers={['Drives Reported', 'Count', 'Percentage']}
            rows={drivesData.map((d) => [d.name, d.count, `${d.percentage}%`])}
            totalRow={['Total Filtered', total, '100%']}
            caption="Note: Drive count indicates recruitment drives reported by students, not unique corporate entities."
          />
        </div>

        {/* Chart 4: Notice & Information Timeliness */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-800 text-sm">Placement Information Timeliness</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              N = {total}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Frequency with which students receive notices early enough to prepare and apply.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelinessData} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} responses (${item.payload.percentage}%)`,
                    'Count',
                  ]}
                  contentStyle={{ borderRadius: 8, fontSize: 12, borderColor: '#CBD5E1' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {timelinessData.map((entry, index) => (
                    <Cell key={`time-cell-${index}`} fill={entry.color || '#D97706'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <AccessibleDataTable
            title="Information Timeliness"
            headers={['Timeliness Rating', 'Count', 'Percentage']}
            rows={timelinessData.map((d) => [d.name, d.count, `${d.percentage}%`])}
            totalRow={['Total Filtered', total, '100%']}
          />
        </div>
      </div>

      {/* Grid Row 3: Biggest Barriers & Urgent Support (Horizontal Bars) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 5: Biggest Barriers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-800 text-sm">Biggest Placement Barriers</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              N = {total}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Primary obstacles preventing students from securing suitable placement roles.
          </p>

          <div className="space-y-2.5">
            {barriersData.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span className="text-slate-500 font-semibold">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand-purple h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <AccessibleDataTable
            title="Biggest Placement Barriers"
            headers={['Reported Barrier', 'Count', 'Percentage']}
            rows={barriersData.map((d) => [d.name, d.count, `${d.percentage}%`])}
            totalRow={['Total Filtered', total, '100%']}
          />
        </div>

        {/* Chart 6: Urgent Support Needed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-800 text-sm">Most Urgent Placement Support Needed</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              N = {total}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Most pressing intervention requested by respondents from the placement department.
          </p>

          <div className="space-y-2.5">
            {urgentSupportData.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span className="text-slate-500 font-semibold">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand-teal h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <AccessibleDataTable
            title="Urgent Support Needed"
            headers={['Support Type', 'Count', 'Percentage']}
            rows={urgentSupportData.map((d) => [d.name, d.count, `${d.percentage}%`])}
            totalRow={['Total Filtered', total, '100%']}
          />
        </div>
      </div>

      {/* Grid Row 4: Ratings - Training Usefulness & Satisfaction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating 1: Training Usefulness */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-800 text-sm">Placement Training Usefulness (1–5)</h3>
            <div className="text-right">
              <span className="text-xs bg-brand-teal/10 text-brand-teal font-bold px-2 py-0.5 rounded-full">
                Avg: {trainingMetric.average !== null ? `${trainingMetric.average} / 5` : 'N/A'}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Valid numeric ratings: {trainingMetric.validCount} | Excluded (Have not attended):{' '}
            {trainingMetric.excludedCount}
          </p>

          <div className="space-y-2">
            {trainingMetric.distribution.map((d) => (
              <div key={d.rating} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-medium text-slate-600">{d.rating} Star</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand-teal h-2 rounded-full"
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
                <span className="w-16 text-right text-slate-500">
                  {d.count} ({d.percentage}%)
                </span>
              </div>
            ))}
          </div>

          <AccessibleDataTable
            title="Training Usefulness Breakdown"
            headers={['Rating (1-5)', 'Valid Responses', 'Percentage of Valid']}
            rows={trainingMetric.distribution.map((d) => [
              `${d.rating} Star`,
              d.count,
              `${d.percentage}%`,
            ])}
            totalRow={[
              'Valid Responses Total',
              trainingMetric.validCount,
              `Average: ${trainingMetric.average ?? 'N/A'}`,
            ]}
            caption={`Calculation rules: Non-numeric 'Have not attended' (${trainingMetric.excludedCount} responses) are strictly excluded from average score calculation.`}
          />
        </div>

        {/* Rating 2: Overall Satisfaction */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-800 text-sm">Overall Placement Satisfaction (1–5)</h3>
            <div className="text-right">
              <span className="text-xs bg-brand-purple/10 text-brand-purple font-bold px-2 py-0.5 rounded-full">
                Avg: {satisfactionMetric.average !== null ? `${satisfactionMetric.average} / 5` : 'N/A'}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Valid numeric ratings: {satisfactionMetric.validCount} | Excluded (Not judged):{' '}
            {satisfactionMetric.excludedCount}
          </p>

          <div className="space-y-2">
            {satisfactionMetric.distribution.map((d) => (
              <div key={d.rating} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-medium text-slate-600">{d.rating} Star</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand-purple h-2 rounded-full"
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
                <span className="w-16 text-right text-slate-500">
                  {d.count} ({d.percentage}%)
                </span>
              </div>
            ))}
          </div>

          <AccessibleDataTable
            title="Overall Satisfaction Breakdown"
            headers={['Rating (1-5)', 'Valid Responses', 'Percentage of Valid']}
            rows={satisfactionMetric.distribution.map((d) => [
              `${d.rating} Star`,
              d.count,
              `${d.percentage}%`,
            ])}
            totalRow={[
              'Valid Responses Total',
              satisfactionMetric.validCount,
              `Average: ${satisfactionMetric.average ?? 'N/A'}`,
            ]}
            caption={`Calculation rules: 'Not enough experience to judge' responses (${satisfactionMetric.excludedCount}) are excluded from the numeric average denominator.`}
          />
        </div>
      </div>
    </div>
  );
};
