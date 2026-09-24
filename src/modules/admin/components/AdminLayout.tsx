import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Building2,
  ChevronDown,
  Clock,
  Globe,
  Home,
  Layers,
  LogOut,
  Menu,
  Search,
  Users,
  X,
  Zap,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { cn, initialsOf } from "@/lib/utils";
import { useAdminSignOut } from "../hooks/useAdminAuth";
import { useAdminOverview } from "../hooks/useAdminOrgs";

/**
 * The console's own shell: top bar, left sidebar, content area.
 *
 * Deliberately not `AppLayout`: a platform admin is a different principal with
 * no organization at all, and the tenant shell would put a "Leads" nav item in
 * front of someone who has no leads to see.
 */

const NAV = [
  { to: "/admin", label: "Dashboard", icon: Home, end: true },
  { to: "/admin/companies", label: "Companies", icon: Building2, end: false },
  { to: "/admin/plans", label: "Plans", icon: Layers, end: false },
  { to: "/admin/website", label: "Website", icon: Globe, end: false },
  { to: "/admin/admins", label: "Admins", icon: Users, end: false },
  { to: "/admin/audit", label: "Audit", icon: Clock, end: false },
];

export function AdminLayout() {
  const admin = useAppSelector((s) => s.admin.admin);
  const signOut = useAdminSignOut();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const overview = useAdminOverview();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDrawerOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pendingCount = overview.data?.pendingOrgs ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fb] text-foreground dark:bg-background">
      <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={drawerOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted md:hidden"
          >
            {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Zap className="h-6 w-6 fill-current" />
          </span>
          <span className="text-[22px] font-bold tracking-tight">Superadmin</span>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <form
            role="search"
            className="relative hidden lg:block lg:w-[410px]"
            onSubmit={(e) => {
              e.preventDefault();
              const q = query.trim();
              navigate(q ? `/admin/companies?search=${encodeURIComponent(q)}` : "/admin/companies");
            }}
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search companies"
              placeholder="Search companies, plans, admins…"
              className="h-11 w-full rounded-xl border border-border bg-muted/50 pl-12 pr-16 text-[15px] text-foreground placeholder:text-muted-foreground transition focus:border-blue-500 focus:bg-card focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border bg-card px-2 py-0.5 font-sans text-xs text-muted-foreground">
              ⌘ K
            </kbd>
          </form>

          <button
            type="button"
            onClick={() => navigate("/admin/companies?status=pending")}
            aria-label={
              pendingCount > 0 ? `${pendingCount} companies awaiting approval` : "Notifications"
            }
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Bell className="h-[22px] w-[22px]" />
            {pendingCount > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-card" />
            )}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-3 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-muted"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-base font-semibold text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
                {initialsOf(admin?.name).slice(0, 1)}
              </span>
              <span className="hidden min-w-0 text-left sm:block">
                <span className="block truncate text-[15px] font-bold leading-tight">
                  {admin?.name ?? "Admin"}
                </span>
                <span className="block max-w-[180px] truncate text-xs text-muted-foreground">
                  {admin?.email}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-border bg-card p-1.5 shadow-xl"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={signOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {drawerOpen && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 top-20 z-10 bg-black/40 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
        )}
        <aside
          className={cn(
            "fixed bottom-0 left-0 top-20 z-20 w-[295px] shrink-0 border-r border-border bg-card transition-transform md:static md:translate-x-0",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <nav aria-label="Console sections" className="space-y-1 p-[18px]">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex h-[52px] items-center gap-6 rounded-lg px-[22px] text-[15px] font-semibold transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                  )
                }
              >
                <Icon className="h-[22px] w-[22px]" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
