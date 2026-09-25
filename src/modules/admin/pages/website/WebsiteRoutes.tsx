import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

/**
 * The Website CMS as one lazy chunk under `/admin/website/*`, so App.tsx grows
 * by a single route line rather than nine.
 */
const Overview = lazy(() =>
  import("./WebsiteOverviewPage").then((m) => ({ default: m.WebsiteOverviewPage })),
);
const Sections = lazy(() =>
  import("./WebsiteSectionsPage").then((m) => ({ default: m.WebsiteSectionsPage })),
);
const Features = lazy(() =>
  import("./WebsiteFeaturesPage").then((m) => ({ default: m.WebsiteFeaturesPage })),
);
const Navigation = lazy(() =>
  import("./WebsiteNavigationPage").then((m) => ({ default: m.WebsiteNavigationPage })),
);
const Contact = lazy(() =>
  import("./WebsiteContactPage").then((m) => ({ default: m.WebsiteContactPage })),
);
const Faq = lazy(() => import("./WebsiteFaqPage").then((m) => ({ default: m.WebsiteFaqPage })));
const Media = lazy(() =>
  import("./WebsiteMediaPage").then((m) => ({ default: m.WebsiteMediaPage })),
);
const Legal = lazy(() =>
  import("./WebsiteLegalPage").then((m) => ({ default: m.WebsiteLegalPage })),
);
const Seo = lazy(() => import("./WebsiteSeoPage").then((m) => ({ default: m.WebsiteSeoPage })));
const Settings = lazy(() =>
  import("./WebsiteSettingsPage").then((m) => ({ default: m.WebsiteSettingsPage })),
);

export function WebsiteRoutes() {
  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="sections" element={<Sections />} />
      <Route path="features" element={<Features />} />
      <Route path="navigation" element={<Navigation />} />
      <Route path="contact" element={<Contact />} />
      <Route path="faq" element={<Faq />} />
      <Route path="media" element={<Media />} />
      <Route path="legal" element={<Legal />} />
      <Route path="seo" element={<Seo />} />
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/admin/website" replace />} />
    </Routes>
  );
}
