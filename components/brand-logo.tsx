import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  badgeClassName?: string;
  showSubtitle?: boolean;
  hideText?: boolean;
  size?: "sm" | "md" | "lg";
  theme?: "light" | "dark";
};

const sizeClasses = {
  sm: {
    wrapper: "gap-3",
    badge: "h-[3.6rem] w-[2.7rem] rounded-[20px] p-1.5",
    image: "h-full w-full",
    title: "text-base",
    subtitle: "text-[11px]",
  },
  md: {
    wrapper: "gap-3.5",
    badge: "h-[4.4rem] w-[3.2rem] rounded-[24px] p-1.5",
    image: "h-full w-full",
    title: "text-lg",
    subtitle: "text-xs",
  },
  lg: {
    wrapper: "gap-4",
    badge: "h-[5.15rem] w-[3.85rem] rounded-[26px] p-2",
    image: "h-full w-full",
    title: "text-xl",
    subtitle: "text-sm",
  },
};

const themeClasses = {
  light: {
    title: "text-white",
    subtitle: "text-slate-300",
    badge:
      "border-white/10 bg-[linear-gradient(180deg,#020617,#0f172a)] shadow-[0_16px_40px_rgba(15,23,42,0.35)]",
  },
  dark: {
    title: "text-slate-900",
    subtitle: "text-slate-500",
    badge:
      "border-slate-200 bg-[linear-gradient(180deg,#020617,#111827)] shadow-[0_12px_30px_rgba(15,23,42,0.16)]",
  },
};

const BrandLogo = ({
  href = "/",
  className,
  titleClassName,
  subtitleClassName,
  badgeClassName,
  showSubtitle = true,
  hideText = false,
  size = "md",
  theme = "light",
}: BrandLogoProps) => {
  const sizing = sizeClasses[size];
  const palette = themeClasses[theme];

  const content = (
    <>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden border",
          sizing.badge,
          palette.badge,
          badgeClassName
        )}
      >
        <Image
          src="/logo.png"
          alt="Genius AI logo"
          width={408}
          height={612}
          priority
          className={cn("object-contain object-center", sizing.image)}
        />
      </div>

      <div className={cn("min-w-0", hideText && "hidden")}>
        <p
          className={cn(
            "truncate font-semibold tracking-[0.02em]",
            sizing.title,
            palette.title,
            titleClassName
          )}
        >
          Genius AI
        </p>

        {showSubtitle ? (
          <p
            className={cn(
              "truncate font-medium",
              sizing.subtitle,
              palette.subtitle,
              subtitleClassName
            )}
          >
            Prompt-powered creation suite
          </p>
        ) : null}
      </div>
    </>
  );

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center", sizing.wrapper, className)}
    >
      {content}
    </Link>
  );
};

export default BrandLogo;
