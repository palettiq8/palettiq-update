"use client";

import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";
import type { AuthUser, AuthStatus, OAuthProvider } from "@/utils/types";
import { AUTH_REDIRECT_PATH } from "@/utils/constants";

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;

  setUser: (user: AuthUser | null) => void;
  clearError: () => void;

  signUp: (
    email: string,
    password: string,
    username: string,
  ) => Promise<{
    success: boolean;
    needsEmailConfirmation?: boolean;
    error?: string;
  }>;

  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;

  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;

  sendPasswordResetOtp: (
    email: string,
  ) => Promise<{ success: boolean; error?: string }>;
  verifyPasswordResetOtp: (
    email: string,
    token: string,
  ) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (
    newPassword: string,
  ) => Promise<{ success: boolean; error?: string }>;

  updateUsername: (
    newUsername: string,
  ) => Promise<{ success: boolean; error?: string }>;
  updateEmail: (newEmail: string) => Promise<{
    success: boolean;
    error?: string;
    needsConfirmation?: boolean;
  }>;
  updateProfile: (fields: {
    bio?: string;
    avatarUrl?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

function mapAuthUser(user: any): AuthUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? "",
    username:
      user.user_metadata?.username ??
      user.user_metadata?.user_name ??
      user.user_metadata?.preferred_username ??
      null,
    avatarUrl: user.user_metadata?.avatar_url ?? null,
  };
}

export const useAuthStore = create<AuthState>((set, get) => {
  const supabase = createClient();

  return {
    user: null,
    status: "idle",
    error: null,

    setUser: (user) =>
      set({ user, status: user ? "authenticated" : "unauthenticated" }),
    clearError: () => set({ error: null }),

    signUp: async (email, password, username) => {
      set({ status: "loading", error: null });

      const { data: available } = await supabase.rpc("is_username_available", {
        p_username: username,
      });
      if (available === false) {
        const msg = "This username is already taken.";
        set({ status: "idle", error: msg });
        return { success: false, error: msg };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/projects`,
        },
      });

      if (error) {
        const raw = error.message.toLowerCase();
        const isDuplicateEmail =
          raw.includes("already registered") ||
          raw.includes("already exists") ||
          (error as any).code === "user_already_exists";

        const message = isDuplicateEmail
          ? "An account with this email already exists. Try signing in instead, or use one of the social options above if that's how you originally signed up."
          : error.message;

        set({ status: "unauthenticated", error: message });
        return { success: false, error: message };
      }
      if (data.user && data.user.identities?.length === 0) {
        const message =
          "An account with this email already exists. Try signing in instead, or use one of the social options above if that's how you originally signed up.";
        set({ status: "unauthenticated", error: message });
        return { success: false, error: message };
      }

      const needsEmailConfirmation = !data.session;
      set({
        user: mapAuthUser(data.user),
        status: data.session ? "authenticated" : "unauthenticated",
      });
      return { success: true, needsEmailConfirmation };
    },

    signIn: async (email, password) => {
      set({ status: "loading", error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const msg = "Invalid email or password.";
        set({ status: "unauthenticated", error: msg });
        return { success: false, error: msg };
      }

      set({ user: mapAuthUser(data.user), status: "authenticated" });
      return { success: true };
    },

    signInWithOAuth: async (provider) => {
      set({ status: "loading", error: null });
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${AUTH_REDIRECT_PATH}`,
        },
      });
      if (error) set({ status: "unauthenticated", error: error.message });
    },

    signOut: async () => {
      set({ status: "loading" });
      await supabase.auth.signOut();
      set({ user: null, status: "unauthenticated" });
    },

    sendPasswordResetOtp: async (email) => {
      set({ status: "loading", error: null });
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      set({ status: "idle" });
      if (error) {
        set({ error: error.message });
        return { success: false, error: error.message };
      }
      return { success: true };
    },

    verifyPasswordResetOtp: async (email, token) => {
      set({ status: "loading", error: null });
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "recovery",
      });
      if (error) {
        const msg = "Invalid or expired code.";
        set({ status: "unauthenticated", error: msg });
        return { success: false, error: msg };
      }
      set({ user: mapAuthUser(data.user), status: "authenticated" });
      return { success: true };
    },

    updatePassword: async (newPassword) => {
      set({ status: "loading", error: null });
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        set({ error: error.message });
        return { success: false, error: error.message };
      }
      set({ status: "authenticated" });
      return { success: true };
    },

    updateUsername: async (newUsername) => {
      set({ status: "loading", error: null });

      const { data: available } = await supabase.rpc("is_username_available", {
        p_username: newUsername,
      });
      if (available === false) {
        const msg = "This username is already taken.";
        set({ status: "authenticated", error: msg });
        return { success: false, error: msg };
      }

      const { data, error } = await supabase.auth.updateUser({
        data: { username: newUsername },
      });

      if (error) {
        set({ status: "authenticated", error: error.message });
        return { success: false, error: error.message };
      }

      set({ user: mapAuthUser(data.user), status: "authenticated" });
      return { success: true };
    },

    updateEmail: async (newEmail) => {
      set({ status: "loading", error: null });

      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) {
        set({ status: "authenticated", error: error.message });
        return { success: false, error: error.message };
      }

      set({ status: "authenticated" });
      return { success: true, needsConfirmation: true };
    },

    updateProfile: async (fields) => {
      set({ status: "loading", error: null });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const msg = "You must be signed in to update your profile.";
        set({ status: "unauthenticated", error: msg });
        return { success: false, error: msg };
      }

      const { error } = await supabase
        .from("users")
        .update({
          ...(fields.bio !== undefined && { bio: fields.bio }),
          ...(fields.avatarUrl !== undefined && {
            avatar_url: fields.avatarUrl,
          }),
        })
        .eq("id", user.id);

      if (error) {
        set({ status: "authenticated", error: error.message });
        return { success: false, error: error.message };
      }

      set((s) => ({
        status: "authenticated",
        user: s.user ? { ...s.user, ...fields } : s.user,
      }));
      return { success: true };
    },
  };
});
