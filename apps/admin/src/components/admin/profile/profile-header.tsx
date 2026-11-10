"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  Mail,
  Settings,
  LogOut,
  User,
  Users,
  Edit,
} from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { LogoutDialog } from "@/components/auth/logout-modal";
import Image from "next/image";

interface ProfileHeaderProps {
  activeTab?: "profile" | "teams";
}

export function ProfileHeader({ activeTab = "profile" }: ProfileHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

  useEffect(() => {
    const syncAvatar = () => {
      try {
        const stored = localStorage.getItem("admin_avatar");
        if (stored) setCustomAvatar(stored);
      } catch {}
    };
    syncAvatar();
    window.addEventListener("admin_avatar_updated", syncAvatar);
    return () => window.removeEventListener("admin_avatar_updated", syncAvatar);
  }, []);

  const currentTab = activeTab || (pathname.includes("/teams") ? "teams" : "profile");

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0]
    : "Modest Store Admin";

  const displayRole = user?.role
    ? user.role.replace(/_/g, " ")
    : "ADMIN";

  const userAvatar = customAvatar || user?.avatar || user?.image || "/images/avatars/1.webp";
  const userEmail = user?.email || "admin@modest.com";

  return (
    <div className="space-y-6">
      {/* Main Profile Card with Cover Photo & Identity */}
      <div className="rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#141414] shadow-xs overflow-hidden">
        {/* Cover Banner */}
        <div className="relative h-44 sm:h-52 md:h-56 w-full bg-linear-to-r from-stone-900 via-neutral-800 to-stone-950 overflow-hidden">
          <Image
            src="/images/banner-user-profile.webp"
            alt="Modest Boutique Admin Banner"
            fill
            priority
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Admin Session
            </span>
          </div>
        </div>

        {/* Identity & Details Section */}
        <div className="px-5 sm:px-8 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-10 sm:-mt-12 md:-mt-12">
            {/* Left: Minimal Avatar + Details */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-3.5 sm:gap-4">
              {/* Minimal Overlapping Avatar */}
              <div className="relative size-20 sm:size-24 rounded-full overflow-hidden border-4 border-white dark:border-[#141414] shadow-md bg-white dark:bg-zinc-800 shrink-0 ring-1 ring-black/5 dark:ring-white/10 group">
                <AvatarWithFallback
                  src={userAvatar}
                  name={displayName}
                  size={96}
                  className="size-full rounded-full text-lg font-bold object-cover"
                />
                <Link
                  href="/settings"
                  className="absolute inset-0 bg-black/45 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px] cursor-pointer"
                  title="Change Admin Avatar in Settings"
                >
                  <Edit className="size-4" />
                </Link>
              </div>

              {/* Name & Meta Row */}
              <div className="pt-1 sm:pt-0 sm:pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                    {displayRole}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-emerald-500" />
                    Verified Authenticated Admin
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-indigo-500" />
                    Modest Luxury Boutique
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5 text-gray-400" />
                    {userEmail}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Admin Controls */}
            <div className="pt-2 md:pt-0 md:pb-1 flex items-center gap-2 shrink-0">
              <Link href="/settings">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8.5 px-3 rounded-xl text-xs font-semibold border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  <Settings className="size-3.5 mr-1.5" />
                  Store Settings
                </Button>
              </Link>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setLogoutOpen(true)}
                className="h-8.5 px-3 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                <LogOut className="size-3.5 mr-1.5" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Navigation Tabs (Profile & Teams) */}
          <nav className="mt-6 flex items-center gap-2 border-t border-gray-100 dark:border-white/5 pt-3.5 overflow-x-auto">
            <Link
              href="/profile"
              className={cn(
                "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer",
                currentTab === "profile"
                  ? "bg-[#0070BA] text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <User className="size-3.5" />
              <span>Overview & Admin Details</span>
            </Link>

            <Link
              href="/profile/teams"
              className={cn(
                "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer",
                currentTab === "teams"
                  ? "bg-[#0070BA] text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Users className="size-3.5" />
              <span>Store Operations Teams</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Logout Modal */}
      <LogoutDialog open={logoutOpen} setOpen={setLogoutOpen} />
    </div>
  );
}
