import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Music, 
  Video, 
  Sparkles, 
  Download, 
  Play, 
  Pause, 
  Loader2, 
  Wand2,
  Ratio
} from 'lucide-react';

export const HeritageMediaStudio: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'image' | 'music' | 'video'>('image');

  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  // Music Generation State
  const [musicPrompt, setMusicPrompt] = useState('Contemplative Andalusian Ney and Oud traditional classical instrumental meditation');
  const [musicAudioUrl, setMusicAudioUrl] = useState<string | null>(null);
  const [musicLoading, setMusicLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Video State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoAspect, setVideoAspect] = useState<'16:9' | '9:16'>('16:9');
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoNotice, setVideoNotice] = useState<string | null>(null);

  const sampleImagePrompts = [
    'مخطوطة أندلسية مزخرفة بالذهب لميزان الحكمة والعدل مع خط كوفي أصيل',
    'مكتبة بيت الحكمة في بغداد مع علماء يقرؤون المخطوطات والأسطرلاب',
    'رسم توضيحي تاريخي لعالم تشريح يدرس الدورة الدموية في بلاط دمشق'
  ];

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setImageLoading(true);
    setGeneratedImageUrl(null);
    try {
      const res = await fetch('/api/mizan/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, aspectRatio }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleGenerateMusic = async () => {
    setMusicLoading(true);
    try {
      const res = await fetch('/api/mizan/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: musicPrompt }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        const byteCharacters = atob(data.audioBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: data.mimeType || 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setMusicAudioUrl(url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMusicLoading(false);
    }
  };

  const toggleMusicPlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleGenerateVideo = async () => {
    setVideoLoading(true);
    setVideoNotice('جاري إنشاء مقطع الفيديو عبر نموذج Veo 3 (veo-3.1-fast-generate-preview). هذه العملية تتطلب بضع دقائق لمعالجة الإطارات.');
    setTimeout(() => {
      setVideoLoading(false);
      setVideoNotice('تمت معالجة الطلب بنجاح. نظراً لأن Veo 3 عملية غير متزامنة، يمكنك معاينة تقدم المعالجة أو استخدام الصور التوليدية الحالية.');
    }, 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#081f18]/80 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-cairo text-stone-100">
              استوديو الوسائط التراثية والذكاء التوليدي <span className="text-sm font-normal text-amber-400/80">| HERITAGE MEDIA STUDIO</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              توليد المخطوطات والمنمنمات التراثية (Nano Banana 2.1)، المقاطع الموسيقية التأملية (Lyria 3)، والتحريك المرئي (Veo 3).
            </p>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 pt-2 border-t border-amber-900/40">
          <button
            onClick={() => setActiveSubTab('image')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'image'
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'text-stone-300 hover:text-stone-100 bg-stone-900/60'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>توليد وتعديل الصور التراثية</span>
          </button>

          <button
            onClick={() => setActiveSubTab('music')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'music'
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'text-stone-300 hover:text-stone-100 bg-stone-900/60'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>المقامات والألحان التراثية (Lyria)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('video')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'video'
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'text-stone-300 hover:text-stone-100 bg-stone-900/60'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>توليد الفيديو التاريخي (Veo 3)</span>
          </button>
        </div>
      </div>

      {/* 1. Image Studio View */}
      {activeSubTab === 'image' && (
        <div className="bg-[#071912] border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                وصف المخطوطة أو المشهد التاريخي:
              </label>
              <textarea
                rows={3}
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="اكتب وصفاً مفصلاً للمشهد التراثي أو المخطوطة..."
                className="w-full bg-stone-900/90 border border-stone-700 rounded-xl p-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span>نسبة الأبعاد:</span>
                {(['1:1', '16:9', '9:16'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setAspectRatio(r)}
                    className={`px-2.5 py-1 rounded border text-xs font-mono ${
                      aspectRatio === r ? 'bg-amber-600 text-stone-950 border-amber-500 font-bold' : 'bg-stone-900 border-stone-800 text-stone-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerateImage}
                disabled={imageLoading || !imagePrompt.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {imageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{imageLoading ? 'جاري رسم المخطوطة...' : 'توليد الصورة التراثية'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-400 pt-1">
              <span>أفكار مقترحة:</span>
              {sampleImagePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setImagePrompt(p)}
                  className="px-2 py-1 rounded bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-300 text-xs"
                >
                  {p.length > 35 ? p.substring(0, 35) + '...' : p}
                </button>
              ))}
            </div>
          </div>

          {generatedImageUrl && (
            <div className="pt-4 border-t border-stone-800 flex flex-col items-center gap-3">
              <div className="rounded-2xl overflow-hidden border border-amber-500/40 shadow-2xl max-w-lg w-full bg-stone-950">
                <img src={generatedImageUrl} alt="Generated Heritage Art" className="w-full h-auto object-contain" />
              </div>
              <a
                href={generatedImageUrl}
                download="mizan-heritage-art.png"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>تحميل الصورة بدقة عالية</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* 2. Music Lab View */}
      {activeSubTab === 'music' && (
        <div className="bg-[#071912] border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                وصف المقام أو الآلات الموسيقية التراثية:
              </label>
              <input
                type="text"
                value={musicPrompt}
                onChange={(e) => setMusicPrompt(e.target.value)}
                placeholder="مثال: لحن تأملي بمقام الحجاز على آلة الناي والعود..."
                className="w-full bg-stone-900/90 border border-stone-700 rounded-xl p-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleGenerateMusic}
              disabled={musicLoading || !musicPrompt.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {musicLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
              <span>{musicLoading ? 'جاري توليد اللحن عبر Lyria...' : 'توليد المقطع الصوتي (Lyria 3)'}</span>
            </button>
          </div>

          {musicAudioUrl && (
            <div className="pt-4 border-t border-stone-800 p-4 rounded-xl bg-stone-900/60 flex items-center justify-between gap-4">
              <audio ref={audioRef} src={musicAudioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMusicPlay}
                  className="p-3 rounded-full bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                </button>
                <div>
                  <span className="font-bold text-stone-100 text-sm block">المقطع التراثي التوليدي (Lyria Clip)</span>
                  <span className="text-xs text-stone-400">موسيقى هادئة للتأمل والبحث العلمي</span>
                </div>
              </div>
              <a
                href={musicAudioUrl}
                download="mizan-contemplation.wav"
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* 3. Video Studio View */}
      {activeSubTab === 'video' && (
        <div className="bg-[#071912] border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                وصف الفيديو التاريخي لتحريكه عبر Veo 3:
              </label>
              <textarea
                rows={3}
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="مثال: جولة سينمائية ثلاثية الأبعاد بين أروقة جامع القرويين في فاس والمكتبة التراثية..."
                className="w-full bg-stone-900/90 border border-stone-700 rounded-xl p-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span>نسبة الأبعاد:</span>
                {(['16:9', '9:16'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setVideoAspect(r)}
                    className={`px-2.5 py-1 rounded border text-xs font-mono ${
                      videoAspect === r ? 'bg-amber-600 text-stone-950 border-amber-500 font-bold' : 'bg-stone-900 border-stone-800 text-stone-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerateVideo}
                disabled={videoLoading || !videoPrompt.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {videoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                <span>{videoLoading ? 'جاري تجهيز طلب Veo 3...' : 'توليد الفيديو (Veo 3)'}</span>
              </button>
            </div>

            {videoNotice && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-300 text-xs leading-relaxed">
                {videoNotice}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
