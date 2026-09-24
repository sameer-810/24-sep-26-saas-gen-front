import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./app/layouts/AppLayout";
import { RequireAuth } from "./app/router/RequireAuth";
import { RequireAdmin } from "./app/router/RequireAdmin";
import { NotFoundPage } from "./app/router/NotFoundPage";
import { PageLoader } from "./shared/components/PageLoader";

const LoginPage = lazy(() =>
  import("./modules/auth/pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = lazy(() =>
  import("./modules/dashboard/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const SettingsPage = lazy(() =>
  import("./modules/settings/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);
const UsersPage = lazy(() =>
  import("./modules/users/pages/UsersPage").then((m) => ({ default: m.UsersPage })),
);
const MyPerformancePage = lazy(() =>
  import("./modules/hr/pages/MyPerformancePage").then((m) => ({ default: m.MyPerformancePage })),
);
const AttendanceAdminPage = lazy(() =>
  import("./modules/hr/pages/AttendanceAdminPage").then((m) => ({
    default: m.AttendanceAdminPage,
  })),
);
const LeadListPage = lazy(() =>
  import("./modules/lead/pages/LeadListPage").then((m) => ({ default: m.LeadListPage })),
);
const LeadDetailPage = lazy(() =>
  import("./modules/lead/pages/LeadDetailPage").then((m) => ({ default: m.LeadDetailPage })),
);
const LeadTrashPage = lazy(() =>
  import("./modules/lead/pages/LeadTrashPage").then((m) => ({ default: m.LeadTrashPage })),
);
const CapacityCalculatorPage = lazy(() =>
  import("./modules/capacity/pages/CapacityCalculatorPage").then((m) => ({
    default: m.CapacityCalculatorPage,
  })),
);
const InventoryListPage = lazy(() =>
  import("./modules/inventory/pages/InventoryListPage").then((m) => ({
    default: m.InventoryListPage,
  })),
);
const TemplatesPage = lazy(() =>
  import("./modules/messaging/pages/TemplatesPage").then((m) => ({ default: m.TemplatesPage })),
);
const LocationsPage = lazy(() =>
  import("./modules/location/LocationsPage").then((m) => ({ default: m.LocationsPage })),
);
const ProductListPage = lazy(() =>
  import("./modules/product/pages/ProductListPage").then((m) => ({
    default: m.ProductListPage,
  })),
);
const SaleListPage = lazy(() =>
  import("./modules/sale/pages/SaleListPage").then((m) => ({ default: m.SaleListPage })),
);
const QuotationListPage = lazy(() =>
  import("./modules/quotation/pages/QuotationListPage").then((m) => ({
    default: m.QuotationListPage,
  })),
);
const ActivityFeedPage = lazy(() =>
  import("./modules/activity/pages/ActivityFeedPage").then((m) => ({
    default: m.ActivityFeedPage,
  })),
);
const ReportsPage = lazy(() =>
  import("./modules/reports/pages/ReportsPage").then((m) => ({ default: m.ReportsPage })),
);

/* ── Platform console ──────────────────────────────────────────────────────
   A separate principal on a separate token, so these routes live OUTSIDE the
   tenant `RequireAuth`/`AppLayout` tree rather than as a branch inside it. A
   platform admin has no organization, no role and no leads; mounting the tenant
   shell around them would render a sidebar of things they cannot have. */
const AdminLoginPage = lazy(() =>
  import("./modules/admin/pages/AdminLoginPage").then((m) => ({ default: m.AdminLoginPage })),
);
const AdminLayout = lazy(() =>
  import("./modules/admin/components/AdminLayout").then((m) => ({ default: m.AdminLayout })),
);
const AdminDashboardPage = lazy(() =>
  import("./modules/admin/pages/AdminDashboardPage").then((m) => ({
    default: m.AdminDashboardPage,
  })),
);
const CompaniesPage = lazy(() =>
  import("./modules/admin/pages/CompaniesPage").then((m) => ({ default: m.CompaniesPage })),
);
const CompanyDetailPage = lazy(() =>
  import("./modules/admin/pages/CompanyDetailPage").then((m) => ({ default: m.CompanyDetailPage })),
);
const CompanyFormPage = lazy(() =>
  import("./modules/admin/pages/CompanyFormPage").then((m) => ({ default: m.CompanyFormPage })),
);
const CompanyUsersPage = lazy(() =>
  import("./modules/admin/pages/CompanyUsersPage").then((m) => ({ default: m.CompanyUsersPage })),
);
const PlansPage = lazy(() =>
  import("./modules/admin/pages/PlansPage").then((m) => ({ default: m.PlansPage })),
);
const AdminsPage = lazy(() =>
  import("./modules/admin/pages/AdminsPage").then((m) => ({ default: m.AdminsPage })),
);
const AuditPage = lazy(() =>
  import("./modules/admin/pages/AuditPage").then((m) => ({ default: m.AuditPage })),
);
const WebsiteRoutes = lazy(() =>
  import("./modules/admin/pages/website/WebsiteRoutes").then((m) => ({
    default: m.WebsiteRoutes,
  })),
);

/* ── Public marketing site ─────────────────────────────────────────────────
   Lives at "/" with no guard; the tenant shell below is now a pathless layout
   so its children keep their absolute URLs (/dashboard, /leads, …). */
const PublicHome = lazy(() =>
  import("./modules/public/pages/PublicHome").then((m) => ({ default: m.PublicHome })),
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          {/* Before "companies/:id" so "new" is never read as a company id. */}
          <Route path="companies/new" element={<CompanyFormPage />} />
          <Route path="companies/:id" element={<CompanyDetailPage />} />
          <Route path="companies/:id/edit" element={<CompanyFormPage />} />
          <Route path="companies/:id/users" element={<CompanyUsersPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="admins" element={<AdminsPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="website/*" element={<WebsiteRoutes />} />
          {/* An unknown console URL lands back on the dashboard rather than
              on the tenant 404, which lives inside the other shell. */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        <Route path="/" element={<PublicHome />} />

        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="leads" element={<LeadListPage />} />
          {/* Before "leads/:id" so "trash" is never read as a lead id. */}
          <Route path="leads/trash" element={<LeadTrashPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route path="capacity-calculator" element={<CapacityCalculatorPage />} />
          <Route path="catalog" element={<ProductListPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="inventory" element={<InventoryListPage />} />
          <Route path="sales" element={<SaleListPage />} />
          <Route path="quotations" element={<QuotationListPage />} />
          <Route path="activity" element={<ActivityFeedPage />} />
          <Route path="reports" element={<ReportsPage />} />
          {/* SRS 3.5 — every role has this; the server scopes it to them. */}
          <Route path="my-performance" element={<MyPerformancePage />} />
          <Route path="attendance" element={<AttendanceAdminPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="users" element={<UsersPage />} />
          {/* Inside the shell, so a wrong URL still leaves you somewhere you
              can navigate from rather than on a bare page. */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Unauthenticated and unknown: RequireAuth sends them to /login, which
            is the honest answer for someone not signed in. */}
        <Route
          path="*"
          element={
            <RequireAuth>
              <Navigate to="/dashboard" replace />
            </RequireAuth>
          }
        />
      </Routes>
    </Suspense>
  );
}
