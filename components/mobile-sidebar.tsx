"use client";

import { Menu } from "lucide-react";

import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type MobileSidebarProps = {
  theme?: "dark" | "light";
};

const MobileSidebar = ({ theme = "dark" }: MobileSidebarProps) => {
  const isDark = theme === "dark";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full border md:hidden",
            isDark
              ? "border-[#334155] bg-[#1e293b] text-[#e2e8f0] hover:bg-[#334155] hover:text-white"
              : "border-slate-200 bg-white/85 text-slate-700 hover:bg-white hover:text-slate-950"
          )}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[88%] border-0 bg-transparent p-3 shadow-none sm:max-w-sm"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Sidebar navigation</SheetTitle>
        </SheetHeader>
        <Sidebar mobile theme={theme} />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
