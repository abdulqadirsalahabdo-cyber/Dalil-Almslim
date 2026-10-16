import React, { useState } from 'react';
import { RumorReportResult } from '../types/mizan.js';
import { AlertTriangle, CheckCircle2, XCircle, Search, ShieldAlert, History, Share2, Compass } from 'lucide-react';

interface RumorDetectorToolProps {
  onDetect: (content: string) => Promise<RumorReportResult>;
}

export const RumorDetectorTool: React.FC<RumorDetectorToolProps> = ({ onDetect }) => {
  const [content, setContent] = useState('');
  const [result, setResult] = useState<RumorReportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleRumors = [
    'شائعة إحراق عمرو بن العاص لمكتبة الإسكندرية واستخدام كتبها 6 أشهر',
    'منشور متداول: انشرها لـ 10 أشخاص وستسمع خبراً يسرك غداً ومن يتجاهلها يحزن',
    'الادعاء بأن إبليس بكى حين نزلت سورة الفاتحة كحديث نبوي',
    'مقولة: شرب الماء واقفاً يسبب قرحة المعدة وتلف الكبد وقد نهى عنه النبي إعجازاً'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await onDetect(content.trim());
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء فحص وتفكيك الشائعة');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'شائعة باطلة':
        return 'bg-red-950/60 text-red-300 border-red-700/60';
      case 'نصف حقيقة محرفة':
        return 'bg-amber-950/60 text-amber-300 border-amber-700/60';
      case 'صحيحة وموثقة':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60';
      case 'سقط تاريخي':
      default:
        return 'bg-purple-950/60 text-purple-300 border-purple-700/60';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#081f18]/80 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-cairo text-stone-100">
              كاشـف الشـائعات والمنشـورات الرائجـة <span className="text-sm font-normal text-rose-400/80">| RUMOR DETECTOR</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              تفكيك ادعاءات السوشيال ميديا، رسائل واتساب المتداولة، كشف الأحاديث المكذوبة والافتراءات التاريخية.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              الصق نص المنشور أو الرسالة المتداولة:
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="انسخ والصق المنشور المشبوه هنا..."
              className="w-full bg-stone-900/90 border border-stone-700 rounded-xl p-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-all font-cairo"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-400">
              <span>منشورات متكررة:</span>
              {sampleRumors.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setContent(sample)}
                  className="px-2 py-1 rounded bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-300 hover:border-amber-600/40 text-xs transition-colors"
                >
                  {sample.length > 35 ? sample.substring(0, 35) + '...' : sample}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-stone-100 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'جاري فك فرائس النص وتتبع المصدر...' : 'إصدار تقرير التحقق'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="bg-[#071912] border border-stone-800 rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-800">
            <div>
              <h3 className="text-base font-bold text-stone-100">{result.headline}</h3>
              <span className="text-xs text-stone-400">تقرير تدقيق صادر عن نظام ميزان AI</span>
            </div>
            <div className={`px-3 py-1 rounded-lg border font-bold text-sm ${getVerdictStyle(result.verdict)}`}>
              النتيجة: {result.verdict}
            </div>
          </div>

          {/* Claims Breakdown Table */}
          {result.claimsBreakdown && result.claimsBreakdown.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-stone-300 mb-2.5 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>تفكيك الادعاءات والمطابقة مع الحقائق الموثقة:</span>
              </h4>
              <div className="space-y-2.5">
                {result.claimsBreakdown.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800 text-xs grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-2.5 rounded bg-rose-950/20 border border-rose-900/30">
                      <span className="text-rose-400 font-bold block mb-1 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> الادعاء المروج:
                      </span>
                      <p className="text-stone-300">{item.claim}</p>
                    </div>

                    <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-900/30">
                      <span className="text-emerald-400 font-bold block mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> الحقيقة العلمية والتاريخية:
                      </span>
                      <p className="text-stone-300">{item.fact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historical trace */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800">
              <span className="font-bold text-stone-300 flex items-center gap-1.5 mb-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>أول ظهور تاريخي موثق للقصة:</span>
              </span>
              <p className="text-stone-300 leading-relaxed">{result.firstHistoricalAppearance}</p>
            </div>

            <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800">
              <span className="font-bold text-stone-300 flex items-center gap-1.5 mb-2">
                <Share2 className="w-4 h-4 text-blue-400" />
                <span>مسار الانتشار وآلية الترويج:</span>
              </span>
              <p className="text-stone-300 leading-relaxed">{result.propagationPath}</p>
            </div>
          </div>

          {/* Rebuttal Evidence */}
          {result.rebuttalEvidence && result.rebuttalEvidence.length > 0 && (
            <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 text-xs">
              <span className="font-bold text-emerald-400 block mb-2">أدلة الدحض الشرعية والتاريخية:</span>
              <ul className="space-y-1.5 text-stone-300">
                {result.rebuttalEvidence.map((ev, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Action */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/40 text-xs text-stone-200">
            <span className="font-bold text-amber-300 block mb-1">التوجيه الأخلاقي والشرعي الموصى به:</span>
            <p className="leading-relaxed">{result.recommendedAction}</p>
          </div>
        </div>
      )}
    </div>
  );
};
