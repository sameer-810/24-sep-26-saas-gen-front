import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type PlatformAdmin = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
};

type AdminAuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  admin: PlatformAdmin | null;
};

/**
 * sessionStorage, NOT localStorage — and this is the one place in the app where
 * that difference is deliberate.
 *
 * A tenant's token reaches one company's data. A platform-admin token reaches
 * every company's. Keeping it in sessionStorage means it dies with the tab
 * instead of sitting on disk until someone explicitly signs out, so a shared or
 * unattended machine does not leave the whole customer base one click away.
 *
 * The cost is real and accepted: closing the tab signs you out of the console.
 * For an account that can suspend a paying customer, that is the right trade.
 */
const STORAGE_KEY = "srf.admin.auth";

const EMPTY: AdminAuthState = { accessToken: null, refreshToken: null, admin: null };

function loadState(): AdminAuthState {
  try {
    /*
      Sweep away any copy an earlier build left in localStorage. Without this a
      token written before the sessionStorage decision would outlive it
      indefinitely — exactly the artefact this key exists to avoid.
    */
    localStorage.removeItem(STORAGE_KEY);

    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as AdminAuthState;
    return {
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
      admin: parsed.admin ?? null,
    };
  } catch {
    // Private windows and blocked site data throw rather than return null.
    return EMPTY;
  }
}

function persist(state: AdminAuthState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable: the console still works for this tab, in memory.
  }
}

const slice = createSlice({
  name: "admin",
  initialState: loadState(),
  reducers: {
    setAdminAuth(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string; admin: PlatformAdmin }>,
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.admin = action.payload.admin;
      persist(state);
    },
    /** Used by the refresh flow, which rotates both tokens. */
    setAdminTokens(state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      persist(state);
    },
    clearAdminAuth(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.admin = null;
      persist(state);
    },
  },
});

export const { setAdminAuth, setAdminTokens, clearAdminAuth } = slice.actions;
export default slice.reducer;
