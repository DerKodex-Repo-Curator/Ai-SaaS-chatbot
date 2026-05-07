"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SessionUser = {
  id: string;
  name: string;
  email: string;
};

type MeResponse = {
  success: boolean;
  userId: string | null;
  email: string | null;
  isAdmin: boolean;
  user: SessionUser | null;
};

type SessionUserMenuProps = {
  compact?: boolean;
  theme?: "dark" | "light";
};

export function SessionUserMenu({
  compact = false,
  theme = "dark",
}: SessionUserMenuProps) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDark = theme === "dark";

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("/auth/me", {
          cache: "no-store",
        });
        const data = (await response.json()) as MeResponse;

        setUser(data.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const logout = async () => {
    await fetch("/auth/logout", {
      method: "POST",
    });

    setUser(null);
    router.push("/login");
    router.refresh();
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "h-11 rounded-full border px-4",
          compact ? "w-11" : "w-36",
          isDark ? "border-[#334155] bg-[#1e293b]" : "border-slate-200 bg-white",
        )}
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-medium",
          isDark
            ? "border-[#334155] bg-[#1e293b] text-[#e2e8f0] hover:bg-[#334155]"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        )}
      >
        Login
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border p-1.5",
        isDark ? "border-[#334155] bg-[#1e293b]" : "border-slate-200 bg-white/85",
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/15">
        <UserRound className="h-4 w-4 text-cyan-300" />
      </div>
      {!compact ? (
        <div className="min-w-0 pr-1">
          <p className="max-w-32 truncate text-xs font-semibold">{user.name}</p>
          <p
            className={cn(
              "max-w-32 truncate text-[11px]",
              isDark ? "text-[#94a3b8]" : "text-slate-500",
            )}
          >
            {user.email}
          </p>
        </div>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={logout}
        className={cn(
          "rounded-full",
          isDark ? "hover:bg-[#334155]" : "hover:bg-slate-100",
        )}
      >
        <LogOut className="h-4 w-4 text-rose-400" />
      </Button>
    </div>
  );
}
