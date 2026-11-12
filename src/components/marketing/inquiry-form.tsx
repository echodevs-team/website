"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import type { HomeContent } from "../../content/home";
import type { InquiryCopy } from "../../content/inquiry";
import type { Locale } from "../../i18n/config";
import { InquirySubmission, type SubmissionOutcome } from "../../lib/inquiries/client";
import { services, type ValidationFields } from "../../lib/validation/inquiry";
import { Field } from "../ui/field";
import { Button } from "../ui/button";

const subscribeReady = () => () => {};
export function InquiryForm({ content: t, locale, copy, sourcePage = `/${locale}` }: { content: Pick<HomeContent, "start" | "fields">; locale: Locale; copy: InquiryCopy; sourcePage?: string }) {
  const session = useRef(new InquirySubmission());
  const form = useRef<HTMLFormElement>(null);
  const summary = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const [pending, setPending] = useState(false);
  const [outcome, setOutcome] = useState<SubmissionOutcome>();
  const [fields, setFields] = useState<ValidationFields>({});
  const [wait, setWait] = useState(0);
  useEffect(() => { mounted.current = true; const current = session.current; return () => { mounted.current = false; current.cancel(); }; }, []);
  useEffect(() => {
    if (!wait) return;
    const timer = setTimeout(() => setWait(Math.max(0, Math.ceil((session.current.retryAt - Date.now()) / 1000))), 1000);
    return () => clearTimeout(timer);
  }, [wait]);
  useEffect(() => { if (Object.keys(fields).length || outcome?.kind === "failure") summary.current?.focus(); }, [fields, outcome]);
  useEffect(() => { if (outcome?.kind === "success") status.current?.focus(); }, [outcome]);
  const fieldMessage = (key: keyof ValidationFields, code: "invalid" | "required") =>
    code === "invalid" ? copy.invalid : key === "email" ? copy.contactRequired : copy.required;
  const error = (key: keyof ValidationFields) => { const code = fields[key]; return code ? fieldMessage(key, code) : undefined; };
  const locked = pending || outcome?.kind === "success" || outcome?.kind === "failure" && outcome.locked;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || session.current.busy || session.current.complete) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const promise = session.current.submit({ ...data, locale, sourcePage });
    setPending(session.current.busy);
    setOutcome(undefined);
    setFields({});
    const next = await promise;
    if (!mounted.current || next.kind === "ignored") return;
    setPending(false); setOutcome(next);
    if (next.kind === "invalid") setFields(next.fields);
    setWait(Math.max(0, Math.ceil((session.current.retryAt - Date.now()) / 1000)));
  }
  const labels: Record<string, string> = { fullName: t.fields.name, email: copy.email, phone: copy.phone, service: t.fields.service, timeline: t.fields.timeline, description: t.fields.description };
  return <form ref={form} className="inquiry-form" aria-label={t.start} aria-describedby="inquiry-help" aria-busy={pending} noValidate onSubmit={submit}>
    <p id="inquiry-help">{copy.contactHint}</p>
    <noscript><p>{copy.noScript}</p></noscript>
    {(Object.keys(fields).length > 0 || outcome?.kind === "failure") && <div ref={summary} className="inquiry-errors" role="alert" tabIndex={-1}>
      {Object.keys(fields).length > 0 ? <><p>{copy.summary}</p><ul>{Object.entries(fields).map(([key, code]) => {
        const field = key as keyof ValidationFields;
        const text = fieldMessage(field, code);
        return <li key={key}>{labels[key] ? <a href={`#inquiry-${key}`} onClick={(event) => { event.preventDefault(); form.current?.querySelector<HTMLElement>(`#inquiry-${key}`)?.focus(); }}>{labels[key]}: {text}</a> : text}</li>;
      })}</ul></>
        : outcome?.kind === "failure" && <p>{copy[outcome.reason]}</p>}
    </div>}
    <fieldset disabled={!ready || locked}><legend>{copy.intro}</legend>
      <div className="inquiry-fields">
        <Field id="inquiry-fullName" name="fullName" dir="auto" label={t.fields.name} autoComplete="name" maxLength={120} required requiredIndicator={copy.requiredField} error={error("fullName")} />
        <Field id="inquiry-email" name="email" type="email" dir="ltr" label={copy.email} aria-describedby="inquiry-help" autoComplete="email" maxLength={254} error={error("email")} />
        <Field id="inquiry-phone" name="phone" type="tel" dir="ltr" label={copy.phone} aria-describedby="inquiry-help" autoComplete="tel" maxLength={80} error={error("phone")} />
        <div className="ui-field"><label htmlFor="inquiry-service">{t.fields.service}</label><select id="inquiry-service" name="service" defaultValue="not_sure" className="ui-field-control" aria-invalid={!!fields.service} aria-describedby={fields.service ? "inquiry-service-error" : undefined}>{services.map((value, i) => <option key={value} value={value}>{copy.serviceLabels[i]}</option>)}</select>{fields.service && <p id="inquiry-service-error" className="ui-field-error">{error("service")}</p>}</div>
        <Field id="inquiry-timeline" name="timeline" label={t.fields.timeline} maxLength={120} error={error("timeline")} />
      </div>
      <Field id="inquiry-description" name="description" dir="auto" label={t.fields.description} description={copy.descriptionHint} multiline rows={3} minLength={20} maxLength={5000} required requiredIndicator={copy.requiredField} error={error("description")} />
      <div hidden aria-hidden="true"><label htmlFor="inquiry-website">Website</label><input id="inquiry-website" name="website" tabIndex={-1} autoComplete="off" /></div>
    </fieldset>
    <div ref={status} tabIndex={-1} className="inquiry-status" role="status" aria-live="polite" aria-atomic="true">
      {pending ? copy.pending : outcome?.kind === "success" ? <><p>{copy.success}</p><p>{copy.reference}: <bdi dir="ltr">{outcome.reference}</bdi></p></> : null}
    </div>
    {wait > 0 && <p className="inquiry-wait">{copy.wait} <bdi>{new Intl.NumberFormat(locale).format(wait)}</bdi></p>}
    {outcome?.kind !== "success" && <Button type="submit" disabled={!ready || pending || wait > 0 || outcome?.kind === "failure" && ["expired", "conflict"].includes(outcome.reason)}>{pending ? copy.pending : locked ? copy.retry : copy.submit}</Button>}
    {(outcome?.kind === "success" || outcome?.kind === "failure" && outcome.reason === "conflict") && <Button type="button" variant="secondary" onClick={() => {
      session.current.reset(); setOutcome(undefined); setFields({});
      if (outcome.kind === "success") form.current?.reset();
      setTimeout(() => form.current?.querySelector<HTMLElement>("#inquiry-fullName")?.focus(), 0);
    }}>{copy.newRequest}</Button>}
  </form>;
}
