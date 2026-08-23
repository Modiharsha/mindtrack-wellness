import React, { useState } from 'react';
import { Recommendation, WellnessCategory } from '../../types';
import {
  Heart,
  Brain,
  Moon,
  BookOpen,
  Activity,
  Phone,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface RecommendationsGridProps {
  recommendations: Recommendation[];
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: 'ALL', label: 'All Resources' },
  { key: 'EMOTIONAL', label: 'Emotional & Coping' },
  { key: 'ACADEMIC', label: 'Academic & Focus' },
  { key: 'SLEEP', label: 'Sleep & Rest' },
  { key: 'PHYSICAL', label: 'Physical Wellness' },
  { key: 'SOCIAL', label: 'Social & Campus Life' },
  { key: 'CRISIS', label: 'Immediate Support' },
];

export const RecommendationsGrid: React.FC<RecommendationsGridProps> = ({ recommendations }) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = recommendations.filter(r => {
    if (activeCategory === 'ALL') return true;
    return r.category === activeCategory;
  });

  const getCategoryIcon = (iconType: string, category: string) => {
    if (category === 'CRISIS' || iconType === 'phone') return <Phone className="w-5 h-5 text-rose-500" />;
    if (category === 'SLEEP' || iconType === 'moon') return <Moon className="w-5 h-5 text-indigo-500" />;
    if (category === 'ACADEMIC' || iconType === 'book') return <BookOpen className="w-5 h-5 text-amber-500" />;
    if (category === 'PHYSICAL' || iconType === 'activity') return <Activity className="w-5 h-5 text-emerald-500" />;
    if (iconType === 'brain') return <Brain className="w-5 h-5 text-teal-500" />;
    return <Heart className="w-5 h-5 text-emerald-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.key
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => {
          const isExpanded = expandedId === item.id;
          const isCrisis = item.category === 'CRISIS' || item.urgencyLevel === 'URGENT';

          return (
            <div
              key={item.id}
              className={`rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                isCrisis
                  ? 'bg-rose-50/50 border-rose-200/90 shadow-sm'
                  : 'bg-white border-slate-200/80 hover:border-emerald-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {getCategoryIcon(item.iconType, item.category)}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isCrisis
                        ? 'bg-rose-200/80 text-rose-900'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-800 mb-1.5 leading-snug">{item.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.summary}</p>

                {/* Expandable Coping Technique Content */}
                {isExpanded && (
                  <div className="mt-3.5 pt-3.5 border-t border-slate-100 text-xs text-slate-700 space-y-2 bg-slate-50/70 p-3 rounded-2xl animate-fadeIn">
                    <p className="font-medium">{item.content}</p>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      Less info <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      How to use <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {item.resourceLink && (
                  <a
                    href={item.resourceLink}
                    target="_blank"
                    rel="noreferrer"
                    className={`text-xs font-bold flex items-center gap-1 hover:underline ${
                      isCrisis ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    Open Resource <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
