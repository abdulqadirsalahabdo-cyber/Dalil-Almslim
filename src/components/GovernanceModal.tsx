import React from 'react';
import { X, ShieldCheck, Scale, Lock, BookOpen, AlertTriangle, Landmark, Users } from 'lucide-react';

interface GovernanceModalProps {
  onClose: () => void;
}

export const GovernanceModal: React.FC<GovernanceModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0a1a14] border border-amber-500/40 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-amber-900/40 bg-stone-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-100 text-base sm:text-lg font-cairo">
                ميثاق الحوكمة والأمانة العلمية والخصوصية
              </h3>
              <p className="text-xs text-stone-400">
                الضوابط الشرعية، المنهجية الأكاديمية، وحدود المسؤولية لمنصة «ميزان»
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm text-stone-300 leading-relaxed">
          {/* Section 1: Core Methodology */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Scale className="w-4 h-4" />
              <span>1. مسار الفحص والتحقيق السباعي (Core Protocol)</span>
            </div>
            <p className="text-stone-300">
              لا تعتمد المنصة على توليد النصوص الاحتمالي العشوائي، بل تخضع كل مدخلة لبروتوكول صارم يتضمن:
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-400 pr-2">
              <li>تفكيك الادعاءات إلى قضايا منفردة قابلة للتحقق.</li>
              <li>الاستناد لنصوص الوحيين (القرآن العظيم والسنة الصحيحة أو الحسنة مع التخريج).</li>
              <li>استعراض المذاهب الفقهية الأربعة المعتمدة (الحنفي، المالكي، الشافعي، الحنبلي) بحيادية وموضوعية دون تعصب.</li>
              <li>عزو الأقوال إلى مصنفاتها الأصلية بذكر اسم المصنف والباب والمؤلف.</li>
              <li>إصدار بطاقة توثيق إلكترونية (Metadata Card) توضح درجة الثقة وحالة النقل.</li>
            </ul>
          </div>

          {/* Section 2: Privacy */}
          <div className="space-y-2 p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Lock className="w-4 h-4" />
              <span>2. معمارية الخصوصية والأمان الفكري (Privacy-First)</span>
            </div>
            <p className="text-stone-300">
              نلتزم بأعلى معايير الخصوصية الرقمية للمستخدمين:
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-400 pr-2">
              <li>الأسئلة والاستفسارات الشخصية لا تُستخدم إطلاقاً في تدريب النماذج العامة.</li>
              <li>جلسات الاستخدام مشفرة، وتتيح المنصة زراً واضحاً لـ «حذف المحادثة فوراً» لإزالة كافة السجلات المحلية.</li>
              <li>حماية فكرية صارمة تمنع إدخال نصوص ملوثة أو محاولات التلاعب بالمصادر التراثية.</li>
            </ul>
          </div>

          {/* Section 3: Advisory Scope & Disclaimer */}
          <div className="space-y-2 p-4 rounded-xl bg-amber-950/20 border border-amber-900/40">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>3. حدود المسؤولية والضوابط الإفتائية والقانونية</span>
            </div>
            <p className="text-stone-200">
              «ميزان» هي منصة <strong>بحثية وتوثيقية ومعرفية</strong> وليست بديلاً عن القضاء الشرعي أو جهات الإفتاء الرسمية المعنية بنوازل الأفراد الخاصة (مثل قضايا الطلاق الشائكة، النزاعات المالية المعقدة، والمسائل الطبية الحساسة). يجب على السائل الرجوع إلى دار الإفتاء أو المؤسسات الرسمية المعتمدة في بلده (كالأزهر الشريف وهيئات كبار العلماء ومجامع الفقه الدولي).
            </p>
          </div>

          {/* Section 4: Academic Reference Bodies */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Landmark className="w-4 h-4" />
              <span>4. المرجعيات المؤسسية المعتمدة</span>
            </div>
            <p className="text-stone-400">
              تستقي المنصة ترجيحاتها من القرارات الصادرة عن المجامع الفقهية المعترف بها عالمياً:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded bg-stone-900 border border-stone-800 text-center font-medium text-stone-300">
                الأزهر الشريف ودار الإفتاء
              </div>
              <div className="p-2.5 rounded bg-stone-900 border border-stone-800 text-center font-medium text-stone-300">
                مجمع الفقه الإسلامي الدولي
              </div>
              <div className="p-2.5 rounded bg-stone-900 border border-stone-800 text-center font-medium text-stone-300">
                المجمع الفقهي لرابطة العالم الإسلامي
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-stone-800 bg-stone-900/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-lg transition-colors"
          >
            إغلاق الميثاق
          </button>
        </div>
      </div>
    </div>
  );
};
