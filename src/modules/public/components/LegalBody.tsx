import type { ReactNode } from "react";

/**
 * Renders the markdown SUBSET the CMS stores for legal documents:
 * `## heading`, `- bullet`, `**bold**`, blank line = new paragraph.
 *
 * Everything becomes React elements — never `dangerouslySetInnerHTML`. The body
 * is admin-editable free text, so handing it to the HTML parser would be a
 * stored-XSS hole; as text children React escapes it and `<script>` is a string.
 */

/** "Your personal data" → "your-personal-data": stable ids the in-page contents link to. */
export const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Splits on `**bold**`; odd segments are the emphasised ones. */
function inline(text: string): ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 ? (
      <strong key={i} className="font-semibold text-slate-900">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

export type LegalHeading = { id: string; text: string };

/** The `## ` headings, in order — the page builds its table of contents from this. */
export function legalHeadings(body: string): LegalHeading[] {
  return body
    .split("\n")
    .filter((l) => l.startsWith("## "))
    .map((l) => ({ id: slug(l.slice(3).trim()), text: l.slice(3).trim() }));
}

export function LegalBody({ body }: { body: string }) {
  const out: ReactNode[] = [];
  let bullets: string[] = [];
  let para: string[] = [];

  const flushBullets = () => {
    if (!bullets.length) return;
    const items = bullets;
    bullets = [];
    out.push(
      <ul key={out.length} className="mb-4 list-disc space-y-1.5 pl-5">
        {items.map((b, i) => (
          <li key={i}>{inline(b)}</li>
        ))}
      </ul>,
    );
  };
  const flushPara = () => {
    if (!para.length) return;
    const text = para.join(" ");
    para = [];
    out.push(
      <p key={out.length} className="mb-4">
        {inline(text)}
      </p>,
    );
  };

  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushBullets();
    } else if (line.startsWith("## ")) {
      flushPara();
      flushBullets();
      const text = line.slice(3).trim();
      out.push(
        <h2
          key={out.length}
          id={slug(text)}
          className="mb-3 mt-10 scroll-mt-24 text-xl font-semibold text-slate-900"
        >
          {text}
        </h2>,
      );
    } else if (line.startsWith("- ")) {
      flushPara();
      bullets.push(line.slice(2).trim());
    } else {
      flushBullets();
      para.push(line);
    }
  }
  flushPara();
  flushBullets();

  return <div className="max-w-3xl text-[15px] leading-7 text-slate-600">{out}</div>;
}
