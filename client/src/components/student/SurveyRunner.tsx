import React, { useState, useEffect } from 'react';
import { Survey, SurveyQuestion, RiskLevel, Recommendation } from '../../types';
import { api } from '../../services/api';
import { RiskBadge } from '../common/RiskBadge';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Save,
  Clock,
  Sparkles,
  BookOpen,
  HeartHandshake,
  AlertCircle,
} from 'lucide-react';

interface SurveyRunnerProps {
  survey: Survey;
  onBack: () => void;
  onComplete: () => void;
}

export const SurveyRunner: React.FC<SurveyRunnerProps> = ({ survey, onBack, onComplete }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [completionResult, setCompletionResult] = useState<{
    score: number;
    maxScore: number;
    riskLevel: RiskLevel;
    interpretation: string;
    contributingFactors: string[];
    recommendations: Recommendation[];
  } | null>(null);

  const questions: SurveyQuestion[] = survey.questions || [];
  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / Math.max(1, questions.length)) * 100);

  const handleSelectOption = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await api.saveSurveyDraft(survey.id, answers);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.submitSurvey(survey.id, answers);
      setCompletionResult({
        score: res.score,
        maxScore: res.maxScore,
        riskLevel: res.riskLevel,
        interpretation: res.interpretation,
        contributingFactors: res.contributingFactors,
        recommendations: res.recommendations || [],
      });
      onComplete();
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  // If Completed, display compassionate wellness interpretation and recommendation cards
  if (completionResult) {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 max-w-3xl mx-auto animate-fadeIn">
        <div className="text-center pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Check-In Completed</h2>
          <p className="text-xs text-slate-500 mt-1">Thank you for investing time in your self-awareness.</p>
        </div>

        {/* Assessment Score Card */}
        <div className="bg-slate-50 rounded-2xl p-5 my-6 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Indicator Score</span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl font-extrabold text-slate-800">
                {completionResult.score} <span className="text-base text-slate-400 font-normal">/ {completionResult.maxScore}</span>
              </span>
              <RiskBadge level={completionResult.riskLevel} size="lg" />
            </div>
          </div>
          <p className="text-xs text-slate-600 max-w-md leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
            {completionResult.interpretation}
          </p>
        </div>

        {/* Suggested Personalized Resources */}
        {completionResult.recommendations.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Tailored Support & Coping Tools For You
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {completionResult.recommendations.map(rec => (
                <div key={rec.id} className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700">{rec.category}</span>
                    <h5 className="font-bold text-xs text-slate-800 mt-0.5">{rec.title}</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">{rec.summary}</p>
                  </div>
                  {rec.resourceLink && (
                    <a
                      href={rec.resourceLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-emerald-700 hover:underline mt-3 inline-block"
                    >
                      Explore Guide &rarr;
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            &larr; Back to Wellness Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 max-w-3xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to surveys
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-emerald-700 px-3 py-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            {draftSaved ? 'Draft Saved!' : 'Save Progress'}
          </button>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3" /> ~{survey.estimatedMinutes} mins
          </span>
        </div>
      </div>

      {/* Title & Progress */}
      <div className="mb-6">
        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          {survey.category} Self-Assessment
        </span>
        <h2 className="text-xl font-bold text-slate-800 mt-2">{survey.title}</h2>
        <p className="text-xs text-slate-500 mt-1">{survey.description}</p>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="bg-slate-50/60 rounded-2xl p-6 border border-slate-200/80 mb-6">
          <h3 className="text-base font-bold text-slate-800 mb-5 leading-snug">
            {currentIndex + 1}. {currentQ.text}
          </h3>

          <div className="space-y-2.5">
            {currentQ.options.map(opt => {
              const isSelected = answers[currentQ.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, opt.value)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/90 text-emerald-950 font-semibold ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xs">{opt.label}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            currentIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Previous
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              allAnswered && !isSubmitting
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Calculating...' : 'Submit & View Wellness Insights'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Next <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Non-clinical disclaimer footer */}
      <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
        <AlertCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <span>This screening is confidential and for wellness monitoring guidance, not a medical diagnosis.</span>
      </div>
    </div>
  );
};
