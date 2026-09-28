export type UUID = string;
export type ProjectStatus = "draft" | "running" | "completed" | "archived";
export type OAuthProvider = "google" | "github" | "figma";
export type ProjectVisibility = "public" | "private";
export type ProjectPermission = "read" | "read-write";
export type UserRole = "admin" | "member";
export type ProjectMemberStatus = "pending" | "accepted";
export type ToastType = "success" | "error" | "warning";

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

export type ToastPosition =
  | "top-center"
  | "top-left"
  | "top-right"
  | "bottom-center"
  | "bottom-left"
  | "bottom-right";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  position: ToastPosition;
  duration: number;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  websiteUrl: string | null;
  location: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  userId: UUID;
  projectId: UUID;
  permission: ProjectPermission;
  invitedBy: UUID;
  status: ProjectMemberStatus;
  addedAt: Date;
}

export interface Project {
  id: UUID;
  adminId: UUID;
  name: string;
  slug: string;
  description?: string;
  metadata: {
    status: ProjectStatus;
    industry?: string;
    visibility: ProjectVisibility;
    thumbnailUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  pending?: boolean;
}
