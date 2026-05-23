import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { logout, setSession } from "@redux/slices/authSlice";
import { useLoginMutation } from "@services/baseApi";
import type { LoginPayload } from "@/types";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loginMutation, { isLoading }] = useLoginMutation();

  const { user, accessToken, status, error } = useAppSelector((s) => s.auth);

  const signIn = useCallback(
    async (payload: LoginPayload) => {
      const session = await loginMutation(payload).unwrap();
      dispatch(setSession(session));
      navigate("/dashboard", { replace: true });
      return session;
    },
    [dispatch, loginMutation, navigate],
  );

  const signOut = useCallback(() => {
    dispatch(logout());
    navigate("/login", { replace: true });
  }, [dispatch, navigate]);

  return {
    user,
    accessToken,
    status,
    error,
    isAuthenticated: status === "authenticated" && !!user,
    isAuthenticating: isLoading,
    signIn,
    signOut,
  };
};
