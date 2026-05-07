"use client";

import { Montserrat } from "next/font/google";
import {
  ChevronsLeft,
  ChevronsRight,
  Code,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Music,
  Settings,
  Sparkles,
  Users,
  VideoIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import BrandLogo from "@/components/brand-logo";
import { SessionUserMenu } from "@/components/session-user-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const montserrat = Montserrat({
  weight: "600",
  subsets: ["latin"],
});

const routes = [
  {
    label: "Dashboard",
    description: "Overview and workspace signals",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-400",
  },
  {
    label: "Conversation AI",
    description: "Prompt-driven chat workspace",
    icon: MessageSquare,
    href: "/conversation",
    color: "text-violet-400",
  },
  {
    label: "Code Generator",
    description: "Build snippets, fixes, and flows",
    icon: Code,
    href: "/code",
    color: "text-emerald-400",
  },
  {
    label: "Image Generator",
    description: "Create visual ideas from prompts",
    icon: ImageIcon,
    href: "/image",
    color: "text-pink-400",
  },
  {
    label: "Music Generator",
    description: "Explore prompt-based audio output",
    icon: Music,
    href: "/music",
    color: "text-amber-300",
  },
  {
    label: "Video Generator",
    description: "Create motion-first AI concepts",
    icon: VideoIcon,
    href: "/video",
    color: "text-orange-400",
  },
  {
    label: "Admin Users",
    description: "MongoDB Atlas registered users",
    icon: Users,
    href: "/users",
    color: "text-cyan-300",
    adminOnly: true,
  },
  {
    label: "Settings",
    description: "Workspace configuration",
    icon: Settings,
    href: "/Settings",
    color: "text-slate-300",
  },
];

type MeResponse = {
  isAdmin?: boolean;
};

type SidebarProps = {
  collapsed?: boolean;
  mobile?: boolean;
  onToggleCollapse?: () => void;
  theme?: "dark" | "light";
};

const Sidebar = ({
  collapsed = false,
  mobile = false,
  onToggleCollapse,
  theme = "dark",
}: SidebarProps) => {
  const pathname = usePathname();
  const isDark = theme === "dark";
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadAdminStatus = async () => {
      try {
        const response = await fetch("/auth/me", {
          cache: "no-store",
        });
        const data = (await response.json()) as MeResponse;

        setIsAdmin(data.isAdmin === true);
      } catch {
        setIsAdmin(false);
      }
    };

    loadAdminStatus();
  }, []);

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-[32px] border px-3 pb-3 pt-4 shadow-[0_30px_90px_rgba(2,6,23,0.22)] backdrop-blur-2xl transition-colors duration-300",
        isDark
          ? "border-[#334155] bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(30,41,59,0.98))] text-[#e2e8f0]"
          : "border-slate-200/80 bg-white/85 text-slate-950"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <BrandLogo
          href="/dashboard"
          size={collapsed && !mobile ? "sm" : "md"}
          theme={isDark ? "light" : "dark"}
          hideText={collapsed && !mobile}
          showSubtitle={!collapsed || mobile}
          className={cn(
            "min-w-0 flex-1 overflow-hidden rounded-[26px] border px-3 py-3 transition",
            collapsed && !mobile && "justify-center px-0",
            isDark
              ? "border-[#334155] bg-[#1e293b] hover:bg-[#334155]"
              : "border-slate-200 bg-slate-50 hover:bg-white"
          )}
          titleClassName={cn("text-xl", montserrat.className)}
          subtitleClassName={isDark ? "text-[#94a3b8]" : "text-slate-500"}
        />

        {!mobile ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn(
              "hidden rounded-2xl border md:inline-flex",
              isDark
                ? "border-[#334155] bg-[#1e293b] text-[#e2e8f0] hover:bg-[#334155] hover:text-white"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white hover:text-slate-950"
            )}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </Button>
        ) : null}
      </div>

      {!collapsed || mobile ? (
        <div
          className={cn(
            "mt-4 rounded-[24px] border px-4 py-4",
            isDark
              ? "border-[#334155] bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(30,41,59,0.96),rgba(15,23,42,0.98))]"
              : "border-cyan-200 bg-[linear-gradient(135deg,rgba(224,242,254,0.9),rgba(255,255,255,0.96),rgba(238,242,255,0.95))]"
          )}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            AI Workspace
          </div>
          <p
            className={cn(
              "mt-2 text-xs leading-6",
              isDark ? "text-[#94a3b8]" : "text-slate-600"
            )}
          >
            Premium prompt tools, generation history, and creative workflows in
            one control center.
          </p>
        </div>
      ) : null}

      <div className="mt-6 flex-1 space-y-2">
        {routes
          .filter((route) => !route.adminOnly || isAdmin)
          .map((route) => {
          const isActive =
            pathname === route.href ||
            (route.href !== "/dashboard" && pathname.startsWith(route.href));

          return (
            <Link
              key={route.href}
              href={route.href}
              title={route.label}
              className={cn(
                "group flex rounded-[22px] border px-3 py-3 transition-all duration-300",
                collapsed && !mobile
                  ? "justify-center"
                  : "items-center gap-3",
                isActive
                  ? isDark
                    ? "border-[#3b82f6]/40 bg-[linear-gradient(135deg,rgba(59,130,246,0.22),rgba(30,41,59,0.96),rgba(15,23,42,0.98))] shadow-[0_18px_40px_rgba(59,130,246,0.16)]"
                    : "border-cyan-200 bg-[linear-gradient(135deg,rgba(224,242,254,0.95),rgba(255,255,255,0.98),rgba(238,242,255,0.95))] shadow-[0_18px_40px_rgba(56,189,248,0.12)]"
                  : isDark
                    ? "border-transparent text-[#e2e8f0] hover:border-[#334155] hover:bg-[#1e293b] hover:text-white"
                    : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition",
                  isActive
                    ? isDark
                      ? "border-[#334155] bg-[#334155]"
                      : "border-slate-200 bg-white"
                    : isDark
                      ? "border-[#334155] bg-[#1e293b]"
                      : "border-slate-200 bg-white/80"
                )}
              >
                <route.icon className={cn("h-5 w-5", route.color)} />
              </div>

              <div className={cn("min-w-0 flex-1", collapsed && !mobile && "hidden")}>
                <div className="text-sm font-semibold">{route.label}</div>
                <p
                  className={cn(
                    "mt-1 truncate text-xs",
                    isDark ? "text-[#94a3b8]" : "text-slate-500"
                  )}
                >
                  {route.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        {!collapsed || mobile ? (
          <div
            className={cn(
              "rounded-[24px] border px-4 py-4",
              isDark
                ? "border-[#334155] bg-[#1e293b]"
                : "border-slate-200 bg-slate-50"
            )}
          >
            <p className="text-sm font-semibold">System status</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className={isDark ? "text-[#94a3b8]" : "text-slate-500"}>
                Models ready
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 font-medium text-emerald-400">
                Online
              </span>
            </div>
          </div>
        ) : null}

        <SessionUserMenu compact={collapsed && !mobile} theme={theme} />
      </div>
    </div>
  );
};

export default Sidebar;
