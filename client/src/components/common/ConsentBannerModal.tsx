import React, { useState } from 'react';
import { Shield, Check, Lock, EyeOff, UserCheck, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ConsentBannerModal: React.FC = () => {
  const { user, submitConsent } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Only show if user is a student who hasn't consented yet
  if (!user || user.role !== 'STUDENT' || user.studentProfile?.consentGiven) {
    return null;
  }

  const handleConsent = async () => {
    if (!agreed) return;
    setLoading(true);
    try {
      await submitConsent();
    } catch (err) {
      console.error('Consent failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-emerald-100 flex flex-col">
        {/* Header Badge */}
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
          <Shield className="w-6 h-6" />
        </div>

        <h2 className="text-2xl font-bold text-slate-800">Welcome to MindTrack</h2>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
          Before taking surveys or tracking your daily wellness, please review our strict student privacy and data commitment.
        </p>

        {/* Privacy Principles Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 my-5 space-y-3.5 text-xs text-slate-700">
          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong>Confidential to You & Your Assigned Counselor:</strong> Your mood logs and individual survey answers are private. Administrators and campus staff only see anonymized, campus-wide statistics.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <EyeOff className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong>Support, Not Surveillance:</strong> We track wellness patterns solely to connect you with personalized campus resources and proactive support before stress escalates.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong>Wellness Screening Disclaimer:</strong> MindTrack provides wellness indicators and self-reflection tools; it does not replace medical clinical diagnosis.
            </p>
          </div>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer select-none text-xs text-slate-700 mb-6 p-2 rounded-xl hover:bg-slate-50">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-slate-300"
          />
          <span>
            I have read and agree to the <strong>Privacy Policy & Wellness Consent</strong>. I understand that I can request counselor support at any time.
          </span>
        </label>

        {/* Action */}
        <button
          onClick={handleConsent}
          disabled={!agreed || loading}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
            agreed && !loading
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow hover:shadow-md'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            'Recording Consent...'
          ) : (
            <>
              <Check className="w-4 h-4" /> Continue to MindTrack
            </>
          )}
        </button>
      </div>
    </div>
  );
};
