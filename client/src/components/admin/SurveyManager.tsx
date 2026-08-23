import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Survey } from '../../types';
import { BookOpen, Plus, Edit, ToggleLeft, ToggleRight, Check, AlertCircle, Code } from 'lucide-react';

export const SurveyManager: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Survey Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ACADEMIC');
  const [estimatedMinutes, setEstimatedMinutes] = useState(4);
  const [questionsJson, setQuestionsJson] = useState(
    JSON.stringify(
      [
        {
          id: 'q1',
          text: 'How frequently have you felt overwhelmed by coursework in the past 14 days?',
          type: 'scale',
          options: [
            { value: 0, label: 'Never' },
            { value: 1, label: 'Several days' },
            { value: 2, label: 'More than half the days' },
            { value: 3, label: 'Nearly every day' },
          ],
        },
      ],
      null,
      2
    )
  );
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminSurveys();
      setSurveys(res.surveys || []);
    } catch (err) {
      console.error('Failed to load admin surveys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const handleToggleActive = async (survey: Survey) => {
    try {
      await api.updateSurveyTemplate(survey.id, { active: !survey.active });
      loadSurveys();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questionsJson);
      if (!Array.isArray(parsedQuestions)) throw new Error('Questions must be a JSON array');
    } catch (err: any) {
      setFormError(`Invalid Questions JSON: ${err.message}`);
      return;
    }

    setCreating(true);
    try {
      await api.createSurveyTemplate({
        title,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        description,
        category,
        estimatedMinutes: Number(estimatedMinutes),
        questions: parsedQuestions,
        active: true,
      });

      setShowCreateModal(false);
      setTitle('');
      setSlug('');
      setDescription('');
      loadSurveys();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create survey template');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-200/80 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            Assessment Instrument Management
          </span>
          <h3 className="text-xl font-bold text-slate-800 mt-1">Survey Questionnaire Templates</h3>
          <p className="text-xs text-slate-500">
            Define structured JSON survey forms and configure cutoffs without deploying code changes.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Survey Instrument
        </button>
      </div>

      {/* Survey List */}
      <div className="space-y-4">
        {surveys.map(survey => (
          <div
            key={survey.id}
            className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-800">{survey.title}</span>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {survey.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    survey.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {survey.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed max-w-2xl">{survey.description}</p>
              <p className="text-[11px] text-slate-400">
                Slug: <code className="bg-slate-100 px-1.5 py-0.5 rounded">{survey.slug}</code> • Questions: {survey.questions?.length || 0} • Estimated: ~{survey.estimatedMinutes} mins
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleActive(survey)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                  survey.active
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {survey.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Survey Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800">Add New Survey Instrument</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter metadata and valid structured JSON questions.
            </p>

            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSurvey} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Survey Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Social Connection & Belonging Survey"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Slug (URL identifier) *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="e.g. social-connection-screener"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <option value="GENERAL">GENERAL</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Minutes</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={estimatedMinutes}
                    onChange={e => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Explain what this check-in assesses and how it helps students..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-emerald-600" /> Structured Questions (JSON Array) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={questionsJson}
                  onChange={e => setQuestionsJson(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] outline-none"
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
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm"
                >
                  {creating ? 'Saving...' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
