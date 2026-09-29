"use client";

import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  href?: string;
}

export function WintalityIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 group-hover:scale-105 ${className}`}
    >
      <defs>
        <linearGradient id="wintalityGrad1" x1="4" y1="6" x2="16" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="wintalityGrad2" x1="16" y1="6" x2="28" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>

      {/* Minimalist Geometric 'W' with Victory Apex */}
      {/* Left outer blade */}
      <path
        d="M4 7.5L10.5 24.5H14.5L9.5 7.5H4Z"
        fill="url(#wintalityGrad1)"
      />
      {/* Left-center inner chevron */}
      <path
        d="M10.5 24.5L16 13L13 7.5L9.5 16L10.5 24.5Z"
        fill="url(#wintalityGrad1)"
        opacity="0.85"
      />
      {/* Right-center inner chevron */}
      <path
        d="M21.5 24.5L16 13L19 7.5L22.5 16L21.5 24.5Z"
        fill="url(#wintalityGrad2)"
        opacity="0.85"
      />
      {/* Right outer blade */}
      <path
        d="M28 7.5L21.5 24.5H17.5L22.5 7.5H28Z"
        fill="url(#wintalityGrad2)"
      />
      {/* Sleek top victory spark */}
      <circle cx="16" cy="5.5" r="1.75" fill="#38bdf8" />
    </svg>
  );
}

export function Logo({
  className = "",
  size = "md",
  showWordmark = true,
  showBadge = true,
  badgeText = "AI",
  href = "/",
}: LogoProps) {
  const iconSizes = {
    sm: 26,
    md: 32,
    lg: 40,
    xl: 48,
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl",
  };

  const content = (
    <div className={`flex items-center gap-2.5 group cursor-pointer ${className}`}>
      <WintalityIcon size={iconSizes[size]} />
      {showWordmark && (
        <div className="flex items-center gap-2">
          <span
            className={`${textSizes[size]} font-black tracking-tight text-zinc-900 dark:text-white transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400`}
          >
            {siteConfig.name}
          </span>
          {showBadge && (
            <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25 font-bold shadow-xs">
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
