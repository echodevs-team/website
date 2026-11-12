import { z } from "zod";

export const services = ["website", "custom_software", "ai_automation", "not_sure"] as const;
export const budgets = ["not_sure", "small", "medium", "large"] as const;
// Preserve Unicode names, join controls and paragraph text; reject embedded NUL/control data.
const singleLine = (min: number, max: number) => z.string().trim().min(min).max(max).regex(/^[^\u0000-\u001f\u007f]*$/u);
const optionalText = (schema: z.ZodType<string>) => z.preprocess((v) => typeof v === "string" && !v.trim() ? undefined : v, schema.optional());
export function normalizePhone(value: string) {
  return value.trim().replace(/[۰-۹٠-٩]/g, (c) => String(c.charCodeAt(0) - (c >= "۰" ? 0x6f0 : 0x660)))
    .replace(/[\s().-]/g, "").replace(/^00/, "+");
}
export const inquirySchema = z.strictObject({
  fullName: singleLine(2, 120),
  email: optionalText(z.string().trim().max(254).email()),
  phone: optionalText(z.string().max(80).transform(normalizePhone).pipe(z.string().regex(/^\+[1-9]\d{6,14}$/))),
  service: z.enum(services),
  budgetRange: z.enum(budgets).optional(),
  timeline: optionalText(singleLine(1, 120)),
  description: z.string().trim().min(20).max(5000).regex(/^[^\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]*$/u),
  locale: z.enum(["fa", "en", "ar"]),
  sourcePage: z.string().max(20),
  website: z.literal("").default(""),
}).superRefine((value, ctx) => {
  if (!value.email && !value.phone) ctx.addIssue({ code: "custom", path: ["email"], message: "contact_required" });
  if (!["/" + value.locale, "/" + value.locale + "/contact"].includes(value.sourcePage)) ctx.addIssue({ code: "custom", path: ["sourcePage"], message: "invalid_source" });
});
export type InquiryInput = z.output<typeof inquirySchema>;
export const submissionKeySchema = z.string().uuid().transform((value) => value.toLowerCase());
export type ValidationFields = Partial<Record<keyof InquiryInput | "request", "invalid" | "required">>;
export function validateInquiry(value: unknown): { data: InquiryInput; fields?: never } | { data?: never; fields: ValidationFields } {
  const result = inquirySchema.safeParse(value);
  if (result.success) return { data: result.data };
  const input = value !== null && typeof value === "object" ? value as Record<string, unknown> : {};
  // Blank required fields are a presence problem, not a length/format problem.
  const blank = (field: keyof InquiryInput) => {
    const entry = input[field];
    return entry === undefined || entry === null || typeof entry === "string" && entry.trim() === "";
  };
  const fields: ValidationFields = {};
  for (const issue of result.error.issues) {
    const field = (issue.path[0] ?? "request") as keyof ValidationFields;
    const required = issue.message === "contact_required"
      || (field === "fullName" || field === "description") && blank(field);
    // `required` wins if the same field also reports a format/length issue.
    if (fields[field] !== "required") fields[field] = required ? "required" : "invalid";
  }
  // Only stable codes/allowlisted paths; no user content or Zod internals in API errors.
  return { fields };
}
