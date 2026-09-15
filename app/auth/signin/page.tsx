"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthSocialButtons from "@/components/auth/AuthSocialButtons";
import CommonUIProvider from "@/components/auth/CommonUIProvider";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { EMAIL_REGEX } from "@/utils/constants";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signIn = useAuthStore((s) => s.signIn);
  const status = useAuthStore((s) => s.status);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");

  const validate = () => {
    let ok = true;
    if (!email.trim()) {
      setEmailError("Email is required.");
      ok = false;
    } else if (!EMAIL_REGEX.test(email)) {
      setEmailError("Enter a valid email address.");
      ok = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required.");
      ok = false;
    } else {
      setPasswordError("");
    }
    return ok;
  };

  const handleSignIn = async () => {
    setFormError("");
    if (!validate()) return;

    const result = await signIn(email.trim(), password);
    if (!result.success) {
      setFormError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    const redirectedFrom = searchParams.get("redirectedFrom");
    router.push(redirectedFrom || "/projects");
  };

  return (
    <CommonUIProvider>
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-80 h-max flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              Welcome Back
            </h1>
            <p className="text-sm font-medium text-zinc-500">
              Sign in to continue where you left off.
            </p>
          </div>
          <AuthSocialButtons />
          <div className="flex flex-col gap-3">
            <Input
              label="Email"
              placeholder="test@gmail.com"
              type="email"
              autoComplete="email"
              value={email}
              error={emailError}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
            />
            <Input
              label="Password"
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
              value={password}
              error={passwordError}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
            />
          </div>

          <div className="flex items-center justify-end -mt-5">
            <Link
              href="/auth/forget-password"
              className="text-xs font-medium text-zinc-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {formError && (
            <p className="text-sm font-medium text-red-500 -mt-4">
              {formError}
            </p>
          )}

          <Button
            title={status === "loading" ? "Signing in..." : "Sign In"}
            size={"md"}
            fullWidth
            disabled={status === "loading"}
            onClick={handleSignIn}
          />
          <p className="text-sm font-medium text-zinc-500 text-center">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-zinc-900 underline dark:text-zinc-400"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </CommonUIProvider>
  );
}
