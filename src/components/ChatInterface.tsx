import React, { useState, useRef, useEffect } from 'react';
import { 
  ChatMessage, 
  PromptMode, 
  MizanAnalysisResult 
} from '../types/mizan.js';
import { MetadataCardView } from './MetadataCardView.js';
import { CognitiveFingerprintView } from './CognitiveFingerprintView.js';
import { FiqhMapView } from './FiqhMapView.js';
import { AcademicExportModal } from './AcademicExportModal.js';
import { 
  Send, 
  Scale, 
  BookOpen, 
  ScrollText, 
  Sparkles, 
  GraduationCap, 
  Copy, 
  Check, 
  HelpCircle, 
  Compass, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  FileText,
  Flame,
  ShieldAlert
} from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (query: string, mode: PromptMode) => Promise<void>;
  isLoading: boolean;
  onClearSession: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onClearSession,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<PromptMode>('academic');
  const [academicModalResult, setAcademicModalResult] = useState<MizanAnalysisResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, { quran: boolean; fiqh: boolean; markdown: boolean }>>({});

  const [loadingElapsed, setLoadingElapsed] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingElapsed(0);
      interval = setInterval(() => {
        setLoadingElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      setLoadingElapsed(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const toggleSection = (msgId: string, section: 'quran' | 'fiqh' | 'markdown') => {
    setExpandedSections((prev) => {
      const current = prev[msgId] || { quran: true, fiqh: true, markdown: true };
      return {
        ...prev,
        [msgId]: {
          ...current,
          [section]: !current[section],
        },
      };
    });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;
    const query = inputQuery.trim();
    setInputQuery('');
    await onSendMessage(query, selectedMode);
  };

  const quickBenchPrompts = [
    { label: 'حكم العملات الرقمية المشفرة', query: 'ما حكم تداول العملات الرقمية المشفرة مثل البيتكوين في الشريعة الإسلامية؟', mode: 'academic' as PromptMode },
    { label: 'تخريج: اطلبوا العلم ولو بالصين', query: 'هل حديث «اطلبوا العلم ولو بالصين» صحيح أم ضعيف؟ وما علته؟', mode: 'quick' as PromptMode },
    { label: 'فرية حرق مكتبة الإسكندرية', query: 'هل أمر عمرو بن العاص بحرق مكتبة الإسكندرية تاريخياً؟', mode: 'academic' as PromptMode },
    { label: 'القنوت في صلاة الفجر', query: 'ما حكم دعاء القنوت في صلاة الفجر عند المذاهب الأربعة؟', mode: 'academic' as PromptMode },
    { label: 'صحة: اختلاف أمتي رحمة', query: 'هل عبارة «اختلاف أمتي رحمة» حديث نبوي مرفوع أم قول مأثور؟', mode: 'quick' as PromptMode },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-5xl mx-auto px-3 sm:px-6">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6">
        {messages.length === 0 ? (
          /* Empty / Welcome State */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 p-4 animate-in fade-in duration-300">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-700/20 via-emerald-950/80 to-stone-900 border border-amber-500/40 shadow-2xl">
              <Scale className="w-10 h-10 text-amber-400" />
            </div>

            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold font-cairo text-stone-100">
                منصة مِيـزَان للتحقيق المعرفي والشرعي
              </h2>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-cairo">
                «ميزان لا يسأل فقط: ماذا يقول الذكاء الاصطناعي؟ بل يسأل: ما الدليل؟ ومن أين جاء؟ وهل نُقل بأمانة؟ وهل يوجد خلاف معتبر؟ وهل يستحق أن نصدقه؟»
              </p>
            </div>

            {/* Prompt Mode Explainer */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl w-full text-xs text-right">
              <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800">
                <div className="font-bold text-amber-300 mb-1">⚡ سريعة وموثقة</div>
                <div className="text-stone-400 text-[11px]">نقاط مركزة، خلاصات واضحة، وتخريج مباشر.</div>
              </div>
              <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800">
                <div className="font-bold text-emerald-300 mb-1">🎓 بحثية وأكاديمية</div>
                <div className="text-stone-400 text-[11px]">أدلة مفصلة، نقد أسانيد، وهوامش علمية.</div>
              </div>
              <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800">
                <div className="font-bold text-sky-300 mb-1">🌱 تعليمية مبسطة</div>
                <div className="text-stone-400 text-[11px]">أسلوب سهل ميسر للناشئة مع ضرب الأمثلة.</div>
              </div>
              <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800">
                <div className="font-bold text-purple-300 mb-1">⚖️ مناظرة علمية</div>
                <div className="text-stone-400 text-[11px]">عرض حجج المذاهب والردود بحيادية تامة.</div>
              </div>
            </div>

            {/* Curated Benchmark Quick Starts */}
            <div className="w-full max-w-3xl pt-2">
              <div className="text-xs font-semibold text-stone-400 mb-2 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>اختر مسألة للتحقيق الفوري:</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {quickBenchPrompts.map((b, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedMode(b.mode);
                      onSendMessage(b.query, b.mode);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#072017] hover:bg-[#0c2f23] border border-amber-600/30 text-stone-200 hover:text-amber-300 text-xs font-medium transition-all shadow-sm"
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Conversation stream */
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const res = msg.result;
            const sections = expandedSections[msg.id] || { quran: true, fiqh: true, markdown: true };

            if (isUser) {
              return (
                <div key={msg.id} className="flex justify-start">
                  <div className="max-w-2xl bg-amber-950/40 border border-amber-700/50 rounded-2xl rounded-tr-sm p-4 text-stone-100 text-sm shadow-md">
                    <div className="flex items-center gap-2 text-xs text-amber-400/90 mb-1">
                      <span className="font-semibold">السؤال / النص المطروح للتحقيق:</span>
                    </div>
                    <p className="font-cairo text-base font-medium">{msg.content}</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="space-y-4">
                {/* Assistant Mizan Box */}
                <div className="bg-[#071912] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                  {/* Decorative top accent */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-600 via-amber-400 to-emerald-600" />

                  {/* Header bar of response */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-amber-900/40">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <Scale className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-stone-100 text-base font-cairo">
                            تقرير التحقيق المعرفي والشرعي
                          </h3>
                          <span className="text-[11px] text-stone-400">
                            (النمط: {msg.mode === 'quick' ? 'سريع وموثق' : msg.mode === 'academic' ? 'بحثي أكاديمي' : msg.mode === 'educational' ? 'تعليمي مبسط' : 'مناظرة علمية'})
                          </span>
                        </div>
                        <span className="text-xs text-stone-400">
                          «تحقيق الدليل، نقد السند، وتحرير المذاهب»
                        </span>
                      </div>
                    </div>

                    {res && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setAcademicModalResult(res)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-colors"
                        >
                          <GraduationCap className="w-4 h-4 text-amber-400" />
                          <span>صيغة ورقة بحثية</span>
                        </button>

                        <button
                          onClick={() => handleCopy(msg.id, res.fullMarkdown || res.summary)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-stone-100 text-xs transition-colors"
                          title="نسخ التقرير"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === msg.id ? 'تم النسخ' : 'نسخ'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Summary / Core Answer */}
                  {res ? (
                    <div className="space-y-5">
                      {/* Executive Summary */}
                      <div className="p-4 rounded-xl bg-stone-900/70 border border-stone-800 text-stone-200 text-sm leading-relaxed font-cairo">
                        <span className="font-bold text-amber-400 block mb-1.5 text-xs">خلاصة التحقيق الأصولي:</span>
                        <p>{res.summary}</p>
                      </div>

                      {/* 1. Revelation (الاستناد إلى الوحي) */}
                      {(res.quranEvidences.length > 0 || res.hadithEvidences.length > 0) && (
                        <div className="rounded-xl border border-stone-800 bg-stone-950/40 overflow-hidden">
                          <button
                            onClick={() => toggleSection(msg.id, 'quran')}
                            className="w-full flex items-center justify-between p-3.5 bg-stone-900/60 text-xs font-bold text-stone-200 hover:bg-stone-900 transition-colors"
                          >
                            <span className="flex items-center gap-2 text-emerald-400">
                              <BookOpen className="w-4 h-4" />
                              الاستناد إلى الوحي (القرآن العظيم والسنة النبوية الصحيحة)
                            </span>
                            {sections.quran ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>

                          {sections.quran && (
                            <div className="p-4 space-y-3.5 text-xs">
                              {/* Quran */}
                              {res.quranEvidences.map((q, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-stone-900/50 border border-stone-800/80">
                                  <div className="font-amiri text-lg text-amber-200 mb-1 leading-relaxed">
                                    ﴿ {q.ayah} ﴾
                                  </div>
                                  <div className="text-stone-400 text-[11px] flex items-center gap-2">
                                    <span className="text-stone-300 font-semibold">سورة {q.surah}{q.ayahNumber ? `، الآية ${q.ayahNumber}` : ''}</span>
                                    <span>·</span>
                                    <span>{q.tafsirSummary}</span>
                                  </div>
                                </div>
                              ))}

                              {/* Hadiths with Takhrij and Grade */}
                              {res.hadithEvidences.map((h, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-stone-900/50 border border-stone-800/80 space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-stone-400 font-mono">
                                      {h.takhrij} {h.sourceBook && `· ${h.sourceBook}`}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                      h.grade === 'صحيح' ? 'bg-emerald-950 text-emerald-300 border-emerald-700' :
                                      h.grade === 'حسن' ? 'bg-teal-950 text-teal-300 border-teal-700' :
                                      'bg-amber-950 text-amber-300 border-amber-700'
                                    }`}>
                                      {h.grade}
                                    </span>
                                  </div>
                                  <div className="font-amiri text-base text-amber-100 py-1">
                                    « {h.matn} »
                                  </div>
                                  {h.narrator && (
                                    <div className="text-[11px] text-stone-400">
                                      الراوي: <span className="text-stone-300">{h.narrator}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 2. Fiqh Map (مقارنة المذاهب الفقهية) */}
                      {res.fiqhOpinions && res.fiqhOpinions.length > 0 && (
                        <div className="rounded-xl border border-stone-800 bg-stone-950/40 overflow-hidden">
                          <button
                            onClick={() => toggleSection(msg.id, 'fiqh')}
                            className="w-full flex items-center justify-between p-3.5 bg-stone-900/60 text-xs font-bold text-stone-200 hover:bg-stone-900 transition-colors"
                          >
                            <span className="flex items-center gap-2 text-amber-400">
                              <Compass className="w-4 h-4" />
                              خريطة المذاهب الفقهية الأربعة والمجامع
                            </span>
                            {sections.fiqh ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>

                          {sections.fiqh && (
                            <div className="p-4">
                              <FiqhMapView
                                topic={res.query}
                                opinions={res.fiqhOpinions}
                                consensusPoints={res.consensusPoints}
                                divergencePoints={res.divergencePoints}
                                weightedOpinion={res.weightedOpinion}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. Full Analytical Markdown */}
                      {res.fullMarkdown && (
                        <div className="p-4 rounded-xl bg-stone-900/40 border border-stone-800 text-xs sm:text-sm text-stone-200 leading-relaxed font-cairo space-y-2 prose prose-invert max-w-none">
                          <div className="font-bold text-stone-300 pb-1 border-b border-stone-800 text-xs">
                            التحقيق الموسع وتفكيك الأدلة:
                          </div>
                          <div className="whitespace-pre-line text-stone-300">
                            {res.fullMarkdown}
                          </div>
                        </div>
                      )}

                      {/* 4. Advisory notice */}
                      {res.advisoryNotice && (
                        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200/90 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-300">تنبيه وضابط استرشادي: </span>
                            {res.advisoryNotice}
                          </div>
                        </div>
                      )}

                      {/* 5. Cognitive Fingerprint */}
                      <CognitiveFingerprintView fingerprint={res.cognitiveFingerprint} />

                      {/* 6. Signature Metadata Card */}
                      <MetadataCardView metadata={res.metadataCard} queryTime={new Date(res.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })} />
                    </div>
                  ) : (
                    <div className="text-sm text-stone-200 leading-relaxed whitespace-pre-line font-cairo">
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Progressive Verification Skeleton Screen */}
        {isLoading && (
          <div className="p-5 sm:p-6 rounded-2xl bg-[#081a14] border border-amber-500/50 shadow-2xl space-y-5 animate-in fade-in duration-300">
            {/* Top Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-900/40">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Scale className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-300 font-cairo flex items-center gap-2">
                    <span>جاري تشغيل مسار الفحص والتحقيق السباعي</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    استقراء الأدلة وتخريج الأحاديث وتحرير المذاهب بدقة علمية
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400/90 bg-stone-900/90 px-2.5 py-1 rounded-lg border border-stone-800">
                <span>⏱️</span>
                <span>{loadingElapsed} ثانية</span>
              </div>
            </div>

            {/* 5 Progressive Verification Stages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                loadingElapsed >= 0 
                  ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200' 
                  : 'bg-stone-900/60 border-stone-800 text-stone-500'
              }`}>
                <span className={`w-2 h-2 rounded-full ${loadingElapsed < 2 ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                <span className="font-medium">1. تفكيك السؤال وعزل الادعاءات</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                loadingElapsed >= 2 
                  ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200' 
                  : 'bg-stone-900/60 border-stone-800 text-stone-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${loadingElapsed >= 2 && loadingElapsed < 4 ? 'bg-amber-400 animate-ping' : loadingElapsed >= 4 ? 'bg-emerald-400' : 'bg-stone-600'}`} />
                <span className="font-medium">2. استقراء القرآن وصحيح السنة</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                loadingElapsed >= 4 
                  ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200' 
                  : 'bg-stone-900/60 border-stone-800 text-stone-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${loadingElapsed >= 4 && loadingElapsed < 6 ? 'bg-amber-400 animate-ping' : loadingElapsed >= 6 ? 'bg-emerald-400' : 'bg-stone-600'}`} />
                <span className="font-medium">3. تحرير المذاهب الأربعة</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                loadingElapsed >= 6 
                  ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200' 
                  : 'bg-stone-900/60 border-stone-800 text-stone-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${loadingElapsed >= 6 && loadingElapsed < 8 ? 'bg-amber-400 animate-ping' : loadingElapsed >= 8 ? 'bg-emerald-400' : 'bg-stone-600'}`} />
                <span className="font-medium">4. ضبط علة الخلاف والترجيح</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all sm:col-span-2 md:col-span-1 ${
                loadingElapsed >= 8 
                  ? 'bg-amber-950/40 border-amber-600/50 text-amber-200' 
                  : 'bg-stone-900/60 border-stone-800 text-stone-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${loadingElapsed >= 8 ? 'bg-amber-400 animate-pulse' : 'bg-stone-600'}`} />
                <span className="font-medium">5. صياغة بطاقة التوثيق والبصمة</span>
              </div>
            </div>

            {/* Shimmering Skeleton Mock Output */}
            <div className="space-y-3 pt-2">
              {/* Summary line skeleton */}
              <div className="p-3.5 rounded-xl bg-stone-900/70 border border-stone-800/80 space-y-2">
                <div className="h-3.5 bg-gradient-to-r from-amber-500/20 via-amber-500/40 to-amber-500/20 rounded w-full animate-pulse" />
                <div className="h-3 bg-stone-800 rounded w-5/6 animate-pulse" />
                <div className="h-3 bg-stone-800/60 rounded w-4/6 animate-pulse" />
              </div>

              {/* Evidences Card Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#061811] border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-amber-500/30 animate-pulse" />
                    <div className="h-3 bg-amber-500/30 rounded w-1/3 animate-pulse" />
                  </div>
                  <div className="h-3 bg-stone-800 rounded w-full animate-pulse" />
                  <div className="h-2.5 bg-stone-800/60 rounded w-2/3 animate-pulse" />
                </div>

                <div className="p-3.5 rounded-xl bg-[#061811] border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-500/30 animate-pulse" />
                    <div className="h-3 bg-emerald-500/30 rounded w-1/3 animate-pulse" />
                  </div>
                  <div className="h-3 bg-stone-800 rounded w-full animate-pulse" />
                  <div className="h-2.5 bg-stone-800/60 rounded w-2/3 animate-pulse" />
                </div>
              </div>

              {/* Fiqh Opinions Matrix Skeleton */}
              <div className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800 space-y-2">
                <div className="h-3 bg-stone-700/60 rounded w-1/4 animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="h-10 bg-stone-800/60 rounded-lg animate-pulse" />
                  <div className="h-10 bg-stone-800/60 rounded-lg animate-pulse" />
                  <div className="h-10 bg-stone-800/60 rounded-lg animate-pulse" />
                  <div className="h-10 bg-stone-800/60 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Dock Area */}
      <div className="pt-2 pb-3 bg-[#08110e]/95 backdrop-blur-md">
        {/* Quick Suggestion Pills if conversation already active */}
        {messages.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-[11px] no-scrollbar">
            <span className="text-stone-400 shrink-0 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>اقتراحات:</span>
            </span>
            {quickBenchPrompts.map((b, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSelectedMode(b.mode);
                  onSendMessage(b.query, b.mode);
                }}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-stone-900/90 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 text-stone-300 hover:text-amber-300 whitespace-nowrap transition-colors"
              >
                {b.label}
              </button>
            ))}
          </div>
        )}

        {/* Mode Selector Segmented Controls */}
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center gap-1 bg-stone-900/80 p-1 rounded-xl border border-stone-800 text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedMode('quick')}
              className={`px-3 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedMode === 'quick'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              ⚡ سريعة وموثقة
            </button>
            <button
              onClick={() => setSelectedMode('academic')}
              className={`px-3 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedMode === 'academic'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              🎓 بحثية وأكاديمية
            </button>
            <button
              onClick={() => setSelectedMode('educational')}
              className={`px-3 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedMode === 'educational'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              🌱 تعليمية مبسطة
            </button>
            <button
              onClick={() => setSelectedMode('debate')}
              className={`px-3 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedMode === 'debate'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              ⚖️ مناظرة علمية
            </button>
          </div>

          <span className="text-[11px] text-stone-500 hidden sm:inline">
            مدقق شرعي وتاريخي محكم
          </span>
        </div>

        {/* Input Textarea Form */}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <textarea
            rows={2}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="اطرح مسألة شرعية، حديثاً للتخريج، واقعة تاريخية، أو ادعاءً لتفكيكه..."
            disabled={isLoading}
            className="w-full bg-[#0a1f18] border border-amber-600/30 rounded-2xl pl-14 pr-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none font-cairo shadow-inner"
          />

          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            title="إرسال للتحقيق"
          >
            <Send className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>
      </div>

      {/* Academic Paper Export Modal */}
      {academicModalResult && (
        <AcademicExportModal
          result={academicModalResult}
          onClose={() => setAcademicModalResult(null)}
        />
      )}
    </div>
  );
};
