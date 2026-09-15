"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CommonUIProvider from "@/components/auth/CommonUIProvider";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { PASSWORD_MIN_LENGTH } from "@/utils/constants";
import { createClient } from "@/utils/supabase/client";

export default function Page() {
  const router = useRouter();
  const updatePassword = useAuthStore((s) => s.updatePassword);
  const status = useAuthStore((s) => s.status);

  const [checkingSession, setCheckingSession] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/auth/forget-password");
      } else {
        setCheckingSession(false);
      }
    });
  }, [router]);

  const handleResetPassword = async () => {
    setFormError("");
    let hasError = false;

    if (!password) {
      setPasswordError("Password is required.");
      hasError = true;
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      setPasswordError(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
      );
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (!confirmPassword) {
      setConfirmError("Please confirm your password.");
      hasError = true;
    } else if (password && confirmPassword !== password) {
      setConfirmError("Passwords do not match.");
      hasError = true;
    } else {
      setConfirmError("");
    }

    if (hasError) return;

    const result = await updatePassword(password);
    if (!result.success) {
      setFormError(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/projects"), 1200);
  };

  if (checkingSession) return null;

  return (
    <CommonUIProvider>
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-80 h-max flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              Reset Password?
            </h1>
            <p className="text-sm font-medium text-zinc-500">
              Set a new password.
            </p>
          </div>

          {done ? (
            <p className="text-sm font-medium text-zinc-500">
              Password updated. Redirecting...
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <Input
                  key="password-input"
                  label="New Password"
                  placeholder="••••••••"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  error={passwordError}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                />
                <Input
                  key="confirm-password-input"
                  label="Confirm Password"
                  placeholder="••••••••"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  error={confirmError}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmError) setConfirmError("");
                  }}
                />
              </div>

              {formError && (
                <p className="text-sm font-medium text-red-500 -mt-4">
                  {formError}
                </p>
              )}

              <Button
                title={status === "loading" ? "Updating..." : "Reset Password"}
                size={"md"}
                fullWidth
                disabled={status === "loading"}
                onClick={handleResetPassword}
              />
            </>
          )}

          <p className="text-sm font-medium text-zinc-500 text-center">
            Have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-zinc-900 underline dark:text-zinc-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </CommonUIProvider>
  );
}
