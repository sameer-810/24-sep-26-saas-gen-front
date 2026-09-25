import { useMemo, type CSSProperties } from "react";
import { usePublicWebsite } from "../hooks/usePublicWebsite";
import { useSiteHead } from "../hooks/useSiteHead";
import type { WebsiteSeo } from "../types";
import { Header } from "../components/sections/Header";
import { Footer } from "../components/sections/Footer";
import { LegalBody, legalHeadings } from "../components/LegalBody";
import { container, eyebrow } from "../components/ui";

const DEFAULT_PRIMARY = "#f97316";
const DEFAULT_SECONDARY = "#0f172a";

const TITLE: Record<"privacy" | "terms", string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
};

function Skeleton() {
  return (
    <div className={`${container} animate-pulse py-16`} aria-busy="true" aria-label="Loading">
      <div className="h-3 w-16 rounded bg-slate-200" />
      <div className="mt-5 h-10 w-2/3 max-w-md rounded bg-slate-200" />
      <div className="mt-4 h-4 w-48 rounded bg-slate-100" />
      <div className="mt-10 max-w-3xl space-y-3">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="h-4 rounded bg-slate-100"
            style={{ width: `${70 + (i % 3) * 10}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * `/privacy` and `/terms`. Reads the same cached `usePublicWebsite()` query the
 * home page uses, so arriving here costs no extra request.
 */
export function LegalPage({ doc }: { doc: "privacy" | "terms" }) {
  const { data, isLoading } = usePublicWebsite();
  const website = data?.website;
  const legal = website?.legal?.[doc];
  const title = legal?.title || TITLE[doc];
  const body = legal?.body ?? "";

  const seo = useMemo<WebsiteSeo | undefined>(
    () =>
      website && {
        title: website.settings.siteName ? `${title} · ${website.settings.siteName}` : title,
        description: `${title} for ${website.settings.siteName || "our service"}.`,
        ogTitle: "",
        ogDescription: "",
        ogImageUrl: "",
      },
    [website, title],
  );
  useSiteHead(seo, website?.settings);

  const headings = useMemo(() => legalHeadings(body), [body]);

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
        <Skeleton />
      ) : (
        <>
          <Header settings={website.settings} navigation={website.navigation} hero={website.hero} />
          <main className={`${container} py-14 sm:py-16`}>
            <p className={eyebrow}>Legal</p>
            <h1 className="mt-3 text-[30px] font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-[38px]">
              {title}
            </h1>
            {legal?.updatedAt && (
              <p className="mt-3 text-sm text-slate-500">Last updated: {legal.updatedAt}</p>
            )}

            <div className="mt-10 flex gap-12">
              {headings.length > 0 && (
                <nav aria-label="On this page" className="hidden w-60 shrink-0 lg:block">
                  <div className="sticky top-[92px]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      On this page
                    </p>
                    <ul className="mt-3 space-y-2 border-l border-slate-200">
                      {headings.map((h) => (
                        <li key={h.id}>
                          <a
                            href={`#${h.id}`}
                            className="-ml-px block border-l border-transparent pl-3 text-sm text-slate-600 transition-colors hover:border-[var(--site-primary)] hover:text-slate-900"
                          >
                            {h.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </nav>
              )}
              <div className="min-w-0 flex-1">
                {body.trim() ? (
                  <LegalBody body={body} />
                ) : (
                  <p className="text-[15px] leading-7 text-slate-600">
                    This document has not been published yet.
                  </p>
                )}
              </div>
            </div>
          </main>
          <Footer footer={website.footer} settings={website.settings} />
        </>
      )}
    </div>
  );
}
