import React from 'react';
import { AdminAnalyticsData } from '../../types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  ShieldCheck,
  Users,
  CheckCircle,
  Activity,
  Sparkles,
  Lock,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

interface AggregatedAnalyticsDashboardProps {
  data: AdminAnalyticsData | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  ACADEMIC: '#F59E0B',
  EMOTIONAL: '#10B981',
  SLEEP: '#6366F1',
  PHYSICAL: '#14B8A6',
  SOCIAL: '#EC4899',
  GENERAL: '#94A3B8',
};

export const AggregatedAnalyticsDashboard: React.FC<AggregatedAnalyticsDashboardProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        <Activity className="w-8 h-8 mx-auto mb-2 animate-spin text-emerald-600" />
        <p>Calculating anonymized campus wellness telemetry...</p>
      </div>
    );
  }

  const { overview, riskDistribution, categoryDistribution, moodTrendsOverTime, programStats } = data;

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Header Alert */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs text-emerald-900">
        <div className="flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
          <p>
            <strong>Zero-PII Anonymization Guard Active:</strong> All individual student responses and identifiers are strictly redacted. Aggregates represent cohort trends across the university.
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase bg-white text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
          Institutional Tier
        </span>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Students</span>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{overview.totalStudents}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {overview.consentRate}% Onboarded
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Active Counselors</span>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{overview.totalCounselors}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Assigned Caseloads</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Surveys Completed</span>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{overview.totalSurveysCompleted}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Validated Assessments</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Mood Check-Ins</span>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{overview.totalMoodsLogged}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Total Telemetry Entries</p>
        </div>
      </div>

      {/* Charts Row 1: Campus Risk Breakdown & Top Stress Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Cohort Stratification
            </span>
            <h4 className="font-bold text-sm text-slate-800 mt-2">Campus Risk Distribution</h4>
            <p className="text-xs text-slate-500">Percentage of student body in each support tier.</p>
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} Students (${item.payload.percentage}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            {riskDistribution.map(r => (
              <div key={r.name} className="p-2 rounded-xl bg-slate-50">
                <span className="text-[10px] text-slate-500 block truncate">{r.name}</span>
                <span className="text-xs font-bold text-slate-800">{r.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Stress Categories Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Stressor Attribution
            </span>
            <h4 className="font-bold text-sm text-slate-800 mt-2">Top Wellness Strain Factors</h4>
            <p className="text-xs text-slate-500">
              Primary challenge areas identified across academic, sleep, and emotional screeners.
            </p>
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {categoryDistribution.map((entry, index) => (
                    <Cell
                      key={`cat-${index}`}
                      fill={CATEGORY_COLORS[entry.category] || '#10B981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-500 text-center border-t border-slate-100 pt-3">
            Academic workload and sleep deprivation account for the majority of campus strain.
          </p>
        </div>
      </div>

      {/* Campus Mood Rhythm Over Time */}
      <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Temporal Trajectory
            </span>
            <h4 className="font-bold text-sm text-slate-800 mt-1">Campus Longitudinal Mood Average</h4>
            <p className="text-xs text-slate-500">
              Aggregated daily campus average (1=Low, 5=Thriving) to identify midterms or finals fatigue cycles.
            </p>
          </div>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={moodTrendsOverTime} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="adminMoodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10 }} tickLine={false} />
              <Tooltip
                formatter={(val: any, name: any, item: any) => [
                  `${val} / 5.0 (${item.payload.totalCheckIns} check-ins)`,
                  'Campus Average Mood',
                ]}
              />
              <Area
                type="monotone"
                dataKey="averageMood"
                stroke="#059669"
                strokeWidth={2.5}
                fill="url(#adminMoodGrad)"
                dot={{ r: 3, fill: '#059669' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Program / Department Wellness Summary Table */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
        <h4 className="font-bold text-sm text-slate-800 mb-1">Academic Program Wellbeing Indices</h4>
        <p className="text-xs text-slate-500 mb-4">
          Anonymized departmental stress patterns to guide targeted academic support initiatives.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[10px] uppercase">
                <th className="py-2.5 px-3">Program / Major</th>
                <th className="py-2.5 px-3">Active Cohort</th>
                <th className="py-2.5 px-3">Needs Attention Rate</th>
                <th className="py-2.5 px-3">Wellness Health Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {programStats.map(p => (
                <tr key={p.program} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-800">{p.program}</td>
                  <td className="py-3 px-3 text-slate-600">{p.enrolledCount} students</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        p.needsAttentionPercent > 30
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.needsAttentionPercent}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-700">
                    {p.averageWellnessIndex} / 100
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
