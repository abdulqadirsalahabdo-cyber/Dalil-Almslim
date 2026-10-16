import React, { useState } from 'react';
import { FiqhSchoolOpinion } from '../types/mizan.js';
import { Compass, BookOpen, Check, HelpCircle, ArrowRightLeft, Sparkles } from 'lucide-react';

interface FiqhMapViewProps {
  topic?: string;
  centralQuestion?: string;
  opinions?: FiqhSchoolOpinion[];
  consensusPoints?: string[];
  divergencePoints?: string[];
  causeOfVariance?: string;
  weightedOpinion?: {
    opinion: string;
    reasoning: string;
    endorsedBy: string;
  };
  isStandalone?: boolean;
  onSearchTopic?: (topic: string) => void;
  isLoading?: boolean;
}

export const FiqhMapView: React.FC<FiqhMapViewProps> = ({
  topic = 'المسألة الفقهية المقارنة',
  centralQuestion,
  opinions = [],
  consensusPoints = [],
  divergencePoints = [],
  causeOfVariance,
  weightedOpinion,
  isStandalone = false,
  onSearchTopic,
  isLoading = false,
}) => {
  const [inputTopic, setInputTopic] = useState('');

  const schoolBadges: Record<string, { color: string; border: string; bg: string }> = {
    'الحنفية': { color: 'text-amber-300', border: 'border-amber-700/60', bg: 'bg-amber-950/30' },
    'المالكية': { color: 'text-emerald-300', border: 'border-emerald-700/60', bg: 'bg-emerald-950/30' },
    'الشافعية': { color: 'text-sky-300', border: 'border-sky-700/60', bg: 'bg-sky-950/30' },
    'الحنابلة': { color: 'text-purple-300', border: 'border-purple-700/60', bg: 'bg-purple-950/30' },
    'المجامع الحديثة': { color: 'text-rose-300', border: 'border-rose-700/60', bg: 'bg-rose-950/30' },
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTopic.trim() && onSearchTopic) {
      onSearchTopic(inputTopic.trim());
    }
  };

  return (
    <div className={`rounded-xl border border-stone-800 bg-[#071912]/80 p-4 sm:p-6 ${isStandalone ? 'max-w-4xl mx-auto shadow-2xl' : 'mt-4'}`}>
      {/* Title & Central Question */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-amber-900/40">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold text-stone-100 font-cairo">
              خريطة الخلاف الفقهي التفاعلية <span className="text-xs text-amber-400/80 font-normal">| FIQH COMPARISON MATRIX</span>
            </h3>
          </div>
          {topic && (
            <p className="text-xs sm:text-sm text-stone-300 mt-1 font-medium">
              المسألة: <span className="text-amber-300">{topic}</span>
            </p>
          )}
        </div>

        {isStandalone && onSearchTopic && (
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={inputTopic}
              onChange={(e) => setInputTopic(e.target.value)}
              placeholder="اكتب مسألة فقهية (مثال: القنوت في الفجر، التورق...)"
              className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 w-full sm:w-64"
            />
            <button
              type="submit"
              disabled={isLoading || !inputTopic.trim()}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
            >
              {isLoading ? 'جاري التحقيق...' : 'توليد الخريطة'}
            </button>
          </form>
        )}
      </div>

      {centralQuestion && (
        <div className="p-3 mb-4 rounded-lg bg-stone-900/60 border border-stone-800 text-xs text-stone-300">
          <span className="font-bold text-amber-400">السؤال المحوري: </span>
          {centralQuestion}
        </div>
      )}

      {/* Consensus & Divergence summary */}
      {(consensusPoints.length > 0 || divergencePoints.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5 text-xs">
          {consensusPoints.length > 0 && (
            <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-300 mb-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>نقاط الوفاق والإجماع:</span>
              </div>
              <ul className="space-y-1.5 text-stone-300">
                {consensusPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">·</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {divergencePoints.length > 0 && (
            <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-900/40">
              <div className="flex items-center gap-1.5 font-semibold text-amber-300 mb-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                <span>نقاط الخلاف المعتبر:</span>
              </div>
              <ul className="space-y-1.5 text-stone-300">
                {divergencePoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">·</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 4 Schools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        {opinions.map((op, idx) => {
          const style = schoolBadges[op.school] || { color: 'text-stone-300', border: 'border-stone-700', bg: 'bg-stone-900' };
          return (
            <div 
              key={idx} 
              className={`p-3.5 rounded-xl border ${style.border} ${style.bg} flex flex-col justify-between transition-all hover:border-amber-500/50`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800/80">
                  <span className={`font-bold text-sm ${style.color}`}>
                    {op.school}
                  </span>
                  {op.scholarName && (
                    <span className="text-[10px] text-stone-400 truncate max-w-[120px]">
                      {op.scholarName}
                    </span>
                  )}
                </div>

                <div className="text-stone-200 text-xs font-medium leading-relaxed mb-3">
                  {op.opinion}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800/80 text-[11px] space-y-1">
                <div className="text-stone-400">
                  <span className="text-stone-300 font-semibold">الدليل: </span>
                  {op.primaryEvidence}
                </div>
                {op.referenceBook && (
                  <div className="text-stone-500 font-mono text-[10px] truncate">
                    {op.referenceBook}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cause of Variance */}
      {causeOfVariance && (
        <div className="p-3.5 rounded-lg bg-stone-900/80 border border-stone-800 text-xs text-stone-300 mb-4">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>سبب الخلاف الأصولي (علة تباين المناهج):</span>
          </div>
          <p className="leading-relaxed">{causeOfVariance}</p>
        </div>
      )}

      {/* Weighted Opinion */}
      {weightedOpinion && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/40 border border-amber-500/40 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-300 text-sm mb-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>القول الراجح أو المعمول به لدى المؤسسات المعتمدة:</span>
          </div>
          <p className="text-stone-100 font-medium text-sm leading-relaxed mb-2">
            {weightedOpinion.opinion}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-stone-400 text-[11px]">
            <div>
              <span className="text-stone-300 font-semibold">علة الترجيح: </span>
              {weightedOpinion.reasoning}
            </div>
            {weightedOpinion.endorsedBy && (
              <div>
                <span className="text-stone-300 font-semibold">الجهات المتبنية: </span>
                {weightedOpinion.endorsedBy}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
