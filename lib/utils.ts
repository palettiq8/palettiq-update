import { User, UserRole } from "@/utils/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mapUserProfile(row: {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  location: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}): User {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    websiteUrl: row.website_url,
    location: row.location,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
