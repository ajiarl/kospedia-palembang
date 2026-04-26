import type { ReactNode } from "react";

type ContentPageShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function ContentPageShell({
  eyebrow,
  title,
  description,
  children,
}: ContentPageShellProps) {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 space-y-2">
          {eyebrow ? <p className="text-sm font-semibold text-primary">{eyebrow}</p> : null}
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="prose prose-stone max-w-none prose-headings:font-bold prose-p:text-foreground/85 prose-li:text-foreground/85">
          {children}
        </div>
      </div>
    </div>
  );
}
