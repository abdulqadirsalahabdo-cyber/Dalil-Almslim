import React from 'react';
import { MetadataCard } from '../types/mizan.js';
import { ShieldCheck, BookMarked, Scale, Landmark, Award, Info } from 'lucide-react';

interface MetadataCardViewProps {
  metadata: MetadataCard;
  queryTime?: string;
}

export const MetadataCardView: React.FC<MetadataCardViewProps> = ({ metadata, queryTime }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ثابت بمصدر معتبر':
        return 'text-emerald-400 border-emerald-800/60 bg-emerald-950/30';
      case 'مختلف فيه معتبر':
        return 'text-amber-400 border-amber-800/60 bg-amber-950/30';
      case 'منسوب خطأ أو مبتور':
        return 'text-rose-400 border-rose-800/60 bg-rose-950/30';
      case 'لا أصل له (موضوع)':
        return 'text-red-500 border-red-900/60 bg-red-950/40';
      default:
        return 'text-stone-300 border-stone-800 bg-stone-900/40';
    }
  };

  const getConfidenceBadge = (level: string) => {
    switch (level) {
      case 'مرتفعة':
        return { label: 'درجة الثقة: مرتفعة (توثيق قطعي/مستفيض)', color: 'text-emerald-300' };
      case 'متوسطة':
        return { label: 'درجة الثقة: متوسطة (مبني على اجتهاد سائغ)', color: 'text-amber-300' };
      case 'محدودة':
      default:
        return { label: 'درجة الثقة: محدودة (نقل يحتاج إلى مزيد استقراء)', color: 'text-rose-300' };
    }
  };

  const conf = getConfidenceBadge(metadata.confidenceLevel);

  return (
    <div className="mt-6 rounded-xl border border-amber-500/30 bg-[#061e16]/80 backdrop-blur-sm p-4 sm:p-5 shadow-lg relative overflow-hidden">
      {/* Decorative top accent line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-600/30 via-amber-400 to-amber-600/30" />

      {/* Header of Metadata Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-amber-900/40">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h4 className="font-semibold text-stone-100 text-sm sm:text-base">
            بطاقة التوثيق المتقدمة <span className="text-xs text-amber-300/80 font-normal">| METADATA CARD</span>
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-medium ${conf.color}`}>{conf.label}</span>
          {queryTime && (
            <>
              <span className="text-stone-600">·</span>
              <span className="text-stone-400">{queryTime}</span>
            </>
          )}
        </div>
      </div>

      {/* Primary Key Attributes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 text-xs">
        <div className="p-3 rounded-lg bg-stone-900/70 border border-stone-800">
          <div className="text-stone-400 mb-1 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>حالة النقل والتوثيق</span>
          </div>
          <div className={`font-semibold text-sm ${getStatusColor(metadata.transmissionStatus)} px-2.5 py-1 rounded inline-block border`}>
            {metadata.transmissionStatus}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-stone-900/70 border border-stone-800">
          <div className="text-stone-400 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>نوع الإجابة والمسألة</span>
          </div>
          <div className="font-semibold text-stone-200 text-sm pt-1">
            {metadata.answerType}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-stone-900/70 border border-stone-800 sm:col-span-2 lg:col-span-1">
          <div className="text-stone-400 mb-1 flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-blue-400" />
            <span>المؤسسات المتبنية / المعتمِدة</span>
          </div>
          <div className="text-stone-300 font-medium pt-1 line-clamp-2">
            {metadata.endorsingInstitutions?.join(' · ') || 'المجامع الفقهية الكبرى'}
          </div>
        </div>
      </div>

      {/* Sources & References */}
      <div className="space-y-3 pt-2 text-xs">
        <div>
          <div className="flex items-center gap-1.5 font-medium text-stone-300 mb-1.5">
            <BookMarked className="w-3.5 h-3.5 text-amber-400" />
            <span>المصادر والمراجع الأساسية المؤيدة:</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-stone-300">
            {metadata.primarySources?.map((src, i) => (
              <li key={i} className="flex items-center gap-2 bg-stone-950/40 px-2.5 py-1 rounded border border-stone-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span className="font-mono text-[11px] text-stone-300 truncate">{src}</span>
              </li>
            ))}
          </ul>
        </div>

        {metadata.opposingOrDifferingSources && metadata.opposingOrDifferingSources.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 font-medium text-stone-400 mb-1.5">
              <Info className="w-3.5 h-3.5 text-stone-400" />
              <span>المصادر ذات الرأي المغاير أو المقارن:</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-stone-400">
              {metadata.opposingOrDifferingSources.map((src, i) => (
                <li key={i} className="flex items-center gap-2 bg-stone-950/30 px-2.5 py-1 rounded border border-stone-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-500 shrink-0" />
                  <span className="font-mono text-[11px] truncate">{src}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {metadata.methodologyNote && (
          <div className="pt-2 border-t border-stone-800/80 text-[11px] text-stone-400 italic">
            <span className="font-semibold text-stone-300 not-italic">الضابط المنهجي: </span>
            {metadata.methodologyNote}
          </div>
        )}
      </div>
    </div>
  );
};
