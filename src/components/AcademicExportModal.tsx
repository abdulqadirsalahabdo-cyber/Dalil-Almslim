import React, { useState } from 'react';
import { MizanAnalysisResult } from '../types/mizan.js';
import { X, Copy, Check, Download, Printer, BookOpen, GraduationCap } from 'lucide-react';

interface AcademicExportModalProps {
  result: MizanAnalysisResult;
  onClose: () => void;
}

export const AcademicExportModal: React.FC<AcademicExportModalProps> = ({ result, onClose }) => {
  const [copied, setCopied] = useState(false);

  const generateAcademicText = () => {
    return `===================================================================
ورقة تحقيق وبحث أكاديمي صادر عن: منصة ميزان للتحقيق المعرفي
العنوان: ${result.query}
نمط التحقيق: بحثي أكاديمي مقارن
التاريخ: ${new Date(result.timestamp).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
درجة التوثيق: ${result.metadataCard.confidenceLevel} | حالة النقل: ${result.metadataCard.transmissionStatus}
===================================================================

[المستخلص]:
${result.summary}

[أولاً: الاستناد إلى نصوص الوحيين (القرآن والسنة)]:
${result.quranEvidences.map((q, idx) => `  (${idx + 1}) قوله تعالى: ﴿${q.ayah}﴾ [سورة ${q.surah}${q.ayahNumber ? '، آية ' + q.ayahNumber : ''}].\n      وجه الدلالة: ${q.tafsirSummary || 'الاستدلال بظاهر النص والقواعد الأصولية.'}`).join('\n\n')}

${result.hadithEvidences.map((h, idx) => `  [حديث ${idx + 1}]: قال رسول الله ﷺ: «${h.matn}».\n      الراوي: ${h.narrator || 'الصحابي رضي الله عنه'}.\n      التخريج والحكم: ${h.takhrij} (درجة الحديث: ${h.grade}).\n      المصدر: ${h.sourceBook}.`).join('\n\n')}

[ثانياً: تحرير محل النزاع وأقوال المذاهب الفقهية]:
${result.fiqhOpinions?.map((f) => `  - ${f.school} (${f.scholarName || 'المعتمد في المذهب'}):\n    الموقف: ${f.opinion}\n    الدليل: ${f.primaryEvidence}\n    المرجع المعتمد: ${f.referenceBook || 'كتب الفقه المعتمدة'}`).join('\n\n') || 'لا خلاف جوهري في أصل المسألة.'}

[ثالثاً: نقاط الاتفاق والخلاف]:
* نقاط الوفاق: ${result.consensusPoints?.join(' ؛ ') || 'الاتفاق على القواعد الشرعية العامة.'}
* نقاط التباين: ${result.divergencePoints?.join(' ؛ ') || 'تنزيل الأحكام الجزئية على الواقعات.'}

[رابعاً: الترجيح الأصولي وتوجيه الفتوى]:
القول الراجح: ${result.weightedOpinion?.opinion || result.summary}
علة الترجيح: ${result.weightedOpinion?.reasoning || 'اتساقاً مع مقاصد الشريعة في حفظ المصالح.'}
المؤسسات المتبنية: ${result.weightedOpinion?.endorsedBy || 'المجامع الفقهية المعاصرة'}

[خامساً: الهوامش وثبت المصادر والمراجع]:
${result.metadataCard.primarySources.map((src, i) => `[${i + 1}] ${src}`).join('\n')}
${result.metadataCard.opposingOrDifferingSources?.map((src, i) => `[${result.metadataCard.primarySources.length + i + 1}] ${src}`).join('\n') || ''}

-------------------------------------------------------------------
توثيق الاقتباس (APA):
ميزان للتحقيق المعرفي. (${new Date().getFullYear()}). تحقيق مسألة: ${result.query}. منصة ميزان للذكاء الاصطناعي الإسلامي والتاريخي.
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateAcademicText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0b1c16] border border-amber-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-amber-900/40 bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-100 text-base sm:text-lg font-cairo">
                مساعد الباحث الأكاديمي <span className="text-xs text-amber-400 font-normal">| SCHOLAR PAPER FORMAT</span>
              </h3>
              <p className="text-xs text-stone-400">
                صيغة بحثية محكمة مزودة بالهوامش وتخريج الأدلة وثبت المصادر
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper Content Preview */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-stone-950 font-cairo text-stone-200 text-sm leading-relaxed selection:bg-amber-800 selection:text-amber-100">
          {/* Research Title Card */}
          <div className="text-center pb-6 border-b border-stone-800 space-y-2">
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block">
              تقرير تحقيق فقهي وتاريخي مقارن
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100 font-amiri max-w-2xl mx-auto">
              {result.query}
            </h1>
            <div className="flex items-center justify-center gap-3 text-xs text-stone-400 pt-2">
              <span>تحقيق: منصة ميزان AI</span>
              <span>·</span>
              <span>التاريخ: {new Date(result.timestamp).toLocaleDateString('ar-EG')}</span>
              <span>·</span>
              <span className="text-emerald-400">توثيق: {result.metadataCard.transmissionStatus}</span>
            </div>
          </div>

          {/* Abstract */}
          <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800">
            <span className="font-bold text-amber-300 block mb-1.5 text-xs">مستخلص البحث الأكاديمي:</span>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">{result.summary}</p>
          </div>

          {/* Revelation */}
          <div className="space-y-3">
            <h3 className="font-bold text-stone-100 text-sm border-b border-amber-900/30 pb-1">
              المبحث الأول: الأدلة من الكتاب العزيز والسنة النبوية
            </h3>
            {result.quranEvidences.map((q, i) => (
              <div key={i} className="p-3.5 rounded-lg bg-stone-900/40 border border-stone-800">
                <p className="font-amiri text-base text-amber-200 mb-1.5">
                  ﴿{q.ayah}﴾
                </p>
                <div className="text-xs text-stone-400">
                  <span className="font-semibold text-stone-300">[سورة {q.surah}{q.ayahNumber ? `، آية ${q.ayahNumber}` : ''}]</span>: {q.tafsirSummary}
                </div>
              </div>
            ))}

            {result.hadithEvidences.map((h, i) => (
              <div key={i} className="p-3.5 rounded-lg bg-stone-900/40 border border-stone-800">
                <p className="font-amiri text-base text-amber-100 mb-1.5">
                  «{h.matn}»
                </p>
                <div className="text-xs text-stone-400 space-y-0.5">
                  <div><span className="font-semibold text-stone-300">الراوي:</span> {h.narrator || 'الصحابي'}</div>
                  <div><span className="font-semibold text-stone-300">التخريج والدرجة:</span> {h.takhrij} ({h.grade})</div>
                  <div><span className="font-semibold text-stone-300">المصدر:</span> {h.sourceBook}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Fiqh Opinions */}
          {result.fiqhOpinions && result.fiqhOpinions.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-stone-100 text-sm border-b border-amber-900/30 pb-1">
                المبحث الثاني: آراء المذاهب الفقهية الأربعة والمجامع
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.fiqhOpinions.map((op, i) => (
                  <div key={i} className="p-3 rounded-lg bg-stone-900/50 border border-stone-800 text-xs">
                    <div className="font-bold text-amber-300 mb-1">{op.school}</div>
                    <p className="text-stone-200 mb-2">{op.opinion}</p>
                    <div className="text-stone-400 text-[11px]">
                      <span className="font-semibold text-stone-300">الدليل:</span> {op.primaryEvidence}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weighted Opinion */}
          {result.weightedOpinion && (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-1.5">
              <span className="font-bold text-amber-300 block text-xs">المبحث الثالث: القول الراجح وتوجيهه الفقهي:</span>
              <p className="text-stone-100 font-medium text-sm">{result.weightedOpinion.opinion}</p>
              <div className="text-xs text-stone-400 pt-1">
                <span className="font-semibold text-stone-300">وجه الترجيح:</span> {result.weightedOpinion.reasoning}
              </div>
            </div>
          )}

          {/* Bibliography */}
          <div className="pt-4 border-t border-stone-800 text-xs space-y-2">
            <span className="font-bold text-stone-300 block">المصادر والمراجع المعتمدة (Bibliography):</span>
            <ol className="list-decimal list-inside space-y-1 text-stone-400 font-mono text-[11px]">
              {result.metadataCard.primarySources.map((src, i) => (
                <li key={i}>{src}</li>
              ))}
              {result.metadataCard.opposingOrDifferingSources?.map((src, i) => (
                <li key={`opp-${i}`}>{src} (وجهة نظر مقارنة)</li>
              ))}
            </ol>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-stone-800 bg-stone-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-stone-400">
            صيغة توثيق قياسية صالحة للاستشهاد الأكاديمي والبحثي
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الورقة</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold transition-colors shadow"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ بنجاح' : 'نسخ التقرير كاملاً'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
