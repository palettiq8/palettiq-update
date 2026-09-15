"use client";

import Modal from "@/components/ui/Modal";
import { X, Globe, Lock, ChevronDown, Mail, Plus, Check } from "lucide-react";
import { Button } from "../ui/Button";
import Input from "../ui/Input";
import { useState, useRef, useEffect, useMemo } from "react";
import DropdownMenu from "../ui/DropdownMenu";
import PortalDropdown from "../ui/PortalDropdown";
import { createClient } from "@/utils/supabase/client";
import {
  ProjectPermission,
  ProjectVisibility,
  ProjectStatus,
} from "@/utils/types";
import { toast } from "@/lib/toast";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchUser = {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
};

type InvitedMember = {
  id: string;
  email: string;
  permission: ProjectPermission;
};

const INDUSTRY_OPTIONS = [
  "Software & Technology",
  "Finance & Banking",
  "Healthcare & Pharmaceuticals",
  "E-commerce & Retail",
  "Education",
  "Manufacturing",
  "Real Estate",
  "Media & Entertainment",
  "Telecommunications",
  "Transportation & Logistics",
  "Energy & Utilities",
  "Hospitality & Tourism",
  "Agriculture",
  "Government & Public Sector",
  "Non-profit",
  "Other",
];

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

export default function CreateProjectModal({
  isOpen,
  onClose,
}: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [projectNameError, setProjectNameError] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [visibility, setVisibility] = useState<ProjectVisibility>("public");
  const [status, setStatus] = useState<ProjectStatus>("running");

  const [isLoading, setIsLoading] = useState(false);

  const [industry, setIndustry] = useState("");
  const [isIndustryOpen, setIsIndustryOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const industryWrapperRef = useRef<HTMLDivElement>(null);
  const industryAnchorRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const supabase = useMemo(() => createClient(), []);

  const [inviteQuery, setInviteQuery] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteHighlightedIndex, setInviteHighlightedIndex] = useState(-1);
  const [inviteResults, setInviteResults] = useState<SearchUser[]>([]);
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState<InvitedMember[]>([]);

  const inviteWrapperRef = useRef<HTMLDivElement>(null);
  const inviteAnchorRef = useRef<HTMLDivElement>(null);
  const inviteInputRef = useRef<HTMLInputElement>(null);
  const inviteItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const filteredIndustries =
    industry.trim() === "" || isOtherSelected
      ? INDUSTRY_OPTIONS
      : INDUSTRY_OPTIONS.filter((item) =>
          item.toLowerCase().includes(industry.toLowerCase()),
        );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (
        industryWrapperRef.current &&
        !industryWrapperRef.current.contains(target) &&
        !target.closest("[data-portal-dropdown]")
      ) {
        setIsIndustryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (highlightedIndex < 0) return;
    itemRefs.current[highlightedIndex]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [highlightedIndex]);

  useEffect(() => {
    if (inviteQuery.trim() === "") {
      setInviteResults([]);
      return;
    }
    setIsSearchingMembers(true);
    const timeout = setTimeout(async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, username, email")
        .or(
          `name.ilike.%${inviteQuery}%,username.ilike.%${inviteQuery}%,email.ilike.%${inviteQuery}%`,
        )
        .limit(6);

      if (!error && data) {
        setInviteResults(
          data.filter((u) => !invitedMembers.some((m) => m.email === u.email)),
        );
        setInviteHighlightedIndex(-1);
      }
      setIsSearchingMembers(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [inviteQuery, invitedMembers, supabase]);

  useEffect(() => {
    function handleInviteClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (
        inviteWrapperRef.current &&
        !inviteWrapperRef.current.contains(target) &&
        !target.closest("[data-portal-dropdown]")
      ) {
        setIsInviteOpen(false);
      }
    }
    document.addEventListener("mousedown", handleInviteClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleInviteClickOutside);
  }, []);

  useEffect(() => {
    if (inviteHighlightedIndex < 0) return;
    inviteItemRefs.current[inviteHighlightedIndex]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [inviteHighlightedIndex]);

  const selectIndustry = (value: string) => {
    if (value === "Other") {
      setIsOtherSelected(true);
      setIndustry("");
      setIsIndustryOpen(false);
    } else {
      setIsOtherSelected(false);
      setIndustry(value);
      setIsIndustryOpen(false);
    }
  };

  const handleIndustryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isOtherSelected) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isIndustryOpen) {
        setIsIndustryOpen(true);
        return;
      }
      setHighlightedIndex((prev) =>
        prev < filteredIndustries.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (
        isIndustryOpen &&
        highlightedIndex >= 0 &&
        filteredIndustries[highlightedIndex]
      ) {
        selectIndustry(filteredIndustries[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsIndustryOpen(false);
    }
  };

  const selectMember = (user: SearchUser) => {
    setInviteQuery(user.email);
    setIsInviteOpen(false);
    setInviteHighlightedIndex(-1);
    inviteInputRef.current?.focus();
  };

  const addMemberFromInput = () => {
    const email = inviteQuery.trim();
    if (!email) return;
    if (
      invitedMembers.some((m) => m.email.toLowerCase() === email.toLowerCase())
    ) {
      setInviteQuery("");
      return;
    }
    setInvitedMembers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), email, permission: "read" },
    ]);
    setInviteQuery("");
    setIsInviteOpen(false);
    setInviteHighlightedIndex(-1);
  };

  const handleInviteAction = () => {
    if (
      isInviteOpen &&
      inviteHighlightedIndex >= 0 &&
      inviteResults[inviteHighlightedIndex]
    ) {
      selectMember(inviteResults[inviteHighlightedIndex]);
    } else {
      addMemberFromInput();
    }
  };

  const handleInviteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isInviteOpen) {
        setIsInviteOpen(true);
        return;
      }
      setInviteHighlightedIndex((prev) =>
        prev < inviteResults.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setInviteHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleInviteAction();
    } else if (e.key === "Escape") {
      setIsInviteOpen(false);
    }
  };

  const updateMemberPermission = (
    id: string,
    permission: ProjectPermission,
  ) => {
    setInvitedMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, permission } : m)),
    );
  };

  const removeMember = (id: string) => {
    setInvitedMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const resetForm = () => {
    setProjectName("");
    setProjectNameError("");
    setProjectDescription("");
    setVisibility("public");
    setStatus("running");
    setIndustry("");
    setIsIndustryOpen(false);
    setHighlightedIndex(-1);
    setIsOtherSelected(false);
    setInviteQuery("");
    setIsInviteOpen(false);
    setInviteHighlightedIndex(-1);
    setInviteResults([]);
    setInvitedMembers([]);
  };

  const createProjectHandler = async () => {
    setIsLoading(true);

    const project = {
      name: projectName,
      slug: projectName.split(" ").join("-").toLowerCase(),
      description: projectDescription,
      metadata: {
        industry,
        status,
        visibility,
        thumbnailUrl: "",
      },
    };

    try {
      const { error } = await supabase.from("projects").insert(project);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Project created successfully!", { duration: 1000000 });
      resetForm();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800 shrink-0">
        <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
          Create project
        </h2>
        <Button icon={X} variant={"ghost"} size={"sm"} onClick={onClose} />
      </div>

      <div className="p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
        <Input
          label="Project Name"
          placeholder="e.g. Digital Library"
          type="text"
          value={projectName}
          error={projectNameError}
          name="Project Name"
          onChange={(e) => {
            setProjectName(e.target.value);
            if (projectNameError) setProjectNameError("");
          }}
        />
        <div className="w-full flex flex-col gap-2">
          <label
            htmlFor="Project Description"
            className="text-sm font-medium text-gray-900 dark:text-zinc-50"
          >
            Description{" "}
            <span className="font-medium text-zinc-500">(optional)</span>
          </label>
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="w-full min-h-30 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 outline-none transition-colors duration-150 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
            placeholder="What is this project for?"
            id="Project Description"
          ></textarea>
        </div>

        {/* visibility section */}
        <div className="w-full flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-900 dark:text-zinc-50">
            Visibility
          </label>
          <div className="inline-flex w-full rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
            {[
              { value: "public" as const, label: "Public", icon: Globe },
              { value: "private" as const, label: "Private", icon: Lock },
            ].map((option) => {
              const isSelected = visibility === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setVisibility(option.value)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-50 dark:text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                  {option.label}
                </button>
              );
            })}
          </div>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {visibility === "public"
              ? "Anyone can view this project, but only in read-only format."
              : "Only you and invited members can access this project."}
          </span>
        </div>

        {/* status section */}
        <div className="w-full flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-900 dark:text-zinc-50">
            Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((option) => {
              const isSelected = status === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  className="flex items-center gap-2 text-left cursor-pointer"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-150 ${
                      isSelected
                        ? "bg-zinc-900 border-zinc-900 dark:bg-zinc-50 dark:border-zinc-50"
                        : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                    }`}
                  >
                    {isSelected && (
                      <Check
                        className="h-3 w-3 text-white dark:text-zinc-900"
                        strokeWidth={3}
                      />
                    )}
                  </span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* industry section */}
        <div className="w-full flex flex-col gap-2" ref={industryWrapperRef}>
          <label
            htmlFor="Industry"
            className="text-sm font-medium text-gray-900 dark:text-zinc-50"
          >
            Industry{" "}
            <span className="font-medium text-zinc-500">(optional)</span>
          </label>
          <div className="relative" ref={industryAnchorRef}>
            <input
              id="Industry"
              type="text"
              placeholder="Select industry"
              value={industry}
              autoComplete="off"
              onFocus={() => {
                setIsIndustryOpen(true);
                setHighlightedIndex(-1);
              }}
              onChange={(e) => {
                setIndustry(e.target.value);
                setIsOtherSelected(false);
                setIsIndustryOpen(true);
                setHighlightedIndex(-1);
              }}
              onKeyDown={handleIndustryKeyDown}
              className="w-full h-9 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 outline-none transition-colors duration-150 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
            />
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          </div>

          <PortalDropdown
            isOpen={
              isIndustryOpen &&
              !isOtherSelected &&
              filteredIndustries.length > 0
            }
            anchorRef={industryAnchorRef}
          >
            <ul className="max-h-48 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 scroll-p-1 custom-scrollbar">
              {filteredIndustries.map((item, index) => (
                <li key={item}>
                  <button
                    type="button"
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectIndustry(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full text-left rounded-md px-3 py-2 text-sm font-medium transition-colors duration-100 cursor-pointer ${
                      index === highlightedIndex
                        ? "bg-zinc-200/70 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                        : "text-zinc-900 dark:text-zinc-50"
                    }`}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </PortalDropdown>
        </div>

        {/* invite members section */}
        <div className="w-full flex flex-col gap-2" ref={inviteWrapperRef}>
          <label
            htmlFor="InviteMembers"
            className="text-sm font-medium text-gray-900 dark:text-zinc-50"
          >
            Invite Members{" "}
            <span className="font-medium text-zinc-500">(optional)</span>
          </label>

          <div className="relative" ref={inviteAnchorRef}>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  id="InviteMembers"
                  ref={inviteInputRef}
                  type="text"
                  placeholder="Search by name, username or email"
                  value={inviteQuery}
                  autoComplete="off"
                  onFocus={() => {
                    setIsInviteOpen(true);
                    setInviteHighlightedIndex(-1);
                  }}
                  onChange={(e) => {
                    setInviteQuery(e.target.value);
                    setIsInviteOpen(true);
                    setInviteHighlightedIndex(-1);
                  }}
                  onKeyDown={handleInviteKeyDown}
                  className="w-full h-9 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-9 pr-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500 outline-none transition-colors duration-150 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                />
              </div>
              <Button
                icon={Plus}
                variant={"outline"}
                className="h-9 w-9 shrink-0"
                onClick={handleInviteAction}
              />
            </div>
          </div>

          <PortalDropdown
            isOpen={isInviteOpen && inviteResults.length > 0}
            anchorRef={inviteAnchorRef}
          >
            <ul className="custom-scrollbar max-h-48 overflow-y-auto scroll-p-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
              {inviteResults.map((user, index) => (
                <li key={user.id}>
                  <button
                    type="button"
                    ref={(el) => {
                      inviteItemRefs.current[index] = el;
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectMember(user)}
                    onMouseEnter={() => setInviteHighlightedIndex(index)}
                    className={`w-full flex flex-col text-left rounded-md px-3 py-2 text-sm transition-colors duration-100 cursor-pointer ${
                      index === inviteHighlightedIndex
                        ? "bg-zinc-200/70 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <span className="font-medium">
                      {user.name || user.username}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {user.email}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </PortalDropdown>

          <PortalDropdown
            isOpen={
              isInviteOpen &&
              inviteQuery.trim() !== "" &&
              !isSearchingMembers &&
              inviteResults.length === 0
            }
            anchorRef={inviteAnchorRef}
          >
            <div className="rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-500 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              No matching user found.
            </div>
          </PortalDropdown>

          {invitedMembers.length > 0 && (
            <div className="flex flex-col gap-2 mt-1">
              {invitedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="h-4 w-4 shrink-0 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                      {member.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <DropdownMenu
                      trigger={
                        <Button
                          icon={ChevronDown}
                          title={
                            member.permission === "read"
                              ? "Read"
                              : "Read & Write"
                          }
                          iconPosition="right"
                          variant={"outline"}
                          size={"sm"}
                        />
                      }
                      sections={[
                        {
                          type: "radio",
                          value: member.permission,
                          onValueChange: (value) =>
                            updateMemberPermission(
                              member.id,
                              value as ProjectPermission,
                            ),
                          options: [
                            { label: "Read", value: "read" },
                            { label: "Read & Write", value: "read_write" },
                          ],
                        },
                      ]}
                    />
                    <Button
                      icon={X}
                      variant={"destructive"}
                      size={"sm"}
                      onClick={() => removeMember(member.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800 shrink-0">
        <Button
          title="Clear"
          variant={"destructive"}
          onClick={() => resetForm()}
        />
        <Button
          disabled={!projectName || isLoading}
          loading={isLoading}
          title={isLoading ? "Creating project..." : "Create"}
          onClick={createProjectHandler}
        />
      </div>
    </Modal>
  );
}
