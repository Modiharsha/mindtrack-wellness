import React from 'react';
import { X, PhoneCall, MessageSquare, AlertCircle, ShieldAlert, HeartHandshake, ExternalLink } from 'lucide-react';
import { InteractiveBreathingWidget } from './InteractiveBreathingWidget';

interface CrisisSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrisisSupportModal: React.FC<CrisisSupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-rose-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 text-white p-6 rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/15 rounded-2xl">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">24/7 Immediate Crisis Support</h2>
              <p className="text-rose-100 text-xs mt-0.5">
                Free, confidential, and available right now. You are never alone.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Emergency Hotlines Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 988 Lifeline */}
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600">National Lifeline</span>
                  <span className="text-[10px] bg-rose-200/60 text-rose-800 px-2 py-0.5 rounded-full font-semibold">24/7 Free</span>
                </div>
                <h3 className="font-bold text-slate-800 text-base">988 Suicide & Crisis Lifeline</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Call or text 988 anytime for free, compassionate, judgment-free support.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <a
                  href="tel:988"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-rose-600 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call 988
                </a>
                <a
                  href="sms:988"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-rose-700 border border-rose-300 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-rose-50 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Text 988
                </a>
              </div>
            </div>

            {/* Crisis Text Line */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Crisis Text Line</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-semibold">Text 24/7</span>
                </div>
                <h3 className="font-bold text-slate-800 text-base">Text HOME to 741741</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Connect with a live, trained crisis volunteer over SMS for anxiety or emotional distress.
                </p>
              </div>
              <div className="mt-4">
                <a
                  href="sms:741741?body=HOME"
                  className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Open SMS (741741)
                </a>
              </div>
            </div>
          </div>

          {/* Campus Urgent Services */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Campus Urgent Health & Security</h4>
                <p className="text-xs text-slate-600">On-campus crisis dispatch available 24/7 at (555) 019-9111</p>
              </div>
            </div>
            <a
              href="tel:5550199111"
              className="inline-flex items-center gap-1.5 bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Call Campus Care
            </a>
          </div>

          {/* Calming Breathing Visualizer */}
          <div>
            <InteractiveBreathingWidget />
          </div>

          {/* Non-clinical disclaimer */}
          <div className="bg-slate-100/70 rounded-2xl p-3.5 flex items-start gap-2.5 text-slate-500 text-xs">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              <strong>Safety Disclaimer:</strong> MindTrack is a student wellness support tool, not an emergency medical response or diagnostic system. If you or someone you know is in immediate life-threatening danger, please call 911 or visit your nearest emergency room immediately.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 rounded-b-3xl border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
