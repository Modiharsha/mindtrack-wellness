import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AdminAnalyticsData } from '../types';
import { AggregatedAnalyticsDashboard } from '../components/admin/AggregatedAnalyticsDashboard';
import { SurveyManager } from '../components/admin/SurveyManager';
import { RecommendationManager } from '../components/admin/RecommendationManager';
import { StaffApprovalManager } from '../components/admin/StaffApprovalManager';
import { FeedbackManager } from '../components/admin/FeedbackManager';
import {
  BarChart3,
  BookOpen,
  Sparkles,
  Users,
  MessageSquareHeart,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AdminAnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'surveys' | 'resources' | 'staff' | 'feedback'>('analytics');
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAnalytics();
      setAnalyticsData(res);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Admin Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 md:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full text-emerald-300">
              Institutional Administration
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">
              Campus Wellness Intelligence
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-xl">
              Anonymized student body insights, survey instruments, feedback ledger, and support catalog management.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Aggregate Analytics (Zero PII)
        </button>

        <button
          onClick={() => setActiveTab('surveys')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'surveys'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Survey Templates
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'resources'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Resource Deck
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'feedback'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquareHeart className="w-4 h-4" /> Community Feedback
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'staff'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> Staff & Access Approvals
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'analytics' && <AggregatedAnalyticsDashboard data={analyticsData} />}
      {activeTab === 'surveys' && <SurveyManager />}
      {activeTab === 'resources' && <RecommendationManager />}
      {activeTab === 'feedback' && <FeedbackManager />}
      {activeTab === 'staff' && <StaffApprovalManager />}
    </div>
  );
};
