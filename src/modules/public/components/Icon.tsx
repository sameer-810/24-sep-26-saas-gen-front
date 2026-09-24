import { icons, Sparkles, type LucideIcon } from "lucide-react";

/**
 * A lucide icon by name, as the CMS stores it. Accepts "CheckCircle",
 * "check-circle" or "checkCircle"; anything unknown falls back to a sparkle
 * rather than rendering nothing, so a typo in the admin is visible, not silent.
 */
export function resolveIcon(name: string | undefined | null): LucideIcon {
  if (!name) return Sparkles;
  const pascal = name
    .trim()
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return (icons as Record<string, LucideIcon>)[pascal] ?? Sparkles;
}

export function isKnownIcon(name: string): boolean {
  return resolveIcon(name) !== Sparkles || /^sparkles$/i.test(name.trim());
}

export function Icon({ name, className }: { name: string | undefined; className?: string }) {
  const Cmp = resolveIcon(name);
  return <Cmp className={className} aria-hidden="true" />;
}
