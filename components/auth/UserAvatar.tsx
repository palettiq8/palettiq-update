"use client";

import { useState } from "react";
import Image from "next/image";
import type { AuthUser } from "@/utils/types";

function getInitial(user: AuthUser): string {
  const source = user.username || user.email || "?";
  return source.charAt(0).toUpperCase();
}

function getAvatarColor(seed: string): string {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-lime-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function UserAvatar({
  user,
  size = 28,
}: {
  user: AuthUser;
  size?: number;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const seed = user.username || user.email || "user";

  if (user.avatarUrl && !imageFailed) {
    return (
      <Image
        src={user.avatarUrl}
        width={size}
        height={size}
        alt={`${user.username ?? user.email} profile picture`}
        className="rounded-full object-cover select-none"
        style={{ width: size, height: size }}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-medium select-none ${getAvatarColor(seed)}`}
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {getInitial(user)}
    </div>
  );
}
