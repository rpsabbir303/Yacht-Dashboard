import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { ACCESS_TOKEN_KEY, SESSION_USER_KEY } from "@utils/constants";
import type { AuthSession, User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: "idle" | "authenticating" | "authenticated" | "unauthenticated";
  error?: string | null;
}

const persistedToken =
  typeof window !== "undefined"
    ? localStorage.getItem(ACCESS_TOKEN_KEY)
    : null;

const persistedUser = ((): User | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
})();

const initialState: AuthState = {
  user: persistedUser,
  accessToken: persistedToken,
  status: persistedToken ? "authenticated" : "unauthenticated",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<AuthSession>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.status = "authenticated";
      state.error = null;
      localStorage.setItem(ACCESS_TOKEN_KEY, action.payload.accessToken);
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(action.payload.user));
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(action.payload));
    },
    setAuthStatus: (state, action: PayloadAction<AuthState["status"]>) => {
      state.status = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.status = "unauthenticated";
      state.error = null;
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(SESSION_USER_KEY);
    },
  },
});

export const { setSession, setUser, setAuthStatus, setAuthError, logout } =
  authSlice.actions;
export default authSlice.reducer;
