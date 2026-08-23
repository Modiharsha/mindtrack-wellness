import React, { useState } from 'react';
import { api } from '../../services/api';
import { X, MessageSquareHeart, Star, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('APP_USABILITY');
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await api.submitFeedback({
        rating,
        category,
        comment: comment.trim(),
        isAnonymous,
      });

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setComment('');
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <MessageSquareHeart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Share Your Feedback</h3>
            <p className="text-xs text-slate-500">Help us improve student wellness & support</p>
          </div>
        </div>

        {success ? (
          <div className="py-8 text-center text-emerald-700 space-y-2 animate-fadeIn">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600 animate-bounce" />
            <h4 className="font-bold text-base">Thank You So Much!</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Your feedback has been stored securely and helps campus mentors enhance wellness services.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs mt-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Star Rating */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 text-center">
                How would you rate your MindTrack experience?
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-125"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Category */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-semibold text-slate-700"
              >
                <option value="APP_USABILITY">App Usability & Design</option>
                <option value="COUNSELOR_SUPPORT">Counselor & Check-In Experience</option>
                <option value="SURVEY_EXPERIENCE">Survey Questions & Relevance</option>
                <option value="RESOURCE_RELEVANCE">Coping Resources & Guides</option>
                <option value="SUGGESTION">Feature Suggestion</option>
                <option value="GENERAL">General Feedback</option>
              </select>
            </div>

            {/* Comments */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Your Thoughts, Suggestions, or Comments *
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="What worked well? What could we do better to support you?"
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none"
              />
            </div>

            {/* Anonymous Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={e => setIsAnonymous(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-slate-300"
              />
              <span>Submit anonymously (do not attach my name/email)</span>
            </label>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !comment.trim()}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? 'Submitting...' : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
