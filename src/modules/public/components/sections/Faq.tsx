import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqItem } from "../../types";
import { SectionHeading, container } from "../ui";

export function Faq({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const visible = items.filter((i) => i.isVisible !== false);
  if (!visible.length) return null;
  return (
    <section id="faq" className="bg-white py-20 sm:py-24">
      <div className={cn(container, "max-w-[820px]")}>
        <SectionHeading eyebrow="FAQ" title="Common questions" />
        <ul className="mt-10 space-y-3">
          {visible.map((item, i) => {
            const id = item.id ?? String(i);
            const open = openId === id;
            return (
              <li key={id} className="rounded-xl border border-slate-200 bg-white">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : id)}
                    aria-expanded={open}
                    aria-controls={`faq-panel-${id}`}
                    id={`faq-btn-${id}`}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold text-slate-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--site-primary)]"
                  >
                    {item.question}
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-slate-400 transition-transform",
                        open && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div
                  id={`faq-panel-${id}`}
                  role="region"
                  aria-labelledby={`faq-btn-${id}`}
                  hidden={!open}
                  className="px-5 pb-5 text-[15px] leading-relaxed text-slate-600"
                >
                  {item.answer}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
