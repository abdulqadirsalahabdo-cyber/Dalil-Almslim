export type PromptMode = 'quick' | 'academic' | 'educational' | 'debate';

export type ConfidenceLevel = 'مرتفعة' | 'متوسطة' | 'محدودة';

export type TransmissionStatus = 
  | 'ثابت بمصدر معتبر' 
  | 'مختلف فيه معتبر' 
  | 'منسوب خطأ أو مبتور' 
  | 'لا أصل له (موضوع)';

export interface QuranEvidence {
  ayah: string;
  surah: string;
  ayahNumber?: number | string;
  tafsirSummary?: string;
}

export interface HadithEvidence {
  matn: string;
  narrator?: string;
  takhrij: string;
  grade: 'صحيح' | 'حسن' | 'ضعيف' | 'موضوع' | 'مختلف في تحسينه';
  sourceBook: string;
}

export interface FiqhSchoolOpinion {
  school: 'الحنفية' | 'المالكية' | 'الشافعية' | 'الحنابلة' | 'المجامع الحديثة';
  scholarName?: string;
  opinion: string;
  primaryEvidence: string;
  referenceBook?: string;
}

export interface CognitiveFingerprint {
  entities: string[];
  eraTimeline: string;
  primarySources: string[];
  crossDisciplinaryChecks: string[];
  anomaliesDetected: boolean;
  anomalyNotes?: string;
}

export interface MetadataCard {
  confidenceLevel: ConfidenceLevel;
  answerType: 'حكم فقهي' | 'فتوى عامة' | 'واقعة تاريخية' | 'تحقيق حديثي' | 'نقد اقتباس' | 'تحليل اصطلاحي';
  transmissionStatus: TransmissionStatus;
  primarySources: string[];
  opposingOrDifferingSources?: string[];
  endorsingInstitutions: string[];
  methodologyNote: string;
}

export interface MizanAnalysisResult {
  id: string;
  query: string;
  mode: PromptMode;
  timestamp: string;
  summary: string;
  quranEvidences: QuranEvidence[];
  hadithEvidences: HadithEvidence[];
  fiqhOpinions?: FiqhSchoolOpinion[];
  consensusPoints?: string[];
  divergencePoints?: string[];
  weightedOpinion?: {
    opinion: string;
    reasoning: string;
    endorsedBy: string;
  };
  cognitiveFingerprint: CognitiveFingerprint;
  metadataCard: MetadataCard;
  fullMarkdown: string;
  advisoryNotice?: string;
}

export interface HadithCheckResult {
  matn: string;
  authenticityGrade: 'صحيح' | 'حسن' | 'ضعيف' | 'موضوع' | 'لا أصل له';
  rawi: string;
  primarySources: {
    book: string;
    chapterNumber?: string;
    hadithNumber?: string;
  }[];
  muhaddithinVerdicts: {
    scholar: string;
    verdict: string;
    reference: string;
  }[];
  sanadAnalysis: string;
  matnAnalysis: string;
  practicalRuling: string;
  confidence: ConfidenceLevel;
}

export interface QuoteCheckResult {
  quote: string;
  allegedAuthor: string;
  attributionStatus: 'منسوب بحق' | 'مبتور من سياقه' | 'منحول ومكذوب' | 'محرف في الألفاظ';
  actualAuthor?: string;
  originalContext?: string;
  verifiedSource?: string;
  fullAnalysis: string;
  confidence: ConfidenceLevel;
}

export interface RumorReportResult {
  headline: string;
  verdict: 'شائعة باطلة' | 'نصف حقيقة محرفة' | 'صحيحة وموثقة' | 'سقط تاريخي';
  claimsBreakdown: {
    claim: string;
    fact: string;
    isTrue: boolean;
  }[];
  firstHistoricalAppearance: string;
  propagationPath: string;
  rebuttalEvidence: string[];
  recommendedAction: string;
  confidence: ConfidenceLevel;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  result?: MizanAnalysisResult;
  timestamp: Date;
  mode?: PromptMode;
}
