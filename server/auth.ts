import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

export interface OtpRecord {
  email: string;
  code: string;
  expiresAt: number; // timestamp
  attempts: number;
  createdAt: number;
}

// In-memory OTP storage cache
const otpStore = new Map<string, OtpRecord>();

const JWT_SECRET = process.env.JWT_SECRET || 'mizan-ai-islamic-scholar-jwt-secret-key-2026';

// Email Transporter (configures SMTP if provided)
function getEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return null;
}

// 1. Generate 6-Digit Secure OTP
export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// 2. Send OTP Email with rich Islamic aesthetic HTML template
export async function sendOtpEmail(email: string, code: string): Promise<{ success: boolean; previewCode?: string; message: string }> {
  const expiresMinutes = 10;
  const expiresAt = Date.now() + expiresMinutes * 60 * 1000;

  // Save to OTP store
  otpStore.set(email.toLowerCase(), {
    email: email.toLowerCase(),
    code,
    expiresAt,
    attempts: 0,
    createdAt: Date.now(),
  });

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #08110e; color: #f3f4f6; margin: 0; padding: 20px; text-align: right; }
      .container { max-width: 550px; margin: 0 auto; background: #0c241b; border: 1px solid #cfa859; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
      .header { text-align: center; border-bottom: 1px solid rgba(207, 168, 89, 0.3); padding-bottom: 20px; margin-bottom: 24px; }
      .brand { font-size: 26px; font-weight: bold; color: #cfa859; letter-spacing: 1px; }
      .subtitle { font-size: 13px; color: #9ca3af; margin-top: 6px; }
      .otp-card { background: #061711; border: 2px dashed #cfa859; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
      .otp-code { font-size: 38px; font-weight: 800; font-family: monospace; letter-spacing: 8px; color: #f5e6c8; margin: 8px 0; }
      .expiry-notice { font-size: 13px; color: #f59e0b; margin-top: 8px; }
      .notice { font-size: 12px; color: #9ca3af; line-height: 1.8; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; }
      .footer { text-align: center; font-size: 11px; color: #6b7280; margin-top: 24px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="brand">⚖️ مِيـزَان | MIZAN AI</div>
        <div class="subtitle">منصة التحقيق والتدقيق في العلوم الإسلامية والتاريخية</div>
      </div>
      <p style="font-size: 15px; color: #e5e7eb;">السلام عليكم ورحمة الله وبركاته،</p>
      <p style="font-size: 14px; color: #d1d5db; line-height: 1.6;">
        لقد طلبت تسجيل الدخول إلى منصة <strong>ميزان AI</strong>. يرجى استخدام رمز التحقق المؤقت (OTP) التالي لتأكيد هويتك وتفعيل جلسة البحث:
      </p>
      
      <div class="otp-card">
        <div style="font-size: 12px; color: #9ca3af; text-transform: uppercase;">رمز التحقق الخاص بك</div>
        <div class="otp-code">${code}</div>
        <div class="expiry-notice">⏱️ هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط</div>
      </div>

      <div class="notice">
        <strong>⚠️ تنبيه أمني:</strong> لا تشارك هذا الرمز مع أي شخص. فريق ميزان لن يطلب منك هذا الرمز أبداً. إذا لم تقم بهذا الطلب، يمكنك تجاهل هذه الرسالة بأمان.
      </div>

      <div class="footer">
        منصة ميزان للتحقيق المعرفي والشرعي © ${new Date().getFullYear()} — كافة الحقوق محفوظة
      </div>
    </div>
  </body>
  </html>
  `;

  // Option A: Resend API (Preferred for Vercel)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resendFrom = process.env.RESEND_FROM || 'Mizan AI <onboarding@resend.dev>';
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [email],
          subject: `⚖️ رمز التحقق لمنصة ميزان: ${code}`,
          html: htmlContent,
          text: `رمز التحقق الخاص بك لمنصة ميزان هو: ${code} (صالح لمدة 10 دقائق)`,
        }),
      });

      if (resendRes.ok) {
        console.log(`[Mizan Auth] OTP sent via Resend API to: ${email}`);
        return {
          success: true,
          message: 'تم إرسال كود التحقق بنجاح إلى بريدك الإلكتروني عبر Resend',
        };
      } else {
        const errorText = await resendRes.text();
        console.warn(`[Mizan Auth] Resend API error: ${errorText}`);
      }
    } catch (resendErr: any) {
      console.warn(`[Mizan Auth] Resend dispatch exception:`, resendErr?.message || resendErr);
    }
  }

  // Option B: Nodemailer SMTP
  const transporter = getEmailTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"ميزان | MIZAN AI" <${process.env.SMTP_FROM || 'noreply@mizan-ai.com'}>`,
        to: email,
        subject: `⚖️ رمز التحقق لمنصة ميزان: ${code}`,
        text: `رمز التحقق الخاص بك هو: ${code} (صالح لمدة 10 دقائق)`,
        html: htmlContent,
      });
      console.log(`[Mizan Auth] OTP sent via Nodemailer SMTP to: ${email}`);
      return { success: true, message: 'تم إرسال كود التحقق بنجاح إلى بريدك الإلكتروني' };
    } catch (err: any) {
      console.error('SMTP Mail error:', err);
      return { 
        success: true, 
        previewCode: code, 
        message: 'تم توليد كود التحقق (وضع المعاينة لتعذر الاتصال بـ SMTP)' 
      };
    }
  }

  // Option C: Simulated preview mode (Logs to server console and provides previewCode for immediate zero-friction testing)
  console.log(`\n======================================================`);
  console.log(`📧 [Mizan AI Auth] Generated OTP for: ${email}`);
  console.log(`🔑 Verification Code: ${code} (Valid for 10 minutes)`);
  console.log(`💡 Developer Note: Configure RESEND_API_KEY or SMTP_HOST in .env to deliver real emails.`);
  console.log(`======================================================\n`);

  return {
    success: true,
    previewCode: code,
    message: 'تم توليد كود التحقق بنجاح (وضع الاختبار الفوري)',
  };
}

// 3. Verify OTP and Generate Session Token (JWT)
export function verifyOtp(email: string, inputCode: string): { success: boolean; token?: string; user?: any; error?: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const record = otpStore.get(normalizedEmail);

  if (!record) {
    return { success: false, error: 'لم يتم العثور على طلب تحقق لهذا البريد أو انتهت صلاحيته' };
  }

  // Check Expiry (10 minutes)
  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return { success: false, error: 'انتهت صلاحية رمز التحقق (أكثر من 10 دقائق). يرجى طلب رمز جديد.' };
  }

  // Check Brute Force attempts (max 5)
  if (record.attempts >= 5) {
    otpStore.delete(normalizedEmail);
    return { success: false, error: 'تجاوزت الحد الأقصى للمحاولات الخاطئة. يرجى طلب رمز تحقق جديد.' };
  }

  // Compare Codes
  if (record.code.trim() !== inputCode.trim()) {
    record.attempts += 1;
    return { success: false, error: `رمز التحقق غير صحيح. المحاولات المتبقية: ${5 - record.attempts}` };
  }

  // Success: consume OTP
  otpStore.delete(normalizedEmail);

  const username = normalizedEmail.split('@')[0];
  const user = {
    uid: `user_${crypto.createHash('md5').update(normalizedEmail).digest('hex').substring(0, 16)}`,
    email: normalizedEmail,
    displayName: username,
    role: 'scholar',
    isEmailVerified: true,
    authProvider: 'email_otp',
  };

  // Sign JWT Session Token (valid for 30 days)
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '30d' });

  return {
    success: true,
    token,
    user,
  };
}

// 4. Verify Session Token middleware helper
export function verifySessionToken(token: string): any | null {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
