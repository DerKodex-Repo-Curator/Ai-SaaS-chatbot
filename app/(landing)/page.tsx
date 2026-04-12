import Link from "next/link";
import type { Metadata } from "next";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  ImageIcon,
  LayoutGrid,
  MessageSquareText,
  MoonStar,
  Music,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Video,
  Wand2,
  Zap,
} from "lucide-react";

import BrandLogo from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "AI Chat Generator",
    description:
      "Create smart conversations, instant answers, and assistant-style workflows from a single prompt.",
    icon: MessageSquareText,
    accent: "from-cyan-400/30 to-sky-500/10",
    iconColor: "text-cyan-300",
  },
  {
    title: "AI Code Generator",
    description:
      "Turn ideas into code snippets, components, APIs, and rapid prototypes in seconds.",
    icon: Code2,
    accent: "from-emerald-400/30 to-teal-500/10",
    iconColor: "text-emerald-300",
  },
  {
    title: "AI Image Generator",
    description:
      "Generate visuals, concept art, marketing assets, and creative imagery directly from text.",
    icon: ImageIcon,
    accent: "from-fuchsia-400/30 to-pink-500/10",
    iconColor: "text-fuchsia-300",
  },
  {
    title: "AI Music Generator",
    description:
      "Shape mood, tone, and sound with prompt-driven audio generation built for creators.",
    icon: Music,
    accent: "from-amber-300/30 to-orange-500/10",
    iconColor: "text-amber-200",
  },
  {
    title: "AI Video Generator",
    description:
      "Build cinematic motion concepts, video ideas, and media-ready outputs from natural language.",
    icon: Video,
    accent: "from-violet-400/30 to-indigo-500/10",
    iconColor: "text-violet-200",
  },
];

const steps = [
  {
    label: "Step 1",
    title: "Login / Register",
    description:
      "Create your secure account or sign in with your existing Genius AI access.",
  },
  {
    label: "Step 2",
    title: "Enter Prompt",
    description:
      "Describe what you want to generate using clear, simple instructions.",
  },
  {
    label: "Step 3",
    title: "Generate Anything",
    description:
      "Let Genius AI produce chat, code, images, music, or video in one place.",
  },
  {
    label: "Step 4",
    title: "Download / Use",
    description:
      "Take the result into your workflow, product, content, or next idea right away.",
  },
];

const reasons = [
  {
    title: "Fast generation",
    description:
      "Move from prompt to polished output with a streamlined, creator-first experience.",
    icon: Zap,
    accent: "text-cyan-300",
  },
  {
    title: "Multiple AI tools",
    description:
      "Access chat, code, image, music, and video generation from one premium platform.",
    icon: LayoutGrid,
    accent: "text-violet-200",
  },
  {
    title: "Simple prompt system",
    description:
      "No complicated setup. Type what you need and let the platform handle the heavy lifting.",
    icon: Wand2,
    accent: "text-emerald-300",
  },
  {
    title: "Secure account",
    description:
      "Protected authentication keeps your workspace and generation flow safe and personal.",
    icon: ShieldCheck,
    accent: "text-amber-200",
  },
];

export const metadata: Metadata = {
  title: "Genius AI | Create Anything with AI",
  description:
    "Prompt-powered AI generation for chat, code, images, music, and video.",
};

type LandingPageProps = {
  searchParams?: Promise<{
    theme?: string | string[] | undefined;
  }>;
};

export default async function LandingPage({ searchParams }: LandingPageProps) {
  const { userId } = await auth();
  const params = (await searchParams) ?? {};
  const themeParam = Array.isArray(params.theme) ? params.theme[0] : params.theme;
  const theme = themeParam === "light" ? "light" : "dark";
  const isDark = theme === "dark";
  const startHref = userId ? "/dashboard" : "/login";
  const currentYear = new Date().getFullYear();
  const themeHref = (nextTheme: "light" | "dark") => `/?theme=${nextTheme}#home`;

  return (
    <>
      <style>{`
        html:has([data-genius-landing]) {
          scroll-behavior: smooth;
        }

        body:has([data-genius-landing]) > header {
          display: none;
        }

        @keyframes genius-float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-16px);
          }
        }

        @keyframes genius-glow {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.08);
          }
        }

        @keyframes genius-rise {
          0% {
            opacity: 0;
            transform: translateY(24px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes genius-shimmer {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>

      <main
        data-genius-landing
        className={cn(
          "min-h-screen overflow-x-hidden transition-colors duration-300",
          isDark
            ? "bg-[linear-gradient(180deg,#020617_0%,#050b17_38%,#09101d_100%)] text-white"
            : "bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_38%,#e2e8f0_100%)] text-slate-950"
        )}
      >
        <div className="relative isolate">
          <div
            className={cn(
              "absolute inset-x-0 top-0 -z-10 h-[720px]",
              isDark
                ? "bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_center,rgba(14,165,233,0.08),transparent_42%)]"
                : "bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_32%),radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_42%)]"
            )}
          />
          <div
            className={cn(
              "absolute left-[8%] top-28 -z-10 size-52 rounded-full blur-3xl motion-safe:animate-[genius-glow_9s_ease-in-out_infinite]",
              isDark ? "bg-cyan-400/15" : "bg-cyan-300/20"
            )}
          />
          <div
            className={cn(
              "absolute right-[10%] top-44 -z-10 size-72 rounded-full blur-3xl motion-safe:animate-[genius-glow_11s_ease-in-out_infinite]",
              isDark ? "bg-violet-400/12" : "bg-indigo-300/18"
            )}
          />

          <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 sm:px-6 lg:px-8">
            <nav
              id="home"
              className="sticky top-0 z-40 pt-4"
            >
              <div
                className={cn(
                  "flex flex-col gap-4 rounded-[28px] border px-4 py-4 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,8,23,0.18)] sm:px-6 lg:flex-row lg:items-center lg:justify-between",
                  isDark
                    ? "border-white/10 bg-white/6"
                    : "border-slate-200/80 bg-white/80"
                )}
              >
                <BrandLogo
                  href="/"
                  size="md"
                  theme={isDark ? "light" : "dark"}
                  className="min-w-0"
                />

                <div
                  className={cn(
                    "flex flex-wrap items-center gap-3 text-sm",
                    isDark ? "text-slate-200" : "text-slate-600"
                  )}
                >
                  <Link
                    href="#home"
                    className={cn(
                      "rounded-full px-3 py-2 transition",
                      isDark
                        ? "hover:bg-white/10 hover:text-white"
                        : "hover:bg-slate-100 hover:text-slate-950"
                    )}
                  >
                    Home
                  </Link>
                  <Link
                    href="#features"
                    className={cn(
                      "rounded-full px-3 py-2 transition",
                      isDark
                        ? "hover:bg-white/10 hover:text-white"
                        : "hover:bg-slate-100 hover:text-slate-950"
                    )}
                  >
                    Features
                  </Link>

                  <div
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border p-1",
                      isDark
                        ? "border-white/10 bg-slate-950/50"
                        : "border-slate-200 bg-slate-100/90"
                    )}
                  >
                    <Link
                      href={themeHref("light")}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition",
                        !isDark
                          ? "bg-white text-slate-950 shadow-sm"
                          : "text-slate-300 hover:bg-white/8 hover:text-white"
                      )}
                    >
                      <SunMedium className="size-3.5" />
                      Light
                    </Link>
                    <Link
                      href={themeHref("dark")}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition",
                        isDark
                          ? "bg-white/10 text-white shadow-sm"
                          : "text-slate-500 hover:bg-white hover:text-slate-950"
                      )}
                    >
                      <MoonStar className="size-3.5" />
                      Dark
                    </Link>
                  </div>

                  {!userId ? (
                    <>
                      <Link
                        href="/login"
                        className={cn(
                          "rounded-full px-3 py-2 transition",
                          isDark
                            ? "hover:bg-white/10 hover:text-white"
                            : "hover:bg-slate-100 hover:text-slate-950"
                        )}
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className={cn(
                          "rounded-full border px-4 py-2 transition",
                          isDark
                            ? "border-white/12 bg-white/8 hover:bg-white/14"
                            : "border-slate-200 bg-slate-50 hover:bg-white"
                        )}
                      >
                        Register
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/dashboard"
                        className={cn(
                          "rounded-full px-3 py-2 transition",
                          isDark
                            ? "hover:bg-white/10 hover:text-white"
                            : "hover:bg-slate-100 hover:text-slate-950"
                        )}
                      >
                        Dashboard
                      </Link>
                      <div
                        className={cn(
                          "rounded-full border p-1",
                          isDark
                            ? "border-white/12 bg-white/8"
                            : "border-slate-200 bg-white"
                        )}
                      >
                        <UserButton />
                      </div>
                    </>
                  )}

                  <Button
                    asChild
                    size="lg"
                    className="rounded-full border border-cyan-300/40 bg-[linear-gradient(120deg,#06b6d4,#8b5cf6,#ec4899)] bg-[length:200%_200%] px-6 text-white shadow-[0_14px_40px_rgba(14,165,233,0.35)] transition hover:scale-[1.02] hover:shadow-[0_18px_44px_rgba(139,92,246,0.35)] motion-safe:animate-[genius-shimmer_8s_linear_infinite]"
                  >
                    <Link href={startHref}>
                      Start Now
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </nav>

            <section className="relative grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
              <div className="max-w-3xl motion-safe:animate-[genius-rise_0.7s_ease-out_forwards]">
                <div
                  className={cn(
                    "mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm",
                    isDark
                      ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-100"
                      : "border-cyan-200 bg-cyan-50 text-cyan-700"
                  )}
                >
                  <Sparkles className="size-4 text-cyan-300" />
                  One workspace for every kind of AI creation
                </div>

                <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
                  Genius AI
                  <span
                    className={cn(
                      "block bg-clip-text text-transparent",
                      isDark
                        ? "bg-[linear-gradient(120deg,#ffffff_0%,#8be9fd_35%,#c4b5fd_65%,#f9a8d4_100%)]"
                        : "bg-[linear-gradient(120deg,#0f172a_0%,#2563eb_35%,#7c3aed_65%,#db2777_100%)]"
                    )}
                  >
                    Create Anything with AI
                  </span>
                </h1>

                <p
                  className={cn(
                    "mt-6 max-w-2xl text-lg leading-8 sm:text-xl",
                    isDark ? "text-slate-300" : "text-slate-600"
                  )}
                >
                  Turn a single prompt into AI chat conversations, code, images, music,
                  and video. Genius AI gives creators, founders, and teams a premium way
                  to move from idea to output without friction.
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full border border-cyan-300/40 bg-[linear-gradient(120deg,#06b6d4,#8b5cf6,#ec4899)] px-7 text-white shadow-[0_16px_45px_rgba(14,165,233,0.35)] transition hover:scale-[1.02]"
                  >
                    <Link href={startHref}>
                      Start Now
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className={cn(
                      "rounded-full px-7 backdrop-blur-md",
                      isDark
                        ? "border-white/15 bg-white/6 text-white hover:bg-white/10 hover:text-white"
                        : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:text-slate-950"
                    )}
                  >
                    <Link href="#features">Explore Features</Link>
                  </Button>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {[
                    "Prompt-first workflow",
                    "Premium dark experience",
                    "Secure dashboard access",
                  ].map((item) => (
                    <div
                      key={item}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border px-4 py-4 text-sm backdrop-blur-xl",
                        isDark
                          ? "border-white/10 bg-white/6 text-slate-200"
                          : "border-slate-200 bg-white/80 text-slate-700"
                      )}
                    >
                      <CheckCircle2 className="size-5 text-cyan-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative motion-safe:animate-[genius-float_9s_ease-in-out_infinite]">
                <div
                  className={cn(
                    "absolute inset-6 rounded-[36px] blur-2xl",
                    isDark
                      ? "bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.2),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_38%)]"
                      : "bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.14),transparent_38%)]"
                  )}
                />
                <div
                  className={cn(
                    "relative overflow-hidden rounded-[36px] border p-5 backdrop-blur-2xl",
                    isDark
                      ? "border-white/12 bg-white/8 shadow-[0_40px_120px_rgba(2,6,23,0.55)]"
                      : "border-slate-200/80 bg-white/80 shadow-[0_28px_90px_rgba(148,163,184,0.22)]"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-between rounded-[28px] border px-5 py-4",
                      isDark
                        ? "border-white/10 bg-slate-950/55"
                        : "border-slate-200 bg-slate-50"
                    )}
                  >
                    <div>
                      <p className={cn("text-sm font-medium", isDark ? "text-slate-200" : "text-slate-900")}>Genius AI Studio</p>
                      <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>Prompt-powered creative engine</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-cyan-300" />
                      <span className="size-2.5 rounded-full bg-violet-300" />
                      <span className="size-2.5 rounded-full bg-pink-300" />
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div
                      className={cn(
                        "rounded-[28px] border p-5",
                        isDark
                          ? "border-cyan-300/20 bg-[linear-gradient(135deg,rgba(8,145,178,0.18),rgba(15,23,42,0.75),rgba(91,33,182,0.18))]"
                          : "border-cyan-200 bg-[linear-gradient(135deg,rgba(224,242,254,0.95),rgba(255,255,255,0.98),rgba(238,242,255,0.95))]"
                      )}
                    >
                      <div className={cn("flex items-center gap-3 text-sm", isDark ? "text-cyan-100" : "text-cyan-700")}>
                        <Sparkles className="size-4 text-cyan-300" />
                        Active prompt
                      </div>
                      <p className={cn("mt-3 text-base leading-7", isDark ? "text-white" : "text-slate-900")}>
                        &quot;Design a product launch campaign with landing copy, hero visual
                        ideas, feature illustrations, and a cinematic teaser concept.&quot;
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div
                        className={cn(
                          "rounded-[28px] border p-5",
                          isDark
                            ? "border-white/10 bg-slate-950/55"
                            : "border-slate-200 bg-white"
                        )}
                      >
                        <p className={cn("text-sm font-medium", isDark ? "text-slate-200" : "text-slate-900")}>Generate modes</p>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          {features.map(({ title, icon: Icon, iconColor }) => (
                            <div
                              key={title}
                              className={cn(
                                "rounded-2xl border px-3 py-3 text-xs",
                                isDark
                                  ? "border-white/10 bg-white/6 text-slate-300"
                                  : "border-slate-200 bg-slate-50 text-slate-600"
                              )}
                            >
                              <Icon className={`mb-2 size-4 ${iconColor}`} />
                              {title.replace(" Generator", "")}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div
                        className={cn(
                          "rounded-[28px] border p-5",
                          isDark
                            ? "border-white/10 bg-slate-950/55"
                            : "border-slate-200 bg-white"
                        )}
                      >
                        <p className={cn("text-sm font-medium", isDark ? "text-slate-200" : "text-slate-900")}>Creation flow</p>
                        <div className="mt-4 space-y-3">
                          {["Prompt received", "Model selected", "Output generated", "Ready to use"].map((item, index) => (
                            <div
                              key={item}
                              className={cn(
                                "flex items-center justify-between rounded-2xl border px-4 py-3",
                                isDark
                                  ? "border-white/10 bg-white/6"
                                  : "border-slate-200 bg-slate-50"
                              )}
                            >
                              <span className={cn("text-sm", isDark ? "text-slate-200" : "text-slate-900")}>{item}</span>
                              <span className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>0{index + 1}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="features" className="scroll-mt-32 py-10 sm:py-14">
              <div className="max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">
                  Features
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  One premium platform, five creative engines
                </h2>
                <p className={cn("mt-4 text-lg", isDark ? "text-slate-300" : "text-slate-600")}>
                  Genius AI is built for people who want powerful generation tools without
                  juggling multiple products or complicated workflows.
                </p>
              </div>

              <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                {features.map(({ title, description, icon: Icon, accent, iconColor }) => (
                  <div
                    key={title}
                    className={cn(
                      "group relative overflow-hidden rounded-[28px] border p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1",
                      isDark
                        ? "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] hover:border-white/20 hover:shadow-[0_24px_80px_rgba(8,15,33,0.45)]"
                        : "border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,245,249,0.92))] hover:border-slate-300 hover:shadow-[0_24px_80px_rgba(148,163,184,0.22)]"
                    )}
                  >
                    <div className={`absolute inset-0 bg-[linear-gradient(135deg,var(--tw-gradient-stops))] ${accent} opacity-60`} />
                    <div className="relative">
                      <div
                        className={cn(
                          "flex size-12 items-center justify-center rounded-2xl border",
                          isDark
                            ? "border-white/10 bg-slate-950/55"
                            : "border-slate-200 bg-white"
                        )}
                      >
                        <Icon className={`size-6 ${iconColor}`} />
                      </div>
                      <h3 className={cn("mt-5 text-xl font-semibold", isDark ? "text-white" : "text-slate-900")}>{title}</h3>
                      <p className={cn("mt-3 text-sm leading-7", isDark ? "text-slate-200/90" : "text-slate-600")}>
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="scroll-mt-32 py-12 sm:py-16">
              <div
                className={cn(
                  "rounded-[36px] border p-6 backdrop-blur-2xl sm:p-8 lg:p-10",
                  isDark
                    ? "border-white/10 bg-white/6"
                    : "border-slate-200/80 bg-white/85"
                )}
              >
                <div className="max-w-2xl">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-violet-200">
                    How It Works
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                    Start generating in four simple steps
                  </h2>
                </div>

                <div className="mt-10 grid gap-5 lg:grid-cols-4">
                  {steps.map(({ label, title, description }) => (
                    <div
                      key={title}
                      className={cn(
                        "rounded-[28px] border p-6",
                        isDark
                          ? "border-white/10 bg-slate-950/55"
                          : "border-slate-200 bg-slate-50"
                      )}
                    >
                      <p className="text-sm font-medium text-cyan-300">{label}</p>
                      <h3 className={cn("mt-4 text-xl font-semibold", isDark ? "text-white" : "text-slate-900")}>{title}</h3>
                      <p className={cn("mt-3 text-sm leading-7", isDark ? "text-slate-300" : "text-slate-600")}>{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="scroll-mt-32 py-12 sm:py-16">
              <div className="max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-300">
                  Why Choose Genius AI
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Built to feel fast, focused, and genuinely premium
                </h2>
              </div>

              <div className="mt-10 grid gap-5 md:grid-cols-2">
                {reasons.map(({ title, description, icon: Icon, accent }) => (
                  <div
                    key={title}
                    className={cn(
                      "rounded-[32px] border p-7",
                      isDark
                        ? "border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.85),rgba(15,23,42,0.55))] shadow-[0_20px_80px_rgba(2,6,23,0.35)]"
                        : "border-slate-200/80 bg-white shadow-[0_18px_70px_rgba(148,163,184,0.2)]"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-14 items-center justify-center rounded-2xl border",
                        isDark
                          ? "border-white/10 bg-white/7"
                          : "border-slate-200 bg-slate-50"
                      )}
                    >
                      <Icon className={`size-7 ${accent}`} />
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold">{title}</h3>
                    <p className={cn("mt-3 text-base leading-8", isDark ? "text-slate-300" : "text-slate-600")}>{description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="py-14 sm:py-18">
              <div className="overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,rgba(6,182,212,0.16),rgba(91,33,182,0.2),rgba(236,72,153,0.14))] p-[1px] shadow-[0_30px_120px_rgba(6,182,212,0.16)]">
                <div
                  className={cn(
                    "rounded-[40px] px-6 py-10 text-center backdrop-blur-2xl sm:px-10 sm:py-14",
                    isDark
                      ? "bg-slate-950/88"
                      : "bg-white/92"
                  )}
                >
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">
                    Ready to create
                  </p>
                  <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
                    Launch your next idea with prompt-powered AI
                  </h2>
                  <p className={cn("mx-auto mt-5 max-w-2xl text-lg leading-8", isDark ? "text-slate-300" : "text-slate-600")}>
                    Sign in, type what you want, and let Genius AI turn intent into output
                    across chat, code, images, music, and video.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <Button
                      asChild
                      size="lg"
                      className="rounded-full border border-cyan-300/40 bg-[linear-gradient(120deg,#06b6d4,#8b5cf6,#ec4899)] px-7 text-white shadow-[0_16px_45px_rgba(139,92,246,0.35)] transition hover:scale-[1.02]"
                    >
                      <Link href={startHref}>
                        Start Now
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className={cn(
                        "rounded-full px-7",
                        isDark
                          ? "border-white/15 bg-white/6 text-white hover:bg-white/10 hover:text-white"
                          : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:text-slate-950"
                      )}
                    >
                      <Link href="#features">See Features</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <footer
              id="terms"
              className={cn(
                "border-t py-8 text-sm",
                isDark
                  ? "border-white/10 text-slate-300"
                  : "border-slate-200 text-slate-600"
              )}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>Genius AI</p>
                  <p className={cn("mt-2 max-w-xl", isDark ? "text-slate-400" : "text-slate-500")}>
                    {currentYear} Genius AI. All rights reserved. Create with confidence
                    using a secure, modern AI workspace.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Link href="/" className={cn("transition", isDark ? "hover:text-white" : "hover:text-slate-950")}>
                    Home
                  </Link>
                  <Link href="#features" className={cn("transition", isDark ? "hover:text-white" : "hover:text-slate-950")}>
                    Features
                  </Link>
                  <Link href="/login" className={cn("transition", isDark ? "hover:text-white" : "hover:text-slate-950")}>
                    Login
                  </Link>
                  <Link href="/register" className={cn("transition", isDark ? "hover:text-white" : "hover:text-slate-950")}>
                    Register
                  </Link>
                  <Link href="/dashboard" className={cn("transition", isDark ? "hover:text-white" : "hover:text-slate-950")}>
                    Dashboard
                  </Link>
                  <a href="mailto:contact@genius-ai.app" className={cn("transition", isDark ? "hover:text-white" : "hover:text-slate-950")}>
                    Contact
                  </a>
                  <Link href="#terms" className={cn("transition", isDark ? "hover:text-white" : "hover:text-slate-950")}>
                    Terms
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </>
  );
}
