"use client";

import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/useAuthStore";
import { FaFigma, FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import type { OAuthProvider } from "@/utils/types";

export default function AuthSocialButtons() {
  const signInWithOAuth = useAuthStore((s) => s.signInWithOAuth);
  const status = useAuthStore((s) => s.status);

  const handleOAuth = (provider: OAuthProvider) => {
    signInWithOAuth(provider);
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant={"outline"}
        icon={FcGoogle}
        size={"md"}
        title="Continue with Google"
        fullWidth
        disabled={status === "loading"}
        onClick={() => handleOAuth("google")}
      />
      <Button
        variant={"outline"}
        icon={FaFigma}
        size={"md"}
        title="Continue with Figma"
        fullWidth
        disabled={status === "loading"}
        onClick={() => handleOAuth("figma")}
      />
      <Button
        variant={"outline"}
        icon={FaGithub}
        size={"md"}
        title="Continue with Github"
        fullWidth
        disabled={status === "loading"}
        onClick={() => handleOAuth("github")}
      />
      <div className="h-px bg-zinc-200 dark:bg-zinc-800 mt-6 flex items-center justify-center">
        <span className="w-6 h-6 text-zinc-900 dark:text-zinc-50 text-sm font-medium bg-zinc-50 flex items-center justify-center dark:bg-zinc-900 rounded-full">
          or
        </span>
      </div>
    </div>
  );
}
