import type { Locale } from "../i18n/config";

type Item = { title: string; description: string };
type Service = Item & { pillar: string; areas: readonly string[]; detail: string };
export type Concept = Item & { kind: "client" | "internal" | "concept"; visual: "analytics" | "chat" | "booking"; badge: string; stack: readonly string[] };
export type HomeContent = {
  badge: string; title: string; lead: string; start: string; examples: string;
  engineering: Item; capabilities: readonly (Item & { label: string })[];
  servicesHeading: Item; servicesEyebrow: string; services: readonly Service[];
  request: string; details: string; areas: string;
  conceptsHeading: Item; conceptsEyebrow: string; concepts: readonly Concept[];
  illustration: string; similar: string; chat: readonly [string, string]; booking: readonly [string, string];
  benefitsHeading: Item; benefitsEyebrow: string; benefits: readonly Item[];
  processHeading: Item; processEyebrow: string; steps: readonly Item[];
  inquiry: Item; unavailable: string; submissionUnavailable: string; contactsPending: string;
  fields: { name: string; contact: string; service: string; timeline: string; description: string; undecided: string };
  footer: string; navigation: string; processLabel: string; benefitsLabel: string; backTop: string;
};

const en: HomeContent = {
  badge: "Echo Devs · Software engineering studio", title: "Your ideas. Our engineering expertise.",
  lead: "Design and engineering for modern websites, custom software and practical AI solutions, shaped around your business needs.",
  start: "Start a project", examples: "Explore concepts and demos",
  engineering: { title: "Engineering with purpose", description: "Clean code meets product thinking to shape useful, maintainable solutions." },
  capabilities: [
    { label: "Product lifecycle", title: "End-to-End", description: "Explore the path from discovery and design to delivery." },
    { label: "Software architecture", title: "Quality by design", description: "Discuss modular code, testing and maintainability." },
    { label: "Focused services", title: "3 service pillars", description: "Websites, custom software and practical AI." },
    { label: "Deployment planning", title: "Cloud-Native", description: "Choose infrastructure to suit the project's constraints." },
  ],
  servicesEyebrow: "Three complementary service pillars",
  servicesHeading: { title: "Software solutions at the scale of your business", description: "Explore possible scopes below. Deliverables, feasibility and operating requirements are agreed for each project." },
  areas: "Areas of focus", request: "Discuss this service", details: "Scope details",
  services: [
    { pillar: "Pillar 01 / Digital identity", title: "Websites & digital identity", description: "Responsive websites with clear content, accessible journeys and a sound technical SEO foundation.", areas: ["Business and organizational portals", "Healthcare information websites", "Legal and consulting websites", "Booking and commerce experiences"], detail: "Scope can include information architecture, responsive design and implementation. Payments, sensitive data and integrations require separate assessment." },
    { pillar: "Pillar 02 / Systems", title: "Custom software development", description: "Web applications tailored to workflows, data management and organizational bottlenecks.", areas: ["Web applications and SaaS platforms", "Management panels and dashboards", "Internal automation tools", "APIs and system integrations"], detail: "Define user roles, workflows, data boundaries and integrations before estimating delivery. Hosting, migration and support are agreed separately." },
    { pillar: "Pillar 03 / Artificial intelligence", title: "AI & automation", description: "Evaluate practical AI for knowledge retrieval, document processing and repetitive workflows.", areas: ["Knowledge-base support assistants", "Business workflow automation", "Document data extraction", "Language-model integrations"], detail: "Start with a bounded use case and evaluation data. Assess accuracy, privacy, costs and human review; error-free output is not guaranteed." },
  ],
  conceptsEyebrow: "Concepts & interface studies", conceptsHeading: { title: "Concept demos and prototype gallery", description: "Illustrative interface studies, not deployed client projects or live applications. Charts, conversations and booking states below are sample visuals." },
  illustration: "Illustrative data only", similar: "Discuss a similar idea",
  chat: ["How can I upgrade my subscription?", "Open Settings → Billing to review available plans."], booking: ["Specialist appointment", "Reminder workflow"],
  concepts: [
    { kind: "concept", visual: "analytics", badge: "Concept · demo", title: "SaaS analytics & data dashboard", description: "An interface concept for reports, trends and product activity. No production performance results are implied.", stack: ["React / Next.js", "Tailwind CSS", "Data visualization"] },
    { kind: "concept", visual: "chat", badge: "Concept · interaction", title: "Knowledge-based support assistant", description: "A conversation concept for business documentation, with source evaluation and human escalation to be designed.", stack: ["Python / FastAPI", "Retrieval", "Vector DB"] },
    { kind: "concept", visual: "booking", badge: "Concept · architecture", title: "Healthcare booking portal", description: "A scheduling interface study. Medical records, payments and regulatory compliance are not implemented or certified here.", stack: ["Next.js", "PostgreSQL", "Scheduling"] },
  ],
  benefitsEyebrow: "Why Echo Devs?", benefitsHeading: { title: "Make the collaboration concrete", description: "A proposed working approach, not evidence of past client outcomes. Use these checkpoints to define the project together." },
  benefits: [
    { title: "Clarify technical decisions", description: "Record requirements, open questions and the reasons behind architectural choices." },
    { title: "Think in product outcomes", description: "Agree on user needs and measurable acceptance criteria, not guaranteed investment returns." },
    { title: "Plan a maintainable handoff", description: "Define source-code access, documentation and ownership in the project agreement." },
    { title: "Make milestones visible", description: "Agree on reviews, dependencies and change handling. Dates follow the approved scope." },
  ],
  processEyebrow: "A clear path to collaboration", processLabel: "Process", benefitsLabel: "Why us",
  processHeading: { title: "Six stages from discovery to delivery", description: "A proposed project path. Timing, deliverables and support are agreed after reviewing scope." },
  steps: [
    { title: "Discovery & requirements", description: "Understand your business, users, constraints and the problem to solve." },
    { title: "Planning & architecture", description: "Agree on scope, technology, milestones and an estimate with explicit assumptions." },
    { title: "Experience & interface design", description: "Review user journeys and prototypes before implementation." },
    { title: "Engineering & development", description: "Build in reviewable increments, with version control and tests for core behavior." },
    { title: "Testing & quality review", description: "Check functionality, accessibility, security and responsiveness against agreed criteria." },
    { title: "Delivery & support planning", description: "Prepare deployment and documentation; agree on maintenance and support separately." },
  ],
  inquiry: { title: "An idea in mind? Let's shape it together.", description: "This is the future project inquiry area. Online intake will open only when requests can be securely stored and reviewed." },
  unavailable: "Project inquiries are not available yet. This preview does not collect or send information.", submissionUnavailable: "Submission unavailable", contactsPending: "Public email, phone and social channels await owner verification. The project inquiry is the available contact path.",
  fields: { name: "Full name", contact: "Email or phone", service: "Requested service", timeline: "Preferred timeline (optional)", description: "Tell us about your project", undecided: "To be discussed" },
  footer: "Websites, custom software and practical AI. A software engineering studio focused on thoughtful digital products.", navigation: "Explore the homepage", backTop: "Back to top",
};

const fa: HomeContent = {
  badge: "استودیو تخصصی اکو دوز (Echo Devs)", title: "ایده‌های شما، تخصص مهندسی ما.", lead: "طراحی و مهندسی وب‌سایت‌های مدرن، نرم‌افزارهای سفارشی و راهکارهای هوش مصنوعی کاربردی، متناسب با نیاز کسب‌وکار شما.", start: "شروع پروژه", examples: "مشاهده نمونه‌ها و دموها",
  engineering: { title: "مهندسی هدفمند", description: "تلفیق کدنویسی تمیز با تفکر محصولی برای راهکارهای کاربردی و قابل نگهداری" },
  capabilities: [
    { label: "چرخه محصول", title: "End-to-End", description: "مسیر شناخت و طراحی تا توسعه و تحویل" },
    { label: "معماری نرم‌افزار", title: "کیفیت در طراحی", description: "بررسی کد ماژولار، آزمون و نگهداری" },
    { label: "خدمات متمرکز", title: "۳ حوزه تخصصی", description: "وب‌سایت، نرم‌افزار سفارشی و هوش مصنوعی" },
    { label: "برنامه‌ریزی استقرار", title: "Cloud-Native", description: "انتخاب زیرساخت متناسب با محدودیت‌های پروژه" },
  ],
  servicesEyebrow: "۳ حوزه تخصصی خدمات اکو دوز", servicesHeading: { title: "راهکارهای نرم‌افزاری متناسب با مقیاس کسب‌وکار شما", description: "دامنه‌های پیشنهادی را بررسی کنید. خروجی‌ها، امکان‌پذیری و نیازهای عملیاتی برای هر پروژه جداگانه توافق می‌شوند." }, areas: "زمینه‌های تخصصی", request: "درخواست این خدمت", details: "جزئیات خدمات",
  services: [
    { pillar: "ستون اول / هویت دیجیتال", title: "وب‌سایت‌ها و هویت دیجیتال", description: "وب‌سایت‌های واکنش‌گرا با محتوای روشن، مسیرهای کاربری دسترس‌پذیر و پایه مناسب برای سئوی فنی.", areas: ["پورتال‌های سازمانی و شرکتی", "وب‌سایت‌های اطلاع‌رسانی پزشکی و سلامت", "وب‌سایت‌های حقوقی و مشاوره", "تجربه‌های رزرو آنلاین و فروشگاهی"], detail: "دامنه می‌تواند شامل معماری اطلاعات، طراحی واکنش‌گرا و پیاده‌سازی باشد. پرداخت، داده حساس و اتصال به سرویس‌های دیگر نیازمند بررسی جداگانه‌اند." },
    { pillar: "ستون دوم / سامانه‌ها", title: "توسعه نرم‌افزار سفارشی", description: "اپلیکیشن‌های تحت وب متناسب با گردش کار، مدیریت داده و گلوگاه‌های سازمان شما.", areas: ["وب‌اپلیکیشن‌ها و پلتفرم‌های SaaS", "پنل‌های مدیریتی و داشبوردها", "ابزارهای اتوماسیون داخلی", "طراحی API و یکپارچه‌سازی سامانه‌ها"], detail: "نقش کاربران، جریان‌های اصلی، مرز داده‌ها و نیازهای اتصال پیش از برآورد مشخص می‌شوند. میزبانی، مهاجرت و پشتیبانی جداگانه توافق می‌شوند." },
    { pillar: "ستون سوم / هوش مصنوعی", title: "هوش مصنوعی و اتوماسیون", description: "ارزیابی کاربرد هوش مصنوعی در بازیابی دانش، پردازش اسناد و گردش کارهای تکراری.", areas: ["دستیار پشتیبانی با پایگاه دانش", "اتوماسیون فرآیندهای کسب‌وکار", "استخراج داده از اسناد", "ادغام مدل‌های زبانی با سامانه‌ها"], detail: "شروع با کاربرد محدود و داده ارزیابی است. دقت مدل، حریم خصوصی، هزینه اجرا و بازبینی انسانی بررسی می‌شوند؛ خروجی بدون خطا تضمین نمی‌شود." },
  ],
  conceptsEyebrow: "مفاهیم و مطالعات رابط کاربری", conceptsHeading: { title: "گالری دموها و پروتوتایپ‌های مفهومی", description: "مطالعات تصویری رابط کاربری؛ نه پروژه مشتری و نه برنامه زنده. نمودارها، گفتگوها و وضعیت‌های رزرو زیر صرفاً نمایشی‌اند." }, illustration: "داده‌ها صرفاً نمایشی‌اند", similar: "گفتگو درباره طرح مشابه", chat: ["چطور می‌توانم اشتراک سرویس را ارتقا دهم؟", "از تنظیمات ← صورتحساب، طرح‌های موجود را بررسی کنید."], booking: ["رزرو نوبت متخصص", "گردش کار یادآوری"],
  concepts: [
    { kind: "concept", visual: "analytics", badge: "مفهوم · دمو", title: "داشبورد SaaS و مدیریت داده‌های تحلیلی", description: "ایده رابط کاربری برای بررسی گزارش‌ها، روندها و فعالیت محصول؛ بدون ادعای نتایج عملکرد واقعی.", stack: ["React / Next.js", "Tailwind CSS", "Data visualization"] },
    { kind: "concept", visual: "chat", badge: "مفهوم · تعامل", title: "دستیار پشتیبانی مبتنی بر پایگاه دانش", description: "طرح گفتگو برای بازیابی مستندات کسب‌وکار؛ ارزیابی منابع و ارجاع به انسان در طراحی واقعی تعریف می‌شوند.", stack: ["Python / FastAPI", "Retrieval", "Vector DB"] },
    { kind: "concept", visual: "booking", badge: "مفهوم · معماری", title: "پورتال خدمات پزشکی و نوبت‌دهی آنلاین", description: "مطالعه رابط زمان‌بندی؛ پرونده پزشکی، پرداخت و انطباق با مقررات در این نمونه پیاده‌سازی یا تأیید نشده‌اند.", stack: ["Next.js", "PostgreSQL", "Scheduling"] },
  ],
  benefitsEyebrow: "چرا اکو دوز؟", benefitsHeading: { title: "همکاری با اکو دوز، روشن و ملموس", description: "رویکرد پیشنهادی همکاری، نه مدرک نتایج مشتریان گذشته. این موارد مبنای تعریف مشترک پروژه‌اند." },
  benefits: [
    { title: "شفاف‌سازی تصمیم‌های فنی", description: "ثبت نیازمندی‌ها، پرسش‌های باز و دلایل انتخاب‌های معماری." },
    { title: "تفکر محصولی و هدف‌محور", description: "توافق بر نیاز کاربر و معیارهای پذیرش قابل سنجش، به‌جای تضمین بازگشت سرمایه." },
    { title: "برنامه تحویل قابل نگهداری", description: "تعریف دسترسی به کد، مستندات و مالکیت در توافق پروژه." },
    { title: "مرحله‌بندی شفاف", description: "توافق بر نقاط بازبینی، وابستگی‌ها و مدیریت تغییر؛ زمان‌بندی تابع دامنه تأییدشده است." },
  ],
  processEyebrow: "مسیر روشن همکاری", processLabel: "فرآیند همکاری", benefitsLabel: "چرا ما؟", processHeading: { title: "فرآیند ۶ مرحله‌ای توسعه و تحویل شفاف", description: "مسیر پیشنهادی پروژه؛ زمان‌بندی، خروجی‌ها و پشتیبانی پس از بررسی دامنه توافق می‌شوند." },
  steps: [
    { title: "کشف و شناخت نیازمندی‌ها", description: "شناخت کسب‌وکار، کاربران، محدودیت‌های فنی و مسئله‌ای که باید حل شود." },
    { title: "برنامه‌ریزی، معماری و برآورد", description: "توافق بر دامنه، فناوری، مراحل و برآورد با فرضیات روشن." },
    { title: "طراحی تجربه و رابط کاربری", description: "بازبینی مسیر کاربر و نمونه‌های اولیه پیش از آغاز پیاده‌سازی." },
    { title: "مهندسی و توسعه", description: "ساخت تدریجی و قابل بازبینی همراه با کنترل نسخه و آزمون رفتارهای اصلی." },
    { title: "تست و بررسی کیفیت", description: "بررسی کارکرد، دسترس‌پذیری، امنیت و واکنش‌گرایی بر اساس معیارهای توافق‌شده." },
    { title: "تحویل و برنامه‌ریزی پشتیبانی", description: "آماده‌سازی استقرار و مستندات؛ توافق جداگانه بر مسئولیت نگهداری و پشتیبانی." },
  ],
  inquiry: { title: "ایده‌ای در ذهن دارید؟ بیایید با هم آن را بسازیم.", description: "این بخش برای درخواست پروژه آماده می‌شود. دریافت آنلاین تنها پس از امکان ذخیره امن و بررسی درخواست‌ها فعال خواهد شد." }, unavailable: "ثبت درخواست پروژه هنوز فعال نیست. این پیش‌نمایش اطلاعاتی دریافت یا ارسال نمی‌کند.", submissionUnavailable: "ارسال درخواست غیرفعال است", contactsPending: "ایمیل، تلفن و شبکه‌های اجتماعی عمومی در انتظار تأیید مالک هستند. فرم درخواست پروژه مسیر ارتباطی در دسترس است.", fields: { name: "نام و نام خانوادگی", contact: "ایمیل یا شماره تماس", service: "نوع خدمت درخواستی", timeline: "زمان‌بندی ترجیحی (اختیاری)", description: "توضیحات نیازمندی پروژه", undecided: "نیازمند گفتگو" }, footer: "وب‌سایت، نرم‌افزار سفارشی و هوش مصنوعی کاربردی؛ استودیوی مهندسی نرم‌افزار با تمرکز بر محصولات دیجیتال سنجیده.", navigation: "بخش‌های صفحه", backTop: "بازگشت به بالا",
};

const ar: HomeContent = {
  badge: "استوديو إيكو ديفز لهندسة البرمجيات", title: "أفكاركم، وخبرتنا الهندسية.", lead: "تصميم وهندسة مواقع حديثة وبرمجيات مخصصة وحلول ذكاء اصطناعي عملية، وفق احتياجات أعمالكم.", start: "ابدأ مشروعًا", examples: "استكشف النماذج المفاهيمية",
  engineering: { title: "هندسة هادفة", description: "برمجة واضحة وتفكير بالمنتج لبناء حلول مفيدة وقابلة للصيانة." },
  capabilities: [
    { label: "دورة المنتج", title: "End-to-End", description: "مسار من الاستكشاف والتصميم إلى التطوير والتسليم." },
    { label: "معمارية البرمجيات", title: "الجودة في التصميم", description: "مناقشة الوحدات البرمجية والاختبارات والصيانة." },
    { label: "خدمات مركزة", title: "٣ محاور للخدمات", description: "المواقع والبرمجيات المخصصة والذكاء الاصطناعي." },
    { label: "تخطيط النشر", title: "Cloud-Native", description: "اختيار البنية التحتية وفق قيود المشروع." },
  ],
  servicesEyebrow: "ثلاثة محاور متكاملة للخدمات", servicesHeading: { title: "حلول برمجية تناسب حجم أعمالكم", description: "استكشفوا النطاقات المقترحة. يجري الاتفاق على المخرجات والجدوى والمتطلبات التشغيلية لكل مشروع." }, areas: "مجالات التركيز", request: "ناقش هذه الخدمة", details: "تفاصيل النطاق",
  services: [
    { pillar: "المحور الأول / الهوية الرقمية", title: "المواقع والهوية الرقمية", description: "مواقع متجاوبة بمحتوى واضح ومسارات ميسرة وأساس سليم لتحسين الظهور التقني في البحث.", areas: ["بوابات الشركات والمؤسسات", "مواقع المعلومات الطبية والصحية", "مواقع الاستشارات والخدمات القانونية", "تجارب الحجز والتجارة الإلكترونية"], detail: "قد يشمل النطاق بنية المعلومات وتصميم الواجهات المتجاوبة وتنفيذها. المدفوعات والبيانات الحساسة والتكاملات تتطلب تقييمًا منفصلًا." },
    { pillar: "المحور الثاني / الأنظمة", title: "تطوير البرمجيات المخصصة", description: "تطبيقات ويب مصممة لسير العمل وإدارة البيانات ومعالجة العقبات داخل المؤسسة.", areas: ["تطبيقات الويب ومنصات SaaS", "لوحات الإدارة ومتابعة البيانات", "أدوات الأتمتة الداخلية", "واجهات API وتكامل الأنظمة"], detail: "تحديد أدوار المستخدمين وسير العمل وحدود البيانات والتكاملات يسبق التقدير. الاستضافة وترحيل البيانات والدعم تُتفق عليها بشكل منفصل." },
    { pillar: "المحور الثالث / الذكاء الاصطناعي", title: "الذكاء الاصطناعي والأتمتة", description: "تقييم تطبيقات عملية لاسترجاع المعرفة ومعالجة المستندات وأتمتة المهام المتكررة.", areas: ["مساعدو الدعم المرتبطون بقاعدة معرفة", "أتمتة إجراءات الأعمال", "استخراج البيانات من المستندات", "دمج النماذج اللغوية في الأنظمة"], detail: "البدء بحالة استخدام محدودة وبيانات تقييم. يجب تقييم الدقة والخصوصية وتكاليف التشغيل والمراجعة البشرية؛ لا ضمان لمخرجات خالية من الأخطاء." },
  ],
  conceptsEyebrow: "مفاهيم ودراسات للواجهات", conceptsHeading: { title: "معرض النماذج والمفاهيم الأولية", description: "دراسات توضيحية للواجهات، وليست مشاريع عملاء منشورة أو تطبيقات حية. الرسوم والمحادثات وحالات الحجز أمثلة بصرية فقط." }, illustration: "بيانات توضيحية فقط", similar: "ناقش فكرة مشابهة", chat: ["كيف يمكنني ترقية اشتراكي؟", "افتح الإعدادات ← الفوترة للاطلاع على الخطط المتاحة."], booking: ["حجز موعد اختصاصي", "سير عمل التذكير"],
  concepts: [
    { kind: "concept", visual: "analytics", badge: "مفهوم · عرض", title: "لوحة تحليلات SaaS وإدارة البيانات", description: "مفهوم واجهة للتقارير والاتجاهات ونشاط المنتج، دون ادعاء نتائج أداء فعلية.", stack: ["React / Next.js", "Tailwind CSS", "Data visualization"] },
    { kind: "concept", visual: "chat", badge: "مفهوم · تفاعل", title: "مساعد دعم مرتبط بقاعدة معرفة", description: "مفهوم محادثة لوثائق العمل؛ تقييم المصادر والإحالة للبشر جزء من التصميم المطلوب لاحقًا.", stack: ["Python / FastAPI", "Retrieval", "Vector DB"] },
    { kind: "concept", visual: "booking", badge: "مفهوم · معمارية", title: "بوابة خدمات صحية وحجز مواعيد", description: "دراسة واجهة للجدولة. السجلات الطبية والمدفوعات والامتثال التنظيمي غير منفذة أو معتمدة هنا.", stack: ["Next.js", "PostgreSQL", "Scheduling"] },
  ],
  benefitsEyebrow: "لماذا إيكو ديفز؟", benefitsHeading: { title: "تعاون واضح وملموس", description: "نهج عمل مقترح، وليس دليلًا على نتائج عملاء سابقين. هذه نقاط تساعد على تحديد المشروع معًا." },
  benefits: [
    { title: "توضيح القرارات التقنية", description: "توثيق المتطلبات والأسئلة المفتوحة وأسباب الخيارات المعمارية." },
    { title: "التفكير بنتائج المنتج", description: "الاتفاق على احتياجات المستخدم ومعايير قبول قابلة للقياس بدل ضمان عائد استثماري." },
    { title: "تخطيط تسليم قابل للصيانة", description: "تحديد الوصول إلى الشيفرة والتوثيق والملكية ضمن اتفاق المشروع." },
    { title: "مراحل واضحة", description: "تحديد المراجعات والتبعيات وإدارة التغيير؛ المواعيد تتبع النطاق المعتمد." },
  ],
  processEyebrow: "مسار واضح للتعاون", processLabel: "مراحل العمل", benefitsLabel: "لماذا نحن؟", processHeading: { title: "ست مراحل من الاستكشاف إلى التسليم", description: "مسار مقترح للمشروع. المدة والمخرجات والدعم تُحدد بعد مراجعة النطاق." },
  steps: [
    { title: "الاستكشاف والمتطلبات", description: "فهم الأعمال والمستخدمين والقيود التقنية والمشكلة المطلوب حلها." },
    { title: "التخطيط والمعمارية والتقدير", description: "الاتفاق على النطاق والتقنية والمراحل والتقدير بافتراضات واضحة." },
    { title: "تصميم التجربة والواجهة", description: "مراجعة رحلات المستخدم والنماذج الأولية قبل بدء التنفيذ." },
    { title: "الهندسة والتطوير", description: "البناء على دفعات قابلة للمراجعة مع إدارة الإصدارات واختبارات السلوك الأساسي." },
    { title: "الاختبار ومراجعة الجودة", description: "فحص الوظائف وإمكانية الوصول والأمان والتجاوب وفق معايير متفق عليها." },
    { title: "التسليم وتخطيط الدعم", description: "إعداد النشر والتوثيق والاتفاق منفصلًا على مسؤوليات الصيانة والدعم." },
  ],
  inquiry: { title: "لديكم فكرة؟ لنبلورها معًا.", description: "هذا القسم مخصص لطلبات المشاريع مستقبلًا. لن يُفتح الاستقبال الإلكتروني إلا عند توفر التخزين الآمن ومراجعة الطلبات." }, unavailable: "طلبات المشاريع غير متاحة بعد. هذه المعاينة لا تجمع المعلومات ولا ترسلها.", submissionUnavailable: "الإرسال غير متاح", contactsPending: "البريد والهاتف والقنوات الاجتماعية العامة بانتظار تحقق المالك. نموذج طلب المشروع هو مسار التواصل المتاح.", fields: { name: "الاسم الكامل", contact: "البريد الإلكتروني أو الهاتف", service: "الخدمة المطلوبة", timeline: "المدة المفضلة (اختياري)", description: "أخبرنا عن مشروعك", undecided: "يُناقش لاحقًا" }, footer: "مواقع وبرمجيات مخصصة وذكاء اصطناعي عملي؛ استوديو هندسة برمجيات يركز على منتجات رقمية مدروسة.", navigation: "أقسام الصفحة", backTop: "العودة إلى الأعلى",
};

export const homeContent: Record<Locale, HomeContent> = { fa, en, ar };
export const serviceIds = ["websites", "software", "ai"] as const;
export const processCodes = ["DISCOVERY", "PLANNING", "UI/UX DESIGN", "DEVELOPMENT", "QA & TESTING", "DELIVERY & SUPPORT"] as const;
