import type { ReactNode } from "react";

export function SectionHeading({ id, level = 2, children, description }: {
  id: string; level?: 1 | 2 | 3; children: ReactNode; description?: ReactNode;
}) {
  const Heading = `h${level}` as "h1" | "h2" | "h3";
  return <div className="ui-section-heading">
    <Heading id={id}>{children}</Heading>
    {description && <p>{description}</p>}
  </div>;
}
