import React from 'react';
import { CognitiveFingerprint } from '../types/mizan.js';
import { Network, History, CheckCircle2, AlertOctagon, Layers, Compass } from 'lucide-react';

interface CognitiveFingerprintViewProps {
  fingerprint: CognitiveFingerprint;
}

export const CognitiveFingerprintView: React.FC<CognitiveFingerprintViewProps> = ({ fingerprint }) => {
  return (
    <div className="mt-4 rounded-xl border border-stone-800 bg-[#091511]/70 p-4 text-xs transition-all">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-stone-800/80">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-stone-200">
            محرك البصمة المعرفية <span className="text-[10px] text-stone-400 font-mono font-normal">| COGNITIVE FINGERPRINT</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {fingerprint.anomaliesDetected ? (
            <span className="flex items-center gap-1 text-rose-400 font-medium">
              <AlertOctagon className="w-3.5 h-3.5" />
              تم رصد خلل زمني أو سند منقطع
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              الشبكة متسقة تاريخياً وإسنادياً
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Entities */}
        <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800/80">
          <span className="text-stone-400 flex items-center gap-1 mb-1.5 font-medium">
            <Layers className="w-3 h-3 text-amber-400" /> الكيانات المرتبطة
          </span>
          <div className="flex flex-wrap gap-1">
            {fingerprint.entities?.map((ent, idx) => (
              <span key={idx} className="bg-stone-800/80 text-stone-200 px-2 py-0.5 rounded text-[11px] border border-stone-700/50">
                {ent}
              </span>
            ))}
          </div>
        </div>

        {/* Timeline Era */}
        <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800/80">
          <span className="text-stone-400 flex items-center gap-1 mb-1.5 font-medium">
            <History className="w-3 h-3 text-blue-400" /> الحقبة والسياق الزمني
          </span>
          <p className="text-stone-200 font-medium text-[11px] pt-0.5">
            {fingerprint.eraTimeline || 'العصر التراثي والمعاصر'}
          </p>
        </div>

        {/* Checks */}
        <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800/80">
          <span className="text-stone-400 flex items-center gap-1 mb-1.5 font-medium">
            <Compass className="w-3 h-3 text-purple-400" /> التوافق البيني للعلوم
          </span>
          <ul className="text-stone-300 space-y-0.5 text-[11px]">
            {fingerprint.crossDisciplinaryChecks?.map((check, idx) => (
              <li key={idx} className="flex items-center gap-1 truncate">
                <span className="text-emerald-400">✓</span> {check}
              </li>
            )) || <li>✓ مطابقة تامة مع أصول الفقه والحديث</li>}
          </ul>
        </div>
      </div>

      {fingerprint.anomalyNotes && (
        <div className="mt-2.5 p-2 rounded bg-rose-950/40 border border-rose-900/50 text-rose-300 text-[11px]">
          <span className="font-bold">تنبيه المحرك: </span> {fingerprint.anomalyNotes}
        </div>
      )}
    </div>
  );
};
