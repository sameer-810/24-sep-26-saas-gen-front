/**
 * SRF Power Machine brandmarks.
 * - <LogoFull> renders the SRF Power Machine emblem (transparent).
 *   variant="light" (default) = white monochrome, for dark surfaces (sidebar, login).
 *   variant="dark" = full navy/blue emblem, for light surfaces.
 *   variant="auto" = switches with the theme.
 * - <LogoMark> is a compact "SRF" monogram badge in the brand blue, for tight
 *   icon-only spots such as the collapsed sidebar rail.
 */

const BRAND_BLUE = "#1C50C8";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-lg font-extrabold tracking-tight text-white"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        background: BRAND_BLUE,
      }}
      aria-hidden
    >
      SRF
    </span>
  );
}

export function LogoFull({
  height = 30,
  className = "",
  variant = "light",
}: {
  height?: number;
  className?: string;
  variant?: "light" | "dark" | "auto";
}) {
  const imgCls = "w-auto object-contain";
  if (variant === "auto") {
    return (
      <span className={`inline-flex ${className}`} style={{ lineHeight: 0 }}>
        <img
          src="/logo-dark.png"
          alt="SRF Power Machine"
          style={{ height }}
          className={`${imgCls} dark:hidden`}
        />
        <img
          src="/logo-light.png"
          alt="SRF Power Machine"
          style={{ height }}
          className={`${imgCls} hidden dark:block`}
        />
      </span>
    );
  }
  return (
    <span className={`inline-flex ${className}`} style={{ lineHeight: 0 }}>
      <img
        src={variant === "dark" ? "/logo-dark.png" : "/logo-light.png"}
        alt="SRF Power Machine"
        style={{ height }}
        className={imgCls}
      />
    </span>
  );
}
