import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Heart, Sparkles } from 'lucide-react';

export const InteractiveBreathingWidget: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev > 1) {
            return prev - 1;
          }

          // Transition to next phase (4 - 7 - 8 technique)
          if (phase === 'Inhale') {
            setPhase('Hold');
            return 7;
          } else if (phase === 'Hold') {
            setPhase('Exhale');
            return 8;
          } else {
            setPhase('Inhale');
            setCycleCount(c => c + 1);
            return 4;
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const resetExercise = () => {
    setIsActive(false);
    setPhase('Inhale');
    setSecondsLeft(4);
    setCycleCount(0);
  };

  const getPhaseInstruction = () => {
    if (phase === 'Inhale') return 'Breathe in slowly through your nose...';
    if (phase === 'Hold') return 'Gently hold your breath in stillness...';
    return 'Exhale softly through your mouth...';
  };

  const getPhaseScale = () => {
    if (!isActive) return 'scale-100';
    if (phase === 'Inhale') return 'scale-125 transition-all duration-[4000ms]';
    if (phase === 'Hold') return 'scale-125 transition-all duration-[7000ms]';
    return 'scale-90 transition-all duration-[8000ms]';
  };

  const getPhaseColor = () => {
    if (phase === 'Inhale') return 'from-emerald-400 to-teal-500 text-emerald-800';
    if (phase === 'Hold') return 'from-cyan-400 to-blue-500 text-cyan-800';
    return 'from-teal-400 to-emerald-600 text-emerald-800';
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50 border border-emerald-100/80 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              4-7-8 Calming Breath Guided Reset
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </h4>
            <p className="text-xs text-slate-500">Activates your parasympathetic nervous system</p>
          </div>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white border border-emerald-100 text-slate-600">
          Cycles: {cycleCount}
        </span>
      </div>

      {/* Visual Animation Circle */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative flex items-center justify-center w-44 h-44">
          {/* Animated Glow Ring */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-tr ${getPhaseColor()} opacity-25 filter blur-xl ${
              isActive ? 'animate-pulse' : ''
            }`}
          />

          {/* Central Pulsing Bubble */}
          <div
            className={`w-36 h-36 rounded-full bg-gradient-to-tr ${getPhaseColor()} flex flex-col items-center justify-center shadow-lg border-2 border-white/80 text-white ${getPhaseScale()}`}
          >
            <span className="text-xs uppercase tracking-wider font-semibold opacity-90">{phase}</span>
            <span className="text-3xl font-extrabold my-0.5 tracking-tight">{secondsLeft}s</span>
            <span className="text-[10px] opacity-80 font-medium">
              {phase === 'Inhale' ? '4s' : phase === 'Hold' ? '7s' : '8s'}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 font-medium mt-4 text-center min-h-[1.25rem]">
          {isActive ? getPhaseInstruction() : 'Press start to begin a relaxing 4-7-8 breathing exercise.'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
            isActive
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow'
          }`}
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4" /> Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" /> Start Breathing
            </>
          )}
        </button>

        <button
          onClick={resetExercise}
          title="Reset"
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
