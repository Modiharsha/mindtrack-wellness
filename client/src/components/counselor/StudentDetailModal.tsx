import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StudentDetailData } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import {
  X,
  Calendar,
  BookOpen,
  TrendingUp,
  FileText,
  Plus,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface StudentDetailModalProps {
  studentProfileId: string;
  onClose: () => void;
  onRefreshList: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  studentProfileId,
  onClose,
  onRefreshList,
}) => {
  const [data, setData] = useState<StudentDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trends' | 'surveys' | 'notes' | 'risk'>('trends');

  // New note form
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const res = await api.getStudentDetail(studentProfileId);
      setData(res.student);
    } catch (err) {
      console.error('Failed to load student detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [studentProfileId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setAddingNote(true);
    try {
      await api.addCounselorNote({
        studentId: studentProfileId,
        noteContent: newNote.trim(),
        isPrivate: true,
      });

      setNewNote('');
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 3000);
      loadDetails();
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleResolveRisk = async (riskId: string) => {
    try {
      await api.resolveRiskAssessment(riskId);
      loadDetails();
      onRefreshList();
    } catch (err) {
      console.error('Failed to resolve risk:', err);
    }
  };

  if (!data && loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
          <p className="text-sm font-semibold text-slate-600">Loading confidential student profile...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const latestRisk = data.riskHistory[0];

  const chartData = data.moodHistory.map(m => ({
    date: new Date(m.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: m.moodValue,
    tags: m.emotionTags.join(', '),
    note: m.note,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-6 md:p-7 border-b border-slate-100 flex items-start justify-between bg-slate-50/70 rounded-t-3xl">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl border border-emerald-200">
              {data.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-800">{data.name}</h2>
                <RiskBadge level={latestRisk?.riskLevel || 'LOW'} size="sm" />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {data.program} • Class of {data.graduationYear} • {data.email}
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                Primary Factor: {latestRisk?.primaryCategory || 'General'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 bg-white">
          <button
            onClick={() => setActiveTab('trends')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'trends'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> 30-Day Mood Trajectory
          </button>
          <button
            onClick={() => setActiveTab('surveys')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'surveys'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Survey Assessments ({data.surveyHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'risk'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Risk Factors & Triage
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Private Clinical Notes ({data.notes.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1">
          {/* TAB 1: Mood Trends Chart */}
          {activeTab === 'trends' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-800">30-Day Longitudinal Mood Trajectory</h4>
              <p className="text-xs text-slate-500">
                1 (Struggling/Depleted) to 5 (Thriving/Optimal). Hover over data points to read notes and distress tags.
              </p>

              {chartData.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No mood check-ins recorded yet.</p>
              ) : (
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="counselorMoodGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                      <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} tickLine={false} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-200 text-xs">
                                <p className="font-bold text-slate-800">{d.date} — Mood: {d.mood}/5</p>
                                {d.tags && <p className="text-slate-500 mt-1">Tags: {d.tags}</p>}
                                {d.note && <p className="text-slate-600 mt-1 italic">"{d.note}"</p>}
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
                        fill="url(#counselorMoodGrad)"
                        dot={{ fill: '#059669', r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Survey History */}
          {activeTab === 'surveys' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-800">Submitted Screening Responses</h4>
              {data.surveyHistory.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No survey assessments completed.</p>
              ) : (
                <div className="space-y-3">
                  {data.surveyHistory.map(s => (
                    <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800 text-sm">{s.title}</span>
                          <span className="ml-2 text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {s.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <RiskBadge level={s.riskLevel} size="sm" />
                          <span className="text-[10px] text-slate-400">
                            {new Date(s.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-600 font-semibold">Total Score: {s.score} points</p>
                      {s.summary && <p className="text-slate-500 italic">"{s.summary}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Risk Factors & Triage */}
          {activeTab === 'risk' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-800">Risk Assessment Audit Trail</h4>
              {data.riskHistory.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No risk flags logged.</p>
              ) : (
                <div className="space-y-3">
                  {data.riskHistory.map(r => (
                    <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RiskBadge level={r.riskLevel} size="sm" />
                          <span className="font-bold text-slate-700">{r.primaryCategory} Stressor</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">
                            Generated: {new Date(r.generatedAt).toLocaleDateString()}
                          </span>
                          {!r.isResolved ? (
                            <button
                              onClick={() => handleResolveRisk(r.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700"
                            >
                              Mark Resolved
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Resolved
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <p className="font-semibold text-slate-700 text-[11px] mb-1">Contributing Factors:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                          {r.contributingFactors.map((f, idx) => (
                            <li key={idx}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Private Clinical Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-600" /> Private Clinical Notes Ledger
                  </h4>
                  <p className="text-xs text-slate-500">
                    Confidential counselor notes. Hidden from students, administrators, and peers.
                  </p>
                </div>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Add New Counselor Note
                </label>
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Record clinical observations, action items, or check-in summaries..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-emerald-700 font-medium">
                    {noteSuccess && '✓ Note recorded to confidential ledger!'}
                  </span>
                  <button
                    type="submit"
                    disabled={!newNote.trim() || addingNote}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {addingNote ? 'Saving...' : 'Save Private Note'}
                  </button>
                </div>
              </form>

              {/* Notes History */}
              <div className="space-y-3">
                {data.notes.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No notes recorded yet.</p>
                ) : (
                  data.notes.map(n => (
                    <div key={n.id} className="p-4 rounded-2xl bg-white border border-slate-200 text-xs shadow-sm space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                        <span>Author: {n.counselor?.name}</span>
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">{n.noteContent}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-3xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-700 transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
