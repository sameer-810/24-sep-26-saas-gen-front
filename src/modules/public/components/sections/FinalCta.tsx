import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WebsiteCta } from "../../types";
import { SmartLink, btnPrimary, container } from "../ui";

export function FinalCta({ cta }: { cta: WebsiteCta }) {
  if (!cta.heading) return null;
  return (
    <section id="final-cta" className="bg-white py-16 sm:py-20">
      <div className={container}>
        <div className="rounded-2xl border border-[var(--site-primary-line)] bg-[var(--site-primary-tint)] px-6 py-12 text-center sm:px-12">
          <h2 className="text-[26px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[32px]">
            {cta.heading}
          </h2>
          {cta.description && (
            <p className="mx-auto mt-3 max-w-2xl text-[16px] leading-relaxed text-slate-600">
              {cta.description}
            </p>
          )}
          {cta.buttonText && (
            <SmartLink href={cta.buttonUrl || "/login"} className={cn(btnPrimary, "mt-7")}>
              {cta.buttonText} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </SmartLink>
          )}
        </div>
      </div>
    </section>
  );
}
