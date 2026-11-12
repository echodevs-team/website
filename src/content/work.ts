import { homeContent, type Concept } from "./home";
import type { Locale } from "../i18n/config";

export const workKinds = ["client", "internal", "concept"] as const;
type WorkCopy = {
  title: string; description: string; navigation: string; preview: string;
  proposedStack: string; stackNote: string; cta: string;
  groups: Record<Concept["kind"], { title: string; description: string; badge: string }>;
};

export const workContent: Record<Locale, WorkCopy> = {
  en: {
    title: "Work & concepts", description: "Explore interface ideas, with a clear distinction between client work, internal projects and concepts. Only concept studies are available here today.",
    navigation: "Work categories", preview: "View the static homepage previews", proposedStack: "Possible implementation stack",
    stackNote: "These are interface studies, not working products. Technology tags describe possible implementation choices, not a verified deployed stack. No live application, source repository or client results are published for these concepts.",
    cta: "Discuss a similar idea",
    groups: {
      client: { title: "Client projects", description: "No verified client projects are approved for publication here yet.", badge: "Client project" },
      internal: { title: "Internal projects", description: "No documented internal projects are approved for publication here yet.", badge: "Internal project" },
      concept: { title: "Concept studies", description: "Illustrative interface ideas from the homepage. They are not completed client projects or live demos.", badge: "Concept · static preview" },
    },
  },
  fa: {
    title: "نمونه‌کارها و طرح‌های مفهومی", description: "ایده‌های رابط کاربری را با تفکیک روشن پروژه‌های مشتری، پروژه‌های داخلی و طرح‌های مفهومی ببینید. در حال حاضر فقط طرح‌های مفهومی در این صفحه موجود است.",
    navigation: "دسته‌بندی نمونه‌کارها", preview: "مشاهده پیش‌نمایش‌های ثابت در صفحه اصلی", proposedStack: "فناوری‌های پیشنهادی برای پیاده‌سازی",
    stackNote: "این موارد مطالعه رابط کاربری هستند، نه محصول فعال. برچسب‌های فناوری گزینه‌های احتمالی پیاده‌سازی را نشان می‌دهند، نه فناوری تأییدشده یک سامانه مستقر. برای این طرح‌ها برنامه زنده، مخزن کد یا نتایج مشتری منتشر نشده است.",
    cta: "گفتگو درباره ایده‌ای مشابه",
    groups: {
      client: { title: "پروژه‌های مشتری", description: "هنوز پروژه مشتری تأییدشده‌ای برای انتشار در این بخش ارائه نشده است.", badge: "پروژه مشتری" },
      internal: { title: "پروژه‌های داخلی", description: "هنوز پروژه داخلی مستندی برای انتشار در این بخش تأیید نشده است.", badge: "پروژه داخلی" },
      concept: { title: "طرح‌های مفهومی", description: "ایده‌های نمایشی رابط کاربری از صفحه اصلی؛ نه پروژه تکمیل‌شده مشتری و نه دموی زنده.", badge: "طرح مفهومی · پیش‌نمایش ثابت" },
    },
  },
  ar: {
    title: "الأعمال والتصورات", description: "استكشفوا أفكار واجهات الاستخدام مع تمييز واضح بين مشاريع العملاء والمشاريع الداخلية والتصورات. المتاح هنا حاليًا هو دراسات تصورية فقط.",
    navigation: "فئات الأعمال", preview: "عرض المعاينات الثابتة في الصفحة الرئيسية", proposedStack: "تقنيات محتملة للتنفيذ",
    stackNote: "هذه دراسات لواجهات الاستخدام وليست منتجات عاملة. تشير وسوم التقنيات إلى خيارات تنفيذ محتملة، لا إلى تقنيات مؤكدة لنظام منشور. لا ننشر لهذه التصورات تطبيقًا حيًا أو مستودع شيفرة أو نتائج لعملاء.",
    cta: "ناقشوا فكرة مشابهة",
    groups: {
      client: { title: "مشاريع العملاء", description: "لا توجد بعد مشاريع عملاء موثقة ومعتمدة للنشر في هذا القسم.", badge: "مشروع عميل" },
      internal: { title: "المشاريع الداخلية", description: "لا توجد بعد مشاريع داخلية موثقة ومعتمدة للنشر في هذا القسم.", badge: "مشروع داخلي" },
      concept: { title: "دراسات تصورية", description: "أفكار توضيحية لواجهات الاستخدام من الصفحة الرئيسية؛ ليست مشاريع عملاء مكتملة أو عروضًا حية.", badge: "تصور · معاينة ثابتة" },
    },
  },
};

// Reuse the existing studies, not a second invented portfolio. No client/internal
// records or proof links are published without verified content and permission.
export function getWorkItems(locale: Locale) {
  return homeContent[locale].concepts.map((item) => ({ ...item, id: item.visual }));
}
