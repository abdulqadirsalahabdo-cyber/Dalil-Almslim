import React from 'react';
import { 
  Scale, 
  BookOpen, 
  ScrollText, 
  AlertTriangle, 
  ShieldCheck, 
  Trash2, 
  FileText,
  Compass,
  Gamepad2,
  Box,
  HeartPulse,
  Mic,
  Palette,
  Globe,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut, User } from '../firebase.js';

export type AppTab = 
  | 'chat' 
  | 'scale3d'
  | 'game'
  | 'hadith' 
  | 'quote' 
  | 'fiqh' 
  | 'rumor' 
  | 'bioscience'
  | 'transcribe'
  | 'media'
  | 'geosearch';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenGovernance: () => void;
  onClearSession: () => void;
  hasMessages: boolean;
  currentUser: User | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenGovernance,
  onClearSession,
  hasMessages,
  currentUser,
}) => {
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Firebase sign-in cancelled or popup closed');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="border-b border-amber-900/30 bg-[#071712]/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Slogan */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-700/30 via-emerald-900/60 to-stone-900 border border-amber-500/40 shadow-inner">
              <Scale className="w-5 h-5 text-amber-400" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="متصل بالتوثيق" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-cairo text-stone-100">
                  مِيـزَان <span className="text-amber-400 font-serif font-normal text-lg">| MIZAN AI</span>
                </h1>
                <span className="text-[10px] font-medium text-emerald-300 bg-emerald-950/80 border border-emerald-700/50 px-2 py-0.5 rounded">
                  مدقق إسلامي موثق
                </span>
              </div>
              <p className="text-[11px] text-stone-400 max-w-sm hidden sm:block truncate">
                «ما الدليل؟ ومن أين جاء؟ وهل نُقل بأمانة؟ وهل يوجد خلاف معتبر؟»
              </p>
            </div>
          </div>

          {/* Mobile Auth button */}
          <div className="md:hidden flex items-center gap-1.5">
            {currentUser ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-300"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 text-stone-950 text-xs font-bold"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>دخول</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Functional interactive buttons) */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 text-xs no-scrollbar">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>الشات</span>
          </button>

          <button
            onClick={() => setActiveTab('scale3d')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'scale3d'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/40'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-amber-400" />
            <span>الميزان (3D)</span>
          </button>

          <button
            onClick={() => setActiveTab('game')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'game'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/40'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>اللعبة (3D)</span>
          </button>

          <button
            onClick={() => setActiveTab('hadith')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'hadith'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/40'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>الحديث</span>
          </button>

          <button
            onClick={() => setActiveTab('quote')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'quote'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>الاقتباس</span>
          </button>

          <button
            onClick={() => setActiveTab('fiqh')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'fiqh'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/40'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>خريطة الخلاف</span>
          </button>

          <button
            onClick={() => setActiveTab('rumor')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'rumor'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/40'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>الشائعات</span>
          </button>

          <button
            onClick={() => setActiveTab('bioscience')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'bioscience'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/40'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-teal-400" />
            <span>الطب الحيوي</span>
          </button>

          <button
            onClick={() => setActiveTab('transcribe')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'transcribe'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/40'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-sky-400" />
            <span>تفريغ الصوت</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'media'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/40'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            <span>الوسائط الذكية</span>
          </button>

          <button
            onClick={() => setActiveTab('geosearch')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'geosearch'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/40'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>الجغرافيا والبحث</span>
          </button>
        </div>

        {/* User Auth & Actions */}
        <div className="hidden md:flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-stone-900/80 px-2.5 py-1 rounded-xl border border-stone-800 text-xs">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="User" className="w-5 h-5 rounded-full" />
              ) : (
                <UserIcon className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-stone-200 font-medium truncate max-w-[100px]">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>
              <button
                onClick={handleSignOut}
                className="text-stone-400 hover:text-rose-300 transition-colors mr-1"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 text-xs font-bold transition-all shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>تسجيل الدخول (Google)</span>
            </button>
          )}

          <button
            onClick={onOpenGovernance}
            className="p-1.5 rounded-lg text-stone-300 hover:text-stone-100 hover:bg-stone-800/50 border border-stone-800 transition-colors"
            title="المنهجية والحوكمة"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </button>

          {hasMessages && (
            <button
              onClick={onClearSession}
              className="p-1.5 rounded-lg text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 border border-rose-900/40 transition-colors"
              title="حذف المحادثة فوراً"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
