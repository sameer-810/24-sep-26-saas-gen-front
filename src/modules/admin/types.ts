/**
 * Wire types for the platform console. These mirror
 * `15-jun-26-gen-back/src/modules/admin/admin.dto.js` — if a field is missing
 * there, it does not exist here.
 */

export type SubscriptionStatus = "trial" | "active" | "past_due" | "cancelled";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type OrgStatus = "active" | "suspended";

/** Which tier decided a limit: the company's own override, its plan, or nothing. */
export type LimitSource = "override" | "plan" | "unlimited";

/**
 * Limits arrive FLAT, three fields per limit, mirroring admin.service.js:
 * the effective ceiling, where it came from, and the company's own override
 * (0 = none). The override travels separately so the edit form seeds from it
 * directly rather than inferring it — an inferred override is how a form ends
 * up saving 0 over a real one. 0 as an effective value means unlimited.
 */
export type OrgSettings = {
  maxUsers: number;
  maxUsersSource: LimitSource;
  maxUsersOverride: number;
  maxProducts: number;
  maxProductsSource: LimitSource;
  maxProductsOverride: number;
  maxLeads: number;
  maxLeadsSource: LimitSource;
  maxLeadsOverride: number;
  /*
    Credentials: configured + where it came from + a mask of the tenant's OWN
    value. The API never returns a usable credential, and never a mask of the
    platform's — where a value falls through to `.env`, source is "platform"
    and the mask is blank.
  */
  indiamartConfigured: boolean;
  /** Portal only. There is deliberately no "platform" here. */
  indiamartSource: "organization" | "none";
  indiamartCrmKeyMasked: string;

  whatsappConfigured: boolean;
  whatsappSource: CredentialSource;
  whatsappTokenMasked: string;
  whatsappPhoneNumberIdMasked: string;

  cloudinaryConfigured: boolean;
  cloudinarySource: CredentialSource;
  /** The cloud name in force — an identifier, shown plain. */
  cloudinaryCloudName: string;
  /** What this tenant typed; "" means it inherits the platform's. */
  cloudinaryCloudNameOverride: string;
  cloudinaryApiKeyMasked: string;
  cloudinaryApiSecretMasked: string;

  /** The company's logo, from its BusinessProfile. "" when unset. */
  logoUrl: string;
};

/** Whose account a credential resolves to. */
export type CredentialSource = "organization" | "platform" | "none";

export type OrgSubscription = {
  planCode: string;
  planName: string;
  status: SubscriptionStatus | "";
  trialEndsAt: string | null;
  currentPeriodEndsAt: string | null;
  provider: string;
};

export type OrgOwner = {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
};

export type AdminOrganization = {
  id: string;
  name: string;
  industry: string;
  isActive: boolean;
  /** Suspension only. Approval is reported separately and on purpose. */
  status: OrgStatus;

  approvalStatus: ApprovalStatus;
  approvalRequestedAt: string | null;
  approvalDecidedAt: string | null;
  approvalDecidedBy: string;
  approvalNote: string;

  email: string;
  phone: string;
  address: string;
  gstin: string;
  contactPersonalEmail: string;
  contactPhone: string;
  /** The plan they clicked on the price list. A note, not a purchase. */
  requestedPlanCode: string;

  subscription: OrgSubscription | null;
  settings: OrgSettings | null;
  owner: OrgOwner | null;

  stats: { users: number; leads: number; quotations: number; sales: number };

  createdAt: string;
  updatedAt: string;
};

export type AdminOverview = {
  totalOrgs: number;
  activeOrgs: number;
  suspendedOrgs: number;
  pendingOrgs: number;
  totalUsers: number;
  totalLeads: number;
};

export type OrgUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "sales" | "inventory";
  isActive: boolean;
  createdAt: string;
};

export type AdminPlan = {
  id: string;
  code: string;
  name: string;
  tagline: string;
  description: string;
  termMonths: number;
  /* What the price card prints — all derived server-side by planDisplay.js. */
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
  isActive: boolean;
  sortOrder: number;
  /** What the FORM edits. 0 mostly means "derive it" — see admin.dto.js. */
  stored: { priceMonthly: number; priceTotal: number; referencePrice: number; badge: string };
  createdAt: string;
  updatedAt: string;
};

/** A platform admin as the Admins table lists them. */
export type PlatformAdminRow = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export type AuditEntry = {
  id: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  meta: Record<string, unknown>;
  ip: string;
  createdAt: string;
};

export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

/* ── Website CMS ──────────────────────────────────────────────────────────
   The draft the console edits is the same document the public site renders
   once published, so the content types live with the public module. */
export type {
  BenefitItem,
  FaqItem,
  FeatureItem,
  NavItem,
  SectionEntry,
  SectionKey,
  SocialLink,
  StepItem,
  TrustItem,
  WebsiteContact,
  WebsiteContent,
  WebsiteCta,
  WebsiteFooter,
  WebsiteHero,
  WebsitePricing,
  WebsiteSeo,
  WebsiteSettings,
} from "@/modules/public/types";
import type { WebsiteContent } from "@/modules/public/types";

export type WebsiteDoc = {
  status: "draft" | "published";
  publishedAt: string | null;
  updatedAt: string;
  lastEditedBy: string;
  draft: WebsiteContent;
  published: WebsiteContent | null;
};

/** What `PUT /website` accepts: any subset of the copy blocks. */
export type WebsitePatch = Partial<
  Pick<
    WebsiteContent,
    | "hero"
    | "trust"
    | "howItWorks"
    | "benefits"
    | "cta"
    | "pricing"
    | "contact"
    | "finalCta"
    | "footer"
    | "settings"
    | "seo"
  >
>;

export type InquiryStatus = "new" | "read" | "archived";

export type WebsiteInquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
};

export type MediaUpload = { url: string; thumbnailUrl: string };
