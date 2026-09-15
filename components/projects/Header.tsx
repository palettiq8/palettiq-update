"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Menu,
  Settings,
  CreditCard,
  Palette,
  HelpCircle,
  LogOut,
  User2,
  Keyboard,
  Sparkles,
} from "lucide-react";
import DropdownWrapper from "../ui/DropdownWrapper";
import DropdownMenu from "../ui/DropdownMenu";
import { Theme, useGlobalState } from "@/store/useGlobalStore";
import ThemeToggle from "../global/ToggleTheme";
import UserAvatar from "../auth/UserAvatar";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthUser } from "@/utils/types";

export default function Header({ user }: { user: AuthUser }) {
  const router = useRouter();
  const theme = useGlobalState((state) => state.theme);
  const setTheme = useGlobalState((state) => state.setTheme);
  const signOut = useAuthStore((s) => s.signOut);

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/signin");
  };

  return (
    <div className="w-full flex items-center justify-between h-12 px-3 bg-zinc-50/70 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 left-0 backdrop-blur-lg z-10">
      <div className="flex items-center gap-2">
        <Button
          icon={Menu}
          variant={"outline"}
          size={"sm"}
          className="hidden"
        />
        <div className="flex items-center gap-1">
          <Button
            icon={ChevronLeft}
            variant={"outline"}
            size={"sm"}
            onClick={() => router.back()}
          />
          <Button
            icon={ChevronRight}
            variant={"outline"}
            size={"sm"}
            onClick={() => router.forward()}
          />
        </div>
        <Link href={"/"} className="flex items-center gap-2">
          <Image src={"/logo.svg"} height={25} width={25} alt="Palettiq Logo" />
        </Link>
        <DropdownWrapper
          trigger={
            <Button
              variant={"ghost"}
              title="All Projects"
              icon={ChevronsUpDown}
              iconPosition="right"
              size={"sm"}
              className="data-[state=open]:bg-zinc-200/50 dark:data-[state=open]:bg-zinc-700/70"
            />
          }
        >
          <div className="w-96 h-96"></div>
        </DropdownWrapper>
      </div>
      <div className="flex items-center gap-2">
        <Button
          title="Upgrade"
          icon={Sparkles}
          size={"sm"}
          variant={"outline"}
        />
        <ThemeToggle />
        <DropdownMenu
          trigger={
            <button
              className="cursor-pointer select-none flex items-center"
              aria-label="Account menu"
            >
              <UserAvatar user={user} size={28} />
            </button>
          }
          header={
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {user.username ?? "User"}
              </span>
              <span className="text-xs font-medium text-zinc-500">
                {user.email}
              </span>
            </div>
          }
          sections={[
            {
              items: [
                { label: "Profile", icon: User2, onClick: () => {} },
                { label: "Billing", icon: CreditCard, onClick: () => {} },
                {
                  label: "Appearance",
                  icon: Palette,
                  children: [
                    {
                      type: "radio",
                      value: theme,
                      onValueChange: (value) => {
                        if (value) setTheme(value as Theme);
                      },
                      options: [
                        { label: "Light", value: "light" },
                        { label: "Dark", value: "dark" },
                        { label: "System", value: "system" },
                      ],
                    },
                  ],
                },
                {
                  label: "Keyboard Shortcuts",
                  icon: Keyboard,
                  onClick: () => {},
                },
              ],
            },
            {
              items: [
                { label: "Settings", icon: Settings, onClick: () => {} },
                {
                  label: "Help & Support",
                  icon: HelpCircle,
                  onClick: () => {},
                },
              ],
            },
            {
              items: [
                {
                  label: "Log out",
                  icon: LogOut,
                  variant: "destructive",
                  onClick: handleLogout,
                },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
}
