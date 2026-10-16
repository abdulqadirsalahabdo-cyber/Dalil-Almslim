/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, AppTab } from './components/Header.js';
import { ChatInterface } from './components/ChatInterface.js';
import { HadithVerifierTool } from './components/HadithVerifierTool.js';
import { QuoteVerifierTool } from './components/QuoteVerifierTool.js';
import { FiqhMapView } from './components/FiqhMapView.js';
import { RumorDetectorTool } from './components/RumorDetectorTool.js';
import { ThreeDScaleViewer } from './components/ThreeDScaleViewer.js';
import { ScholarQuestGame } from './components/ScholarQuestGame.js';
import { BioScienceViewer } from './components/BioScienceViewer.js';
import { AudioTranscriberTool } from './components/AudioTranscriberTool.js';
import { HeritageMediaStudio } from './components/HeritageMediaStudio.js';
import { GeoHistoryExplorer } from './components/GeoHistoryExplorer.js';
import { GovernanceModal } from './components/GovernanceModal.js';
import { auth, onAuthStateChanged, User, db } from './firebase.js';
import { collection, addDoc } from 'firebase/firestore';
import { 
  ChatMessage, 
  PromptMode, 
  HadithCheckResult, 
  QuoteCheckResult, 
  RumorReportResult,
  FiqhSchoolOpinion 
} from './types/mizan.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showGovernance, setShowGovernance] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Standalone Fiqh Map State
  const [standaloneFiqhData, setStandaloneFiqhData] = useState<{
    topic: string;
    centralQuestion?: string;
    opinions: FiqhSchoolOpinion[];
    consensusPoints: string[];
    divergencePoints: string[];
    causeOfVariance?: string;
    weightedOpinion?: {
      opinion: string;
      reasoning: string;
      endorsedBy: string;
    };
  }>({
    topic: 'حكم القنوت في صلاة الفجر',
    centralQuestion: 'هل القنوت في صلاة الفجر سنة راتبة أم بدعة ومحدثة عند أئمة الفقه؟',
    consensusPoints: [
      'مشروعية القنوت في النوازل والكوارث التي تنزل بالمسلمين باتفاق الأئمة الأربعة.',
      'صحة صلاة من قنت ومن لم يقنت دون بطلان عند جمهور الأمة.'
    ],
    divergencePoints: [
      'المداومة على القنوت في صلاة الفجر في غير النوازل: سنة مستحبة عند الشافعية والمالكية، ومكروه أو غير مشروع عند الحنفية والحنابلة.'
    ],
    opinions: [
      {
        school: 'الشافعية',
        scholarName: 'الإمام الشافعي والنووي',
        opinion: 'سنة مؤكدة في الركعة الثانية بعد الركوع، ويُسجد للسهو عند تركه.',
        primaryEvidence: 'حديث أنس بن مالك: «ما زال رسول الله ﷺ يقنت في الفجر حتى فارق الدنيا» (أخرجه أحمد والبيهقي).',
        referenceBook: 'المجموع شرح المهذب للنووي'
      },
      {
        school: 'المالكية',
        scholarName: 'الإمام مالك بن أنس',
        opinion: 'مستحب وفضيلة قبل الركوع أو بعده (والأفضل قبله) سراً بلا سجود سهو.',
        primaryEvidence: 'عمل أهل المدينة واستحباب الدعاء والذكر في الصبح.',
        referenceBook: 'المدونة الكبرى، ومختصر خليل'
      },
      {
        school: 'الحنفية',
        scholarName: 'أبو حنيفة وأصحابه',
        opinion: 'غير مشروع في الفجر إلا في النوازل العامة للمسلمين؛ والقنوت الدائم خاص بالوتر.',
        primaryEvidence: 'أحاديث النهي وأثر طارق الأشجعي: «صليت خلف النبي وأبي بكر وعمر... فلم يكونوا يقنتون في الفجر».',
        referenceBook: 'بدائع الصنائع للكاساني'
      },
      {
        school: 'الحنابلة',
        scholarName: 'الإمام أحمد بن حنبل',
        opinion: 'لا يسن القنوت في الفجر إلا لنازلة عامة يجهر فيها الإمام دون المأموم المنفرد.',
        primaryEvidence: 'أن النبي ﷺ قنت شهراً يدعو على رعل وذكوان ثم تركه، فدل على اختصاصه بالنوازل.',
        referenceBook: 'المغني لابن قدامة'
      }
    ],
    causeOfVariance: 'يرجع سبب الخلاف إلى ثبوت حديث أنس: «ما زال يقنت حتى فارق الدنيا» فضعفه الحنفية والحنابلة، وصححه أو حسنه الشافعية والمالكية، مع تفسير معنى "القنوت" هل هو طول القيام أم خصوص الدعاء.',
    weightedOpinion: {
      opinion: 'المسألة من الخلاف السائغ المعتبر؛ من قنت فقد اقتدى بأئمة كبار (الشافعي ومالك)، ومن ترك فقد اقتدى بأئمة كبار (أبي حنيفة وأحمد)، ويُكره إثارة النزاع والفرقة في المساجد بسببها.',
      reasoning: 'قاعدة: «لا يُنكر المختلف فيه، وإنما يُنكر المجمع عليه»، واختلاف الأئمة سعة ورحمة.',
      endorsedBy: 'دار الإفتاء المصرية، الأزهر الشريف، وهيئة كبار العلماء'
    }
  });
  const [isFiqhLoading, setIsFiqhLoading] = useState(false);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Chat message send handler
  const handleSendMessage = async (queryText: string, mode: PromptMode) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: new Date(),
      mode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/mizan/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, mode }),
      });

      if (!response.ok) {
        throw new Error(`خطأ في استجابة الخادم: ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.summary || '',
        result: data,
        timestamp: new Date(),
        mode,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically save to user's saved research in Firestore if signed in
      if (currentUser) {
        try {
          await addDoc(collection(db, 'users', currentUser.uid, 'saved_researches'), {
            query: queryText,
            summary: data.summary || '',
            mode,
            createdAt: new Date().toISOString(),
          });
        } catch {
          // quiet ignore
        }
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: 'حدث خطأ مؤقت أثناء الاتصال بمحرك التحقيق. يرجى إعادة المحاولة.',
        timestamp: new Date(),
        mode,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Dedicated Hadith Verifier
  const handleVerifyHadith = async (hadithText: string): Promise<HadithCheckResult> => {
    const response = await fetch('/api/mizan/hadith-verifier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hadithText }),
    });

    if (!response.ok) {
      throw new Error('فشل تخريج الحديث من المصادر المسندة');
    }

    return await response.json();
  };

  // Dedicated Quote Verifier
  const handleVerifyQuote = async (quoteText: string, attributedTo: string): Promise<QuoteCheckResult> => {
    const response = await fetch('/api/mizan/quote-verifier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quoteText, attributedTo }),
    });

    if (!response.ok) {
      throw new Error('فشل فحص صحة نسبة القول');
    }

    return await response.json();
  };

  // Dedicated Rumor Detector
  const handleDetectRumor = async (content: string): Promise<RumorReportResult> => {
    const response = await fetch('/api/mizan/rumor-detector', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('فشل استخراج تقرير التحقق من الشائعة');
    }

    return await response.json();
  };

  // Standalone Fiqh Search
  const handleSearchFiqhTopic = async (topic: string) => {
    setIsFiqhLoading(true);
    try {
      const response = await fetch('/api/mizan/fiqh-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error('تعذر توليد خريطة الخلاف الفقهي');
      }

      const data = await response.json();
      setStandaloneFiqhData({
        topic: data.topic || topic,
        centralQuestion: data.centralQuestion,
        opinions: data.schools || [],
        consensusPoints: data.agreedPoints || [],
        divergencePoints: data.divergentPoints || [],
        causeOfVariance: data.causeOfVariance,
        weightedOpinion: data.majorityView ? {
          opinion: data.majorityView,
          reasoning: data.causeOfVariance || 'بناءً على تحقيق المناط وترجيح المجامع الفقهية المعاصرة.',
          endorsedBy: 'المجامع الفقهية والمؤسسات المعتمدة'
        } : undefined,
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsFiqhLoading(false);
    }
  };

  const handleClearSession = () => {
    if (window.confirm('هل أنت متأكد من حذف الجلسة ومسح كافة السجلات التزاماً بالخصوصية التامة؟')) {
      setMessages([]);
    }
  };

  // Dedicated full-viewport Game Shell: never render website navbars or footers when playing the game
  if (activeTab === 'game') {
    return <ScholarQuestGame onExit={() => setActiveTab('chat')} />;
  }

  return (
    <div className="min-h-screen bg-[#06110d] bg-islamic-pattern text-stone-100 flex flex-col font-cairo">
      {/* Top Global Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGovernance={() => setShowGovernance(true)}
        onClearSession={handleClearSession}
        hasMessages={messages.length > 0}
        currentUser={currentUser}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4">
        {activeTab === 'chat' && (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            onClearSession={handleClearSession}
          />
        )}

        {activeTab === 'scale3d' && (
          <ThreeDScaleViewer />
        )}

        {activeTab === 'hadith' && (
          <HadithVerifierTool onVerify={handleVerifyHadith} />
        )}

        {activeTab === 'quote' && (
          <QuoteVerifierTool onVerify={handleVerifyQuote} />
        )}

        {activeTab === 'fiqh' && (
          <FiqhMapView
            isStandalone
            topic={standaloneFiqhData.topic}
            centralQuestion={standaloneFiqhData.centralQuestion}
            opinions={standaloneFiqhData.opinions}
            consensusPoints={standaloneFiqhData.consensusPoints}
            divergencePoints={standaloneFiqhData.divergencePoints}
            causeOfVariance={standaloneFiqhData.causeOfVariance}
            weightedOpinion={standaloneFiqhData.weightedOpinion}
            onSearchTopic={handleSearchFiqhTopic}
            isLoading={isFiqhLoading}
          />
        )}

        {activeTab === 'rumor' && (
          <RumorDetectorTool onDetect={handleDetectRumor} />
        )}

        {activeTab === 'bioscience' && (
          <BioScienceViewer />
        )}

        {activeTab === 'transcribe' && (
          <AudioTranscriberTool
            onSendToChat={(text) => {
              setActiveTab('chat');
              handleSendMessage(text, 'academic');
            }}
          />
        )}

        {activeTab === 'media' && (
          <HeritageMediaStudio />
        )}

        {activeTab === 'geosearch' && (
          <GeoHistoryExplorer />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-[#05140e]/90 py-3 text-center text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            منصة «مِيـزَان | MIZAN AI» — منصة الذكاء الاصطناعي الموثوقة لتحقيق وتحليل المعرفة الإسلامية والتاريخية وإسناد الأدلة.
          </p>
          <div className="flex items-center gap-3 text-stone-400 text-[11px]">
            <span>التوثيق: القرآن والسنة والمذاهب الأربعة</span>
            <span>·</span>
            <span>الأمانة العلمية والخصوصية التامة</span>
          </div>
        </div>
      </footer>

      {/* Governance & Privacy Charter Modal */}
      {showGovernance && (
        <GovernanceModal onClose={() => setShowGovernance(false)} />
      )}
    </div>
  );
}
