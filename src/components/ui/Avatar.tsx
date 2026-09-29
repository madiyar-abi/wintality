"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string | null;
  alt?: string;
  fallbackName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  isOnline?: boolean;
  useDicebear?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
};

const statusSizeClasses = {
  sm: "w-2 h-2 ring-1",
  md: "w-2.5 h-2.5 ring-2",
  lg: "w-3.5 h-3.5 ring-2",
  xl: "w-4 h-4 ring-2",
};

export function UserAvatar({
  src,
  alt = "User Avatar",
  fallbackName = "Студент Wintality",
  size = "md",
  showStatus = false,
  isOnline = true,
  useDicebear = true,
  className,
  ...props
}: UserAvatarProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name.slice(0, 2) || "W").toUpperCase();
  };

  const dicebearUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
    fallbackName
  )}&backgroundColor=18181b`;

  const finalSrc = src || (useDicebear ? dicebearUrl : undefined);

  return (
    <div className="relative inline-block select-none">
      <AvatarPrimitive.Root
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-sm",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {finalSrc && (
          <AvatarPrimitive.Image
            src={finalSrc}
            alt={alt}
            className="aspect-square h-full w-full object-cover transition-opacity duration-300"
          />
        )}
        <AvatarPrimitive.Fallback
          className="flex h-full w-full items-center justify-center font-bold tracking-tight text-zinc-200 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700"
          delayMs={300}
        >
          {getInitials(fallbackName)}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>

      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full bg-emerald-500 ring-zinc-950",
            statusSizeClasses[size]
          )}
          title={isOnline ? "В сети" : "Офлайн"}
        >
          <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
        </span>
      )}
    </div>
  );
}

export { AvatarPrimitive };
