import { cn } from "@/lib/utils";
import type { WebsiteFooter, WebsiteSettings } from "../../types";
import { SmartLink, container } from "../ui";

export function Footer({ footer, settings }: { footer: WebsiteFooter; settings: WebsiteSettings }) {
  const copyright = footer.copyright || settings.copyright;
  return (
    <footer className="bg-slate-950 py-10 text-slate-400">
      <div
        className={cn(
          container,
          "flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between",
        )}
      >
        <div className="max-w-md">
          <p className="text-[15px] font-semibold text-white">{settings.siteName}</p>
          {footer.description && (
            <p className="mt-2 text-sm leading-relaxed">{footer.description}</p>
          )}
        </div>
        {footer.links?.length > 0 && (
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {footer.links.map((l) => (
              <SmartLink
                key={l.href + l.label}
                href={l.href}
                className="text-sm transition-colors hover:text-white"
              >
                {l.label}
              </SmartLink>
            ))}
          </nav>
        )}
      </div>
      <div
        className={cn(
          container,
          "mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <p>{copyright}</p>
        {settings.socialLinks?.length > 0 && (
          <ul className="flex flex-wrap gap-4">
            {settings.socialLinks.map((s) => (
              <li key={s.url + s.label}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
