import React, { useState, useRef } from 'react';
import { Mic, MicOff, Play, Square, FileText, Check, Copy, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface AudioTranscriberToolProps {
  onSendToChat?: (transcribedText: string) => void;
}

export const AudioTranscriberTool: React.FC<AudioTranscriberToolProps> = ({ onSendToChat }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcribedText, setTranscribedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleTranscribeBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err: any) {
      setError('تعذر الوصول إلى الميكروفون. يرجى التحقق من أذونات المتصفح.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleTranscribeBlob = async (blob: Blob) => {
    setLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await fetch('/api/mizan/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioBase64: base64Data, mimeType: 'audio/webm' }),
        });

        if (!res.ok) throw new Error('فشل تفريغ الصوت عبر نموذج gemini-3.5-transcribe');
        const data = await res.json();
        setTranscribedText(data.text || '');
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      setError(err?.message || 'تعذر إتمام تفريغ الصوت');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcribedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-[#081f18]/80 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden text-center space-y-4">
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Mic className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-cairo text-stone-100">
            تفريـغ الصـوت والمحاضـرات <span className="text-sm font-normal text-amber-400/80">| AUDIO TRANSCRIBER</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 max-w-lg">
            سجل مقطعاً صوتياً أو درساً أو شبهة متداولة عبر الميكروفون ليقوم نموذج <span className="text-amber-300 font-mono">gemini-3.5-transcribe</span> بتحويله إلى نص دقيق ومضبوط فوراً لإخضاعه لميزان التحقيق.
          </p>
        </div>

        {/* Recording Controller */}
        <div className="py-6 flex flex-col items-center justify-center gap-4">
          {isRecording ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-lg font-bold animate-pulse">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span>جاري التسجيل: {recordingTime} ثانية</span>
              </div>
              <button
                onClick={stopRecording}
                className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-stone-100 font-bold text-sm shadow-xl flex items-center gap-2 transition-all"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>إيقاف التسجيل وتفريغه الآن</span>
              </button>
            </div>
          ) : (
            <button
              onClick={startRecording}
              disabled={loading}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-sm shadow-xl flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري التفريغ بواسطة Gemini...</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>ابدأ التسجيل الصوتي</span>
                </>
              )}
            </button>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Transcribed Text Result */}
        {transcribedText && (
          <div className="text-right p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800 text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> النص المفرغ:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 rounded text-stone-300 hover:text-stone-100 transition-colors flex items-center gap-1 text-[11px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                </button>
                {onSendToChat && (
                  <button
                    onClick={() => onSendToChat(transcribedText)}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 rounded text-stone-950 font-bold transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>إرسال للشات للتحقيق</span>
                  </button>
                )}
              </div>
            </div>

            <p className="font-cairo text-sm text-stone-100 leading-relaxed font-medium">
              {transcribedText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
