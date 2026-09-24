import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WebsiteCta } from "../../types";
import { SmartLink, btnPrimary, container, eyebrow } from "../ui";

/** The dark full-bleed band mid-page. */
export function Cta({ cta }: { cta: WebsiteCta }) {
  if (!cta.heading && !cta.description) return null;
  return (
    <section id="cta" className="bg-slate-950 py-20 text-white sm:py-24">
      <div className={cn(container, "grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]")}>
        <div>
          <p className={eyebrow}>Next step</p>
          <h2 className="mt-3 text-[28px] font-bold leading-[1.15] tracking-tight sm:text-[36px]">
            {cta.heading}
          </h2>
          {cta.description && (
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-slate-300">
              {cta.description}
            </p>
          )}
        </div>
        {cta.buttonText && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 lg:justify-self-end lg:w-full lg:max-w-sm">
            <p className="text-sm text-slate-300">
              Set up in minutes. Your team signs in with the same account they already use.
            </p>
            <SmartLink href={cta.buttonUrl || "/login"} className={cn(btnPrimary, "mt-5 w-full")}>
              {cta.buttonText} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </SmartLink>
          </div>
        )}
      </div>
    </section>
  );
}
