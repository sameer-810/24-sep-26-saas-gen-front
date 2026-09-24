import { useEffect, useState } from "react";
import { Menu, X, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { NavItem, WebsiteHero, WebsiteSettings } from "../../types";
import { SmartLink, btnPrimary, container } from "../ui";

export function Header({
  settings,
  navigation,
  hero,
}: {
  settings: WebsiteSettings;
  navigation: NavItem[];
  hero: WebsiteHero;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const loginBtn =
    "inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--site-primary)] focus-visible:ring-offset-2";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className={cn(container, "flex h-[68px] items-center justify-between gap-6")}>
        <a href="#top" className="flex min-w-0 items-center gap-3" aria-label={settings.siteName}>
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt=""
              className="h-9 w-auto max-w-[140px] object-contain"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--site-primary)] text-white">
              <Zap className="h-5 w-5 fill-current" aria-hidden="true" />
            </span>
          )}
          <span className="truncate text-[17px] font-bold tracking-tight text-slate-900">
            {settings.siteName}
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {navigation.map((item) => (
            <SmartLink
              key={item.id ?? item.href + item.label}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {item.label}
            </SmartLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button type="button" onClick={() => navigate("/login")} className={loginBtn}>
            Login
          </button>
          <SmartLink
            href={hero.primaryButtonUrl || "/login"}
            className={cn(btnPrimary, "h-10 px-5 text-sm")}
          >
            {hero.primaryButtonText || "Get started"}
          </SmartLink>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-mobile-menu"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div id="site-mobile-menu" className="border-t border-slate-200 bg-white lg:hidden">
          <nav aria-label="Primary mobile" className={cn(container, "flex flex-col py-3")}>
            {navigation.map((item) => (
              <SmartLink
                key={item.id ?? item.href + item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-[15px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                {item.label}
              </SmartLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={cn(loginBtn, "h-12 w-full")}
              >
                Login
              </button>
              <SmartLink
                href={hero.primaryButtonUrl || "/login"}
                className={cn(btnPrimary, "w-full")}
              >
                {hero.primaryButtonText || "Get started"}
              </SmartLink>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
