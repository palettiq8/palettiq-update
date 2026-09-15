"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthSocialButtons from "@/components/auth/AuthSocialButtons";
import CommonUIProvider from "@/components/auth/CommonUIProvider";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import {
  EMAIL_REGEX,
  PASSWORD_MIN_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_REGEX,
} from "@/utils/constants";

export default function Page() {
  const router = useRouter();
  const signUp = useAuthStore((s) => s.signUp);
  const status = useAuthStore((s) => s.status);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);

  const validate = () => {
    let ok = true;

    if (!username.trim()) {
      setUsernameError("Username is required.");
      ok = false;
    } else if (
      username.length < USERNAME_MIN_LENGTH ||
      username.length > USERNAME_MAX_LENGTH ||
      !USERNAME_REGEX.test(username)
    ) {
      setUsernameError(
        `${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters, letters/numbers/underscore only.`,
      );
      ok = false;
    } else {
      setUsernameError("");
    }

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
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      setPasswordError(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
      );
      ok = false;
    } else {
      setPasswordError("");
    }

    return ok;
  };

  const handleSignUp = async () => {
    setFormError("");
    if (!validate()) return;

    const result = await signUp(email.trim(), password, username.trim());
    if (!result.success) {
      setFormError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    if (result.needsEmailConfirmation) {
      setConfirmationSent(true);
    } else {
      router.push("/projects");
    }
  };

  return (
    <CommonUIProvider>
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-80 h-max flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              Join Today
            </h1>
            <p className="text-sm font-medium text-zinc-500">
              Create a new account to get started.
            </p>
          </div>

          {confirmationSent ? (
            <p className="text-sm font-medium text-zinc-500">
              We've sent a confirmation link to <strong>{email}</strong>. Please
              verify your email to continue.
            </p>
          ) : (
            <>
              <AuthSocialButtons />
              <div className="flex flex-col gap-3">
                <Input
                  label="Username"
                  placeholder="ahnaf_dev"
                  type="text"
                  autoComplete="username"
                  value={username}
                  error={usernameError}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (usernameError) setUsernameError("");
                  }}
                />
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
                  autoComplete="new-password"
                  value={password}
                  error={passwordError}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                />
              </div>

              {formError && (
                <p className="text-sm font-medium text-red-500 -mt-4">
                  {formError}
                </p>
              )}

              <Button
                title={status === "loading" ? "Creating account..." : "Sign Up"}
                size={"md"}
                fullWidth
                disabled={status === "loading"}
                onClick={handleSignUp}
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
