import React, { useState } from 'react';
import { MapPin, Search, Compass, Globe, ExternalLink, Loader2, Landmark } from 'lucide-react';

export const GeoHistoryExplorer: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'maps' | 'search'>('maps');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const sampleLocations = [
    'دار الحكمة في القاهرة وخزائن الكتب الفاطمية',
    'بيت الحكمة في بغداد ومسارات الترجمة',
    'جامع القرويين في فاس وأقدم جامعة بالعالم',
    'مسار رحلة الإمام البخاري في طلب الحديث من بخارى إلى نيسابور وبغداد ومكة'
  ];

  const sampleSearches = [
    'أحدث قرارات مجمع الفقه الإسلامي الدولي الدورة الأخيرة',
    'بيان دار الإفتاء المصرية حول الذكاء الاصطناعي والتزييف العميق',
    'مؤتمر مجمع الفقه بشأن الأصول الرقمية والتشفير'
  ];

  const handleSearch = async (overrideQuery?: string) => {
    const q = overrideQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    setResult(null);

    const endpoint = activeMode === 'maps' ? '/api/mizan/maps-grounding' : '/api/mizan/search-grounding';
    const bodyKey = activeMode === 'maps' ? 'locationQuery' : 'query';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [bodyKey]: q }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#081f18]/80 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-cairo text-stone-100">
              المستكشف الجغرافي والبحث المباشر <span className="text-sm font-normal text-amber-400/80">| MAPS & SEARCH GROUNDING</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              ربط المعرفة الإسلامية بالجغرافيا التاريخية ورحلات المحدثين (Google Maps Grounding) ومتابعة الفتاوى الرسمية الحية (Google Search Grounding).
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-2 border-t border-amber-900/40">
          <button
            onClick={() => {
              setActiveMode('maps');
              setResult(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'maps'
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'text-stone-300 hover:text-stone-100 bg-stone-900/60'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>الجغرافيا الإسلامية ورحلات المحدثين (Maps)</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('search');
              setResult(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'search'
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'text-stone-300 hover:text-stone-100 bg-stone-900/60'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>البحث المباشر عن الفتاوى والمستجدات (Search)</span>
          </button>
        </div>

        {/* Input */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={
              activeMode === 'maps'
                ? 'اكتب معلماً تاريخياً أو مسار رحلة عالم (مثال: دار الحكمة بالقاهرة، رحلة الشافعي...)'
                : 'ابحث عن أحدث الفتاوى والبيانات الرسمية الحية...'
            }
            className="flex-1 bg-stone-900/90 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : activeMode === 'maps' ? <MapPin className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            <span>{loading ? 'جاري الاستعلام الموثق...' : activeMode === 'maps' ? 'تحديد الموقع الجغرافي' : 'بحث حي بالويب'}</span>
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 text-xs text-stone-400">
          <span>اقتراحات سريعة:</span>
          {(activeMode === 'maps' ? sampleLocations : sampleSearches).map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(s);
                handleSearch(s);
              }}
              className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-300 text-xs transition-colors"
            >
              {s.length > 35 ? s.substring(0, 35) + '...' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-[#071912] border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <span className="font-bold text-stone-200 text-sm flex items-center gap-1.5">
              {activeMode === 'maps' ? <Landmark className="w-4 h-4 text-amber-400" /> : <Globe className="w-4 h-4 text-emerald-400" />}
              <span>بيانات التوثيق الميداني والواقعي:</span>
            </span>
            <span className="text-xs text-stone-400 font-mono">
              مزود بـ {activeMode === 'maps' ? 'Google Maps Grounding' : 'Google Search Grounding'}
            </span>
          </div>

          <div className="text-stone-200 text-sm leading-relaxed whitespace-pre-line font-cairo">
            {result.text}
          </div>

          {result.sources && result.sources.length > 0 && (
            <div className="pt-3 border-t border-stone-800 space-y-1.5">
              <span className="text-xs font-bold text-stone-400 block">المصادر الرسمية المرتبطة:</span>
              <div className="flex flex-wrap gap-2">
                {result.sources.map((src: any, i: number) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-amber-300 hover:text-amber-200 text-xs transition-colors"
                  >
                    <span>{src.title}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
