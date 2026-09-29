"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  Search,
  Plus,
} from "lucide-react";
import DropdownWrapper from "../ui/DropdownWrapper";
import DropdownMenu from "../ui/DropdownMenu";
import { Spinner } from "../ui/Spinner";
import { Theme, useGlobalState } from "@/store/useGlobalStore";
import ThemeToggle from "../global/ToggleTheme";
import UserAvatar from "../auth/UserAvatar";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/utils/supabase/client";
import { mapProjectRow } from "@/lib/utils";
import type { AuthUser, Project } from "@/utils/types";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
const AVATAR_COLORS = [
  "bg-red-500/15 text-red-700 dark:bg-red-500/25 dark:text-red-300",
  "bg-orange-500/15 text-orange-700 dark:bg-orange-500/25 dark:text-orange-300",
  "bg-amber-500/15 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300",
  "bg-lime-500/15 text-lime-700 dark:bg-lime-500/25 dark:text-lime-300",
  "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300",
  "bg-teal-500/15 text-teal-700 dark:bg-teal-500/25 dark:text-teal-300",
  "bg-cyan-500/15 text-cyan-700 dark:bg-cyan-500/25 dark:text-cyan-300",
  "bg-blue-500/15 text-blue-700 dark:bg-blue-500/25 dark:text-blue-300",
  "bg-indigo-500/15 text-indigo-700 dark:bg-indigo-500/25 dark:text-indigo-300",
  "bg-violet-500/15 text-violet-700 dark:bg-violet-500/25 dark:text-violet-300",
  "bg-pink-500/15 text-pink-700 dark:bg-pink-500/25 dark:text-pink-300",
  "bg-rose-500/15 text-rose-700 dark:bg-rose-500/25 dark:text-rose-300",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Header({ user }: { user: AuthUser }) {
  const router = useRouter();
  const theme = useGlobalState((state) => state.theme);
  const setTheme = useGlobalState((state) => state.setTheme);
  const signOut = useAuthStore((s) => s.signOut);

  const supabase = useMemo(() => createClient(), []);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projectQuery, setProjectQuery] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProjects(data.map(mapProjectRow));
      }
      setIsLoading(false);
    };

    fetchProjects();
  }, [supabase]);

  const filteredProjects = useMemo(() => {
    const q = projectQuery.trim().toLowerCase();
    return q
      ? projects.filter((p) => p.name.toLowerCase().includes(q))
      : projects;
  }, [projects, projectQuery]);

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
          <div className="w-60 h-max">
            <div className="w-full relative">
              <input
                type="text"
                placeholder="Find Project..."
                data-autofocus
                value={projectQuery}
                onChange={(e) => setProjectQuery(e.target.value)}
                className="w-full border-b border-zinc-200 dark:border-zinc-700 outline-none h-10 pr-3 pl-9 text-zinc-900 dark:text-zinc-50 text-sm font-medium placeholder:text-zinc-400"
              />
              <Search
                size={16}
                className="text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2"
              />
            </div>

            <div className="w-full h-60 overflow-y-auto p-1.5 custom-scrollbar">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Spinner className="text-zinc-900 dark:text-zinc-50" />
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-sm font-medium text-zinc-500">
                  {projectQuery ? "No projects found" : "No projects yet"}
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {filteredProjects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => {
                        // TODO: router.push(`/projects/${project.id}`)
                      }}
                      className={`w-full flex items-center gap-2.5 px-1.5 py-1.5 rounded-lg text-left cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors duration-150 ${
                        project.pending ? "opacity-60" : ""
                      }`}
                    >
                      <span
                        className={`h-7 w-7 shrink-0 grid place-content-center rounded-md text-xs font-semibold select-none truncate ${getAvatarColor(
                          project.name,
                        )}`}
                      >
                        {getInitials(project.name)}
                      </span>
                      <span className="text-xs font-medium text-zinc-900 dark:text-zinc-50 truncate">
                        {project.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full p-1.5 border-t border-zinc-200 dark:border-zinc-700">
              <Button
                title="Create Project"
                icon={Plus}
                variant={"ghost"}
                className="flex items-center gap-2 justify-start w-full px-1.5"
              />
            </div>
          </div>
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
