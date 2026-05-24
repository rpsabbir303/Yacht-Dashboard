import { useCallback } from "react";

const KEY = "meridian.admin.lastEmail";

/**
 * Tiny localStorage helper for the "Remember me" sign-in flag. We only ever
 * persist the email address — never the password — so the user can return to a
 * pre-filled form on the same device without sacrificing security.
 */
export const useRememberMe = () => {
  const read = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  }, []);

  const save = useCallback((email: string) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(KEY, email);
    } catch {
      /* private mode — silently ignore */
    }
  }, []);

  const clear = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* noop */
    }
  }, []);

  return { read, save, clear };
};
