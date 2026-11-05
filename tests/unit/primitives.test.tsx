import { describe, expect, it } from "vitest";
import { renderToStaticMarkup as render } from "react-dom/server";
import { Button } from "../../src/components/ui/button";
import { Link } from "../../src/components/ui/link";
import { Field } from "../../src/components/ui/field";
import { SectionHeading } from "../../src/components/ui/section-heading";
import { Card } from "../../src/components/ui/card";
import { Container } from "../../src/components/layout/container";
import { Footer } from "../../src/components/layout/footer";

describe("native, server-renderable primitives", () => {
  it("defaults to a non-submitting button and retains explicit submit semantics", () => {
    expect(render(<Button>Continue</Button>)).toContain('type="button"');
    expect(render(<Button type="submit">Send</Button>)).toContain('type="submit"');
  });
  it("disables pending actions and exposes localized busy text", () => {
    const html = render(<Button loading loadingLabel="در حال ارسال" aria-label="ارسال">ارسال</Button>);
    expect(html).toContain('disabled=""');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('aria-label="در حال ارسال"');
    expect(html).toContain('>در حال ارسال</button>');
    expect(html).not.toContain('loadingLabel');
  });
  it("preserves ordinary disabled state independently of pending", () => {
    const html = render(<Button disabled variant="secondary">Send</Button>);
    expect(html).toContain('disabled=""');
    expect(html).not.toContain('aria-busy');
    expect(html).toContain('data-variant="secondary"');
  });
  it("renders real localized navigation with no simulated button role", () => {
    const html = render(<Link href="/ar" lang="ar" appearance="primary">العربية</Link>);
    expect(html).toContain('<a href="/ar" lang="ar"');
    expect(html).not.toContain('role=');
    expect(html).not.toContain('tabindex=');
    expect(html).toContain('ui-link-button');
  });
  it("protects new-tab links without losing caller relationships", () => {
    expect(render(<Link href="/en" target="_blank" rel="alternate">English</Link>))
      .toContain('rel="alternate noopener noreferrer"');
  });
  it("connects label, description, error and caller-provided help IDs", () => {
    const html = render(<Field id="email" label="البريد الإلكتروني" type="email" dir="ltr"
      required description="تفاصيل" error="تحقق من العنوان" aria-describedby="privacy" />);
    expect(html).toContain('for="email"');
    expect(html).toContain('id="email"');
    expect(html).toContain('aria-describedby="privacy email-description email-error"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('id="email-description"');
    expect(html).toContain('id="email-error"');
    expect(html).toContain('dir="ltr"');
    expect(html).toContain('required=""');
  });
  it("does not emit dangling error/help references for an ordinary field", () => {
    const html = render(<Field id="name" label="نام" autoComplete="name" disabled />);
    expect(html).not.toContain('aria-invalid');
    expect(html).not.toContain('aria-describedby');
    expect(html).toContain('disabled=""');
    expect(html).toContain('autoComplete="name"');
  });
  it("supports textarea attributes and escapes untrusted content", () => {
    const html = render(<Field multiline id="details" label="Details" rows={5}
      defaultValue="<script>alert(1)</script>" readOnly />);
    expect(html).toContain('<textarea');
    expect(html).toContain('rows="5"');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });
  it("retains document hierarchy, noninteractive card and footer landmark", () => {
    const html = render(<Container dir="rtl"><Card aria-labelledby="section">
      <SectionHeading id="section" level={3} description="توضیحات">عنوان</SectionHeading>
    </Card><Footer>Echo Devs</Footer></Container>);
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('<article aria-labelledby="section"');
    expect(html).toContain('<h3 id="section">عنوان</h3>');
    expect(html).toContain('<footer');
    expect(html).not.toContain('tabindex');
  });
});
