import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Info, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon, isKnownIcon } from "@/modules/public/components/Icon";
import type { SectionKey } from "../../types";
import { Field, adminBtnPrimary, adminBtnSmall, adminInput } from "../../components/AdminUi";

/** Display name and editor route for each of the 11 sections, in seed order. */
export const SECTION_META: Record<SectionKey, { label: string; editPath: string }> = {
  hero: { label: "Hero", editPath: "/admin/website/sections?tab=hero" },
  trust: { label: "Trust strip", editPath: "/admin/website/sections?tab=trust" },
  features: { label: "Features", editPath: "/admin/website/features" },
  howItWorks: { label: "How it works", editPath: "/admin/website/sections?tab=howItWorks" },
  benefits: { label: "Benefits", editPath: "/admin/website/sections?tab=benefits" },
  cta: { label: "Call to action", editPath: "/admin/website/sections?tab=cta" },
  pricing: { label: "Pricing", editPath: "/admin/website/sections?tab=pricing" },
  faq: { label: "FAQ", editPath: "/admin/website/faq" },
  contact: { label: "Contact", editPath: "/admin/website/contact" },
  finalCta: { label: "Final call to action", editPath: "/admin/website/sections?tab=finalCta" },
  footer: { label: "Footer", editPath: "/admin/website/sections?tab=footer" },
};

export const SECTION_KEYS = Object.keys(SECTION_META) as SectionKey[];

export const DRAFT_NOTE = "Changes are in draft until you Publish";

export function DraftNote() {
  return (
    <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
      <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
      {DRAFT_NOTE}. Publish from the{" "}
      <a href="/admin/website" className="font-semibold underline">
        Website overview
      </a>
      .
    </p>
  );
}

/* ── Field wrappers: label + control in one call, so forms stay short ──── */

export function TextInput({
  label,
  value,
  onChange,
  type = "text",
  hint,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "url" | "email" | "tel" | "color";
  hint?: ReactNode;
  placeholder?: string;
  className?: string;
}) {
  const id = `f-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <Field label={label} htmlFor={id} hint={hint} className={className}>
      {type === "color" ? (
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-card p-1"
          />
          <input
            aria-label={`${label} hex`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(adminInput, "font-mono")}
            placeholder="#f97316"
          />
        </div>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={adminInput}
        />
      )}
    </Field>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  hint,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: ReactNode;
  className?: string;
}) {
  const id = `f-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <Field label={label} htmlFor={id} hint={hint} className={className}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(adminInput, "resize-y")}
      />
    </Field>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border accent-blue-600"
      />
      {label}
    </label>
  );
}

/** Text input for a lucide icon name with a live preview beside it. */
export function IconInput({
  label = "Icon",
  value,
  onChange,
  className,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const known = !value || isKnownIcon(value);
  const id = `f-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <Field
      label={label}
      htmlFor={id}
      className={className}
      hint={
        known ? (
          <>
            A{" "}
            <a
              href="https://lucide.dev/icons"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              lucide
            </a>{" "}
            icon name, e.g. <span className="font-mono">ShieldCheck</span>
          </>
        ) : (
          <span className="text-amber-600">Unknown icon; a fallback will show</span>
        )
      }
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border",
            known ? "bg-blue-50 text-blue-600 dark:bg-blue-500/15" : "bg-amber-50 text-amber-600",
          )}
          aria-hidden="true"
        >
          <Icon name={value} className="h-5 w-5" />
        </span>
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(adminInput, "font-mono")}
          placeholder="ShieldCheck"
          spellCheck={false}
        />
      </div>
    </Field>
  );
}

/* ── Repeated-item editor ─────────────────────────────────────────────── */

/* Static so Tailwind's scanner sees every class it must emit. */
const SPAN: Record<number, string> = {
  3: "col-span-12 md:col-span-3",
  4: "col-span-12 md:col-span-4",
  6: "col-span-12 md:col-span-6",
  8: "col-span-12 md:col-span-8",
  12: "col-span-12",
};

export type ListField<T> = {
  key: keyof T & string;
  label: string;
  kind?: "text" | "textarea" | "icon" | "url";
  /** Grid columns the field spans, out of 12. */
  span?: number;
};

/**
 * Edits an array of flat objects: add, remove, move up/down, one input per
 * field. `order` (when present on T) is rewritten from the index on every
 * change, so the caller never has to.
 */
export function ListEditor<T extends Record<string, unknown>>({
  items,
  onChange,
  fields,
  blank,
  addLabel = "Add item",
  itemLabel = "Item",
}: {
  items: T[];
  onChange: (items: T[]) => void;
  fields: ListField<T>[];
  blank: () => T;
  addLabel?: string;
  itemLabel?: string;
}) {
  function commit(next: T[]) {
    onChange(next.map((it, i) => ("order" in it ? { ...it, order: i } : it)));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  }
  function setField(i: number, key: keyof T, value: string) {
    commit(items.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)));
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Nothing here yet.
        </p>
      )}
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {itemLabel} {i + 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className={adminBtnSmall}
                aria-label="Move up"
              >
                <ArrowUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className={adminBtnSmall}
                aria-label="Move down"
              >
                <ArrowDown className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => commit(items.filter((_, idx) => idx !== i))}
                className={`${adminBtnSmall} hover:text-rose-600`}
                aria-label="Remove"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-3">
            {fields.map((f) => {
              const v = String(item[f.key] ?? "");
              const span = f.span ?? (f.kind === "textarea" ? 12 : 6);
              const cls = SPAN[span] ?? SPAN[6];
              if (f.kind === "textarea")
                return (
                  <TextArea
                    key={f.key}
                    label={f.label}
                    value={v}
                    rows={2}
                    onChange={(x) => setField(i, f.key, x)}
                    className={cls}
                  />
                );
              if (f.kind === "icon")
                return (
                  <IconInput
                    key={f.key}
                    label={f.label}
                    value={v}
                    onChange={(x) => setField(i, f.key, x)}
                    className={cls}
                  />
                );
              return (
                <TextInput
                  key={f.key}
                  label={f.label}
                  value={v}
                  type={f.kind === "url" ? "url" : "text"}
                  onChange={(x) => setField(i, f.key, x)}
                  className={cls}
                />
              );
            })}
          </div>
        </div>
      ))}
      <button type="button" onClick={() => commit([...items, blank()])} className={adminBtnSmall}>
        <Plus className="h-3 w-3" /> {addLabel}
      </button>
    </div>
  );
}

/**
 * Local draft state around a block of fields with one Save button. Mount it
 * with `key={updatedAt}` so a fresh fetch reseeds it.
 */
export function SectionForm<T>({
  initial,
  onSave,
  pending,
  children,
}: {
  initial: T;
  onSave: (value: T) => void;
  pending: boolean;
  children: (draft: T, set: (patch: Partial<T>) => void) => ReactNode;
}) {
  const [draft, setDraft] = useState<T>(initial);
  const set = (patch: Partial<T>) => setDraft((d) => ({ ...d, ...patch }));
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft);
      }}
    >
      {children(draft, set)}
      <div className="flex items-center justify-end border-t border-border pt-5">
        <button type="submit" disabled={pending} className={adminBtnPrimary}>
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
