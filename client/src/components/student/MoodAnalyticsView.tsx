import React, { useState } from 'react';
import { MoodEntry, MoodStats } from '../../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import { Calendar, TrendingUp, Sparkles, Activity } from 'lucide-react';

interface MoodAnalyticsViewProps {
  entries: MoodEntry[];
  stats: MoodStats | null;
}

export const MoodAnalyticsView: React.FC<MoodAnalyticsViewProps> = ({ entries, stats }) => {
  const [viewMode, setViewMode] = useState<'line' | 'heatmap'>('line');

  // Format line chart data
  const chartData = entries.map(e => ({
    date: new Date(e.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: e.entryDate,
    mood: e.moodValue,
    tags: e.emotionTags.join(', '),
    note: e.note,
  }));

  // Build 30-day calendar grid for heatmap
  const buildHeatmapDays = () => {
    const days = [];
    const dateMap = new Map(entries.map(e => [e.entryDate, e]));
    const today = new Date();

    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const entry = dateMap.get(dStr);

      days.push({
        dateStr: dStr,
        dayNumber: d.getDate(),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        entry,
      });
    }
    return days;
  };

  const heatmapDays = buildHeatmapDays();

  const getHeatmapColor = (mood?: number) => {
    if (!mood) return 'bg-slate-100/80 border-slate-200 text-slate-400';
    if (mood === 5) return 'bg-teal-500 border-teal-600 text-white shadow-sm';
    if (mood === 4) return 'bg-emerald-400 border-emerald-500 text-white shadow-sm';
    if (mood === 3) return 'bg-emerald-100 border-emerald-300 text-emerald-900';
    if (mood === 2) return 'bg-amber-200 border-amber-300 text-amber-900';
    return 'bg-rose-300 border-rose-400 text-rose-950';
  };

  const getMoodWord = (val: number) => {
    if (val === 5) return 'Thriving (5/5)';
    if (val === 4) return 'Good (4/5)';
    if (val === 3) return 'Okay (3/5)';
    if (val === 2) return 'Difficult (2/5)';
    return 'Struggling (1/5)';
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-200/80">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            Wellness Trends
          </span>
          <h3 className="text-xl font-bold text-slate-800 mt-1">Your Wellbeing Journey</h3>
          <p className="text-xs text-slate-500">Visualizing your emotional rhythm over the past 30 days.</p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-xs font-semibold">
          <button
            onClick={() => setViewMode('line')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'line' ? 'bg-white text-emerald-800 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Trend Line
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'heatmap' ? 'bg-white text-emerald-800 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Calendar Heatmap
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
          <p className="text-xs font-semibold text-slate-600">No mood entries logged yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Complete your first daily check-in above to visualize your trends!</p>
        </div>
      ) : (
        <>
          {viewMode === 'line' ? (
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.7} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-200 text-xs">
                            <p className="font-bold text-slate-800">{data.fullDate}</p>
                            <p className="text-emerald-600 font-semibold mt-0.5">{getMoodWord(data.mood)}</p>
                            {data.tags && (
                              <p className="text-slate-500 text-[11px] mt-1">
                                <strong>Tags:</strong> {data.tags}
                              </p>
                            )}
                            {data.note && (
                              <p className="text-slate-600 text-[11px] mt-1 italic max-w-xs">
                                "{data.note}"
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="#059669"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#moodGradient)"
                    dot={{ fill: '#059669', stroke: '#fff', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            /* Calendar Heatmap */
            <div>
              <div className="grid grid-cols-7 gap-2">
                {heatmapDays.map((d, idx) => {
                  const hasEntry = Boolean(d.entry);
                  return (
                    <div
                      key={idx}
                      className={`h-16 rounded-2xl border p-2 flex flex-col justify-between transition-transform hover:scale-105 cursor-pointer ${getHeatmapColor(
                        d.entry?.moodValue
                      )}`}
                      title={`${d.dateStr}: ${
                        d.entry ? getMoodWord(d.entry.moodValue) : 'No entry logged'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-semibold opacity-90">
                        <span>{d.dayName}</span>
                        <span>{d.dayNumber}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-bold">
                          {hasEntry ? d.entry?.moodValue : '—'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Lower / Struggling</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-300 inline-block" />
                  <span className="w-3 h-3 rounded bg-amber-200 inline-block" />
                  <span className="w-3 h-3 rounded bg-emerald-100 inline-block" />
                  <span className="w-3 h-3 rounded bg-emerald-400 inline-block" />
                  <span className="w-3 h-3 rounded bg-teal-500 inline-block" />
                </div>
                <span>Optimal / Thriving</span>
              </div>
            </div>
          )}

          {/* Quick Summary Pill Bar */}
          {stats && (
            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 text-center">
              <div className="bg-slate-50 p-2.5 rounded-2xl">
                <span className="text-xs text-slate-500 block">30-Day Check-Ins</span>
                <span className="text-base font-bold text-slate-800">{stats.totalLogged} days</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-2xl">
                <span className="text-xs text-slate-500 block">Average Mood</span>
                <span className="text-base font-bold text-emerald-700">{stats.averageMood} / 5.0</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-2xl">
                <span className="text-xs text-slate-500 block">Current Streak</span>
                <span className="text-base font-bold text-amber-600">{stats.streakDays} days 🔥</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
