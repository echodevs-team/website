import type { Locale } from "../i18n/config";

export type PrivacyIcon = "person" | "web" | "code" | "cloud" | "clock" | "chip" | "trend";
export type PrivacyCard = { title: string; body: string; icon: PrivacyIcon };
export type PrivacySection = { eyebrow: string; title: string; description: string; cards: readonly PrivacyCard[] };

export type PrivacyContent = {
  eyebrow: string;
  title: string;
  description: string;
  badges: readonly string[];
  notice: { title: string; body: string };
  data: PrivacySection;
  storage: PrivacySection;
  temporary: PrivacySection;
  retention: PrivacySection;
  thirdParties: PrivacySection;
  updates: {
    eyebrow: string; title: string; description: string; body: string;
    links: readonly { key: "contact" | "about"; label: string }[];
  };
};

const en: PrivacyContent = {
  eyebrow: "Privacy",
  title: "Inquiry information and how it is handled",
  description: "This page explains what the project inquiry collects, where it is stored and which policy questions are still unresolved. The text describes implemented technical behavior; it is not a finalized legal privacy policy.",
  badges: ["Technical disclosure", "Legal review pending"],
  notice: {
    title: "Working technical disclosure",
    body: "This page reflects what the code actually does. A legal entity or controller identity, jurisdiction, privacy contact, retention period and legal basis have not been approved. Real-user intake remains blocked pending owner and legal review.",
  },
  data: {
    eyebrow: "What we collect",
    title: "Inquiry information and why it is requested",
    description: "The project inquiry is the only personal-information form on this site. It asks for what is needed to understand and answer a project request, not for an account or a marketing profile.",
    cards: [
      { icon: "person", title: "Your details", body: "The form asks for a full name and a project description of 20–5000 characters. Both are required. Do not include passwords, identity documents or other sensitive personal information." },
      { icon: "web", title: "A reply channel", body: "Email and international phone are separate optional fields, but at least one is required. The server normalizes phone spacing and local digits before validation; no verification or messaging service is connected." },
      { icon: "code", title: "Project context", body: "The form asks for a service category and an optional preferred timeline. The API also accepts an optional budget category, but the current public form does not display it." },
      { icon: "cloud", title: "Request metadata", body: "The app records the selected locale and source page, limited to the localized homepage or contact page. It adds no account, file upload, payment data or arbitrary tracking URL." },
    ],
  },
  storage: {
    eyebrow: "Storage and access",
    title: "How inquiries are stored and protected",
    description: "An inquiry exists only after server-side validation and a confirmed PostgreSQL commit. The interface does not show success before that acknowledgment.",
    cards: [
      { icon: "code", title: "Server validation", body: "The endpoint accepts JSON only, caps the request at 32 KiB, checks the exact site origin, applies one shared schema and performs the database write in a transaction." },
      { icon: "chip", title: "Database record", body: "A stored inquiry contains the submitted fields, an opaque UUID reference, created and updated timestamps and a processing status. Submitted text is stored as text, never rendered as HTML or inserted into analytics." },
      { icon: "person", title: "Who may access it", body: "The application role can insert inquiries but cannot read, update or delete them. Private readback and erasure use separate owner-approved capability groups and command-line tools; there is no public read endpoint or web admin." },
      { icon: "cloud", title: "Protection limits", body: "Parameterized SQL and least-privilege roles are implemented. Production TLS, hosting, encryption at rest, provider logging, named operators and access revocation are not approved or verified, so no security certification is claimed." },
    ],
  },
  temporary: {
    eyebrow: "Temporary records",
    title: "Security and retry metadata",
    description: "The service keeps short-lived pseudonymous records to prevent duplicate writes and abuse. These are not customer profiles and are not used for advertising.",
    cards: [
      { icon: "clock", title: "Duplicate prevention", body: "A submission UUID, a keyed digest of the normalized payload and the inquiry reference are kept for 24 hours. A matching retry returns the same reference; after the replay window, deleting an inquiry also removes this metadata." },
      { icon: "cloud", title: "Network throttling", body: "The app stores a keyed network identity, a counter and an expiry for 10 minutes. IPv4 uses the full address and IPv6 uses the /64 prefix. Raw IPs are not stored in the inquiry record, though a hosting proxy may still see request metadata." },
      { icon: "code", title: "Cleanup and limits", body: "A shared global counter allows 30 attempts per 10 minutes. Expired temporary rows are removed opportunistically and by an explicit maintenance command; no production schedule is approved." },
      { icon: "person", title: "Browser-side data", body: "An in-progress draft stays in page memory and is lost on navigation or reload. The site stores the theme preference in localStorage under echo_theme and does not put inquiry drafts there or in the URL." },
    ],
  },
  retention: {
    eyebrow: "Retention and deletion",
    title: "Retention, requests and backups",
    description: "Business retention and the public request process are not final. The technical controls below do not create a legal retention period.",
    cards: [
      { icon: "clock", title: "Retention is not configured", body: "No business retention period is selected and no automatic inquiry-deletion job exists. The 10-minute and 24-hour technical expiries do not authorize keeping or purging business inquiries." },
      { icon: "person", title: "Correction and deletion", body: "A single-record erasure command exists with dry run, exact confirmation and replay-window safeguards. A verified privacy contact, request-verification method and approved process are not published; do not send identity documents through the project form." },
      { icon: "cloud", title: "Backups, exports and limits", body: "Local encrypted snapshots and private exports can outlive a live-row deletion. Backup retention, key custody, production RPO/RTO and deletion-manifest reconciliation are unresolved. Deleting the database row does not guarantee immediate removal from older copies, provider logs or PostgreSQL storage." },
    ],
  },
  thirdParties: {
    eyebrow: "Third parties",
    title: "Analytics, cookies and external services",
    description: "Only the following browser and third-party behavior is present in the implementation.",
    cards: [
      { icon: "trend", title: "No analytics or marketing tools", body: "There are no analytics scripts, advertising pixels, social embeds, marketing cookies or external notification providers. Fonts are self-hosted WOFF2 files." },
      { icon: "web", title: "Local preferences", body: "The app reads an echo_locale cookie if one already exists when choosing the initial language; the current code does not set that cookie. Theme choice is local storage only and is not sent to the server." },
      { icon: "cloud", title: "Infrastructure disclosure", body: "No production host, proxy or log-retention configuration is approved. If hosting, analytics, notifications or another processor is added, its legal basis, vendor, location and retention must be reviewed and disclosed here before use." },
    ],
  },
  updates: {
    eyebrow: "Status",
    title: "Status and updates",
    description: "This is a technical disclosure, not a final legal notice. It will change as operations are approved.",
    body: "Open owner and legal decisions: legal entity or controller identity, jurisdiction, legal bases, business retention, privacy contact and verification, named operators and access review, hosting/logging/processor locations, backup custody and deletion times. Until they are approved, the site claims no regulatory compliance and no guaranteed deletion time.",
    links: [
      { key: "contact", label: "Contact the team" },
      { key: "about", label: "How the team works" },
    ],
  },
};

const fa: PrivacyContent = {
  eyebrow: "حریم خصوصی",
  title: "اطلاعات درخواست و نحوه نگهداری آن",
  description: "این صفحه توضیح می‌دهد فرم درخواست پروژه چه اطلاعاتی جمع می‌کند، کجا ذخیره می‌شود و چه پرسش‌های سیاستی هنوز حل نشده‌اند. متن، رفتار فنی پیاده‌شده را توصیف می‌کند و سیاست حقوقی نهایی نیست.",
  badges: ["افشای فنی", "بازبینی حقوقی در انتظار"],
  notice: {
    title: "افشای فنی موقت",
    body: "این صفحه رفتار واقعی کد را نشان می‌دهد. هویت حقوقی یا کنترل‌کننده، حوزه قضایی، نشانی تماس حریم خصوصی، مدت نگهداری و مبنای قانونی تأیید نشده‌اند. دریافت اطلاعات کاربران واقعی تا بازبینی مالک و حقوقی متوقف است.",
  },
  data: {
    eyebrow: "چه اطلاعاتی جمع می‌شود",
    title: "اطلاعات درخواست و دلیل درخواست آن",
    description: "فرم درخواست پروژه تنها فرم اطلاعات شخصی این سایت است و فقط چیزی را می‌پرسد که برای فهم و پاسخ به درخواست لازم است، نه حساب کاربری یا پروفایل بازاریابی.",
    cards: [
      { icon: "person", title: "مشخصات شما", body: "فرم نام کامل و توضیح پروژه (۲۰ تا ۵۰۰۰ نویسه) را می‌خواهد؛ هر دو الزامی‌اند. رمز عبور، مدرک هویتی یا اطلاعات شخصی حساس وارد نکنید." },
      { icon: "web", title: "راه پاسخ", body: "ایمیل و شماره تلفن بین‌المللی دو فیلد جداگانه و اختیاری هستند، اما دست‌کم یکی الزامی است. سرور فاصله‌ها و ارقام محلی تلفن را پیش از اعتبارسنجی یکسان می‌کند؛ سرویس تأیید یا پیام‌رسانی متصل نیست." },
      { icon: "code", title: "زمینه پروژه", body: "فرم نوع خدمت و زمان‌بندی ترجیحی اختیاری را می‌پرسد. API یک دسته بودجه اختیاری هم می‌پذیرد، اما فرم عمومی فعلی آن را نمایش نمی‌دهد." },
      { icon: "cloud", title: "فراداده درخواست", body: "برنامه زبان انتخاب‌شده و صفحه مبدأ را ثبت می‌کند؛ فقط صفحه اصلی یا صفحه تماس همان زبان مجاز است. حساب کاربری، بارگذاری فایل، اطلاعات پرداخت یا نشانی ردیابی دلخواه اضافه نمی‌شود." },
    ],
  },
  storage: {
    eyebrow: "ذخیره‌سازی و دسترسی",
    title: "درخواست‌ها چگونه ذخیره و محافظت می‌شوند",
    description: "درخواست تنها پس از اعتبارسنجی سمت سرور و تأیید ثبت در PostgreSQL وجود دارد. رابط کاربری پیش از این تأیید موفقیت نشان نمی‌دهد.",
    cards: [
      { icon: "code", title: "اعتبارسنجی سرور", body: "نقطه پایانی فقط JSON می‌پذیرد، حجم درخواست را به ۳۲ کیلوبایت محدود می‌کند، مبدأ دقیق سایت را بررسی می‌کند، یک طرح اعتبارسنجی مشترک دارد و نوشتن در پایگاه داده را در یک تراکنش انجام می‌دهد." },
      { icon: "chip", title: "رکورد پایگاه داده", body: "درخواست ذخیره‌شده شامل فیلدهای ارسالی، شناسه مبهم UUID، زمان ایجاد و به‌روزرسانی و وضعیت پردازش است. متن ارسالی به‌صورت متن ذخیره می‌شود و هرگز به‌عنوان HTML یا در تحلیل‌ها درج نمی‌شود." },
      { icon: "person", title: "چه کسی دسترسی دارد", body: "نقش برنامه فقط می‌تواند درخواست درج کند و نمی‌تواند آن را بخواند، تغییر دهد یا حذف کند. خواندن خصوصی و حذف با گروه‌های مجوز جداگانه و تأیید مالک و ابزارهای خط فرمان انجام می‌شود؛ نقطه خواندن عمومی یا پنل مدیریت وب وجود ندارد." },
      { icon: "cloud", title: "محدودیت‌های حفاظت", body: "SQL پارامتری و نقش‌های کم‌دسترسی پیاده‌شده‌اند. TLS تولید، میزبانی، رمزنگاری در حالت سکون، گزارش‌های ارائه‌دهنده، اپراتورهای نام‌دار و لغو دسترسی تأیید یا بررسی نشده‌اند؛ بنابراین هیچ گواهی امنیتی ادعا نمی‌شود." },
    ],
  },
  temporary: {
    eyebrow: "داده موقت",
    title: "فراداده امنیت و تلاش دوباره",
    description: "سرویس سوابق کوتاه‌عمر و شبه‌ناشناس برای جلوگیری از نوشتن تکراری و سوءاستفاده نگه می‌دارد. این‌ها پروفایل مشتری نیستند و برای تبلیغات استفاده نمی‌شوند.",
    cards: [
      { icon: "clock", title: "جلوگیری از تکرار", body: "شناسه ارسال، خلاصه کلیددار محتوای یکسان‌شده و شناسه درخواست به مدت ۲۴ ساعت نگه داشته می‌شوند. تلاش دوباره منطبق همان شناسه را برمی‌گرداند و پس از پایان پنجره تلاش دوباره، حذف درخواست این فراداده را نیز حذف می‌کند." },
      { icon: "cloud", title: "محدودیت شبکه", body: "برنامه هویت شبکه کلیددار، شمارنده و انقضا را برای ۱۰ دقیقه ذخیره می‌کند. IPv4 با نشانی کامل و IPv6 با پیشوند /64 گروه‌بندی می‌شود. IP خام در رکورد درخواست ذخیره نمی‌شود، اما پروکسی میزبانی ممکن است فراداده درخواست را ببیند." },
      { icon: "code", title: "پاک‌سازی و سقف‌ها", body: "یک شمارنده جهانی مشترک ۳۰ تلاش در هر ۱۰ دقیقه را مجاز می‌کند. ردیف‌های موقت منقضی در فرصت مناسب و با فرمان نگهداری صریح حذف می‌شوند؛ زمان‌بندی تولید تأیید نشده است." },
      { icon: "person", title: "داده در مرورگر", body: "پیش‌نویس در حال تکمیل فقط در حافظه صفحه می‌ماند و با جابه‌جایی یا بازخوانی از بین می‌رود. سایت ترجیح پوسته را با کلید echo_theme در localStorage نگه می‌دارد و پیش‌نویس درخواست را آنجا یا در نشانی صفحه ذخیره نمی‌کند." },
    ],
  },
  retention: {
    eyebrow: "نگهداری و حذف",
    title: "مدت نگهداری، درخواست‌ها و نسخه‌های پشتیبان",
    description: "مدت نگهداری اطلاعات کاری و فرآیند عمومی درخواست نهایی نشده است. کنترل‌های فنی زیر مدت نگهداری قانونی ایجاد نمی‌کنند.",
    cards: [
      { icon: "clock", title: "مدت نگهداری تنظیم نشده", body: "هیچ مدت نگهداری کاری انتخاب نشده و هیچ کار حذف خودکار درخواست وجود ندارد. انقضای فنی ۱۰ دقیقه‌ای و ۲۴ ساعته مجوز نگه‌داشتن یا پاک‌کردن درخواست‌های کاری نیست." },
      { icon: "person", title: "اصلاح و حذف", body: "یک فرمان حذف تک‌رکورد با اجرای آزمایشی، تأیید دقیق و محافظت از پنجره تلاش دوباره وجود دارد. نشانی تماس حریم خصوصی تأییدشده، روش احراز درخواست و فرآیند مصوب منتشر نشده‌اند؛ مدارک هویتی را از طریق فرم پروژه نفرستید." },
      { icon: "cloud", title: "پشتیبان، خروجی و محدودیت‌ها", body: "نسخه‌های پشتیبان رمزنگاری‌شده محلی و خروجی‌های خصوصی می‌توانند پس از حذف رکورد زنده باقی بمانند. مدت نگهداری پشتیبان، نگهداری کلید، RPO/RTO تولید و تطبیق فهرست حذف حل نشده‌اند. حذف ردیف پایگاه داده، حذف فوری از نسخه‌های قدیمی، گزارش‌های ارائه‌دهنده یا فضای ذخیره‌سازی PostgreSQL را تضمین نمی‌کند." },
    ],
  },
  thirdParties: {
    eyebrow: "شخص ثالث",
    title: "تحلیل‌ها، کوکی‌ها و سرویس‌های بیرونی",
    description: "تنها رفتار مرورگری و شخص ثالثی که در پیاده‌سازی وجود دارد در ادامه آمده است.",
    cards: [
      { icon: "trend", title: "بدون ابزار تحلیل یا بازاریابی", body: "هیچ اسکریپت تحلیلی، پیکسل تبلیغاتی، محتوای جاسازی‌شده شبکه اجتماعی، کوکی بازاریابی یا ارائه‌دهنده اعلان بیرونی وجود ندارد. فونت‌ها فایل‌های WOFF2 میزبانی‌شده محلی هستند." },
      { icon: "web", title: "ترجیحات محلی", body: "برنامه در زمان انتخاب زبان اولیه، کوکی echo_locale را در صورت وجود می‌خواند؛ کد فعلی آن را نمی‌نویسد. انتخاب پوسته فقط در حافظه محلی است و به سرور ارسال نمی‌شود." },
      { icon: "cloud", title: "افشای زیرساخت", body: "هیچ میزبان، پروکسی یا تنظیم نگهداری گزارش تولید تأیید نشده است. اگر میزبانی، تحلیل، اعلان یا پردازشگر دیگری اضافه شود، مبنای قانونی، فروشنده، مکان و مدت نگهداری باید پیش از استفاده بررسی و در اینجا افشا شود." },
    ],
  },
  updates: {
    eyebrow: "وضعیت",
    title: "وضعیت و به‌روزرسانی‌ها",
    description: "این صفحه یک افشای فنی است، نه اخطار حقوقی نهایی. با تأیید عملیات تغییر می‌کند.",
    body: "تصمیم‌های باز مالک و حقوقی: هویت شخصیت حقوقی یا کنترل‌کننده، حوزه قضایی، مبانی قانونی، مدت نگهداری کاری، تماس حریم خصوصی و روش احراز، اپراتورهای نام‌دار و بازبینی دسترسی، مکان میزبانی، گزارش و پردازشگر، نگهداری پشتیبان و زمان‌های حذف. تا تأیید آن‌ها، سایت هیچ انطباق مقرراتی یا حذف تضمین‌شده‌ای ادعا نمی‌کند.",
    links: [
      { key: "contact", label: "تماس با تیم" },
      { key: "about", label: "نحوه کار تیم" },
    ],
  },
};

const ar: PrivacyContent = {
  eyebrow: "الخصوصية",
  title: "معلومات الطلب وكيفية التعامل معها",
  description: "توضح هذه الصفحة ما يجمعه نموذج طلب المشروع، وأين يُخزَّن، وما أسئلة السياسة التي لم تُحسم بعد. النص وصف تقني للسلوك المنفذ، وليس سياسة خصوصية قانونية نهائية.",
  badges: ["إفصاح تقني", "المراجعة القانونية معلقة"],
  notice: {
    title: "إفصاح تقني مؤقت",
    body: "تعكس هذه الصفحة سلوك الشيفرة الفعلي. لم تُعتمد الهوية القانونية أو الجهة المتحكمة ولا الاختصاص ولا بريد الخصوصية ولا مدة الاحتفاظ ولا الأساس القانوني. يبقى استقبال بيانات المستخدمين الحقيقيين متوقفًا حتى مراجعة المالك والقانون.",
  },
  data: {
    eyebrow: "ما نجمعه",
    title: "معلومات الطلب وسبب طلبها",
    description: "نموذج طلب المشروع هو نموذج المعلومات الشخصية الوحيد في الموقع، ولا يطلب إلا ما يلزم لفهم الطلب والرد عليه، لا حسابًا أو ملفًا تسويقيًا.",
    cards: [
      { icon: "person", title: "بياناتكم", body: "يطلب النموذج الاسم الكامل ووصف المشروع (٢٠ إلى ٥٠٠٠ حرف)، وكلاهما مطلوب. لا تكتبوا كلمات مرور أو وثائق هوية أو معلومات شخصية حساسة." },
      { icon: "web", title: "وسيلة الرد", body: "البريد الإلكتروني والهاتف الدولي حقلان اختياريان منفصلان، لكن أحدهما مطلوب على الأقل. يوحّد الخادم المسافات والأرقام المحلية قبل التحقق؛ ولا توجد خدمة تحقق أو مراسلة متصلة." },
      { icon: "code", title: "سياق المشروع", body: "يطلب النموذج نوع الخدمة والمدة الزمنية المفضلة الاختيارية. تقبل واجهة API أيضًا فئة ميزانية اختيارية، لكن النموذج العام الحالي لا يعرضها." },
      { icon: "cloud", title: "بيانات وصفية للطلب", body: "يسجل التطبيق اللغة المختارة وصفحة المصدر، ولا يقبل إلا الصفحة الرئيسية أو صفحة التواصل باللغة نفسها. لا يضيف حسابًا أو رفع ملف أو بيانات دفع أو رابط تتبع حرًا." },
    ],
  },
  storage: {
    eyebrow: "التخزين والوصول",
    title: "كيف تُخزَّن الطلبات وتُحمى",
    description: "لا يوجد الطلب إلا بعد تحقق الخادم وتأكيد الالتزام في PostgreSQL. ولا تعرض الواجهة نجاحًا قبل هذا التأكيد.",
    cards: [
      { icon: "code", title: "تحقق الخادم", body: "تقبل نقطة النهاية JSON فقط، وتحدّ الطلب بـ٣٢ كيلوبايت، وتتحقق من أصل الموقع الدقيق، وتستخدم مخطط تحقق مشتركًا، وتنفذ الكتابة في قاعدة البيانات ضمن معاملة واحدة." },
      { icon: "chip", title: "سجل قاعدة البيانات", body: "يتضمن الطلب المحفوظ الحقول المرسلة ومعرّف UUID مبهمًا وتواريخ الإنشاء والتحديث وحالة المعالجة. يُحفظ النص كنص، ولا يُعرض كـHTML ولا يُدرج في التحليلات." },
      { icon: "person", title: "من يملك الوصول", body: "يمكن لدور التطبيق إدراج الطلبات فقط، ولا يمكنه قراءتها أو تعديلها أو حذفها. تتم القراءة الخاصة والحذف بأدوات سطر أوامر ومجموعات صلاحيات منفصلة بموافقة المالك؛ ولا توجد نقطة قراءة عامة أو لوحة إدارة ويب." },
      { icon: "cloud", title: "حدود الحماية", body: "تم تنفيذ SQL معاملات وأدوار أقل صلاحية. لم تُعتمد أو تُتحقق TLS الإنتاج ولا الاستضافة ولا التشفير عند الراحة ولا سجلات المزود ولا المشغلون المسمّون ولا إلغاء الوصول؛ لذلك لا يُدّعى أي اعتماد أمني." },
    ],
  },
  temporary: {
    eyebrow: "بيانات مؤقتة",
    title: "بيانات الأمان وإعادة المحاولة",
    description: "يحتفظ الخدمة بسجلات قصيرة العمر وشبه مجهولة لمنع التكرار وإساءة الاستخدام. وهي ليست ملفات تعريف للعملاء ولا تُستخدم للإعلان.",
    cards: [
      { icon: "clock", title: "منع التكرار", body: "يُحفظ معرّف الإرسال وملخص مفتاحي للمحتوى الموحّد ومعرّف الطلب لمدة ٢٤ ساعة. تعيد المحاولة المطابقة المعرّف نفسه، وبعد انتهاء نافذة إعادة المحاولة يحذف حذف الطلب هذه البيانات الوصفية." },
      { icon: "cloud", title: "تقييد الشبكة", body: "يحفظ التطبيق هوية شبكة مفتاحية وعدادًا وانتهاءً لمدة ١٠ دقائق. يُستخدم عنوان IPv4 الكامل وبادئة /64 لـIPv6. لا يُحفظ IP الخام في سجل الطلب، لكن قد يرى وكيل الاستضافة بيانات وصفية للطلب." },
      { icon: "code", title: "التنظيف والحدود", body: "يسمح عداد عالمي مشترك بـ٣٠ محاولة كل ١٠ دقائق. تُحذف الصفوف المؤقتة المنتهية عند الفرصة وبأمر صيانة صريح؛ ولم تُعتمد جدولة إنتاج." },
      { icon: "person", title: "بيانات المتصفح", body: "تبقى المسودة قيد التحرير في ذاكرة الصفحة وتضيع عند التنقل أو إعادة التحميل. يحفظ الموقع تفضيل السمة بمفتاح echo_theme في localStorage، ولا يحفظ مسودة الطلب هناك أو في عنوان الصفحة." },
    ],
  },
  retention: {
    eyebrow: "الاحتفاظ والحذف",
    title: "مدة الاحتفاظ والطلبات والنسخ الاحتياطية",
    description: "لم تُحسم مدة الاحتفاظ ببيانات الأعمال ولا عملية الطلب العامة. الضوابط التقنية أدناه لا تنشئ مدة احتفاظ قانونية.",
    cards: [
      { icon: "clock", title: "الاحتفاظ غير مهيأ", body: "لم تُختر مدة احتفاظ ببيانات الأعمال ولا توجد مهمة حذف تلقائي للطلبات. انتهاء الصلاحية التقني بعد ١٠ دقائق و٢٤ ساعة لا يسمح بالاحتفاظ بطلبات الأعمال أو حذفها." },
      { icon: "person", title: "التصحيح والحذف", body: "يوجد أمر حذف لسجل واحد مع تشغيل تجريبي وتأكيد دقيق وحماية نافذة إعادة المحاولة. لم يُنشر بريد خصوصية موثّق ولا طريقة تحقق من الطلب ولا عملية معتمدة؛ لا ترسلوا وثائق هوية عبر نموذج المشروع." },
      { icon: "cloud", title: "النسخ الاحتياطية والتصدير والحدود", body: "قد تبقى لقطات محلية مشفرة وتصديرات خاصة بعد حذف السجل الحي. مدة الاحتفاظ بالنسخ الاحتياطية وحفظ المفتاح وRPO/RTO الإنتاج ومطابقة قائمة الحذف غير محسومة. حذف صف قاعدة البيانات لا يضمن الإزالة الفورية من النسخ الأقدم أو سجلات المزود أو تخزين PostgreSQL." },
    ],
  },
  thirdParties: {
    eyebrow: "الأطراف الثالثة",
    title: "التحليلات وملفات الارتباط والخدمات الخارجية",
    description: "لا يوجد في التنفيذ سوى السلوك المتعلق بالمتصفح والأطراف الثالثة الموضح أدناه.",
    cards: [
      { icon: "trend", title: "لا أدوات تحليل أو تسويق", body: "لا توجد نصوص تحليلية أو بكسلات إعلانية أو تضمينات شبكات اجتماعية أو ملفات ارتباط تسويقية أو مزود إشعارات خارجي. الخطوط ملفات WOFF2 مستضافة محليًا." },
      { icon: "web", title: "تفضيلات محلية", body: "يقرأ التطبيق ملف الارتباط echo_locale إن وُجد عند اختيار اللغة الأولية؛ والشيفرة الحالية لا تكتبه. يُحفظ اختيار السمة محليًا فقط ولا يُرسل إلى الخادم." },
      { icon: "cloud", title: "إفصاح البنية التحتية", body: "لم تُعتمد استضافة إنتاج أو وكيل أو إعداد الاحتفاظ بالسجلات. إذا أُضيفت استضافة أو تحليلات أو إشعارات أو معالج آخر، يجب مراجعة الأساس القانوني والمزود والموقع ومدة الاحتفاظ والإفصاح عنها هنا قبل الاستخدام." },
    ],
  },
  updates: {
    eyebrow: "الحالة",
    title: "الحالة والتحديثات",
    description: "هذه الصفحة إفصاح تقني وليست إشعارًا قانونيًا نهائيًا. ستتغير عند اعتماد العمليات.",
    body: "قرارات المالك والقانون المفتوحة: الهوية القانونية أو الجهة المتحكمة، الاختصاص، الأسس القانونية، مدة احتفاظ بيانات الأعمال، جهة اتصال الخصوصية وطريقة التحقق، المشغلون المسمّون ومراجعة الوصول، مواقع الاستضافة والسجلات والمعالجين، حفظ النسخ الاحتياطية وأوقات الحذف. وإلى أن تُعتمد، لا يدّعي الموقع أي امتثال تنظيمي أو حذف مضمون.",
    links: [
      { key: "contact", label: "تواصلوا مع الفريق" },
      { key: "about", label: "كيف يعمل الفريق" },
    ],
  },
};

export const privacyContent: Record<Locale, PrivacyContent> = { fa, en, ar };
