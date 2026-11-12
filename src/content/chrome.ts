import type { Locale } from "../i18n/config";

/** Shared header/footer copy. Only factual studio description and process labels:
 * no availability, legal, contact or infrastructure claims until the owner verifies them. */
export type ChromeContent = {
  tagline: string;
  footer: {
    servicesHeading: string;
    demos: string;
    contactHeading: string;
    intake: string;
    architecture: string;
  };
};

const fa: ChromeContent = {
  tagline: "استودیو توسعه نرم‌افزار و راهکارهای هوشمند",
  footer: {
    servicesHeading: "حوزه‌های خدمات",
    demos: "دموها و طرح‌های مفهومی",
    contactHeading: "کانال‌های ارتباطی",
    intake: "پذیرش پروژه با توافق دامنه",
    architecture: "معماری قابل نگهداری",
  },
};

const en: ChromeContent = {
  tagline: "Software studio for considered digital products",
  footer: {
    servicesHeading: "Service pillars",
    demos: "Demos and concept studies",
    contactHeading: "Contact channels",
    intake: "Project intake by scope agreement",
    architecture: "Maintainable architecture",
  },
};

const ar: ChromeContent = {
  tagline: "استوديو هندسة برمجيات لحلول رقمية مدروسة",
  footer: {
    servicesHeading: "محاور الخدمات",
    demos: "النماذج والدراسات التصورية",
    contactHeading: "قنوات التواصل",
    intake: "استقبال المشاريع بعد اتفاق النطاق",
    architecture: "بنية قابلة للصيانة",
  },
};

export const chromeContent: Record<Locale, ChromeContent> = { fa, en, ar };
