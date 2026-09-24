import { useChatAppearance } from "@/modules/settings/hooks/useSettings";

/**
 * The signed-in company's own mark, for the sidebar.
 *
 * Before multi-tenancy the sidebar carried one hard-coded brandmark, which was
 * right when there was one company and is wrong now: a customer signing in to
 * their CRM and seeing another business's logo is the single most visible way
 * a "white-label" product fails to be one.
 *
 * Three states, in order:
 *   1. the company has set a logo → show it
 *   2. no logo yet → the company's initials on a neutral disc, plus its name
 *   3. nothing loaded yet → an empty disc, so the header never jumps
 *
 * The fallback is initials and never the platform's mark. DESIGN.md's rule on
 * identity discs applies: neutral, never tinted — colour here would be
 * ornament, and colour in this product means status.
 */
export function TenantLogo({ collapsed }: { collapsed: boolean }) {
  const { data } = useChatAppearance();
  const name = data?.businessName?.trim() ?? "";
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "";

  if (data?.logoUrl) {
    return (
      <img
        src={data.logoUrl}
        alt={name || "Company logo"}
        style={{ height: collapsed ? 34 : 42 }}
        className="w-auto max-w-full object-contain"
      />
    );
  }

  const disc = (
    <span
      className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground"
      aria-hidden
    >
      {initials}
    </span>
  );

  if (collapsed) return disc;

  return (
    <span className="flex min-w-0 items-center gap-2.5">
      {disc}
      <span className="truncate text-sm font-semibold text-sidebar-foreground">{name}</span>
    </span>
  );
}
