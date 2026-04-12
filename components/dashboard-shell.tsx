"use client";

import { useEffect, useState } from "react";

import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
};

export type DashboardTheme = "dark" | "light";

const DashboardShell = ({ children }: DashboardShellProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<DashboardTheme>("dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");

    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, [theme]);

  return (
    <>
      <style>{`
        body:has([data-dashboard-shell]) > header {
          display: none;
        }

        body:has([data-dashboard-shell]) {
          background: ${theme === "dark" ? "#0f172a" : "#e2e8f0"};
        }
      `}</style>

      <div
        data-dashboard-shell
        className={cn(
          "relative min-h-screen overflow-hidden transition-colors duration-500",
          theme === "dark"
            ? "bg-[linear-gradient(180deg,#0f172a_0%,#0f172a_48%,#1e293b_100%)] text-[#e2e8f0]"
            : "bg-[linear-gradient(180deg,#f8fafc_0%,#eff6ff_55%,#e2e8f0_100%)] text-slate-950"
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            theme === "dark"
              ? "bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_30%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.08),transparent_40%)]"
              : "bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(167,139,250,0.12),transparent_30%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.08),transparent_42%)]"
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-0 opacity-60",
            theme === "dark"
              ? "bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:72px_72px]"
              : "bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:72px_72px]"
          )}
        />
        <div className="pointer-events-none absolute left-[10%] top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[8%] top-40 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-[80] hidden p-4 transition-all duration-300 md:flex",
            isSidebarCollapsed ? "w-24" : "w-[18.5rem]"
          )}
        >
          <Sidebar
            collapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
            theme={theme}
          />
        </aside>

        <div
          className={cn(
            "relative flex min-h-screen flex-col transition-[padding] duration-300",
            isSidebarCollapsed ? "md:pl-24" : "md:pl-[18.5rem]"
          )}
        >
          <Navbar
            collapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed((current) => !current)}
            theme={theme}
            onToggleTheme={() =>
              setTheme((current) => (current === "dark" ? "light" : "dark"))
            }
          />

          <main className="relative z-10 flex-1 pb-10 pt-4 sm:pt-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardShell;
