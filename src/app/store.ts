import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/modules/auth/authSlice";
import adminReducer from "@/modules/admin/adminSlice";

/**
 * Two independent auth slices, and they never merge.
 *
 * `auth` is a tenant employee signed into their own company's CRM, persisted to
 * localStorage. `admin` is the platform console, persisted to sessionStorage
 * because its token reaches every tenant (see adminSlice.ts). Signing out of one
 * has no effect on the other, which is correct: they are different accounts
 * against different secrets, and one person may legitimately hold both.
 */
export const store = configureStore({
  reducer: { auth: authReducer, admin: adminReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
