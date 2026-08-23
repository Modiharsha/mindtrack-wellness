import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { MoodStats } from '../../types';
import { Flame, Sparkles, CheckCircle2, MessageSquare, Tag } from 'lucide-react';

interface MoodTrackerCardProps {
  stats: MoodStats | null;
  onMoodLogged: () => void;
}

const MOOD_LEVELS = [
  { val: 1, emoji: '😔', label: 'Struggling', desc: 'Overwhelmed, heavy, or down', color: 'hover:border-rose-300 hover:bg-rose-50/50' },
  { val: 2, emoji: '🙁', label: 'Difficult', desc: 'Stressed, fatigued, or anxious', color: 'hover:border-amber-300 hover:bg-amber-50/50' },
  { val: 3, emoji: '😐', label: 'Okay / Neutral', desc: 'Managing, balanced, steady', color: 'hover:border-slate-300 hover:bg-slate-50/50' },
  { val: 4, emoji: '🙂', label: 'Good', desc: 'Positive, energetic, focused', color: 'hover:border-emerald-300 hover:bg-emerald-50/50' },
  { val: 5, emoji: '😄', label: 'Thriving', desc: 'Inspired, grateful, joyful', color: 'hover:border-teal-300 hover:bg-teal-50/50' },
];

const EMOTION_TAGS = [
  'Grateful',
  'Anxious',
  'Tired',
  'Motivated',
  'Overwhelmed',
  'Peaceful',
  'Focused',
  'Exam Stress',
  'Homesick',
  'Energetic',
];

export const MoodTrackerCard: React.FC<MoodTrackerCardProps> = ({ stats, onMoodLogged }) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;

    setSaving(true);
    try {
      const res = await api.logMood({
        moodValue: selectedMood,
        emotionTags: selectedTags,
        note: note.trim() || undefined,
      });

      // Trigger wellness confetti if positive mood or streak milestone
      if (selectedMood >= 4 || (stats && stats.streakDays >= 2)) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10B981', '#14B8A6', '#F59E0B'],
        });
      }

      setSuccessMessage('Your check-in has been logged. Thank you for taking a moment for yourself.');
      onMoodLogged();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Mood log error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-200/80 relative overflow-hidden">
      {/* Top Bar with Streak */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            Daily Check-In
          </span>
          <h3 className="text-xl font-bold text-slate-800 mt-1.5">How are you feeling today?</h3>
          <p className="text-xs text-slate-500">A confidential pulse-check to understand your wellbeing patterns.</p>
        </div>

        {/* Streak Counter */}
        {stats && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 px-3.5 py-1.5 rounded-2xl shadow-sm">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-400 animate-pulse" />
            <div className="text-right">
              <span className="text-xs font-bold text-slate-800">{stats.streakDays} Day Streak</span>
              <p className="text-[10px] text-amber-700 font-medium">Keep it going!</p>
            </div>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Mood Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {MOOD_LEVELS.map(m => {
          const isSelected = selectedMood === m.val;
          return (
            <button
              key={m.val}
              type="button"
              onClick={() => setSelectedMood(m.val)}
              className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-sm scale-[1.02]'
                  : `border-slate-200/80 bg-slate-50/40 text-slate-700 ${m.color}`
              }`}
            >
              <span className="text-3xl transform transition-transform hover:scale-125">{m.emoji}</span>
              <span className="font-bold text-xs text-slate-800">{m.label}</span>
              <span className="text-[10px] text-slate-500 leading-tight hidden sm:block">{m.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Emotion Tags */}
      {selectedMood && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              What words best capture your space today? (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOTION_TAGS.map(tag => {
                const isTagSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                      isTagSelected
                        ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Short Reflection Note */}
          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Optional reflection (What's on your mind?):
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Studying for algorithms exam, feeling a bit stretched on sleep..."
              rows={2}
              maxLength={400}
              className="w-full text-xs p-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              {saving ? 'Recording...' : 'Log Mood Check-In'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
