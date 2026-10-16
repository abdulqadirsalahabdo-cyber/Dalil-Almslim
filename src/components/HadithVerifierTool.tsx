import React, { useState } from 'react';
import { HadithCheckResult } from '../types/mizan.js';
import { ScrollText, CheckCircle2, AlertOctagon, HelpCircle, BookOpen, User, ShieldAlert, Award } from 'lucide-react';

interface HadithVerifierToolProps {
  onVerify: (hadithText: string) => Promise<HadithCheckResult>;
}

export const HadithVerifierTool: React.FC<HadithVerifierToolProps> = ({ onVerify }) => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<HadithCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleHadiths = [
    'اطْلُبُوا العِلْمَ وَلَوْ بالصِّينِ',
    'إنما الأعمال بالنيات وإنما لكل امرئ ما نوى',
    'من غشنا فليس منا',
    'حب الوطن من الإيمان'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await onVerify(inputText.trim());
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء فحص الحديث وتخريجه');
    } finally {
      setLoading(false);
    }
  };

  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case 'صحيح':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-600/60';
      case 'حسن':
        return 'bg-teal-950/60 text-teal-300 border-teal-600/60';
      case 'ضعيف':
        return 'bg-amber-950/60 text-amber-300 border-amber-600/60';
      case 'موضوع':
      case 'لا أصل له':
        return 'bg-rose-950/60 text-rose-300 border-rose-600/60';
      default:
        return 'bg-stone-900 text-stone-200 border-stone-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#081f18]/80 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ScrollText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-cairo text-stone-100">
              محقـق الحـديث النبـوي <span className="text-sm font-normal text-amber-400/80">| HADITH VERIFIER</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              تخريج فوري، نقد الأسانيد، حكم أئمة الجرح والتعديل، وتمييز الصحيح من الموضوع والمدرج.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              أدخل نص الحديث أو جزءاً من متنه للتحقيق:
            </label>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="مثال: اطلبوا العلم ولو بالصين، أو: لا تجتمع أمتي على ضلالة..."
              className="w-full bg-stone-900/90 border border-stone-700 rounded-xl p-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-amiri text-base"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-400">
              <span>أمثلة سريعة:</span>
              {sampleHadiths.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInputText(sample)}
                  className="px-2 py-1 rounded bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-300 hover:border-amber-600/40 text-xs transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'جاري فحص السند والمتن...' : 'تحقيق الحديث وتخريجه'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Verification Results */}
      {result && (
        <div className="bg-[#071912] border border-stone-800 rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in duration-300">
          {/* Matn & Primary Verdict */}
          <div className="pb-5 border-b border-stone-800">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <span className="text-xs text-stone-400 font-medium">نص الحديث المحقق:</span>
              <div className={`px-3 py-1 rounded-lg border font-bold text-sm ${getGradeStyle(result.authenticityGrade)}`}>
                الحكم: {result.authenticityGrade}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 font-amiri text-lg text-amber-100 leading-relaxed text-center">
              « {result.matn} »
            </div>

            {result.rawi && (
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-stone-300">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>الراوي الأعلى: </span>
                <span className="font-semibold text-stone-100">{result.rawi}</span>
              </div>
            )}
          </div>

          {/* Primary Reference Sources */}
          {result.primarySources && result.primarySources.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-stone-300 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>مواضع التخريج في مصنفات السنة:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {result.primarySources.map((src, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800 text-xs">
                    <div className="font-bold text-stone-200">{src.book}</div>
                    <div className="text-stone-400 text-[11px] mt-0.5">
                      {src.chapterNumber} {src.hadithNumber && `· ${src.hadithNumber}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Muhaddithin Verdicts */}
          {result.muhaddithinVerdicts && result.muhaddithinVerdicts.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-stone-300 mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>أحكام أئمة الحديث ونقاده:</span>
              </h4>
              <div className="space-y-2">
                {result.muhaddithinVerdicts.map((v, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-stone-900/60 border border-stone-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-amber-300">{v.scholar}: </span>
                      <span className="text-stone-200">{v.verdict}</span>
                    </div>
                    <span className="text-[11px] text-stone-500 font-mono shrink-0">
                      {v.reference}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Sanad & Matn Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800">
              <span className="font-bold text-stone-300 block mb-2">فحص السند ورجال الرواية:</span>
              <p className="text-stone-300 leading-relaxed">{result.sanadAnalysis}</p>
            </div>

            <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800">
              <span className="font-bold text-stone-300 block mb-2">نقد المتن وموافقة الأصول:</span>
              <p className="text-stone-300 leading-relaxed">{result.matnAnalysis}</p>
            </div>
          </div>

          {/* Practical Ruling */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-stone-900 border border-emerald-800/40 text-xs text-stone-200">
            <span className="font-bold text-emerald-300 block mb-1">الحكم العملي والمسلك الإفتائي:</span>
            <p className="leading-relaxed">{result.practicalRuling}</p>
          </div>
        </div>
      )}
    </div>
  );
};
