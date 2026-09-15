"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CommonUIProvider from "@/components/auth/CommonUIProvider";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { EMAIL_REGEX } from "@/utils/constants";

export default function Page() {
  const router = useRouter();
  const sendPasswordResetOtp = useAuthStore((s) => s.sendPasswordResetOtp);
  const verifyPasswordResetOtp = useAuthStore((s) => s.verifyPasswordResetOtp);
  const status = useAuthStore((s) => s.status);

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");

  const handleSendCode = async () => {
    if (!email.trim()) {
      setEmailError("Email is required.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError("");

    await sendPasswordResetOtp(email.trim());
    setStep("code");
  };

  const handleConfirmCode = async () => {
    if (!code.trim()) {
      setCodeError("Enter the code we sent you.");
      return;
    }
    setCodeError("");

    const result = await verifyPasswordResetOtp(email.trim(), code.trim());
    if (!result.success) {
      setCodeError(result.error ?? "Invalid or expired code.");
      return;
    }

    router.push("/auth/reset-password");
  };

  return (
    <CommonUIProvider>
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-80 h-max flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              Forget Password?
            </h1>
            <p className="text-sm font-medium text-zinc-500">
              {step === "email"
                ? "Enter your email to receive a reset code."
                : `If an account exists for ${email}, we've sent a code. Enter it below.`}
            </p>
          </div>

          {step === "email" ? (
            <>
              <div className="flex flex-col gap-3">
                <Input
                  key="email-input"
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
              </div>
              <Button
                title={status === "loading" ? "Sending..." : "Send Code"}
                size={"md"}
                fullWidth
                disabled={status === "loading"}
                onClick={handleSendCode}
              />
            </>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <Input
                  key="code-input"
                  label="Reset Code"
                  placeholder="482913"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  value={code}
                  error={codeError}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ""));
                    if (codeError) setCodeError("");
                  }}
                />
              </div>
              <Button
                title={status === "loading" ? "Verifying..." : "Confirm Code"}
                size={"md"}
                fullWidth
                disabled={status === "loading"}
                onClick={handleConfirmCode}
              />
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors -mt-4 hover:underline cursor-pointer"
              >
                Wrong email? Go back
              </button>
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
