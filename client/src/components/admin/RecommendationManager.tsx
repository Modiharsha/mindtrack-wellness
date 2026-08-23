import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Recommendation } from '../../types';
import { Sparkles, Plus, Trash2, ExternalLink, AlertCircle } from 'lucide-react';

export const RecommendationManager: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ACADEMIC');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [resourceLink, setResourceLink] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'GENERAL' | 'RECOMMENDED' | 'URGENT'>('GENERAL');
  const [saving, setSaving] = useState(false);

  const loadResources = async () => {
    try {
      setLoading(true);
      const res = await api.getRecommendations();
      setRecommendations(res.recommendations || []);
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createRecommendation({
        title,
        category,
        summary,
        content,
        resourceLink: resourceLink || undefined,
        urgencyLevel,
        iconType: category === 'CRISIS' ? 'phone' : category === 'SLEEP' ? 'moon' : 'book',
      });

      setShowCreateModal(false);
      setTitle('');
      setSummary('');
      setContent('');
      setResourceLink('');
      loadResources();
    } catch (err) {
      console.error('Create error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this resource?')) return;
    try {
      await api.deleteRecommendation(id);
      loadResources();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-200/80 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            Resource Catalog
          </span>
          <h3 className="text-xl font-bold text-slate-800 mt-1">Campus Coping Tools & Links</h3>
          <p className="text-xs text-slate-500">
            Manage evidence-based articles, crisis hotline numbers, and campus support centers.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Campus Resource
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map(rec => (
          <div key={rec.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {rec.category}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    rec.urgencyLevel === 'URGENT'
                      ? 'bg-rose-100 text-rose-800'
                      : rec.urgencyLevel === 'RECOMMENDED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {rec.urgencyLevel}
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-800 mb-1">{rec.title}</h4>
              <p className="text-slate-600 leading-relaxed line-clamp-2">{rec.summary}</p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200">
              {rec.resourceLink ? (
                <a
                  href={rec.resourceLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                >
                  Open Link <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-400">In-app guide</span>
              )}

              <button
                onClick={() => handleDelete(rec.id)}
                className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">Add Wellness Resource</h3>
            <form onSubmit={handleCreate} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Free Campus Writing & Math Tutoring Center"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none bg-white"
                  >
                    <option value="ACADEMIC">ACADEMIC</option>
                    <option value="EMOTIONAL">EMOTIONAL</option>
                    <option value="SLEEP">SLEEP</option>
                    <option value="PHYSICAL">PHYSICAL</option>
                    <option value="SOCIAL">SOCIAL</option>
                    <option value="CRISIS">CRISIS</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Urgency Level</label>
                  <select
                    value={urgencyLevel}
                    onChange={e => setUrgencyLevel(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none bg-white"
                  >
                    <option value="GENERAL">GENERAL</option>
                    <option value="RECOMMENDED">RECOMMENDED</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Summary (Short blurb) *</label>
                <input
                  type="text"
                  required
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="e.g. Drop-in 1-on-1 tutoring on the 2nd floor of Library..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Content / Instructions *</label>
                <textarea
                  rows={3}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Provide step-by-step guidance, location hours, or mindfulness steps..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">External Resource Link (Optional)</label>
                <input
                  type="url"
                  value={resourceLink}
                  onChange={e => setResourceLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm"
                >
                  {saving ? 'Saving...' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
