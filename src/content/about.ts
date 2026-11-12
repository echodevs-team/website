import type { Locale } from "../i18n/config";
import type { serviceIds } from "./home";

type Point = { title: string; description: string };
type Step = Point & { code: string };

export type AboutContent = {
  title: string;
  description: string;
  eyebrow: string;
  badges: readonly string[];
  actions: { primary: string; secondary: string };
  team: {
    eyebrow: string; title: string; description: string; pointsTitle: string;
    points: readonly Point[]; profilesTitle: string; profilesNote: string;
    factsTitle: string; factsNote: string;
  };
  capabilities: {
    eyebrow: string; title: string; description: string; cta: string;
    items: readonly (Point & { service: (typeof serviceIds)[number] })[];
  };
  principles: { eyebrow: string; title: string; description: string; items: readonly Step[] };
  discovery: {
    eyebrow: string; title: string; description: string; items: readonly Point[];
    agreementTitle: string; agreement: string; note: string;
  };
  delivery: { eyebrow: string; title: string; description: string; steps: readonly Step[]; note: string };
  collaboration: { eyebrow: string; title: string; description: string; items: readonly Point[] };
  next: {
    eyebrow: string; title: string; description: string;
    services: string; work: string; contact: string; note: string;
  };
};

const en: AboutContent = {
  title: "A collective team for considered software",
  description: "Echo Devs is a collective software team. We design and build websites, custom systems and focused AI tools, and we explain the tradeoffs before work begins. This page describes how we think and cooperate; individual profiles and client references appear only when they are verified and approved.",
  eyebrow: "About Echo Devs",
  badges: ["Collective development team", "Product & software engineering"],
  actions: { primary: "Start a project", secondary: "Explore services" },
  team: {
    eyebrow: "Who we are",
    title: "A collective team, not a list of unverified credentials",
    description: "Echo Devs works as a development collective: a small group organized around the problem at hand. Instead of presenting unverified biographies, this page explains the capabilities we bring together, the principles we work by and how a project is shaped.",
    pointsTitle: "What the team works across",
    points: [
      { title: "Product thinking", description: "Clarify the user need, the job to be done and what success should look like before choosing a solution." },
      { title: "Interface design", description: "Structure content and interaction so the product is understandable on small screens and in right-to-left languages." },
      { title: "Application engineering", description: "Build web experiences, backends and integrations with reviewable code and explicit data boundaries." },
      { title: "Practical AI", description: "Test a narrowly defined automation or assistant against representative cases, with human review and stated limits." },
    ],
    profilesTitle: "Public profiles",
    profilesNote: "Individual names, biographies, photographs and public profiles are not published yet. They will appear only with each person's approval; until then, this page makes no claim about individual credentials.",
    factsTitle: "Company facts",
    factsNote: "A founding date, office address, registration number and delivery statistics are not shown because they have not been verified for publication.",
  },
  capabilities: {
    eyebrow: "Capabilities",
    title: "Product development from interface to operation",
    description: "Capabilities are combined per project. The services page explains possible deliverables, exclusions and agreement points for each pillar.",
    cta: "Read the service scope",
    items: [
      { title: "Product & interface design", description: "Information architecture, responsive layouts, interaction states and accessible components for real content and both text directions.", service: "websites" },
      { title: "Web application engineering", description: "Server-rendered interfaces, authenticated workflows and validated data flows for defined user roles.", service: "software" },
      { title: "APIs, data & integrations", description: "Documented interfaces, data and access rules, and connections to approved external systems with failure handling.", service: "software" },
      { title: "AI & automation", description: "Bounded assistants and workflow automation evaluated against representative cases, with review points and a human fallback.", service: "ai" },
    ],
  },
  principles: {
    eyebrow: "Working principles",
    title: "Engineering and design decisions you can review",
    description: "These principles describe how we approach the work. They are commitments to a process, not promises of a business result.",
    items: [
      { code: "PROBLEM", title: "Start from the problem", description: "Understand users and constraints before selecting technology. A smaller, well-defined solution is preferred to unneeded complexity." },
      { code: "TRADEOFFS", title: "Make tradeoffs visible", description: "Record assumptions, alternatives and open questions so the client can see why a decision was made." },
      { code: "MAINTAIN", title: "Build for maintainability", description: "Favour readable code, explicit data boundaries, tests for core behavior and documented setup over clever shortcuts." },
      { code: "INCLUSIVE", title: "Design beyond the default", description: "Plan mobile, keyboard, zoom and right-to-left reading from the start, not as final polish." },
    ],
  },
  discovery: {
    eyebrow: "Understanding the requirement",
    title: "A useful proposal starts with better questions",
    description: "The first conversations are about the business, the people who will use the product and the limits you already know. We do not quote a solution before the problem is clear.",
    items: [
      { title: "The problem and its priority", description: "What is difficult today, who is affected and what happens if nothing changes?" },
      { title: "Users and their tasks", description: "Who needs the product, what do they need to complete and which edge cases matter?" },
      { title: "Data and integrations", description: "Which systems, permissions, imports or external APIs are involved, and what is not accessible?" },
      { title: "Constraints", description: "Existing content, brand assets, devices, hosting, regulatory limits and the budget range you want to work within." },
      { title: "Success and acceptance", description: "Which observable outcomes show the work is done, and who reviews each milestone?" },
    ],
    agreementTitle: "What you receive before committing",
    agreement: "Before development starts, you receive a written scope with assumptions, acceptance criteria, milestones, exclusions and what is needed from your side.",
    note: "If an answer is not available yet, it becomes an explicit open question in the proposal rather than a silent assumption.",
  },
  delivery: {
    eyebrow: "From discovery to delivery",
    title: "Four collaboration stages",
    description: "This is an engagement path centered on client review. It is not a promise of a fixed schedule; timing follows the agreed scope.",
    steps: [
      { code: "TALK", title: "First conversation", description: "We listen to the context, the users and the constraints, then decide whether the work fits the team and your budget." },
      { code: "SCOPE", title: "Written scope & estimate", description: "We document the proposed solution, assumptions, acceptance criteria, milestones and exclusions. Nothing begins until you approve it." },
      { code: "REVIEW", title: "Reviewable increments", description: "Design and engineering progress in small, visible steps. You review decisions and use the agreed change process when scope needs to move." },
      { code: "HANDOFF", title: "Handoff & next steps", description: "We prepare deployment notes and documentation, agree how source access and ownership are delivered, and discuss support separately." },
    ],
    note: "Testing, accessibility and security reviews accompany the increments rather than waiting until the end.",
  },
  collaboration: {
    eyebrow: "Working together",
    title: "Clear roles, visible decisions, honest limits",
    description: "We work with clients as a small, direct team. The exact communication channel and cadence are agreed at kickoff; no response time is promised on this page.",
    items: [
      { title: "One shared decision record", description: "Requirements, assumptions and changes live in shared written notes so both sides refer to the same version." },
      { title: "Defined review points", description: "Each milestone has a named review and acceptance step; feedback and pending decisions are tracked together." },
      { title: "Clear ownership at handoff", description: "Source access, documentation, deployment notes and the agreed support arrangement are part of delivery, not an afterthought." },
    ],
  },
  next: {
    eyebrow: "Choose the next step",
    title: "See the work, check the scope, or start a conversation",
    description: "Use the implemented paths below. Project details are shaped in the inquiry, not in a generic quote.",
    services: "Review services",
    work: "Explore concept work",
    contact: "Open the project inquiry",
    note: "Public email addresses and social profiles are not published until the owner verifies them. The project inquiry is the implemented contact path and is available on both the homepage and the Contact page.",
  },
};

const fa: AboutContent = {
  title: "تیمی جمعی برای ساخت نرم‌افزار سنجیده",
  description: "اکو دوز یک تیم توسعه جمعی است. وب‌سایت، سامانه سفارشی و ابزار هوش مصنوعی محدود می‌سازیم و پیش از آغاز کار، گزینه‌ها و محدودیت‌ها را روشن می‌کنیم. این صفحه نحوه تفکر و همکاری ما را توضیح می‌دهد؛ مشخصات فردی و سابقه مشتریان تنها پس از تأیید منتشر می‌شود.",
  eyebrow: "درباره اکو دوز",
  badges: ["تیم توسعه جمعی", "مهندسی محصول و نرم‌افزار"],
  actions: { primary: "شروع پروژه", secondary: "بررسی خدمات" },
  team: {
    eyebrow: "ما چه کسانی هستیم",
    title: "یک تیم جمعی، نه فهرستی از اعتبارهای تأییدنشده",
    description: "اکو دوز به‌صورت یک جمع توسعه‌دهنده کار می‌کند؛ گروهی کوچک که حول مسئله پیش رو سازمان می‌یابد. به‌جای ارائه زندگینامه‌های تأییدنشده، این صفحه توانمندی‌هایی را که کنار هم می‌آوریم، اصول کاری و مسیر شکل‌گیری پروژه توضیح می‌دهد.",
    pointsTitle: "حوزه‌های کاری تیم",
    points: [
      { title: "تفکر محصولی", description: "پیش از انتخاب راهکار، نیاز کاربر، کاری که باید انجام شود و معنای موفقیت را روشن می‌کنیم." },
      { title: "طراحی رابط", description: "ساختار محتوا و تعامل را طوری می‌چینیم که محصول روی صفحه کوچک و در زبان‌های راست‌به‌چپ قابل فهم باشد." },
      { title: "مهندسی اپلیکیشن", description: "تجربه وب، بک‌اند و اتصال سامانه‌ها را با کد قابل بازبینی و مرزهای روشن داده می‌سازیم." },
      { title: "هوش مصنوعی کاربردی", description: "یک اتوماسیون یا دستیار محدود را با موارد نمونه، بازبینی انسانی و محدودیت‌های مشخص می‌سنجیم." },
    ],
    profilesTitle: "مشخصات عمومی",
    profilesNote: "نام، زندگینامه، تصویر و صفحه عمومی اعضای تیم هنوز منتشر نشده است. این اطلاعات فقط با تأیید هر فرد اضافه می‌شود؛ تا آن زمان این صفحه ادعایی درباره اعتبار فردی مطرح نمی‌کند.",
    factsTitle: "اطلاعات رسمی",
    factsNote: "تاریخ تأسیس، نشانی دفتر، شماره ثبت و آمار تحویل پروژه نمایش داده نمی‌شود، زیرا برای انتشار تأیید نشده‌اند.",
  },
  capabilities: {
    eyebrow: "توانمندی‌ها",
    title: "توسعه محصول از رابط تا بهره‌برداری",
    description: "توانمندی‌ها برای هر پروژه ترکیب می‌شوند. صفحه خدمات، خروجی‌های ممکن، موارد خارج از دامنه و نقاط توافق هر حوزه را توضیح می‌دهد.",
    cta: "مطالعه دامنه خدمت",
    items: [
      { title: "طراحی محصول و رابط", description: "معماری اطلاعات، چیدمان واکنش‌گرا، وضعیت‌های تعاملی و اجزای دسترس‌پذیر برای محتوای واقعی و هر دو جهت نوشتار.", service: "websites" },
      { title: "مهندسی اپلیکیشن وب", description: "رابط رندرشده در سرور، جریان‌های دارای احراز هویت و داده‌های اعتبارسنجی‌شده برای نقش‌های مشخص کاربر.", service: "software" },
      { title: "API، داده و یکپارچه‌سازی", description: "رابط‌های مستند، قواعد داده و دسترسی، و اتصال به سامانه‌های تأییدشده با مدیریت خطا.", service: "software" },
      { title: "هوش مصنوعی و اتوماسیون", description: "دستیار و اتوماسیون محدود که با موارد نمونه ارزیابی می‌شود و نقاط بازبینی و مسیر جایگزین انسانی دارد.", service: "ai" },
    ],
  },
  principles: {
    eyebrow: "اصول کاری",
    title: "تصمیم‌های مهندسی و طراحی قابل بازبینی",
    description: "این اصول شیوه برخورد ما با کار را توصیف می‌کنند؛ تعهد به یک فرآیند، نه وعده نتیجه تجاری.",
    items: [
      { code: "PROBLEM", title: "شروع از مسئله", description: "پیش از انتخاب فناوری، کاربران و محدودیت‌ها را می‌فهمیم. راهکار کوچک و روشن به پیچیدگی غیرضروری ترجیح دارد." },
      { code: "TRADEOFFS", title: "شفاف‌کردن گزینه‌ها", description: "فرضیات، گزینه‌های جایگزین و پرسش‌های باز ثبت می‌شوند تا مشتری دلیل تصمیم را ببیند." },
      { code: "MAINTAIN", title: "ساخت برای نگهداری", description: "کد خوانا، مرزهای روشن داده، آزمون رفتارهای اصلی و راه‌اندازی مستند بر میان‌برهای هوشمندانه ترجیح دارد." },
      { code: "INCLUSIVE", title: "طراحی فراتر از حالت پیش‌فرض", description: "موبایل، صفحه‌کلید، بزرگ‌نمایی و خواندن راست‌به‌چپ از ابتدا در طراحی دیده می‌شوند، نه در پایان کار." },
    ],
  },
  discovery: {
    eyebrow: "شناخت نیازمندی",
    title: "پیشنهاد مفید از پرسش‌های بهتر شروع می‌شود",
    description: "گفتگوهای اول درباره کسب‌وکار، افرادی که از محصول استفاده می‌کنند و محدودیت‌های موجود است. پیش از روشن‌شدن مسئله، راهکار قیمت‌گذاری نمی‌کنیم.",
    items: [
      { title: "مسئله و اولویت آن", description: "امروز چه چیزی دشوار است، چه کسی متأثر می‌شود و اگر تغییری نکنیم چه اتفاقی می‌افتد؟" },
      { title: "کاربران و وظایف آن‌ها", description: "چه کسانی به محصول نیاز دارند، چه کاری باید انجام دهند و کدام حالت‌های خاص اهمیت دارند؟" },
      { title: "داده و یکپارچه‌سازی", description: "کدام سامانه‌ها، مجوزها، ورود داده یا API بیرونی دخیل‌اند و به چه چیزی دسترسی نداریم؟" },
      { title: "محدودیت‌ها", description: "محتوای موجود، دارایی برند، دستگاه‌ها، میزبانی، الزامات قانونی و بازه بودجه‌ای که در نظر دارید." },
      { title: "موفقیت و پذیرش", description: "کدام نتیجه قابل مشاهده نشان می‌دهد کار تمام شده و هر مرحله را چه کسی بازبینی می‌کند؟" },
    ],
    agreementTitle: "پیش از تعهد چه دریافت می‌کنید",
    agreement: "پیش از شروع توسعه، دامنه مکتوب همراه با فرضیات، معیارهای پذیرش، مراحل، موارد خارج از دامنه و آنچه از سمت شما لازم است دریافت می‌کنید.",
    note: "اگر پاسخی هنوز آماده نیست، به‌جای فرض پنهان، به‌صورت پرسش باز در پیشنهاد ثبت می‌شود.",
  },
  delivery: {
    eyebrow: "از شناخت تا تحویل",
    title: "چهار مرحله همکاری",
    description: "این مسیر بر بازبینی مشتری تمرکز دارد و وعده زمان‌بندی ثابت نیست؛ زمان‌بندی تابع دامنه تأییدشده است.",
    steps: [
      { code: "TALK", title: "گفتگوی اول", description: "به زمینه، کاربران و محدودیت‌ها گوش می‌دهیم و بررسی می‌کنیم آیا کار به تیم و بودجه شما می‌خورد." },
      { code: "SCOPE", title: "دامنه و برآورد مکتوب", description: "راهکار پیشنهادی، فرضیات، معیارهای پذیرش، مراحل و موارد خارج از دامنه مستند می‌شود. تا تأیید شما کاری آغاز نمی‌شود." },
      { code: "REVIEW", title: "گام‌های قابل بازبینی", description: "طراحی و مهندسی در گام‌های کوچک و قابل مشاهده پیش می‌رود. تصمیم‌ها را بازبینی می‌کنید و تغییر دامنه از فرآیند توافق‌شده عبور می‌کند." },
      { code: "HANDOFF", title: "تحویل و گام بعد", description: "راهنمای استقرار و مستندات آماده می‌شود، نحوه تحویل کد و مالکیت توافق می‌گردد و پشتیبانی جداگانه بررسی می‌شود." },
    ],
    note: "آزمون، دسترس‌پذیری و بررسی امنیت همراه گام‌ها انجام می‌شود، نه فقط در پایان.",
  },
  collaboration: {
    eyebrow: "همکاری با مشتری",
    title: "نقش‌های روشن، تصمیم‌های قابل مشاهده، محدودیت‌های صادقانه",
    description: "به‌عنوان تیمی کوچک و مستقیم با مشتری کار می‌کنیم. کانال ارتباطی و فاصله زمانی دقیق در آغاز توافق می‌شود؛ در این صفحه زمان پاسخ مشخصی وعده داده نمی‌شود.",
    items: [
      { title: "یک سند تصمیم مشترک", description: "نیازمندی‌ها، فرضیات و تغییرات در یادداشت‌های مکتوب مشترک ثبت می‌شوند تا دو طرف به یک نسخه مراجعه کنند." },
      { title: "نقاط بازبینی مشخص", description: "هر مرحله بازبینی و پذیرش مشخص دارد؛ بازخورد و تصمیم‌های معطل با هم پیگیری می‌شوند." },
      { title: "تحویل با مالکیت روشن", description: "دسترسی به کد، مستندات، راهنمای استقرار و ترتیب پشتیبانی بخشی از تحویل‌اند، نه موضوعی حاشیه‌ای." },
    ],
  },
  next: {
    eyebrow: "گام بعدی",
    title: "کار را ببینید، دامنه را بررسی کنید یا گفتگو را آغاز کنید",
    description: "از مسیرهای پیاده‌شده زیر استفاده کنید. جزئیات پروژه در فرم درخواست شکل می‌گیرد، نه در یک برآورد عمومی.",
    services: "بررسی خدمات",
    work: "مشاهده طرح‌های مفهومی",
    contact: "بازکردن فرم درخواست پروژه",
    note: "نشانی ایمیل و شبکه‌های اجتماعی عمومی تا تأیید مالک منتشر نمی‌شوند. فرم درخواست پروژه مسیر ارتباطی پیاده‌شده است و در صفحه اصلی و صفحه تماس در دسترس است.",
  },
};

const ar: AboutContent = {
  title: "فريق جماعي لبناء برمجيات مدروسة",
  description: "إيكو ديفز فريق تطوير جماعي. نصمم ونبني المواقع والأنظمة المخصصة وأدوات الذكاء الاصطناعي المحددة، ونوضح الخيارات والقيود قبل بدء العمل. تشرح هذه الصفحة طريقة تفكيرنا وتعاوننا؛ ولا تُنشر الملفات الشخصية ومراجع العملاء إلا بعد التحقق والموافقة.",
  eyebrow: "عن إيكو ديفز",
  badges: ["فريق تطوير جماعي", "هندسة منتجات وبرمجيات"],
  actions: { primary: "ابدأ مشروعًا", secondary: "استكشف الخدمات" },
  team: {
    eyebrow: "من نحن",
    title: "فريق جماعي، لا سجلًا لخبرات غير موثقة",
    description: "يعمل إيكو ديفز كتجمّع تطويري؛ مجموعة صغيرة تتنظم حول المشكلة المطروحة. بدلًا من تقديم سير ذاتية غير موثقة، توضح هذه الصفحة القدرات التي نجمعها ومبادئ عملنا ومسار تشكيل المشروع.",
    pointsTitle: "مجالات عمل الفريق",
    points: [
      { title: "التفكير بالمنتج", description: "نوضح حاجة المستخدم والمهمة المطلوبة ومعنى النجاح قبل اختيار الحل." },
      { title: "تصميم الواجهات", description: "ننظم المحتوى والتفاعل ليكون المنتج مفهومًا على الشاشات الصغيرة وفي اللغات ذات الاتجاه من اليمين إلى اليسار." },
      { title: "هندسة التطبيقات", description: "نبني تجارب الويب والخوادم وتكامل الأنظمة بشيفرة قابلة للمراجعة وحدود بيانات واضحة." },
      { title: "الذكاء الاصطناعي العملي", description: "نقيّم أتمتة أو مساعدًا محدودًا بحالات تمثيلية ومراجعة بشرية وحدود معلنة." },
    ],
    profilesTitle: "الملفات العامة",
    profilesNote: "لم تُنشر بعد أسماء أعضاء الفريق أو سيرهم أو صورهم أو ملفاتهم العامة. تُضاف هذه المعلومات بموافقة كل شخص فقط؛ وحتى ذلك الحين لا تدّعي هذه الصفحة أي اعتماد فردي.",
    factsTitle: "المعلومات الرسمية",
    factsNote: "لا يُعرض تاريخ التأسيس أو عنوان المكتب أو رقم التسجيل أو إحصاءات التسليم لأنها لم تُتحقق للنشر.",
  },
  capabilities: {
    eyebrow: "القدرات",
    title: "تطوير المنتج من الواجهة إلى التشغيل",
    description: "تُجمع القدرات بحسب كل مشروع. صفحة الخدمات توضح المخرجات المحتملة والحدود ونقاط الاتفاق لكل محور.",
    cta: "اقرأ نطاق الخدمة",
    items: [
      { title: "تصميم المنتج والواجهة", description: "معمارية المعلومات والتخطيط المتجاوب وحالات التفاعل ومكونات ميسرة للمحتوى الحقيقي وكلا اتجاهي الكتابة.", service: "websites" },
      { title: "هندسة تطبيقات الويب", description: "واجهات تُعرض من الخادم وتدفقات تتطلب مصادقة وبيانات مُتحقق منها لأدوار مستخدمين محددة.", service: "software" },
      { title: "واجهات API والبيانات والتكامل", description: "واجهات موثقة وقواعد بيانات ووصول، وربط بأنظمة معتمدة مع معالجة الإخفاق.", service: "software" },
      { title: "الذكاء الاصطناعي والأتمتة", description: "مساعد وأتمتة محدودان يُقيّمان بحالات تمثيلية مع نقاط مراجعة وبديل بشري.", service: "ai" },
    ],
  },
  principles: {
    eyebrow: "مبادئ العمل",
    title: "قرارات هندسية وتصميمية قابلة للمراجعة",
    description: "تصف هذه المبادئ طريقة تعاملنا مع العمل؛ وهي التزام بعملية وليست وعدًا بنتيجة تجارية.",
    items: [
      { code: "PROBLEM", title: "البدء من المشكلة", description: "نفهم المستخدمين والقيود قبل اختيار التقنية. الحل الأصغر والأوضح أفضل من التعقيد غير الضروري." },
      { code: "TRADEOFFS", title: "إظهار الخيارات", description: "نسجل الافتراضات والبدائل والأسئلة المفتوحة ليرى العميل سبب القرار." },
      { code: "MAINTAIN", title: "البناء للصيانة", description: "نفضّل شيفرة واضحة وحدود بيانات صريحة واختبارات للسلوك الأساسي وتعليمات إعداد موثقة على الحلول المختصرة." },
      { code: "INCLUSIVE", title: "التصميم لما هو أبعد من الافتراضي", description: "نخطط للجوال ولوحة المفاتيح والتكبير والقراءة من اليمين إلى اليسار من البداية، لا في النهاية." },
    ],
  },
  discovery: {
    eyebrow: "فهم المتطلبات",
    title: "الاقتراح المفيد يبدأ بأسئلة أفضل",
    description: "تدور المحادثات الأولى حول الأعمال والأشخاص الذين سيستخدمون المنتج والقيود المعروفة. لا نسعّر حلًا قبل وضوح المشكلة.",
    items: [
      { title: "المشكلة وأولويتها", description: "ما الصعب اليوم، ومن يتأثر، وماذا يحدث إن لم يتغير شيء؟" },
      { title: "المستخدمون ومهامهم", description: "من يحتاج المنتج، وما الذي يجب إنجازه، وأي الحالات الاستثنائية مهمة؟" },
      { title: "البيانات والتكامل", description: "أي الأنظمة والصلاحيات والاستيراد أو واجهات خارجية معنية، وما الذي لا يمكن الوصول إليه؟" },
      { title: "القيود", description: "المحتوى والهوية الحالية والأجهزة والاستضافة والقيود التنظيمية ونطاق الميزانية الذي تعملون ضمنه." },
      { title: "النجاح والقبول", description: "أي نتائج يمكن ملاحظتها تدل على إنجاز العمل، ومن يراجع كل مرحلة؟" },
    ],
    agreementTitle: "ما تحصلون عليه قبل الالتزام",
    agreement: "قبل بدء التطوير، تحصلون على نطاق مكتوب يتضمن الافتراضات ومعايير القبول والمراحل والحدود وما يلزم من جهتكم.",
    note: "إذا لم يكن الجواب جاهزًا بعد، يُسجل سؤالًا مفتوحًا صريحًا في الاقتراح بدل افتراض صامت.",
  },
  delivery: {
    eyebrow: "من الاستكشاف إلى التسليم",
    title: "أربع مراحل للتعاون",
    description: "مسار تعاون يركز على مراجعة العميل، وليس وعدًا بجدول ثابت؛ المواعيد تتبع النطاق المتفق عليه.",
    steps: [
      { code: "TALK", title: "المحادثة الأولى", description: "نستمع إلى السياق والمستخدمين والقيود، ثم نقرر إن كان العمل يناسب الفريق وميزانيتكم." },
      { code: "SCOPE", title: "نطاق وتقدير مكتوبان", description: "نوثق الحل المقترح والافتراضات ومعايير القبول والمراحل والحدود. لا يبدأ العمل قبل موافقتكم." },
      { code: "REVIEW", title: "خطوات قابلة للمراجعة", description: "يتقدم التصميم والهندسة في خطوات صغيرة ومرئية. تراجعون القرارات، وتمر تغييرات النطاق عبر العملية المتفق عليها." },
      { code: "HANDOFF", title: "التسليم والخطوة التالية", description: "نجهز تعليمات النشر والتوثيق، ونتفق على تسليم الوصول إلى الشيفرة والملكية، ونناقش الدعم بشكل منفصل." },
    ],
    note: "تواكب الاختبارات وإمكانية الوصول ومراجعة الأمان الخطوات، ولا تنتظر النهاية.",
  },
  collaboration: {
    eyebrow: "العمل مع العميل",
    title: "أدوار واضحة وقرارات مرئية وحدود صادقة",
    description: "نعمل مع العملاء كفريق صغير ومباشر. تُتفق قناة التواصل ووتيرته عند البداية؛ ولا نعد بزمن استجابة محدد في هذه الصفحة.",
    items: [
      { title: "سجل قرار مشترك", description: "تُسجل المتطلبات والافتراضات والتغييرات في ملاحظات مكتوبة مشتركة ليرجع الطرفان إلى النسخة نفسها." },
      { title: "نقاط مراجعة محددة", description: "لكل مرحلة مراجعة وقبول محددان؛ ويُتابع كل من الملاحظات والقرارات المعلقة معًا." },
      { title: "تسليم بملكية واضحة", description: "الوصول إلى الشيفرة والتوثيق وتعليمات النشر وترتيب الدعم جزء من التسليم، لا موضوع هامشي." },
    ],
  },
  next: {
    eyebrow: "الخطوة التالية",
    title: "شاهدوا العمل أو راجعوا النطاق أو ابدأوا محادثة",
    description: "استخدموا المسارات المنفذة أدناه. تتشكل تفاصيل المشروع في نموذج الاستفسار، لا في تقدير عام.",
    services: "راجع الخدمات",
    work: "استكشف الأعمال التصورية",
    contact: "افتح نموذج طلب المشروع",
    note: "لا تُنشر عناوين البريد أو الملفات الاجتماعية العامة حتى يتحقق المالك منها. نموذج طلب المشروع هو مسار التواصل المنفذ، وهو متاح في الصفحة الرئيسية وصفحة التواصل.",
  },
};

export const aboutContent: Record<Locale, AboutContent> = { fa, en, ar };
