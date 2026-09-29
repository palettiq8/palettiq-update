"use client";

import { Button } from "@/components/ui/Button";
import DropdownMenu from "@/components/ui/DropdownMenu";
import IconButtonGroup from "@/components/ui/IconButtonGroup";
import {
  ChevronDown,
  FolderOpen,
  LayoutGrid,
  List,
  Plus,
  Search,
  MoreHorizontal,
  Settings,
  Trash,
  Share,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import CreateProjectModal from "@/components/global/CreateProjectModal";
import EmptyState from "@/components/ui/EmptyState";
import { createClient } from "@/utils/supabase/client";
import { Project } from "@/utils/types";
import { Spinner } from "@/components/ui/Spinner";
import { mapProjectRow } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  draft:
    "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400",
  running: "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400",
  completed:
    "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
  archived: "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400",
};

export default function page() {
  const [status, setStatus] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "grid">("list");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

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

  useEffect(() => {
    fetchProjects();
  }, [supabase]);

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

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesStatus = status ? project.metadata?.status === status : true;
      const matchesSearch = searchQuery.trim()
        ? project.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [projects, status, searchQuery]);

  const handleOptimisticCreate = (tempProject: Project) => {
    setProjects((prev) => [tempProject, ...prev]);
  };

  const handleCreateSuccess = (tempId: string, project: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === tempId ? project : p)));
  };

  const handleCreateError = (tempId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== tempId));
  };

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

        <div className="w-full mt-8">
          {isLoading ? (
            <div className="w-full h-100 flex items-center justify-center">
              <Spinner className="text-zinc-900 dark:text-zinc-50" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="w-full h-100">
              <EmptyState
                icon={FolderOpen}
                title="No projects yet"
                description="Create your first project to get started."
              />
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className={`flex flex-col gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors duration-150 cursor-pointer ${
                    project.pending ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate flex items-center gap-2 min-w-0">
                      {project.pending && (
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                      )}
                      <span className="truncate">{project.name}</span>
                    </h3>
                    <DropdownMenu
                      trigger={
                        <Button
                          icon={MoreHorizontal}
                          variant="outline"
                          size="sm"
                        />
                      }
                      sections={[
                        {
                          items: [
                            {
                              label: "Share",
                              icon: Share,
                              onClick: () => {},
                            },
                            {
                              label: "Settings",
                              icon: Settings,
                              onClick: () => {},
                            },
                          ],
                        },
                        {
                          items: [
                            {
                              label: "Delete",
                              icon: Trash,
                              variant: "destructive",
                              onClick: () => {},
                            },
                          ],
                        },
                      ]}
                    />
                  </div>
                  {project.description && (
                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium capitalize ${
                        STATUS_STYLES[project.metadata?.status ?? ""]
                      }`}
                    >
                      {project.metadata?.status}
                    </span>
                    <span className="text-xs font-medium text-zinc-900 dark:text-zinc-50">
                      {project.createdAt
                        ? new Date(project.createdAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                    <th className="text-left px-4 py-3 text-xs font-semibold font-mono uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Project
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold font-mono uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Description
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold font-mono uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold font-mono uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Created
                    </th>
                    <th className="w-10 px-4 py-3 bg-zinc-50 dark:bg-zinc-800"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr
                      key={project.id}
                      className={`bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 last:border-b-0 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors duration-150 ${
                        project.pending ? "opacity-60" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          {project.pending && (
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                          )}
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                            {project.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-64">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate block">
                          {project.description || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium capitalize ${
                            STATUS_STYLES[project.metadata?.status ?? ""]
                          }`}
                        >
                          {project.metadata?.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-zinc-900 dark:text-zinc-50">
                        {project.createdAt
                          ? new Date(project.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu
                          trigger={
                            <Button
                              icon={MoreHorizontal}
                              variant="outline"
                              size="sm"
                            />
                          }
                          sections={[
                            {
                              items: [
                                {
                                  label: "Share",
                                  icon: Share,
                                  onClick: () => {},
                                },
                                {
                                  label: "Settings",
                                  icon: Settings,
                                  onClick: () => {},
                                },
                              ],
                            },
                            {
                              items: [
                                {
                                  label: "Delete",
                                  icon: Trash,
                                  variant: "destructive",
                                  onClick: () => {},
                                },
                              ],
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOptimisticCreate={handleOptimisticCreate}
        onCreateSuccess={handleCreateSuccess}
        onCreateError={handleCreateError}
      />
    </div>
  );
}
