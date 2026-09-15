"use client";

import { Button } from "@/components/ui/Button";
import DropdownMenu from "@/components/ui/DropdownMenu";
import IconButtonGroup from "@/components/ui/IconButtonGroup";
import { ChevronDown, FolderOpen, LayoutGrid, List, Plus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CreateProjectModal from "@/components/global/CreateProjectModal";
import EmptyState from "@/components/ui/EmptyState";

export default function page() {
  const [status, setStatus] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "grid">("list");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const input = searchInputRef.current;
      if (!input) return;

      if (e.key === "/" && document.activeElement !== input) {
        const target = e.target as HTMLElement;
        const isTyping =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;

        if (!isTyping) {
          e.preventDefault();
          input.focus();
        }
      }

      if (e.key === "Escape" && document.activeElement === input) {
        input.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full h-max px-3">
      <div className="max-w-6xl mx-auto py-12">
        <div className="w-full flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Projects
          </h1>
        </div>
        <div className="w-full flex items-center gap-2 mt-8">
          <div className="relative w-full">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search Projects"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="text-sm font-medium placeholder:text-zinc-500 text-zinc-900 dark:text-zinc-50 w-full h-9 px-9 outline-none border border-zinc-200 rounded-lg dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-3 focus:ring-zinc-200 focus:border-zinc-300 dark:focus:ring-zinc-700 dark:focus:border-zinc-600 duration-200 leading-none"
            />
            <Search
              size={16}
              className="text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2"
            />
            <kbd className="absolute top-1.75 right-1.75 text-zinc-500 border border-zinc-200 dark:border-zinc-800 h-5.5 min-w-5.5 px-1 grid text-sm place-content-center rounded-sm select-none">
              {isSearchFocused ? "Esc" : "/"}
            </kbd>
          </div>
          <DropdownMenu
            trigger={
              <Button
                icon={ChevronDown}
                title="Status"
                iconPosition="right"
                variant={"outline"}
              />
            }
            sections={[
              {
                type: "radio",
                value: status,
                onValueChange: setStatus,
                options: [
                  { label: "Running", value: "running" },
                  { label: "Completed", value: "completed" },
                  { label: "Draft", value: "draft" },
                  { label: "Archived", value: "archived" },
                ],
              },
            ]}
          />
          <IconButtonGroup
            items={[
              {
                icon: List,
                active: view === "list",
                onClick: () => setView("list"),
                "aria-label": "List view",
              },
              {
                icon: LayoutGrid,
                active: view === "grid",
                onClick: () => setView("grid"),
                "aria-label": "Grid view",
              },
            ]}
          />
          <Button
            title="Create Project"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          />
        </div>
        <div className="w-full h-100 mt-8">
          <EmptyState
            icon={FolderOpen}
            title="No projects yet"
            description="Create your first project to get started."
          />
        </div>
      </div>
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
