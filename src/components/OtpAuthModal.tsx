import React, { useState, useEffect, useRef } from 'react';
import { Mail, KeyRound, Clock, ArrowRight, CheckCircle2, AlertCircle, Loader2, X, ShieldCheck } from 'lucide-react';

interface OtpAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any, token: string) => void;
}

export const OtpAuthModal: React.FC<OtpAuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(600); // 10 minutes

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((sec) => sec - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, secondsRemaining]);

  if (!isOpen) return null;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صالح');
      return;
    }

    setLoading(true);
    setError(null);
    setPreviewCode(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل إرسال كود التحقق');
      }

      setStep('otp');
      setSecondsRemaining(600); // 10 minutes
      if (data.previewCode) {
        setPreviewCode(data.previewCode);
      }
      setSuccessMsg('تم إرسال كود التحقق المكون من 6 أرقام إلى بريدك');
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 6) {
      setError('يرجى إدخال كود التحقق كاملاً (6 أرقام)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'رمز التحقق غير صالح');
      }

      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'فشل التحقق من الكود');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-cairo">
      <div className="bg-[#0b1f18] border border-amber-500/40 rounded-2xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative text-right">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center pb-4 border-b border-amber-900/40 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-stone-100">
            {step === 'email' ? 'تسجيل الدخول بالبريد الإلكتروني' : 'تأكيد رمز التحقق (OTP)'}
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            {step === 'email'
              ? 'أدخل بريدك الإلكتروني ليصلك كود تحقق سري وآمن صالح لمرة واحدة'
              : `أدخل الكود المكون من 6 أرقام المرسل إلى: ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {previewCode && step === 'otp' && (
          <div className="mb-4 p-3 rounded-xl bg-amber-950/40 border border-amber-600/60 text-amber-300 text-xs flex items-center justify-between">
            <span>كود التحقق التجريبي (للاختبار الفوري):</span>
            <span className="font-mono font-bold text-base tracking-widest text-white">{previewCode}</span>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                البريد الإلكتروني:
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoFocus
                  className="w-full bg-stone-900/90 border border-stone-700 rounded-xl px-4 py-3 pl-10 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري إنشاء وإرسال الرمز...</span>
                </>
              ) : (
                <>
                  <span>إرسال كود التحقق (OTP)</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: Enter 6-digit OTP */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div onPaste={handlePaste}>
              <label className="block text-xs font-semibold text-stone-300 mb-2 text-center">
                أدخل رمز التحقق (6 أرقام):
              </label>
              <div className="flex justify-center gap-2 dir-ltr">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono bg-stone-900 border-2 border-stone-700 rounded-xl text-amber-300 focus:outline-none focus:border-amber-400 focus:bg-stone-950 transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Timer and Resend button */}
            <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
              <div className="flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className={secondsRemaining < 60 ? 'text-rose-400 font-bold' : 'text-stone-300'}>
                  {formatTimer(secondsRemaining)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || secondsRemaining > 540}
                className="text-amber-400 hover:text-amber-300 disabled:opacity-40 transition-colors font-medium"
              >
                إعادة إرسال الرمز
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={loading || otpDigits.join('').length < 6}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق وتفعيل الحساب...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>تأكيد الحساب والدخول</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtpDigits(['', '', '', '', '', '']);
                }}
                className="w-full py-2 text-stone-400 hover:text-stone-200 text-xs transition-colors"
              >
                تغيير البريد الإلكتروني
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 pt-3 border-t border-stone-800/80 text-[11px] text-stone-400 text-center">
          حماية أمنية مشفرة بكلمة مرور لمرة واحدة (One-Time Password) تضمن خصوصيتك الكاملة.
        </div>
      </div>
    </div>
  );
};
