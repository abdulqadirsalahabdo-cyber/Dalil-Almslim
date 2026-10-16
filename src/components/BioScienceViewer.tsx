import React, { useState } from 'react';
import { Dna, HeartPulse, Stethoscope, BookOpen, CheckCircle2, FlaskConical, Award } from 'lucide-react';

interface BioScienceData {
  topic: string;
  historicalDiscovery: string;
  contemporaryBioethics: string;
  primarySources: string[];
  recommendation: string;
}

export const BioScienceViewer: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [data, setData] = useState<BioScienceData | null>({
    topic: 'الدورة الدموية الصغرى وزراعة الأعضاء',
    historicalDiscovery: 'ابن النفيس (ت 687 هـ) هو المكتشف الأول للدورة الدموية الرئوية الصغرى في كتابه "شرح تشريح القانون"، حيث أثبت علمياً أن الدم يمر من البطين الأيمن إلى الرئتين ليتنقى بالهواء ثم يرجع إلى البطين الأيسر، داحضا نظرية جالينوس السائدة لأكثر من ألف عام.',
    contemporaryBioethics: 'أصدر مجمع الفقه الإسلامي الدولي بجدة (القرار رقم 26) وهيئة كبار العلماء وفتاوى الأزهر الشريف جواز التبرع بالأعضاء بعد الوفاة بشروط دقيقة: التحقق من موت الدماغ بصورة قطعية من لجنة طبية مستقلة، ألا يكون التبرع بمقابل مالي، وأن يتم صيانة كرامة الجثمان.',
    primarySources: [
      'شرح تشريح القانون لابن النفيس',
      'التصريف لمن عجز عن التأليف لأبي القاسم الزهراوي',
      'قرارات مجمع الفقه الإسلامي الدولي (القرار 26 بشأن زراعة الأعضاء)',
      'المعايير الأخلاقية للمنظمة الإسلامية للعلوم الطبية (IOMS)'
    ],
    recommendation: 'يُوصى بالتمييز بين نقل الأعضاء الحيوية (كالقلب) الذي لا يجوز إلا بعد التحقق اليقيني من الوفاة، ونقل الأنسجة المتجددة (كالدم ونخاع العظم) الجائز بشروط السلامة.'
  });
  const [loading, setLoading] = useState(false);

  const sampleTopics = [
    'الدورة الدموية الصغرى وزراعة الأعضاء',
    'التعديل الجيني وتقنية كريسبر (CRISPR)',
    'الخلايا الجذعية الجنينية والبالغة',
    'جراحة العظام والأدوات الجراحية للزهراوي',
    'موت الدماغ وأجهزة الإنعاش الصناعي'
  ];

  const handleSearch = async (queryTopic: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/mizan/bioscience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: queryTopic }),
      });
      if (response.ok) {
        const res = await response.json();
        setData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#081f18]/80 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-cairo text-stone-100">
              العلوم الطبية الحيوية والأخلاق الإسلامية <span className="text-sm font-normal text-emerald-400/80">| BIOSCIENCE & BIOETHICS</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              تحقيق تاريخ الطب الإسلامي (ابن النفيس، الزهراوي، ابن سينا) والمسائل البيوطبية المعاصرة (زراعة الأعضاء، الجينوم، الخلايا الجذعية).
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="اكتب موضوعاً طبياً حيوياً (مثال: الاستنساخ، الخلايا الجذعية، التبرع بالقرنية...)"
            className="flex-1 bg-stone-900/90 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => handleSearch(topic)}
            disabled={loading || !topic.trim()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-stone-950 font-bold text-xs sm:text-sm rounded-xl transition-colors whitespace-nowrap shadow-md"
          >
            {loading ? 'جاري الفحص الطبي والشرعي...' : 'تحقيق المسألة الطبية'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-3 text-xs text-stone-400">
          <span>قضايا نموذجية:</span>
          {sampleTopics.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setTopic(s);
                handleSearch(s);
              }}
              className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-emerald-300 text-xs transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {data && (
        <div className="bg-[#071912] border border-stone-800 rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <h3 className="text-lg font-bold text-stone-100">{data.topic}</h3>
            <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold">
              توثيق طبي فقهي مزدوج
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-stone-900/70 border border-stone-800 space-y-2">
              <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                <Award className="w-4 h-4 text-amber-400" />
                <span>الإسهام والاكتشاف التاريخي في الحضارة الإسلامية:</span>
              </span>
              <p className="text-stone-200 text-xs sm:text-sm leading-relaxed">{data.historicalDiscovery}</p>
            </div>

            <div className="p-4 rounded-xl bg-stone-900/70 border border-stone-800 space-y-2">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                <Dna className="w-4 h-4 text-emerald-400" />
                <span>التكييف الفقهي والأخلاقي المعاصر (Bioethics):</span>
              </span>
              <p className="text-stone-200 text-xs sm:text-sm leading-relaxed">{data.contemporaryBioethics}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-900/40 border border-stone-800 space-y-2">
            <span className="font-bold text-stone-300 flex items-center gap-1.5 text-xs">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>المصادر المرجعية الطبية والفقهية:</span>
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-400 font-mono">
              {data.primarySources?.map((src, idx) => (
                <li key={idx} className="flex items-center gap-2 bg-stone-950/40 p-2 rounded border border-stone-900">
                  <span className="text-emerald-400">·</span>
                  <span className="truncate">{src}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs text-stone-200">
            <span className="font-bold text-emerald-300 block mb-1">الخلاصة والتوصية المنهجية:</span>
            <p className="leading-relaxed">{data.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
};
