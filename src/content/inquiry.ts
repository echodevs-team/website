import type { Locale } from "../i18n/config";
export type InquiryCopy = {
  intro: string; note: string; submit: string; pending: string; retry: string; newRequest: string;
  success: string; reference: string; summary: string; invalid: string; required: string; requiredField: string;
  uncertain: string; rejected: string; limited: string; conflict: string; expired: string; wait: string;
  email: string; phone: string; contactHint: string; descriptionHint: string; noScript: string;
  serviceLabels: readonly [string, string, string, string];
};
export const inquiryCopy: Record<Locale, InquiryCopy> = {
  en: {
    intro: "Describe your project and leave one way to reach you.", note: "Your draft stays in this page's memory. Do not reload while a submission is uncertain. Online intake requires the local API to be configured; this preview is not a public launch.",
    submit: "Send project inquiry", pending: "Saving inquiry…", retry: "Retry the same inquiry", newRequest: "Start a separate inquiry",
    success: "Your inquiry was saved.", reference: "Reference", summary: "Please review these fields", invalid: "Check this value and its allowed length.", required: "Provide an email address or international phone number.", requiredField: "required",
    uncertain: "We cannot confirm whether your inquiry was saved. Your draft is retained and locked; retry the same inquiry to check safely. Do not reload or send it as a new inquiry.",
    rejected: "The request was not accepted. Your draft is retained; review the fields or try again.", limited: "Too many attempts. Your draft is retained. Please wait before retrying.",
    conflict: "This submission key belongs to different data. Do not retry with changes. Only start a separate inquiry if you intend a new request.",
    expired: "The safe retry window has ended. Saving is still unconfirmed. Do not resubmit as new until the earlier inquiry can be verified.", wait: "Seconds before retry:",
    email: "Email", phone: "International phone", contactHint: "Provide at least one: email or phone with country code, e.g. +44…", descriptionHint: "20–5000 characters. Do not include passwords or sensitive personal information.", noScript: "JavaScript is required for safe submission and retry. No information is sent with scripts disabled.",
    serviceLabels: ["Website & digital identity", "Custom software", "AI & automation", "Not sure yet"],
  },
  fa: {
    intro: "پروژه را شرح دهید و یک راه ارتباطی بگذارید.", note: "پیش‌نویس فقط در حافظه همین صفحه می‌ماند. هنگام نامشخص بودن نتیجه، صفحه را بازخوانی نکنید. دریافت درخواست نیازمند تنظیم API محلی است؛ این پیش‌نمایش انتشار عمومی نیست.",
    submit: "ارسال درخواست پروژه", pending: "در حال ذخیره درخواست…", retry: "تلاش دوباره برای همین درخواست", newRequest: "شروع یک درخواست جداگانه",
    success: "درخواست شما ذخیره شد.", reference: "شناسه پیگیری", summary: "این موارد را بررسی کنید", invalid: "مقدار و طول مجاز این فیلد را بررسی کنید.", required: "ایمیل یا شماره تلفن بین‌المللی وارد کنید.", requiredField: "الزامی",
    uncertain: "ذخیره درخواست هنوز تأیید نشده است. پیش‌نویس حفظ و قفل شده؛ برای بررسی امن، همین درخواست را دوباره امتحان کنید. صفحه را بازخوانی نکنید و درخواست جدید نسازید.",
    rejected: "درخواست پذیرفته نشد. پیش‌نویس حفظ شده؛ فیلدها را بررسی یا دوباره تلاش کنید.", limited: "تعداد تلاش‌ها زیاد است. پیش‌نویس حفظ شده؛ پیش از تلاش دوباره صبر کنید.",
    conflict: "این کلید ارسال به اطلاعات دیگری تعلق دارد. با تغییر اطلاعات تکرار نکنید. فقط اگر قصد درخواست جدید دارید، یک درخواست جداگانه شروع کنید.",
    expired: "مهلت تلاش دوباره امن پایان یافته و نتیجه هنوز نامشخص است. تا بررسی درخواست قبلی، آن را به‌عنوان درخواست جدید ارسال نکنید.", wait: "ثانیه تا تلاش دوباره:",
    email: "ایمیل", phone: "شماره تلفن بین‌المللی", contactHint: "حداقل یکی را وارد کنید: ایمیل یا تلفن با کد کشور، مانند ‎+44…", descriptionHint: "۲۰ تا ۵۰۰۰ نویسه. رمز عبور یا اطلاعات شخصی حساس ننویسید.", noScript: "برای ارسال و تلاش دوباره امن، جاوااسکریپت لازم است. بدون آن اطلاعاتی ارسال نمی‌شود.",
    serviceLabels: ["وب‌سایت و هویت دیجیتال", "نرم‌افزار سفارشی", "هوش مصنوعی و اتوماسیون", "هنوز مطمئن نیستم"],
  },
  ar: {
    intro: "صف مشروعك واترك وسيلة واحدة للتواصل.", note: "تبقى المسودة في ذاكرة هذه الصفحة فقط. لا تعِد تحميلها عندما تكون النتيجة غير مؤكدة. يتطلب الاستقبال إعداد API المحلي؛ هذه المعاينة ليست إطلاقًا عامًا.",
    submit: "إرسال طلب مشروع", pending: "جارٍ حفظ الطلب…", retry: "إعادة محاولة الطلب نفسه", newRequest: "بدء طلب منفصل",
    success: "تم حفظ طلبك.", reference: "الرقم المرجعي", summary: "يرجى مراجعة هذه الحقول", invalid: "تحقق من القيمة والطول المسموح لهذا الحقل.", required: "أدخل بريدًا إلكترونيًا أو رقم هاتف دوليًا.", requiredField: "مطلوب",
    uncertain: "لم نتمكن من تأكيد حفظ الطلب. احتُفظ بالمسودة وقُفلت؛ أعد محاولة الطلب نفسه للتحقق بأمان. لا تعِد تحميل الصفحة أو ترسله كطلب جديد.",
    rejected: "لم يُقبل الطلب. احتُفظ بالمسودة؛ راجع الحقول أو حاول مجددًا.", limited: "محاولات كثيرة. احتُفظ بالمسودة؛ انتظر قبل إعادة المحاولة.",
    conflict: "مفتاح الإرسال مرتبط ببيانات مختلفة. لا تعِد المحاولة ببيانات معدلة. ابدأ طلبًا منفصلًا فقط إذا كنت تقصد طلبًا جديدًا.",
    expired: "انتهت مهلة إعادة المحاولة الآمنة وما زال الحفظ غير مؤكد. لا ترسله كطلب جديد قبل التحقق من الطلب السابق.", wait: "ثوانٍ قبل إعادة المحاولة:",
    email: "البريد الإلكتروني", phone: "رقم هاتف دولي", contactHint: "أدخل أحدهما على الأقل: بريدًا إلكترونيًا أو هاتفًا برمز الدولة، مثل ‎+44…", descriptionHint: "٢٠–٥٠٠٠ حرف. لا تكتب كلمات مرور أو معلومات شخصية حساسة.", noScript: "يلزم JavaScript للإرسال وإعادة المحاولة بأمان. لا تُرسل معلومات عند تعطيله.",
    serviceLabels: ["موقع وهوية رقمية", "برمجيات مخصصة", "ذكاء اصطناعي وأتمتة", "لست متأكدًا بعد"],
  },
};
