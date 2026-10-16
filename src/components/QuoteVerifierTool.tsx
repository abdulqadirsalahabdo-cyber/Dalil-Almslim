import React, { useState } from 'react';
import { QuoteCheckResult } from '../types/mizan.js';
import { FileText, CheckCircle2, AlertTriangle, XCircle, Search, BookMarked, User } from 'lucide-react';

interface QuoteVerifierToolProps {
  onVerify: (quoteText: string, attributedTo: string) => Promise<QuoteCheckResult>;
}

export const QuoteVerifierTool: React.FC<QuoteVerifierToolProps> = ({ onVerify }) => {
  const [quoteText, setQuoteText] = useState('');
  const [attributedTo, setAttributedTo] = useState('');
  const [result, setResult] = useState<QuoteCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleQuotes = [
    { text: 'اختلاف أمتي رحمة', author: 'رسول الله ﷺ (مروي كحديث)' },
    { text: 'إن الله لا يمل حتى تملوا، ولا يستحي حتى تستحوا', author: 'ابن تيمية' },
    { text: 'رأيي صواب يحتمل الخطأ، ورأي غيري خطأ يحتمل الصواب', author: 'الإمام الشافعي' },
    { text: 'متى استعبدتم الناس وقد ولدتهم أمهاتهم أحرارا', author: 'عمر بن الخطاب رضي الله عنه' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteText.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await onVerify(quoteText.trim(), attributedTo.trim());
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء فحص وتدقيق الاقتباس');
    } finally {
      setLoading(false);
    }
  };

  const getAttributionStatusStyle = (status: string) => {
    switch (status) {
      case 'منسوب بحق':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-600/60';
      case 'مبتور من سياقه':
        return 'bg-amber-950/60 text-amber-300 border-amber-600/60';
      case 'منحول ومكذوب':
        return 'bg-rose-950/60 text-rose-300 border-rose-600/60';
      case 'محرف في الألفاظ':
        return 'bg-orange-950/60 text-orange-300 border-orange-600/60';
      default:
        return 'bg-stone-900 text-stone-200 border-stone-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#081f18]/80 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-cairo text-stone-100">
              محقـق الاقتبـاس والنقـول <span className="text-sm font-normal text-amber-400/80">| QUOTE VERIFIER</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              فحص صحة نسبة النصوص لقائليها، كشف النقول المبتورة والمحرفة، والرجوع إلى المطبوعات الأصلية.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                نص الاقتباس أو القول المراد فحصه:
              </label>
              <textarea
                rows={3}
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="اكتب الاقتباس هنا..."
                className="w-full bg-stone-900/90 border border-stone-700 rounded-xl p-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-all font-amiri text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                المنسوب إليه (اختياري):
              </label>
              <input
                type="text"
                value={attributedTo}
                onChange={(e) => setAttributedTo(e.target.value)}
                placeholder="مثال: ابن تيمية، الغزالي..."
                className="w-full bg-stone-900/90 border border-stone-700 rounded-xl p-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-400">
              <span>أقوال شائعة:</span>
              {sampleQuotes.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setQuoteText(sample.text);
                    setAttributedTo(sample.author);
                  }}
                  className="px-2 py-1 rounded bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-300 hover:border-amber-600/40 text-xs transition-colors"
                >
                  {sample.text}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !quoteText.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'جاري فحص المصادر الأصلية...' : 'تحقيق نسبة القول'}
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
              <span className="text-xs text-stone-400">القائل المزعوم: </span>
              <span className="text-sm font-bold text-stone-200">{result.allegedAuthor}</span>
            </div>
            <div className={`px-3 py-1 rounded-lg border font-bold text-sm ${getAttributionStatusStyle(result.attributionStatus)}`}>
              حالة النسبة: {result.attributionStatus}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 font-amiri text-lg text-amber-100 text-center leading-relaxed">
            « {result.quote} »
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800">
              <span className="font-bold text-stone-300 flex items-center gap-1.5 mb-2">
                <User className="w-4 h-4 text-amber-400" />
                <span>القائل الحقيقي المثبت:</span>
              </span>
              <p className="text-stone-100 font-semibold text-sm">
                {result.actualAuthor || 'لا تصح نسبته لمعين'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800">
              <span className="font-bold text-stone-300 flex items-center gap-1.5 mb-2">
                <BookMarked className="w-4 h-4 text-emerald-400" />
                <span>المصدر الأصلي المعتمد:</span>
              </span>
              <p className="text-stone-300 font-mono text-xs">
                {result.verifiedSource || 'مروي بلا إسناد في كتب الأدب والطرائف'}
              </p>
            </div>
          </div>

          {result.originalContext && (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs">
              <span className="font-bold text-amber-300 block mb-1.5">السياق الأصلي للعبارة:</span>
              <p className="text-stone-200 leading-relaxed">{result.originalContext}</p>
            </div>
          )}

          <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 text-xs text-stone-300">
            <span className="font-bold text-stone-200 block mb-2">التقرير التحليلي لنقد النقل:</span>
            <p className="leading-relaxed">{result.fullAnalysis}</p>
          </div>
        </div>
      )}
    </div>
  );
};
