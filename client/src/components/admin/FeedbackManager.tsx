import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Star, MessageSquareHeart, CheckCircle, Clock, Check } from 'lucide-react';

export const FeedbackManager: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminFeedback();
      setFeedbacks(res.feedbacks || []);
      setStats(res.stats || null);
    } catch (err) {
      console.error('Failed to load feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateFeedbackStatus(id, status);
      loadFeedback();
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Community Sentiment
            </span>
            <h3 className="text-xl font-bold text-slate-800 mt-1">Student & Staff Feedback Ledger</h3>
            <p className="text-xs text-slate-500">
              Live feedback, ratings, and feature suggestions submitted by students and counselors.
            </p>
          </div>

          {stats && (
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Average Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-lg font-extrabold text-slate-800">{stats.avgRating} / 5.0</span>
                </div>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Submissions</span>
                <span className="text-lg font-extrabold text-slate-800">{stats.totalCount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Feedback List */}
        <div className="space-y-3">
          {feedbacks.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <MessageSquareHeart className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No feedback submissions recorded yet.</p>
            </div>
          ) : (
            feedbacks.map(f => (
              <div
                key={f.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white text-xs space-y-2 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= f.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {f.category}
                    </span>
                    <span className="font-bold text-slate-700">
                      {f.isAnonymous ? 'Anonymous Student' : `${f.userName} (${f.userRole})`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        f.status === 'ACTIONED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : f.status === 'REVIEWED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {f.status}
                    </span>
                  </div>
                </div>

                <p className="text-slate-700 font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                  "{f.comment}"
                </p>

                <div className="flex justify-end gap-2 pt-1">
                  {f.status !== 'REVIEWED' && f.status !== 'ACTIONED' && (
                    <button
                      onClick={() => handleUpdateStatus(f.id, 'REVIEWED')}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[10px]"
                    >
                      Mark Reviewed
                    </button>
                  )}
                  {f.status !== 'ACTIONED' && (
                    <button
                      onClick={() => handleUpdateStatus(f.id, 'ACTIONED')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-[10px]"
                    >
                      Mark Actioned
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
