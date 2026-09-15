import Image from "next/image";
import React from "react";
import BubbleAnimation from "./BubbleAnimation";
import Link from "next/link";

export default function AuthCommonUIProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen flex">
      <div className="w-1/2 min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-900 max-lg:w-full">
        <div className="w-full flex items-center justify-between h-20 px-8">
          <Link href={"/"}>
            <Image
              src={"/logo.svg"}
              height={25}
              width={25}
              alt="Palettiq Logo"
            />
          </Link>
        </div>
        <div className="flex-1 max-lg:px-4">{children}</div>
        <div className="w-full flex items-center justify-center h-25 px-8">
          <p className="text-xs font-medium text-zinc-500 text-center max-w-110">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              target="_blank"
              className="text-zinc-900 underline dark:text-zinc-400"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="text-zinc-900 underline dark:text-zinc-400"
            >
              Privacy Policy
            </Link>
            , and consent to receive updates, notifications, and occasional
            emails from Palettiq.
          </p>
        </div>
      </div>
      <div className="w-1/2 min-h-screen relative overflow-hidden border-l border-zinc-200 dark:border-zinc-800 max-lg:hidden">
        <Image
          src="/auth-illustration.png"
          alt="Color design illustration"
          fill
          sizes="(max-width: 768px) 0px, 50vw"
          priority
          className="object-cover"
        />
        <BubbleAnimation />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl" />
        <div className="absolute inset-0 grid place-content-center p-10"></div>
      </div>
    </div>
  );
}
