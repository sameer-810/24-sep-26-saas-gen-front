import { cn } from "@/lib/utils";
import type { StepItem } from "../../types";
import { Icon } from "../Icon";
import { SectionHeading, container } from "../ui";

/** The orange-tinted "workflow" panel: numbered steps joined by a hairline. */
export function HowItWorks({
  title,
  description,
  steps,
}: {
  title: string;
  description: string;
  steps: StepItem[];
}) {
  if (!steps.length && !title) return null;
  return (
    <section id="how-it-works" className="bg-slate-50 py-20 sm:py-24">
      <div className={container}>
        <SectionHeading eyebrow="How it works" title={title} description={description} />
        {steps.length > 0 && (
          <div className="relative mt-12 rounded-2xl border border-[var(--site-primary-line)] bg-[var(--site-primary-tint)] p-5 sm:p-8">
            <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <li
                  key={step.id ?? step.title}
                  className={cn(
                    "relative rounded-xl border bg-white p-5 transition-colors",
                    i === 0
                      ? "border-[var(--site-primary-line)] shadow-[0_12px_30px_-20px_var(--site-primary)]"
                      : "border-slate-200",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--site-primary-soft)] text-[var(--site-primary)]">
                      <Icon name={step.icon} className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-xs font-semibold tabular-nums text-slate-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[16px] font-semibold text-slate-900">{step.title}</h3>
                  {step.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      {step.description}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
