import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MoodEntry, MoodStats, Survey, SurveyHistoryItem, Recommendation, RiskLevel } from '../types';
import { MoodTrackerCard } from '../components/student/MoodTrackerCard';
import { MoodAnalyticsView } from '../components/student/MoodAnalyticsView';
import { RecommendationsGrid } from '../components/student/RecommendationsGrid';
import { SurveyRunner } from '../components/student/SurveyRunner';
import { RiskBadge } from '../components/common/RiskBadge';
import {
  Sparkles,
  BookOpen,
  Calendar,
  HeartHandshake,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Smile,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface StudentDashboardProps {
  onOpenCrisis: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onOpenCrisis }) => {
  const { user } = useAuth();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [moodStats, setMoodStats] = useState<MoodStats | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveyHistory, setSurveyHistory] = useState<SurveyHistoryItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);

  // Latest computed risk
  const [studentRiskLevel, setStudentRiskLevel] = useState<RiskLevel>('LOW');

  const loadStudentData = async () => {
    try {
      setLoading(true);
      // 1. Mood history & stats
      const moodRes = await api.getMoodHistory(undefined, 30);
      setMoodEntries(moodRes.entries || []);
      setMoodStats(moodRes.stats || null);

      // 2. Active surveys
      const surveyRes = await api.getSurveys();
      setSurveys(surveyRes.surveys || []);

      // 3. Survey history
      const histRes = await api.getSurveyHistory();
      setSurveyHistory(histRes.history || []);
      if (histRes.history?.length > 0) {
        setStudentRiskLevel(histRes.history[0].riskLevel);
      }

      // 4. Personalized recommendations
      const recRes = await api.getPersonalizedRecommendations();
      setRecommendations(recRes.recommendations || []);
      if (recRes.riskLevel) {
        setStudentRiskLevel(recRes.riskLevel as RiskLevel);
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, []);

  if (activeSurvey) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <SurveyRunner
          survey={activeSurvey}
          onBack={() => setActiveSurvey(null)}
          onComplete={() => {
            loadStudentData();
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full text-emerald-100">
                Student Wellness Center
              </span>
              <RiskBadge level={studentRiskLevel} size="sm" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Alex'}
            </h1>
            <p className="text-emerald-100 text-xs md:text-sm mt-1 max-w-xl leading-relaxed">
              Your mental wellbeing is just as important as your academics. Take a moment to log your daily pulse and explore tools to recharge.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/student/counselor"
              className="bg-white text-emerald-800 hover:bg-emerald-50 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <HeartHandshake className="w-4 h-4 text-emerald-600" /> Talk to Counselor
            </Link>
            <button
              onClick={onOpenCrisis}
              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" /> 24/7 Crisis Help
            </button>
          </div>
        </div>
      </div>

      {/* Gentle in-app prompt if in Needs Attention */}
      {studentRiskLevel === 'NEEDS_ATTENTION' && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 flex items-start gap-4 shadow-sm animate-fadeIn">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-rose-950 text-sm">We are here with you</h4>
            <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
              Recent check-ins indicate your stress or emotional fatigue might be elevated. Consider doing a quick 5-minute breathing exercise below or reaching out to Dr. Chen.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <Link
                to="/student/counselor"
                className="text-xs font-bold bg-rose-600 text-white px-3.5 py-1.5 rounded-xl hover:bg-rose-700 transition-colors shadow-sm"
              >
                Send Message to Counselor
              </Link>
              <button
                onClick={onOpenCrisis}
                className="text-xs font-bold text-rose-800 hover:underline"
              >
                View 24/7 Emergency Lines &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Mood Tracker & Wellness Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <MoodTrackerCard stats={moodStats} onMoodLogged={loadStudentData} />
        </div>
        <div className="lg:col-span-6">
          <MoodAnalyticsView entries={moodEntries} stats={moodStats} />
        </div>
      </div>

      {/* Wellness Surveys Row */}
      <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Validated Self-Assessments
            </span>
            <h3 className="text-xl font-bold text-slate-800 mt-1">Periodic Wellness Check-Ins</h3>
            <p className="text-xs text-slate-500">
              Structured questionnaires to help you reflect on academic load, sleep habits, and vitality.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {surveys.map(s => (
            <div
              key={s.id}
              className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                  {s.category}
                </span>
                <h4 className="font-bold text-sm text-slate-800 mt-2">{s.title}</h4>
                <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">{s.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">~{s.estimatedMinutes} mins</span>
                <button
                  onClick={() => setActiveSurvey(s)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  Start Assessment <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Coping & Campus Resources */}
      <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Campus Resource Catalog
            </span>
            <h3 className="text-xl font-bold text-slate-800 mt-1">Recommended Coping Tools & Support</h3>
            <p className="text-xs text-slate-500">
              Evidence-based micro-practices, academic workshops, and campus community spaces.
            </p>
          </div>
        </div>

        <RecommendationsGrid recommendations={recommendations} />
      </div>
    </div>
  );
};
