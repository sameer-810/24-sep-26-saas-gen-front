import { useEffect } from "react";
import type { WebsiteSeo, WebsiteSettings } from "../types";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Title, description, OG tags and favicon from the CMS. Restores the title on unmount. */
export function useSiteHead(seo: WebsiteSeo | undefined, settings: WebsiteSettings | undefined) {
  useEffect(() => {
    if (!seo || !settings) return;
    const prevTitle = document.title;
    const title = seo.title || settings.siteName;
    if (title) document.title = title;
    upsertMeta("name", "description", seo.description);
    upsertMeta("property", "og:title", seo.ogTitle || title);
    upsertMeta("property", "og:description", seo.ogDescription || seo.description);
    upsertMeta("property", "og:image", seo.ogImageUrl);
    upsertMeta("property", "og:type", "website");

    const icon = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const prevIcon = icon?.href ?? "";
    if (settings.faviconUrl && icon) {
      icon.href = settings.faviconUrl;
      icon.removeAttribute("type");
    }
    return () => {
      document.title = prevTitle;
      if (icon && prevIcon) icon.href = prevIcon;
    };
  }, [seo, settings]);
}
