/**
 * Wire types for the public website. These mirror `GET /api/public/website`;
 * the admin CMS reuses the content types because the draft it edits is the
 * same document before publishing.
 */

export type SocialLink = { label: string; url: string };

export type WebsiteSettings = {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  copyright: string;
  socialLinks: SocialLink[];
};

export type WebsiteSeo = {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
};

export type NavItem = {
  /** Server maps Mongo _id → id; sub-rows without an id (links, highlights) omit it. */
  id?: string;
  label: string;
  href: string;
  order: number;
  isVisible: boolean;
};

export type SectionKey =
  | "hero"
  | "trust"
  | "features"
  | "howItWorks"
  | "benefits"
  | "cta"
  | "pricing"
  | "faq"
  | "contact"
  | "finalCta"
  | "footer";

export type SectionEntry = { key: SectionKey; order: number; isVisible: boolean };

export type Highlight = { label: string; value: string };

export type WebsiteHero = {
  badge: string;
  heading: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  imageUrl: string;
  supportingText: string;
  highlights: Highlight[];
};

export type TrustItem = {
  /** Server maps Mongo _id → id; sub-rows without an id (links, highlights) omit it. */
  id?: string;
  title: string;
  description: string;
  icon: string;
  order: number;
};

export type FeatureItem = {
  /** Server maps Mongo _id → id; sub-rows without an id (links, highlights) omit it. */
  id?: string;
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
  link: string;
  order: number;
  isVisible: boolean;
};

export type StepItem = {
  /** Server maps Mongo _id → id; sub-rows without an id (links, highlights) omit it. */
  id?: string;
  title: string;
  description: string;
  icon: string;
  order: number;
};

export type BenefitItem = {
  /** Server maps Mongo _id → id; sub-rows without an id (links, highlights) omit it. */
  id?: string;
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
  order: number;
};

export type WebsiteCta = {
  heading: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
};

export type WebsitePricing = {
  heading: string;
  description: string;
  showToggle: boolean;
  ctaText: string;
  layout: string;
};

export type FaqItem = {
  /** Server maps Mongo _id → id; sub-rows without an id (links, highlights) omit it. */
  id?: string;
  question: string;
  answer: string;
  order: number;
  isVisible: boolean;
};

export type WebsiteContact = {
  title: string;
  description: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  businessHours: string;
  socialLinks: SocialLink[];
  formEnabled: boolean;
};

export type WebsiteFooter = {
  description: string;
  links: { label: string; href: string }[];
  copyright: string;
};

export type WebsiteContent = {
  settings: WebsiteSettings;
  seo: WebsiteSeo;
  navigation: NavItem[];
  sections: SectionEntry[];
  hero: WebsiteHero;
  trust: { items: TrustItem[] };
  features: { title: string; description: string; items: FeatureItem[] };
  howItWorks: { title: string; description: string; steps: StepItem[] };
  benefits: { heading: string; description: string; items: BenefitItem[] };
  cta: WebsiteCta;
  pricing: WebsitePricing;
  faq: FaqItem[];
  contact: WebsiteContact;
  finalCta: WebsiteCta;
  footer: WebsiteFooter;
};

/** Already decorated server-side. Rendered as-is; prices are never recomputed here. */
export type PublicPlan = {
  id: string;
  code: string;
  name: string;
  tagline: string;
  description: string;
  termMonths: number;
  perMonth: number;
  total: number;
  reference: number;
  saves: number;
  savePct: number;
  badge: string;
  isFeatured: boolean;
  features: string[];
  maxUsers: number;
  maxProducts: number;
  maxLeads: number;
};

export type PublicWebsite = { website: WebsiteContent; plans: PublicPlan[] };

export type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  /** Honeypot. Rendered hidden, always sent as "". */
  website: string;
};
