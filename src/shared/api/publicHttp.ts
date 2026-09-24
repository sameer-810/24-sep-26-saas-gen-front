import axios from "axios";

/**
 * A bare client for the public marketing site. No auth interceptor on purpose:
 * a visitor has no token, and a 401 here must never bounce anyone to /login.
 */
export const publicHttp = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5003/api"}/public`,
  timeout: 20000,
});
