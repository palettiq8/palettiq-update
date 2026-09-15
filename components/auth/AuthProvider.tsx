"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

function mapSupabaseUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, any>;
}) {
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

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useAuthStore((s) => s.setUser);
  const lastSyncedAvatar = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();

    const syncAvatarIfNeeded = async (
      userId: string,
      avatarUrl: string | null,
    ) => {
      if (!avatarUrl) return;
      if (lastSyncedAvatar.current === avatarUrl) return;

      lastSyncedAvatar.current = avatarUrl;
      const { error } = await supabase
        .from("users")
        .update({ avatar_url: avatarUrl })
        .eq("id", userId);

      if (error) {
        console.error("Failed to sync avatar_url:", error.message);
      }
    };

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setUser(null);
        return;
      }
      const mapped = mapSupabaseUser(data.user);
      setUser(mapped);
      syncAvatarIfNeeded(data.user.id, mapped.avatarUrl);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        lastSyncedAvatar.current = undefined;
        return;
      }
      const mapped = mapSupabaseUser(session.user);
      setUser(mapped);
      syncAvatarIfNeeded(session.user.id, mapped.avatarUrl);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return <>{children}</>;
}
