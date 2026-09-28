"use client";

import { Button } from "@/components/ui/Button";
import DropdownMenu from "@/components/ui/DropdownMenu";
import IconButtonGroup from "@/components/ui/IconButtonGroup";
import { ChevronDown, FolderOpen, LayoutGrid, List, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import CreateProjectModal from "@/components/global/CreateProjectModal";
import EmptyState from "@/components/ui/EmptyState";
import { createClient } from "@/utils/supabase/client";
import { Project } from "@/utils/types";
import { Spinner } from "@/components/ui/Spinner";
import { mapProjectRow } from "@/lib/utils";

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
                  className={`flex flex-col gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-150 cursor-pointer ${project.pending ? "opacity-60" : ""
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate flex items-center gap-2">
                      {project.pending && (
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                      )}
                      {project.name}
                    </h3>
                    <span className="text-xs font-medium text-zinc-500 capitalize shrink-0 ml-2">
                      {project.metadata?.status}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className={`flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors duration-150 cursor-pointer ${project.pending ? "opacity-60" : ""
                    }`}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate flex items-center gap-2">
                      {project.pending && (
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                      )}
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-medium text-zinc-500 capitalize shrink-0">
                    {project.metadata?.status}
                  </span>
                </div>
              ))}
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


// ) : view === "grid" ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {filteredProjects.map((project) => (
//                 <div
//                   key={project.id}
//                   className={`flex flex-col gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-150 cursor-pointer ${project.pending ? "opacity-60" : ""
//                     }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate flex items-center gap-2">
//                       {project.pending && (
//                         <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
//                       )}
//                       {project.name}
//                     </h3>
//                     <span className="text-xs font-medium text-zinc-500 capitalize shrink-0 ml-2">
//                       {project.metadata?.status}
//                     </span>
//                   </div>
//                   {project.description && (
//                     <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
//                       {project.description}
//                     </p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
//               {filteredProjects.map((project) => (
//                 <div
//                   key={project.id}
//                   className={`flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors duration-150 cursor-pointer ${project.pending ? "opacity-60" : ""
//                     }`}
//                 >
//                   <div className="flex flex-col gap-0.5 min-w-0">
//                     <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate flex items-center gap-2">
//                       {project.pending && (
//                         <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
//                       )}
//                       {project.name}
//                     </h3>
//                     {project.description && (
//                       <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
//                         {project.description}
//                       </p>
//                     )}
//                   </div>
//                   <span className="text-xs font-medium text-zinc-500 capitalize shrink-0">
//                     {project.metadata?.status}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           )}
// akhon project display ui change korte hobe, aita akdom just akta basic hoise.

// List view a table er moto hobe, column and row hisebe. thead er tr er moddhe th gulo hobe, PROJECT, DESCRIPTION, STATUS, CREATED, and aro akta extra item thakbe seta hobe more tobe more er jonno shudhu prottekta row er seshe icon button thakbe sekhane akta menu hobe (more menu ta amra pore desingn korbo) th gula uppercase hobe and font-mono hobe.  