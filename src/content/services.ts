import type { Locale } from "../i18n/config";
import type { serviceIds } from "./home";

type Pillar = {
  title: string; outcome: string; services: readonly { title: string; scope: string }[];
  deliverables: readonly string[]; example: string; boundaries: string;
};
export type ServicesContent = {
  title: string; description: string; navigation: string; scope: string; deliverables: string;
  example: string; boundaries: string; cta: string; agreement: string;
  pillars: Record<(typeof serviceIds)[number], Pillar>;
};

const en: ServicesContent = {
  title: "Services shaped around your next step",
  description: "Clarify a customer journey, connect your systems or evaluate a focused automation. These are possible project scopes, not a record of completed client work. Feasibility and deliverables are agreed before development.",
  navigation: "Service pillar navigation", scope: "Scope & sub-services", deliverables: "Possible deliverables",
  example: "Illustrative example — not a completed project", boundaries: "Boundaries & exclusions", cta: "Discuss your needs",
  agreement: "Start with the problem, users and constraints. Scope, acceptance criteria, milestones, ownership and handoff are agreed together. Hosting, third-party fees, migration and ongoing support are not automatically included; no fixed timeline or business result is promised here.",
  pillars: {
    websites: {
      title: "Digital products", outcome: "Help people understand your offering and complete the right task, from a business website to a focused product experience.",
      services: [
        { title: "Business & professional websites", scope: "Content structure, responsive service pages and clear inquiry journeys for businesses and independent professionals." },
        { title: "Web applications & SaaS", scope: "Defined user journeys, account roles and product workflows; billing and subscriptions only within an agreed scope." },
        { title: "Mobile app discovery", scope: "Assess device needs, platform constraints and prototype journeys before committing to a build. Native development requires a separate feasibility agreement." },
        { title: "UI/UX & product design", scope: "Information architecture, wireframes, interface prototypes and reviewable interaction states." },
      ],
      deliverables: ["Agreed page map and user flows", "Responsive interface or scoped product prototype", "Implementation, core checks and handoff notes where commissioned"],
      example: "A consulting website with service pages and an inquiry flow; or a booking prototype used to review a customer journey.",
      boundaries: "Search ranking, sales growth and app-store approval are not guaranteed. Payments, medical records, regulated data and native app delivery are not included by default. No legal or compliance certification is offered.",
    },
    software: {
      title: "Software systems", outcome: "Make a defined workflow easier to run, with clear data boundaries and connections between the tools your organization uses.",
      services: [
        { title: "Backend systems", scope: "Domain rules, data models, permissions and persistence for agreed workflows." },
        { title: "APIs & service boundaries", scope: "Documented interfaces and validation. Microservices only when operational requirements justify the additional complexity." },
        { title: "System integrations", scope: "Connect approved external APIs with explicit failure, retry and access rules." },
        { title: "Data engineering", scope: "Bounded imports, transformations and reporting datasets, subject to source quality and access permissions." },
      ],
      deliverables: ["Workflow and data model with access rules", "Scoped API or integration with core automated tests", "Setup instructions and agreed operational handoff"],
      example: "An internal request-tracking tool connected to an existing system, with a documented API and agreed user roles.",
      boundaries: "A full ERP replacement, unlimited migration, round-the-clock operations and uptime SLAs are not standard inclusions. Existing-system access, data cleanup, hosting and maintenance require separate agreement.",
    },
    ai: {
      title: "Intelligent operations", outcome: "Evaluate whether a repetitive task can be assisted safely, with a bounded use case, reviewable outputs and a human fallback.",
      services: [
        { title: "AI & workflow automation", scope: "Map repeatable steps, approval points and failure handling before connecting tools." },
        { title: "Business chatbots", scope: "Prototype bounded support conversations with human escalation and clearly stated limits." },
        { title: "Knowledge assistants", scope: "Retrieval from approved documents, source references and evaluation against representative questions." },
        { title: "Document & model integrations", scope: "Test extraction or language-model calls within existing workflows, with output validation and review." },
      ],
      deliverables: ["Use-case and data-access assessment", "Bounded prototype with evaluation cases and limitations", "Integration and human-review guidance if feasibility is established"],
      example: "An assistant that retrieves approved internal guidance and cites its sources, with unanswered questions referred to a person.",
      boundaries: "No error-free answers, autonomous high-stakes decisions or guaranteed cost savings. Sensitive data use, model-provider terms and recurring costs must be reviewed first. Production rollout is not implied by a prototype.",
    },
  },
};

const fa: ServicesContent = {
  title: "خدمات متناسب با گام بعدی شما",
  description: "مسیر مشتری را روشن کنید، سامانه‌ها را به هم متصل کنید یا یک اتوماسیون محدود را بسنجید. این‌ها دامنه‌های پیشنهادی پروژه‌اند، نه سابقه کار انجام‌شده برای مشتری. امکان‌پذیری و خروجی‌ها پیش از توسعه توافق می‌شوند.",
  navigation: "پیمایش حوزه‌های خدمات", scope: "دامنه و زیرخدمات", deliverables: "خروجی‌های قابل توافق",
  example: "مثال توضیحی؛ نه پروژه انجام‌شده", boundaries: "مرزها و موارد خارج از دامنه", cta: "گفتگو درباره نیاز شما",
  agreement: "از مسئله، کاربران و محدودیت‌ها شروع می‌کنیم. دامنه، معیارهای پذیرش، مراحل، مالکیت و نحوه تحویل با هم توافق می‌شوند. میزبانی، هزینه سرویس‌های ثالث، مهاجرت داده و پشتیبانی مستمر خودکار در دامنه نیستند؛ اینجا زمان ثابت یا نتیجه تجاری تضمین نمی‌شود.",
  pillars: {
    websites: {
      title: "محصولات دیجیتال", outcome: "کمک به مخاطب برای شناخت خدمات شما و انجام کار موردنظر؛ از وب‌سایت شرکتی تا تجربه یک محصول مشخص.",
      services: [
        { title: "وب‌سایت‌های شرکتی و حرفه‌ای", scope: "ساختار محتوا، صفحات واکنش‌گرای خدمات و مسیر روشن درخواست برای کسب‌وکارها و متخصصان مستقل." },
        { title: "وب‌اپلیکیشن‌ها و پلتفرم‌های SaaS", scope: "مسیرهای مشخص کاربر، نقش‌های دسترسی و جریان‌های محصول؛ پرداخت و اشتراک فقط در دامنه توافق‌شده." },
        { title: "بررسی اولیه اپلیکیشن موبایل", scope: "بررسی نیاز دستگاه، محدودیت پلتفرم و نمونه مسیر کاربر پیش از تعهد به ساخت؛ توسعه بومی نیازمند توافق جداگانه درباره امکان‌پذیری است." },
        { title: "طراحی تجربه کاربری، رابط و محصول", scope: "معماری اطلاعات، وایرفریم، نمونه رابط و وضعیت‌های تعاملی قابل بازبینی." },
      ],
      deliverables: ["نقشه صفحات و مسیرهای کاربرِ توافق‌شده", "رابط واکنش‌گرا یا نمونه محصول با دامنه مشخص", "پیاده‌سازی، آزمون‌های اصلی و راهنمای تحویل در صورت سفارش"],
      example: "وب‌سایت مشاوره با صفحات خدمات و مسیر درخواست؛ یا نمونه رزرو برای بازبینی تجربه مشتری.",
      boundaries: "رتبه جستجو، رشد فروش و تأیید فروشگاه اپلیکیشن تضمین نمی‌شوند. پرداخت، پرونده پزشکی، داده مشمول مقررات و تحویل اپ بومی به‌صورت پیش‌فرض در دامنه نیستند. گواهی حقوقی یا انطباق ارائه نمی‌شود.",
    },
    software: {
      title: "سامانه‌های نرم‌افزاری", outcome: "اجرای ساده‌تر یک گردش کار مشخص، با مرزهای روشن داده و اتصال میان ابزارهای سازمان شما.",
      services: [
        { title: "توسعه بک‌اند", scope: "قواعد کسب‌وکار، مدل داده، مجوزها و ذخیره‌سازی برای جریان‌های توافق‌شده." },
        { title: "رابط‌های برنامه‌نویسی و مرز سرویس‌ها", scope: "رابط‌های مستند و اعتبارسنجی؛ ریزخدمت‌ها تنها وقتی نیاز عملیاتی، پیچیدگی بیشتر را توجیه کند." },
        { title: "یکپارچه‌سازی سامانه‌ها", scope: "اتصال به رابط‌های تأییدشده بیرونی با قواعد روشن خطا، تلاش مجدد و دسترسی." },
        { title: "مهندسی داده", scope: "ورود محدود داده، تبدیل و آماده‌سازی داده گزارش‌گیری، وابسته به کیفیت منبع و مجوز دسترسی." },
      ],
      deliverables: ["گردش کار و مدل داده همراه با قواعد دسترسی", "رابط یا اتصال با دامنه مشخص و آزمون‌های خودکار اصلی", "راهنمای راه‌اندازی و تحویل عملیاتی توافق‌شده"],
      example: "ابزار داخلی پیگیری درخواست متصل به سامانه موجود، با رابط مستند و نقش‌های کاربری توافق‌شده.",
      boundaries: "جایگزینی کامل سامانه سازمانی، مهاجرت نامحدود، عملیات شبانه‌روزی و تعهد سطح خدمت در دامنه استاندارد نیستند. دسترسی به سامانه موجود، پاک‌سازی داده، میزبانی و نگهداری توافق جداگانه می‌خواهند.",
    },
    ai: {
      title: "عملیات هوشمند", outcome: "سنجش امکان کمک به یک کار تکراری با کاربرد محدود، خروجی قابل بازبینی و مسیر ارجاع به انسان.",
      services: [
        { title: "هوش مصنوعی و اتوماسیون گردش کار", scope: "ترسیم گام‌های تکراری، نقاط تأیید و مدیریت خطا پیش از اتصال ابزارها." },
        { title: "چت‌بات کسب‌وکار", scope: "نمونه‌سازی گفتگوی پشتیبانی محدود با ارجاع به انسان و بیان روشن محدودیت‌ها." },
        { title: "دستیار دانش", scope: "بازیابی از اسناد تأییدشده، ارجاع به منبع و ارزیابی با پرسش‌های نمونه." },
        { title: "اتصال پردازش اسناد و مدل‌های زبانی", scope: "آزمایش استخراج داده یا فراخوانی مدل در گردش کار موجود، همراه با اعتبارسنجی خروجی و بازبینی." },
      ],
      deliverables: ["ارزیابی کاربرد و دسترسی به داده", "نمونه محدود با موارد ارزیابی و محدودیت‌های مستند", "راهنمای اتصال و بازبینی انسانی در صورت تأیید امکان‌پذیری"],
      example: "دستیاری برای بازیابی راهنمای داخلی تأییدشده با ذکر منبع و ارجاع پرسش‌های بی‌پاسخ به انسان.",
      boundaries: "پاسخ بدون خطا، تصمیم خودکار پرخطر یا صرفه‌جویی تضمینی ارائه نمی‌شود. استفاده از داده حساس، شرایط ارائه‌دهنده مدل و هزینه مستمر باید ابتدا بررسی شوند. نمونه اولیه به معنای آماده‌بودن برای بهره‌برداری نیست.",
    },
  },
};

const ar: ServicesContent = {
  title: "خدمات تناسب خطوتكم التالية",
  description: "وضّحوا رحلة العميل، أو اربطوا أنظمتكم، أو قيّموا أتمتة محددة. هذه نطاقات محتملة للمشاريع وليست سجلًا لأعمال عملاء منجزة. تُحدّد الجدوى والمخرجات بالاتفاق قبل التطوير.",
  navigation: "التنقل بين محاور الخدمات", scope: "النطاق والخدمات الفرعية", deliverables: "مخرجات يمكن الاتفاق عليها",
  example: "مثال توضيحي — ليس مشروعًا منجزًا", boundaries: "الحدود وما لا يشمله النطاق", cta: "ناقشوا احتياجاتكم",
  agreement: "نبدأ بالمشكلة والمستخدمين والقيود. نتفق معًا على النطاق ومعايير القبول والمراحل والملكية والتسليم. لا تُدرج الاستضافة ورسوم الأطراف الخارجية وترحيل البيانات والدعم المستمر تلقائيًا؛ ولا نعد هنا بموعد ثابت أو نتيجة تجارية مضمونة.",
  pillars: {
    websites: {
      title: "المنتجات الرقمية", outcome: "مساعدة الزوار على فهم خدماتكم وإتمام المهمة المناسبة، من موقع تعريفي للشركة إلى تجربة منتج محددة.",
      services: [
        { title: "مواقع الشركات والمهنيين", scope: "هيكلة المحتوى وصفحات خدمات متجاوبة ومسارات واضحة للاستفسار للشركات والمهنيين المستقلين." },
        { title: "تطبيقات الويب ومنصات SaaS", scope: "رحلات مستخدم وأدوار وصول وتدفقات منتج محددة؛ الفوترة والاشتراكات ضمن نطاق متفق عليه فقط." },
        { title: "استكشاف تطبيقات الجوال", scope: "تقييم احتياجات الأجهزة وقيود المنصات ونماذج الرحلات قبل الالتزام بالبناء. يتطلب التطوير الأصلي اتفاق جدوى منفصلًا." },
        { title: "تصميم تجربة المستخدم والواجهات والمنتج", scope: "معمارية المعلومات والمخططات الأولية ونماذج الواجهات وحالات تفاعل قابلة للمراجعة." },
      ],
      deliverables: ["خريطة صفحات وتدفقات مستخدم متفق عليها", "واجهة متجاوبة أو نموذج منتج محدود النطاق", "تنفيذ وفحوص أساسية وملاحظات تسليم عند التكليف بها"],
      example: "موقع استشارات بصفحات خدمات ومسار استفسار؛ أو نموذج حجز لمراجعة رحلة العميل.",
      boundaries: "لا نضمن ترتيب البحث أو نمو المبيعات أو قبول متاجر التطبيقات. المدفوعات والسجلات الطبية والبيانات الخاضعة للتنظيم وتسليم التطبيقات الأصلية ليست مشمولة افتراضيًا. لا نقدم شهادة قانونية أو شهادة امتثال.",
    },
    software: {
      title: "الأنظمة البرمجية", outcome: "تسهيل تشغيل سير عمل محدد، بحدود واضحة للبيانات وروابط بين أدوات مؤسستكم.",
      services: [
        { title: "الأنظمة الخلفية", scope: "قواعد العمل ونماذج البيانات والصلاحيات والتخزين للتدفقات المتفق عليها." },
        { title: "واجهات البرمجة وحدود الخدمات", scope: "واجهات موثقة وتحقق من المدخلات. تُستخدم الخدمات المصغرة فقط عندما تبرر المتطلبات التشغيلية تعقيدها الإضافي." },
        { title: "تكامل الأنظمة", scope: "ربط واجهات خارجية معتمدة بقواعد صريحة للأخطاء وإعادة المحاولة والوصول." },
        { title: "هندسة البيانات", scope: "استيراد وتحويل محدودان وبيانات للتقارير، وفق جودة المصادر وأذونات الوصول." },
      ],
      deliverables: ["سير عمل ونموذج بيانات بقواعد وصول", "واجهة أو تكامل محدد مع اختبارات آلية أساسية", "تعليمات إعداد وتسليم تشغيلي متفق عليه"],
      example: "أداة داخلية لتتبع الطلبات متصلة بنظام قائم، بواجهة موثقة وأدوار مستخدمين متفق عليها.",
      boundaries: "استبدال نظام المؤسسة بالكامل وترحيل البيانات بلا حدود والتشغيل على مدار الساعة واتفاقيات مستوى الخدمة ليست مشمولة افتراضيًا. يتطلب الوصول للأنظمة وتنظيف البيانات والاستضافة والصيانة اتفاقًا منفصلًا.",
    },
    ai: {
      title: "العمليات الذكية", outcome: "تقييم إمكانية المساعدة في مهمة متكررة بأمان، باستخدام محدد ومخرجات قابلة للمراجعة ومسار بديل بشري.",
      services: [
        { title: "الذكاء الاصطناعي وأتمتة سير العمل", scope: "تحديد الخطوات المتكررة ونقاط الموافقة ومعالجة الإخفاق قبل ربط الأدوات." },
        { title: "روبوتات محادثة للأعمال", scope: "نماذج لمحادثات دعم محدودة مع تصعيد إلى شخص وتوضيح الحدود." },
        { title: "مساعدو المعرفة", scope: "استرجاع من مستندات معتمدة وإشارات للمصادر وتقييم بأسئلة ممثلة للاستخدام." },
        { title: "تكامل المستندات والنماذج اللغوية", scope: "اختبار استخراج البيانات أو استدعاء النماذج ضمن سير عمل قائم، مع التحقق من المخرجات ومراجعتها." },
      ],
      deliverables: ["تقييم حالة الاستخدام والوصول للبيانات", "نموذج محدود بحالات تقييم وحدود موثقة", "إرشادات التكامل والمراجعة البشرية إذا ثبتت الجدوى"],
      example: "مساعد يسترجع إرشادات داخلية معتمدة ويذكر مصادرها، ويحيل الأسئلة التي لم تُجب إلى شخص.",
      boundaries: "لا نقدم إجابات معصومة من الخطأ أو قرارات مستقلة عالية المخاطر أو وفرًا مضمونًا. تُراجع البيانات الحساسة وشروط مزود النموذج والتكاليف المتكررة أولًا. النموذج الأولي لا يعني الجاهزية للتشغيل الفعلي.",
    },
  },
};

export const servicesContent: Record<Locale, ServicesContent> = { fa, en, ar };
