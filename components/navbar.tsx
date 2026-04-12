"use client";

import { UserButton } from "@clerk/nextjs";
import {
  Bell,
  MoonStar,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  SunMedium,
} from "lucide-react";
import { usePathname } from "next/navigation";

import BrandLogo from "@/components/brand-logo";
import MobileSidebar from "@/components/mobile-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type NavbarProps = {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  theme: "dark" | "light";
};

const routeMeta = [
  {
    match: (pathname: string) => pathname === "/dashboard",
    eyebrow: "Workspace Overview",
    title: "AI Control Center",
    description: "Monitor tools, activity, and prompt workflows from one premium dashboard.",
  },
  {
    match: (pathname: string) => pathname.startsWith("/conversation"),
    eyebrow: "Conversation AI",
    title: "Chat Workspace",
    description: "Generate multi-turn conversations, refine prompts, and manage session history.",
  },
  {
    match: (pathname: string) => pathname.startsWith("/code"),
    eyebrow: "Code Generator",
    title: "Developer Studio",
    description: "Draft code, iterate on snippets, and keep coding sessions organized.",
  },
  {
    match: (pathname: string) => pathname.startsWith("/image"),
    eyebrow: "Image Generator",
    title: "Visual Prompt Lab",
    description: "Stage creative prompts and build visual ideas in a focused workspace.",
  },
  {
    match: (pathname: string) => pathname.startsWith("/music"),
    eyebrow: "Music Generator",
    title: "Audio Prompt Lab",
    description: "Shape music-ready ideas and keep your sound generation flow organized.",
  },
  {
    match: (pathname: string) => pathname.startsWith("/video"),
    eyebrow: "Video Generator",
    title: "Motion Studio",
    description: "Design cinematic concepts and manage prompt-driven video workflows.",
  },
];

const Navbar = ({
  collapsed,
  onToggleSidebar,
  onToggleTheme,
  theme,
}: NavbarProps) => {
  const pathname = usePathname();
  const isDark = theme === "dark";
  const meta =
    routeMeta.find((item) => item.match(pathname)) ?? routeMeta[0];

  return (
    <div className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
      <div
        className={cn(
          "rounded-[30px] border px-4 py-4 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-2xl transition-colors duration-300 sm:px-5",
          isDark
            ? "border-[#334155] bg-[#0f172a]/85 text-[#e2e8f0]"
            : "border-white/80 bg-white/70 text-slate-950"
        )}
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <MobileSidebar theme={theme} />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className={cn(
                "hidden rounded-full border md:inline-flex",
                isDark
                  ? "border-[#334155] bg-[#1e293b] text-[#e2e8f0] hover:bg-[#334155] hover:text-white"
                  : "border-slate-200 bg-white/80 text-slate-700 hover:bg-white hover:text-slate-950"
              )}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>

            <BrandLogo
              href="/dashboard"
              size="sm"
              theme={isDark ? "light" : "dark"}
              showSubtitle={false}
              className="md:hidden"
            />

            <div className="hidden min-w-0 sm:block">
              <p
                className={cn(
                  "text-xs font-medium uppercase tracking-[0.22em]",
                  isDark ? "text-blue-300" : "text-cyan-700"
                )}
              >
                {meta.eyebrow}
              </p>
              <h1 className="mt-1 text-xl font-semibold">{meta.title}</h1>
              <p
                className={cn(
                  "mt-1 max-w-xl text-sm",
                  isDark ? "text-[#94a3b8]" : "text-slate-500"
                )}
              >
                {meta.description}
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 xl:max-w-3xl xl:flex-row xl:items-center xl:justify-end">
            <div className="relative w-full xl:max-w-xl">
              <Search
                className={cn(
                  "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2",
                  isDark ? "text-[#94a3b8]" : "text-slate-500"
                )}
              />
              <Input
                placeholder="Search tools, prompts, activity..."
                className={cn(
                  "h-12 rounded-full border pl-11 shadow-none",
                  isDark
                    ? "border-[#334155] bg-[#1e293b] text-[#e2e8f0] placeholder:text-[#64748b]"
                    : "border-slate-200 bg-white/85 text-slate-900 placeholder:text-slate-500"
                )}
              />
            </div>

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onToggleTheme}
                className={cn(
                  "rounded-full border",
                  isDark
                    ? "border-[#334155] bg-[#1e293b] text-[#e2e8f0] hover:bg-[#334155] hover:text-white"
                    : "border-slate-200 bg-white/85 text-slate-700 hover:bg-white hover:text-slate-950"
                )}
              >
                {isDark ? (
                  <SunMedium className="h-4 w-4" />
                ) : (
                  <MoonStar className="h-4 w-4" />
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "relative rounded-full border",
                  isDark
                    ? "border-[#334155] bg-[#1e293b] text-[#e2e8f0] hover:bg-[#334155] hover:text-white"
                    : "border-slate-200 bg-white/85 text-slate-700 hover:bg-white hover:text-slate-950"
                )}
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan-400" />
              </Button>

              <div
                className={cn(
                  "rounded-full border p-1.5",
                  isDark
                    ? "border-[#334155] bg-[#1e293b]"
                    : "border-slate-200 bg-white/85"
                )}
              >
                <UserButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
