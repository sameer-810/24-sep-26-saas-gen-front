import axios from "axios";
import { store } from "@/app/store";
import { clearAdminAuth, setAdminTokens } from "@/modules/admin/adminSlice";

/**
 * A SEPARATE axios instance for the platform console.
 *
 * It does not share `http` and must not start to. The two carry different
 * tokens signed with different secrets, and a single client with one
 * interceptor is one `if` away from putting an admin token on a tenant request
 * — or, worse, clearing a signed-in customer's session because a console call
 * happened to 401.
 */
export const adminHttp = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5003/api"}/admin`,
  timeout: 20000,
});

adminHttp.interceptors.request.use((config) => {
  const token = store.getState().admin.accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Refresh once, then give up.
 *
 * The console's access token is short-lived (30 minutes by default), and an
 * admin halfway through editing a tenant should not be dropped at the login
 * screen for crossing that boundary. `_retried` makes it exactly one attempt:
 * a refresh endpoint that itself 401s means the refresh token is dead too, and
 * retrying that in a loop is how a browser tab starts hammering an API.
 */
type RetriableConfig = { _retried?: boolean } & Parameters<typeof adminHttp.request>[0];

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = store.getState().admin.refreshToken;
  if (!refreshToken) return null;

  try {
    // A bare axios call, not adminHttp: going back through this instance would
    // attach the expired access token and re-enter this same interceptor.
    const { data } = await axios.post(`${adminHttp.defaults.baseURL}/auth/refresh`, {
      refreshToken,
    });
    const tokens = data?.data ?? data;
    if (!tokens?.accessToken) return null;
    store.dispatch(
      setAdminTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }),
    );
    return tokens.accessToken as string;
  } catch {
    return null;
  }
}

adminHttp.interceptors.response.use(
  (response) => response,
  async (err: unknown) => {
    if (!axios.isAxiosError(err) || err.response?.status !== 401) return Promise.reject(err);

    const config = err.config as RetriableConfig | undefined;
    const isAuthCall = String(config?.url || "").includes("/auth/");

    if (config && !config._retried && !isAuthCall) {
      config._retried = true;
      // Single-flight: ten parallel table requests hitting a stale token must
      // produce one refresh, not ten competing rotations of the same token.
      refreshing = refreshing ?? refreshAccessToken().finally(() => (refreshing = null));
      const token = await refreshing;
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
        return adminHttp.request(config);
      }
    }

    store.dispatch(clearAdminAuth());
    if (typeof window !== "undefined" && window.location.pathname !== "/admin/login") {
      window.location.assign("/admin/login");
    }
    return Promise.reject(err);
  },
);
