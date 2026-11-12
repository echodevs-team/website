import type { Locale } from "../i18n/config";

type Point = { title: string; description: string };
type ExploreKey = "services" | "work" | "about";

export type ContactContent = {
  title: string;
  description: string;
  eyebrow: string;
  badges: readonly string[];
  guidance: {
    eyebrow: string; title: string; description: string; items: readonly Point[];
    channelsTitle: string; channelsNote: string;
  };
  form: { eyebrow: string; title: string; description: string; note: string; ariaLabel: string };
  next: { eyebrow: string; title: string; description: string; steps: readonly Point[]; note: string };
  explore: {
    title: string; description: string; cta: string;
    links: readonly (Point & { key: ExploreKey })[];
  };
};

const en: ContactContent = {
  title: "Talk to us about the problem you need to solve",
  description: "Use the project inquiry to describe what you want to change, who it is for and the constraints you already know. Echo Devs reviews the context before proposing a scope; no response time or outcome is promised on this page.",
  eyebrow: "Contact Echo Devs",
  badges: ["Project inquiry", "Software & product work"],
  guidance: {
    eyebrow: "Before you write",
    title: "What makes an initial request useful",
    description: "A short, concrete message is easier to assess than a complete specification. Share what you know; open questions can be clarified later.",
    items: [
      { title: "The problem and desired outcome", description: "What is difficult today, who experiences it and what should be different when the work is done?" },
      { title: "The current context", description: "The existing website, system, content or workflow, and anything that must be preserved." },
      { title: "Scope signals", description: "The main pages or workflows, user roles, and which capabilities are essential versus later." },
      { title: "Data and integrations", description: "Approved systems, imports, external services, permissions and any sensitive data involved." },
      { title: "Constraints", description: "A realistic timeline and budget range, hosting requirements and legal or regulatory limits." },
    ],
    channelsTitle: "Direct channels",
    channelsNote: "No public email address, phone number or social profile is published yet. The project inquiry is the implemented contact path; verified channels will be added when approved.",
  },
  form: {
    eyebrow: "Project inquiry",
    title: "Send a project request",
    description: "Describe the project and leave one way to reach you. Required fields are marked.",
    note: "Success appears only after the inquiry has been saved. If the service is unavailable, the form reports that it could not confirm storage and keeps your draft in this page.",
    ariaLabel: "Project inquiry form",
  },
  next: {
    eyebrow: "After you send",
    title: "What happens next",
    description: "The process starts with confirmation, not an automatic promise of work. We do not state a response time unless one has been agreed.",
    steps: [
      { title: "Confirmation and reference", description: "A successful submission returns a reference. Keep it for any follow-up; no confirmation is shown before the inquiry is stored." },
      { title: "Context review", description: "We review the problem, constraints and missing information to judge whether the work fits the team and the scope can be defined." },
      { title: "Follow-up or written scope", description: "If the request fits, we use the email or phone you provided to discuss the problem and prepare a written scope with assumptions, milestones and exclusions." },
    ],
    note: "No public response-time guarantee is published. Scope, timing and support are agreed before development starts.",
  },
  explore: {
    title: "Explore before contacting",
    description: "If you are deciding whether to start a conversation, review the related pages first.",
    cta: "Open page",
    links: [
      { key: "services", title: "Services and scopes", description: "See the possible project scopes, deliverables and exclusions." },
      { key: "work", title: "Concept work", description: "Review illustrative interface studies; they are not live client projects." },
      { key: "about", title: "Team and approach", description: "Read how the collective works, reviews decisions and hands projects over." },
    ],
  },
};

const fa: ContactContent = {
  title: "درباره مسئله‌ای که می‌خواهید حل کنید با ما صحبت کنید",
  description: "برای شرح آنچه می‌خواهید تغییر کند، افرادی که از آن استفاده می‌کنند و محدودیت‌های موجود از فرم درخواست پروژه استفاده کنید. اکو دوز ابتدا زمینه را بررسی می‌کند و سپس دامنه پیشنهادی را می‌سازد؛ در این صفحه زمان پاسخ یا نتیجه‌ای وعده داده نمی‌شود.",
  eyebrow: "تماس با اکو دوز",
  badges: ["درخواست پروژه", "نرم‌افزار و محصول دیجیتال"],
  guidance: {
    eyebrow: "پیش از نوشتن",
    title: "چه چیزی یک درخواست اولیه را مفید می‌کند",
    description: "یک پیام کوتاه و مشخص بهتر از یک مشخصات کامل قابل ارزیابی است. آنچه می‌دانید را بنویسید؛ پرسش‌های باز بعداً روشن می‌شوند.",
    items: [
      { title: "مسئله و نتیجه مطلوب", description: "امروز چه چیزی دشوار است، چه کسی آن را تجربه می‌کند و پس از پایان کار چه چیزی باید متفاوت باشد؟" },
      { title: "وضعیت فعلی", description: "وب‌سایت، سامانه، محتوا یا گردش کار موجود و هر چیزی که باید حفظ شود." },
      { title: "نشانه‌های دامنه", description: "صفحات یا جریان‌های اصلی، نقش‌های کاربر و اینکه کدام قابلیت‌ها ضروری و کدام بعدی هستند." },
      { title: "داده و یکپارچه‌سازی", description: "سامانه‌های تأییدشده، ورود داده، سرویس‌های بیرونی، مجوزها و داده حساسی که دخیل است." },
      { title: "محدودیت‌ها", description: "بازه واقع‌بینانه زمان و بودجه، نیاز میزبانی و محدودیت‌های قانونی یا مقرراتی." },
    ],
    channelsTitle: "کانال‌های مستقیم",
    channelsNote: "هنوز نشانی ایمیل، شماره تلفن یا صفحه اجتماعی عمومی منتشر نشده است. فرم درخواست پروژه تنها مسیر ارتباطی پیاده‌شده است؛ کانال‌های تأییدشده پس از تأیید اضافه می‌شوند.",
  },
  form: {
    eyebrow: "درخواست پروژه",
    title: "ارسال درخواست پروژه",
    description: "پروژه را شرح دهید و یک راه ارتباطی بگذارید. فیلدهای الزامی مشخص شده‌اند.",
    note: "پیام موفقیت تنها پس از ذخیره درخواست نمایش داده می‌شود. اگر سرویس در دسترس نباشد، فرم اعلام می‌کند که ذخیره تأیید نشد و پیش‌نویس را در همین صفحه نگه می‌دارد.",
    ariaLabel: "فرم درخواست پروژه",
  },
  next: {
    eyebrow: "پس از ارسال",
    title: "چه اتفاقی می‌افتد",
    description: "فرآیند با تأیید ذخیره شروع می‌شود، نه با وعده خودکار انجام کار. زمان پاسخ مشخصی اعلام نمی‌کنیم مگر آنکه توافق شده باشد.",
    steps: [
      { title: "تأیید و شناسه پیگیری", description: "ارسال موفق یک شناسه پیگیری برمی‌گرداند. آن را برای پیگیری نگه دارید؛ پیش از ذخیره درخواست تأییدی نمایش داده نمی‌شود." },
      { title: "بررسی زمینه", description: "مسئله، محدودیت‌ها و اطلاعات ناقص را بررسی می‌کنیم تا مشخص شود کار به تیم می‌خورد و دامنه قابل تعریف است." },
      { title: "پیگیری یا دامنه مکتوب", description: "اگر درخواست مناسب باشد، با ایمیل یا تلفنی که وارد کرده‌اید درباره مسئله گفتگو می‌کنیم و دامنه مکتوب با فرضیات، مراحل و موارد خارج از دامنه آماده می‌کنیم." },
    ],
    note: "هیچ تعهد عمومی برای زمان پاسخ منتشر نشده است. دامنه، زمان‌بندی و پشتیبانی پیش از توسعه توافق می‌شوند.",
  },
  explore: {
    title: "پیش از تماس بررسی کنید",
    description: "اگر درباره شروع گفتگو تردید دارید، ابتدا صفحات مرتبط را ببینید.",
    cta: "بازکردن صفحه",
    links: [
      { key: "services", title: "خدمات و دامنه‌ها", description: "دامنه‌های ممکن پروژه، خروجی‌ها و موارد خارج از دامنه را ببینید." },
      { key: "work", title: "طرح‌های مفهومی", description: "مطالعات نمایشی رابط کاربری را ببینید؛ این‌ها پروژه زنده مشتری نیستند." },
      { key: "about", title: "تیم و رویکرد", description: "بخوانید تیم جمعی چگونه کار می‌کند، تصمیم‌ها را بازبینی می‌کند و پروژه را تحویل می‌دهد." },
    ],
  },
};

const ar: ContactContent = {
  title: "تحدثوا معنا عن المشكلة التي تحتاجون إلى حلها",
  description: "استخدموا نموذج طلب المشروع لوصف ما تريدون تغييره، ومن سيستخدمه، والقيود المعروفة لديكم. يراجع إيكو ديفز السياق قبل اقتراح النطاق؛ ولا نعد في هذه الصفحة بزمن استجابة أو نتيجة.",
  eyebrow: "تواصلوا مع إيكو ديفز",
  badges: ["طلب مشروع", "برمجيات ومنتجات رقمية"],
  guidance: {
    eyebrow: "قبل الكتابة",
    title: "ما يجعل الطلب الأولي مفيدًا",
    description: "رسالة قصيرة ومحددة أسهل في التقييم من مواصفات كاملة. اكتبوا ما تعرفونه؛ ويمكن توضيح الأسئلة المفتوحة لاحقًا.",
    items: [
      { title: "المشكلة والنتيجة المطلوبة", description: "ما الصعب اليوم، ومن يواجهه، وما الذي يجب أن يكون مختلفًا بعد إنجاز العمل؟" },
      { title: "الوضع الحالي", description: "الموقع أو النظام أو المحتوى أو سير العمل القائم، وكل ما يجب الحفاظ عليه." },
      { title: "إشارات النطاق", description: "الصفحات أو التدفقات الرئيسية وأدوار المستخدمين، وأي القدرات ضرورية وأيها لاحقًا." },
      { title: "البيانات والتكامل", description: "الأنظمة المعتمدة والاستيراد والخدمات الخارجية والصلاحيات وأي بيانات حساسة معنية." },
      { title: "القيود", description: "نطاق زمني وميزانية واقعيان ومتطلبات الاستضافة والحدود القانونية أو التنظيمية." },
    ],
    channelsTitle: "القنوات المباشرة",
    channelsNote: "لم يُنشر بعد بريد إلكتروني أو رقم هاتف أو ملف اجتماعي عام. نموذج طلب المشروع هو مسار التواصل المنفذ؛ وتُضاف القنوات المتحقق منها بعد الموافقة.",
  },
  form: {
    eyebrow: "طلب مشروع",
    title: "أرسلوا طلب مشروع",
    description: "صفوا المشروع واتركوا وسيلة واحدة للتواصل. الحقول المطلوبة مميزة.",
    note: "لا تظهر رسالة النجاح إلا بعد حفظ الطلب. وإذا كانت الخدمة غير متاحة، يوضح النموذج أنه لم يؤكد الحفظ ويحتفظ بمسودتكم في هذه الصفحة.",
    ariaLabel: "نموذج طلب المشروع",
  },
  next: {
    eyebrow: "بعد الإرسال",
    title: "ماذا يحدث بعد ذلك",
    description: "تبدأ العملية بتأكيد الحفظ، لا بوعد تلقائي بتنفيذ العمل. لا نذكر زمن استجابة محددًا ما لم يكن متفقًا عليه.",
    steps: [
      { title: "التأكيد والرقم المرجعي", description: "يعيد الإرسال الناجح رقمًا مرجعيًا. احتفظوا به لأي متابعة؛ ولا يظهر أي تأكيد قبل حفظ الطلب." },
      { title: "مراجعة السياق", description: "نراجع المشكلة والقيود والمعلومات الناقصة لتحديد ما إذا كان العمل يناسب الفريق ويمكن تعريف نطاقه." },
      { title: "متابعة أو نطاق مكتوب", description: "إذا ناسب الطلب، نستخدم البريد أو الهاتف الذي تركتموه لمناقشة المشكلة وإعداد نطاق مكتوب بالافتراضات والمراحل والحدود." },
    ],
    note: "لا يُنشر أي تعهد عام بزمن الاستجابة. يُتفق على النطاق والتوقيت والدعم قبل بدء التطوير.",
  },
  explore: {
    title: "استكشفوا قبل التواصل",
    description: "إذا كنتم تقررون بدء محادثة، راجعوا الصفحات ذات الصلة أولًا.",
    cta: "فتح الصفحة",
    links: [
      { key: "services", title: "الخدمات والنطاقات", description: "شاهدوا نطاقات المشاريع المحتملة والمخرجات والحدود." },
      { key: "work", title: "الأعمال التصورية", description: "راجعوا دراسات واجهات توضيحية؛ وليست مشاريع عملاء حية." },
      { key: "about", title: "الفريق والنهج", description: "اقرأوا كيف يعمل الفريق الجماعي ويراجع القرارات ويسلم المشاريع." },
    ],
  },
};

export const contactContent: Record<Locale, ContactContent> = { fa, en, ar };
