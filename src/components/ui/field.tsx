import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Shared = { id: string; label: ReactNode; description?: ReactNode; error?: ReactNode; requiredIndicator?: ReactNode };
type Managed = "id" | "children" | "aria-invalid";
export type FieldProps = Shared & (
  | ({ multiline?: false } & Omit<ComponentPropsWithoutRef<"input">, Managed>)
  | ({ multiline: true } & Omit<ComponentPropsWithoutRef<"textarea">, Managed>)
);

/** Stable caller IDs work in server components and client forms alike.
 * Validation/announcements belong to the consuming form. */
export function Field({ id, label, description, error, requiredIndicator, multiline, className = "", ...props }: FieldProps) {
  const describedBy = [props["aria-describedby"], description ? `${id}-description` : null,
    error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  const controlProps = { ...props, id, className: `ui-field-control ${className}`,
    "aria-describedby": describedBy, "aria-invalid": error ? true as const : undefined };
  return <div className="ui-field">
    <label htmlFor={id}>{label}{props.required && <><span className="ui-field-required" aria-hidden="true">*</span>{requiredIndicator && <span className="ui-field-required-text">({requiredIndicator})</span>}</>}</label>
    {description && <p id={`${id}-description`} className="ui-field-description">{description}</p>}
    {multiline
      ? <textarea {...controlProps as ComponentPropsWithoutRef<"textarea">} />
      : <input {...controlProps as ComponentPropsWithoutRef<"input">} />}
    {error && <p id={`${id}-error`} className="ui-field-error">{error}</p>}
  </div>;
}
