import type { Locale } from "../i18n/config";
import { getWorkItems } from "./work";

export const workSlugs = ["analytics", "chat", "booking"] as const;
export type WorkSlug = (typeof workSlugs)[number];
type Detail = {
  problem: string; solution: string; capabilities: readonly string[];
  workflow: readonly string[]; limitations: string;
};
type DetailCopy = {
  back: string; details: string; problem: string; solution: string; capabilities: string;
  workflow: string; limitations: string; contribution: string; contributionNote: string;
  visual: string; visualNote: string; services: string; notice: string;
  items: Record<WorkSlug, Detail>;
};

// Editorial proposals extending the three existing static studies. These records
// intentionally contain no client, deployment, result, live URL or source claims.
export const workDetailContent: Record<Locale, DetailCopy> = {
  en: {
    back: "Back to all work", details: "Explore this concept", problem: "Problem to explore", solution: "Proposed solution",
    capabilities: "Proposed capabilities", workflow: "Illustrative workflow", limitations: "Scope & limitations",
    contribution: "What this study contains", contributionNote: "This study presents a static interface illustration and a proposed product scope. It does not document delivered software, a client engagement or an operating system.",
    visual: "Static interface study", visualNote: "Illustration only: not a screenshot of a working product. Bars, messages and booking states are illustrative, not measured results or active controls.",
    services: "Related service scopes", notice: "Concept only — not a completed project or live demo. The capabilities and workflow below are proposals to discuss, not implemented functionality. No verified deployment or business results are published.",
    items: {
      analytics: {
        problem: "Teams reviewing information across separate tools may struggle to compare periods or understand where a figure came from.",
        solution: "A focused reporting workspace could bring agreed data sources into one view, with clear metric definitions and freshness indicators.",
        capabilities: ["Period and category filters for agreed reports", "Metric definitions and source timestamps", "Role-aware report access and scoped exports"],
        workflow: ["Agree source access and metric definitions", "Validate and transform approved data into a reporting dataset", "Review summaries, filter a period and inspect the source context"],
        limitations: "The chart is static and is not connected to business data. Imports, permissions, exports and refresh jobs are not implemented. Source quality, access controls and reporting scale would need assessment; no revenue or performance improvement is claimed.",
      },
      chat: {
        problem: "Repeated support questions can make it difficult for people to find the right guidance in scattered documentation.",
        solution: "A knowledge assistant could retrieve relevant passages from approved documents, suggest a response with source links and hand uncertain questions to a person.",
        capabilities: ["Retrieval from an agreed, maintained knowledge collection", "Source-linked draft answers with an explicit uncertainty state", "Human handoff for unsupported or sensitive requests"],
        workflow: ["Review and approve documents and access boundaries", "Retrieve relevant passages for a question", "Present a sourced suggestion or defer to human support"],
        limitations: "The conversation is fixed sample copy. There is no model, retrieval index or support integration behind it. Accuracy, data handling, evaluation and provider costs require separate design; no zero-error, privacy or availability guarantee is offered.",
      },
      booking: {
        problem: "A visitor arranging an appointment needs to understand available services and times without confusing a request with a confirmed booking.",
        solution: "A booking journey could let visitors choose a service and time, then receive a clear pending or confirmed state based on the scheduling system's response.",
        capabilities: ["Service and practitioner selection with available times", "Explicit pending, confirmed and unavailable states", "Scoped cancellation and optional reminder preferences"],
        workflow: ["Choose a service and review available times", "Request a slot and check availability on the server", "Show the confirmed or unavailable state; arrange a reminder only if agreed"],
        limitations: "The preview does not reserve appointments or send messages. Scheduling, payments and reminders are not connected. Medical records and clinical advice are outside this concept; any sensitive data, compliance obligations or external integrations require specialist review and an agreed scope.",
      },
    },
  },
  fa: {
    back: "بازگشت به همه نمونه‌کارها", details: "بررسی این طرح مفهومی", problem: "مسئله مورد بررسی", solution: "راهکار پیشنهادی",
    capabilities: "قابلیت‌های پیشنهادی", workflow: "گردش کار نمونه", limitations: "دامنه و محدودیت‌ها",
    contribution: "محتوای این مطالعه", contributionNote: "این مطالعه شامل تصویر ثابت رابط کاربری و دامنه پیشنهادی محصول است؛ نه گزارش نرم‌افزار تحویل‌شده، همکاری با مشتری یا سامانه عملیاتی.",
    visual: "مطالعه ثابت رابط کاربری", visualNote: "صرفاً تصویرسازی است، نه تصویر محصول فعال. نمودار، پیام‌ها و وضعیت‌های نوبت‌دهی نمایشی‌اند؛ نه نتیجه اندازه‌گیری یا کنترل فعال.",
    services: "خدمات مرتبط با این دامنه", notice: "فقط طرح مفهومی؛ نه پروژه تکمیل‌شده و نه دموی زنده. قابلیت‌ها و گردش کار زیر پیشنهادهایی برای گفتگو هستند، نه امکانات پیاده‌سازی‌شده. استقرار یا نتیجه تجاری تأییدشده‌ای منتشر نشده است.",
    items: {
      analytics: {
        problem: "برای تیم‌هایی که اطلاعات را در ابزارهای جداگانه بررسی می‌کنند، مقایسه دوره‌ها و شناخت منبع هر عدد می‌تواند دشوار باشد.",
        solution: "یک محیط گزارش‌گیری متمرکز می‌تواند منابع داده توافق‌شده را با تعریف روشن شاخص‌ها و زمان به‌روزرسانی در یک نما گردآوری کند.",
        capabilities: ["فیلتر دوره و دسته‌بندی برای گزارش‌های توافق‌شده", "تعریف شاخص‌ها و نمایش زمان داده منبع", "دسترسی به گزارش بر اساس نقش و خروجی با دامنه مشخص"],
        workflow: ["توافق بر دسترسی منابع و تعریف شاخص‌ها", "اعتبارسنجی و تبدیل داده مجاز به مجموعه داده گزارش‌گیری", "بررسی خلاصه‌ها، انتخاب دوره و مشاهده زمینه منبع"],
        limitations: "نمودار ثابت است و به داده کسب‌وکار متصل نیست. ورود داده، مجوزها، خروجی و به‌روزرسانی دوره‌ای پیاده‌سازی نشده‌اند. کیفیت منابع، کنترل دسترسی و مقیاس گزارش‌گیری نیاز به بررسی دارند؛ ادعایی درباره رشد درآمد یا بهبود کارایی مطرح نیست.",
      },
      chat: {
        problem: "پرسش‌های تکراری پشتیبانی و پراکندگی مستندات می‌تواند یافتن راهنمای مناسب را دشوار کند.",
        solution: "یک دستیار دانش می‌تواند بخش‌های مرتبط از مستندات مجاز را بازیابی کند، پاسخی پیشنهادی همراه منبع ارائه دهد و پرسش نامطمئن را به انسان ارجاع دهد.",
        capabilities: ["بازیابی از مجموعه دانش توافق‌شده و به‌روز", "پاسخ پیش‌نویس با پیوند منبع و وضعیت عدم اطمینان", "ارجاع درخواست‌های حساس یا خارج از دامنه به پشتیبان انسانی"],
        workflow: ["بازبینی و تأیید مستندات و مرزهای دسترسی", "بازیابی بخش‌های مرتبط با پرسش", "ارائه پیشنهاد مستند یا ارجاع به پشتیبان انسانی"],
        limitations: "گفتگو متن نمونه ثابت است؛ مدل، نمایه بازیابی یا اتصال پشتیبانی ندارد. دقت، شیوه پردازش داده، ارزیابی و هزینه ارائه‌دهنده نیازمند طراحی جداگانه‌اند؛ تضمین خطای صفر، حریم خصوصی یا دسترس‌پذیری ارائه نمی‌شود.",
      },
      booking: {
        problem: "متقاضی نوبت باید خدمات و زمان‌ها را بشناسد و درخواست نوبت را با رزرو قطعی اشتباه نگیرد.",
        solution: "یک مسیر نوبت‌دهی می‌تواند انتخاب خدمت و زمان را ممکن کند و بر اساس پاسخ سامانه زمان‌بندی، وضعیت روشن در انتظار یا تأییدشده نشان دهد.",
        capabilities: ["انتخاب خدمت و ارائه‌دهنده همراه زمان‌های موجود", "وضعیت‌های روشن در انتظار، تأییدشده و ناموجود", "لغو در دامنه مشخص و تنظیم اختیاری یادآوری"],
        workflow: ["انتخاب خدمت و بررسی زمان‌های موجود", "درخواست بازه و بررسی ظرفیت در سرور", "نمایش وضعیت قطعی یا ناموجود؛ تنظیم یادآوری فقط در صورت توافق"],
        limitations: "پیش‌نمایش نوبتی رزرو نمی‌کند و پیامی نمی‌فرستد. زمان‌بندی، پرداخت و یادآوری متصل نیستند. پرونده پزشکی و توصیه بالینی خارج از این طرح‌اند؛ داده حساس، الزامات انطباق و اتصال بیرونی به بررسی تخصصی و دامنه توافق‌شده نیاز دارند.",
      },
    },
  },
  ar: {
    back: "العودة إلى جميع الأعمال", details: "استكشاف هذا التصور", problem: "المشكلة محل الدراسة", solution: "الحل المقترح",
    capabilities: "الإمكانات المقترحة", workflow: "مسار عمل توضيحي", limitations: "النطاق والقيود",
    contribution: "محتوى هذه الدراسة", contributionNote: "تقدم هذه الدراسة رسمًا ثابتًا لواجهة استخدام ونطاقًا مقترحًا لمنتج. ولا توثق برنامجًا تم تسليمه أو تعاونًا مع عميل أو نظامًا قيد التشغيل.",
    visual: "دراسة ثابتة لواجهة استخدام", visualNote: "رسم توضيحي فقط، وليس لقطة لمنتج يعمل. الأعمدة والرسائل وحالات الحجز أمثلة توضيحية وليست نتائج مقاسة أو عناصر تحكم نشطة.",
    services: "نطاقات الخدمات المرتبطة", notice: "تصور فقط؛ ليس مشروعًا مكتملًا أو عرضًا حيًا. الإمكانات ومسار العمل أدناه مقترحات للنقاش وليست وظائف منفذة. لا ننشر نتائج تشغيل أو نتائج تجارية موثقة.",
    items: {
      analytics: {
        problem: "قد تواجه الفرق التي تراجع المعلومات عبر أدوات منفصلة صعوبة في مقارنة الفترات أو معرفة مصدر كل رقم.",
        solution: "يمكن لمساحة تقارير مركزة جمع مصادر البيانات المتفق عليها في عرض واحد، مع تعريف واضح للمؤشرات ووقت تحديثها.",
        capabilities: ["تصفية حسب الفترة والفئة للتقارير المتفق عليها", "تعريف المؤشرات وعرض أوقات بيانات المصدر", "وصول بحسب الأدوار وتصدير ضمن نطاق محدد"],
        workflow: ["الاتفاق على صلاحيات المصادر وتعريف المؤشرات", "التحقق من البيانات المصرح بها وتحويلها إلى مجموعة للتقارير", "مراجعة الملخصات واختيار الفترة وفحص سياق المصدر"],
        limitations: "الرسم ثابت وغير متصل ببيانات أعمال. لم تُنفذ عمليات الاستيراد والصلاحيات والتصدير والتحديث الدوري. تحتاج جودة المصادر وضوابط الوصول وحجم التقارير إلى تقييم؛ ولا ندعي تحسن الإيرادات أو الأداء.",
      },
      chat: {
        problem: "قد تجعل أسئلة الدعم المتكررة وتشتت الوثائق العثور على الإرشادات المناسبة أمرًا صعبًا.",
        solution: "يمكن لمساعد معرفي استرجاع مقاطع من وثائق معتمدة، واقتراح إجابة بروابط المصادر، وإحالة الأسئلة غير المؤكدة إلى شخص مختص.",
        capabilities: ["استرجاع من مجموعة معرفة متفق عليها ومحدثة", "مسودات إجابات بمصادر وحالة واضحة لعدم اليقين", "إحالة الطلبات الحساسة أو غير المدعومة إلى الدعم البشري"],
        workflow: ["مراجعة الوثائق واعتمادها وتحديد حدود الوصول", "استرجاع المقاطع المرتبطة بالسؤال", "عرض اقتراح موثق أو الإحالة إلى الدعم البشري"],
        limitations: "المحادثة نص توضيحي ثابت؛ لا يوجد نموذج أو فهرس استرجاع أو اتصال بالدعم. تتطلب الدقة ومعالجة البيانات والتقييم وتكاليف المزود تصميمًا منفصلًا؛ ولا نقدم ضمانًا بانعدام الأخطاء أو للخصوصية أو التوافر.",
      },
      booking: {
        problem: "يحتاج طالب الموعد إلى فهم الخدمات والأوقات المتاحة دون الخلط بين طلب الموعد والحجز المؤكد.",
        solution: "يمكن لمسار حجز إتاحة اختيار الخدمة والوقت، ثم عرض حالة انتظار أو تأكيد واضحة بناءً على استجابة نظام المواعيد.",
        capabilities: ["اختيار الخدمة والمختص مع الأوقات المتاحة", "حالات واضحة للانتظار والتأكيد وعدم التوافر", "إلغاء ضمن نطاق محدد وتفضيلات تذكير اختيارية"],
        workflow: ["اختيار خدمة ومراجعة الأوقات المتاحة", "طلب موعد والتحقق من التوافر على الخادم", "عرض التأكيد أو عدم التوافر؛ ترتيب تذكير فقط عند الاتفاق عليه"],
        limitations: "لا تحجز المعاينة مواعيد ولا ترسل رسائل. الجدولة والدفع والتذكيرات غير متصلة. السجلات الطبية والمشورة السريرية خارج هذا التصور؛ وتتطلب البيانات الحساسة والالتزامات التنظيمية والتكاملات الخارجية مراجعة متخصصة ونطاقًا متفقًا عليه.",
      },
    },
  },
};

export const relatedServiceIds = {
  analytics: ["software", "websites"], chat: ["ai", "software"], booking: ["websites", "software"],
} as const;

export function getWorkDetail(locale: Locale, slug: string) {
  if (!workSlugs.some((value) => value === slug)) return undefined;
  const id = slug as WorkSlug;
  const item = getWorkItems(locale).find((record) => record.id === id);
  return item ? { ...item, ...workDetailContent[locale].items[id], slug: id, services: relatedServiceIds[id] } : undefined;
}
