import type { CSSProperties, ReactNode } from "react";
import { usePublicWebsite } from "../hooks/usePublicWebsite";
import { useSiteHead } from "../hooks/useSiteHead";
import type { PublicPlan, SectionKey, WebsiteContent } from "../types";
import { Header } from "../components/sections/Header";
import { Hero } from "../components/sections/Hero";
import { Trust } from "../components/sections/Trust";
import { Features } from "../components/sections/Features";
import { HowItWorks } from "../components/sections/HowItWorks";
import { Benefits } from "../components/sections/Benefits";
import { Cta } from "../components/sections/Cta";
import { Pricing } from "../components/sections/Pricing";
import { Faq } from "../components/sections/Faq";
import { Contact } from "../components/sections/Contact";
import { FinalCta } from "../components/sections/FinalCta";
import { Footer } from "../components/sections/Footer";
import { container } from "../components/ui";

const DEFAULT_PRIMARY = "#f97316";
const DEFAULT_SECONDARY = "#0f172a";

/**
 * One renderer per section key. The page walks `website.sections` in the order
 * the API returns it (already sorted, hidden removed), so reordering or hiding
 * a section in the CMS needs no code change here. Footer is the exception: it
 * is a landmark that belongs after <main>, so it is rendered last if present.
 */
const SECTION: Record<
  Exclude<SectionKey, "footer">,
  (w: WebsiteContent, plans: PublicPlan[]) => ReactNode
> = {
  hero: (w) => <Hero hero={w.hero} />,
  trust: (w) => <Trust items={w.trust.items} />,
  features: (w) => <Features {...w.features} />,
  howItWorks: (w) => <HowItWorks {...w.howItWorks} />,
  benefits: (w) => <Benefits {...w.benefits} />,
  cta: (w) => <Cta cta={w.cta} />,
  pricing: (w, plans) => <Pricing pricing={w.pricing} plans={plans} />,
  faq: (w) => <Faq items={w.faq} />,
  contact: (w) => <Contact contact={w.contact} />,
  finalCta: (w) => <FinalCta cta={w.finalCta} />,
};

function Skeleton() {
  return (
    <div className={`${container} animate-pulse py-16`} aria-busy="true" aria-label="Loading">
      <div className="h-4 w-40 rounded bg-slate-200" />
      <div className="mt-6 h-12 w-3/4 max-w-xl rounded bg-slate-200" />
      <div className="mt-3 h-12 w-1/2 max-w-md rounded bg-slate-200" />
      <div className="mt-8 h-5 w-2/3 max-w-lg rounded bg-slate-100" />
      <div className="mt-10 h-12 w-48 rounded-lg bg-slate-200" />
      <div className="mt-16 grid gap-5 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

export function PublicHome() {
  const { data, isLoading, isError, refetch } = usePublicWebsite();
  const website = data?.website;
  useSiteHead(website?.seo, website?.settings);

  const primary = website?.settings.primaryColor || DEFAULT_PRIMARY;
  const secondary = website?.settings.secondaryColor || DEFAULT_SECONDARY;
  const style = {
    "--site-primary": primary,
    "--site-secondary": secondary,
    "--site-primary-soft": `color-mix(in srgb, ${primary} 12%, white)`,
    "--site-primary-tint": `color-mix(in srgb, ${primary} 5%, white)`,
    "--site-primary-glow": `color-mix(in srgb, ${primary} 22%, transparent)`,
    "--site-primary-line": `color-mix(in srgb, ${primary} 35%, transparent)`,
    colorScheme: "light",
  } as CSSProperties;

  return (
    <div
      id="top"
      style={style}
      className="light min-h-screen bg-white font-sans text-slate-900 antialiased"
    >
      {isLoading || !website ? (
        isError ? (
          <div className={`${container} py-24 text-center`}>
            <h1 className="text-2xl font-bold">We could not load the site</h1>
            <p className="mt-2 text-slate-600">Please check your connection and try again.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-6 inline-flex h-11 items-center rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : (
          <Skeleton />
        )
      ) : (
        <>
          <Header settings={website.settings} navigation={website.navigation} hero={website.hero} />
          <main>
            {website.sections
              .filter((s) => s.key !== "footer" && s.key in SECTION)
              .map((s) => (
                <div key={s.key}>
                  {SECTION[s.key as Exclude<SectionKey, "footer">](website, data?.plans ?? [])}
                </div>
              ))}
          </main>
          {website.sections.some((s) => s.key === "footer") && (
            <Footer footer={website.footer} settings={website.settings} />
          )}
        </>
      )}
    </div>
  );
}
