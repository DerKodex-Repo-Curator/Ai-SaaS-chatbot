"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  Clock3,
  Code,
  ImageIcon,
  MessageSquare,
  Music,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  VideoIcon,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToolCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  accent: string;
  iconColor: string;
  iconSurface: string;
};

type StatCard = {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  accent: string;
};

const tools: ToolCard[] = [
  {
    title: "Conversation AI",
    description:
      "Start intelligent prompt-based chats, build context, and keep every conversation organized.",
    icon: MessageSquare,
    href: "/conversation",
    accent: "from-violet-500/20 via-fuchsia-500/10 to-transparent",
    iconColor: "text-violet-300",
    iconSurface: "bg-violet-500/12",
  },
  {
    title: "Code Generator",
    description:
      "Generate snippets, debug logic, and shape developer-ready outputs from natural language.",
    icon: Code,
    href: "/code",
    accent: "from-emerald-500/20 via-cyan-500/10 to-transparent",
    iconColor: "text-emerald-300",
    iconSurface: "bg-emerald-500/12",
  },
  {
    title: "Image Generator",
    description:
      "Turn descriptive prompts into visual ideas, concept art, and creative image workflows.",
    icon: ImageIcon,
    href: "/image",
    accent: "from-pink-500/20 via-rose-500/10 to-transparent",
    iconColor: "text-pink-300",
    iconSurface: "bg-pink-500/12",
  },
  {
    title: "Music Generator",
    description:
      "Explore prompt-first music creation with faster ideation for moods, tracks, and audio concepts.",
    icon: Music,
    href: "/music",
    accent: "from-amber-400/20 via-orange-500/10 to-transparent",
    iconColor: "text-amber-200",
    iconSurface: "bg-amber-500/12",
  },
  {
    title: "Video Generator",
    description:
      "Create cinematic concepts, visual scenes, and motion-driven ideas from a single prompt.",
    icon: VideoIcon,
    href: "/video",
    accent: "from-sky-500/20 via-indigo-500/10 to-transparent",
    iconColor: "text-sky-300",
    iconSurface: "bg-sky-500/12",
  },
];

const stats: StatCard[] = [
  {
    label: "Total generations",
    value: "12,480",
    trend: "+18.4% this week",
    icon: BarChart3,
    accent: "text-cyan-300",
  },
  {
    label: "Images created",
    value: "3,264",
    trend: "+240 today",
    icon: ImageIcon,
    accent: "text-pink-300",
  },
  {
    label: "Codes generated",
    value: "1,942",
    trend: "+12 active sessions",
    icon: Code,
    accent: "text-emerald-300",
  },
  {
    label: "Videos created",
    value: "428",
    trend: "+31 queued concepts",
    icon: VideoIcon,
    accent: "text-sky-300",
  },
];

const recentActivity = [
  {
    title: "Conversation prompt refined",
    description: "Expanded the assistant response flow for product launch research.",
    time: "2 min ago",
    status: "Live",
    statusClassName: "bg-cyan-500/15 text-cyan-300",
  },
  {
    title: "Code workspace updated",
    description: "New debugging session started for component styling and layout cleanup.",
    time: "18 min ago",
    status: "Active",
    statusClassName: "bg-emerald-500/15 text-emerald-300",
  },
  {
    title: "Image prompt staged",
    description: "Prepared a cinematic neon city concept prompt for visual generation.",
    time: "46 min ago",
    status: "Queued",
    statusClassName: "bg-pink-500/15 text-pink-300",
  },
  {
    title: "Video concept drafted",
    description: "Storyboard prompt created for a premium AI product teaser sequence.",
    time: "1 hr ago",
    status: "Draft",
    statusClassName: "bg-orange-500/15 text-orange-300",
  },
];

const workspaceSignals = [
  {
    label: "Prompt quality",
    value: "92%",
    width: "w-[92%]",
    accent: "bg-cyan-400",
  },
  {
    label: "Generation velocity",
    value: "86%",
    width: "w-[86%]",
    accent: "bg-violet-400",
  },
  {
    label: "Workspace uptime",
    value: "99.9%",
    width: "w-full",
    accent: "bg-emerald-400",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="relative overflow-hidden rounded-[36px] border border-border/60 bg-card/80 p-6 text-card-foreground shadow-[0_24px_90px_rgba(15,23,42,0.16)] backdrop-blur-2xl sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_34%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.08),transparent_40%)]" />

          <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
                <Sparkles className="h-4 w-4" />
                Premium AI workspace ready
              </div>

              <h2 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Welcome to Genius AI
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
                Create anything using AI prompts. Move from ideas to chat, code,
                images, music, and video with a premium workspace built for speed.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full border border-cyan-300/30 bg-[linear-gradient(120deg,#06b6d4,#8b5cf6,#ec4899)] px-7 text-white shadow-[0_18px_45px_rgba(14,165,233,0.24)] transition hover:scale-[1.02]"
                >
                  <Link href="/conversation">
                    Start Creating
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full border-border/60 bg-background/60 px-7"
                >
                  <Link href="/code">Open Code Generator</Link>
                </Button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  "One prompt, multiple creative tools",
                  "Premium AI-first dashboard layout",
                  "Fast switching between workflows",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border/60 bg-background/55 px-4 py-4 text-sm text-muted-foreground backdrop-blur-xl"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[30px] border border-border/60 bg-background/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Workflow pulse
                    </p>
                    <p className="mt-2 text-3xl font-semibold">27 active prompts</p>
                  </div>
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3">
                    <TrendingUp className="h-6 w-6 text-cyan-300" />
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Avg response
                    </p>
                    <p className="mt-2 text-xl font-semibold">1.8s</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Prompt streak
                    </p>
                    <p className="mt-2 text-xl font-semibold">14 days</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-border/60 bg-background/70 p-5 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Trust layer
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      Secure account and protected workspace access
                    </p>
                  </div>
                  <ShieldCheck className="h-6 w-6 text-emerald-300" />
                </div>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Your dashboard keeps prompts, sessions, and tools organized behind
                  secure authentication with a clean AI SaaS workflow.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[28px] border border-border/60 bg-card/80 p-5 text-card-foreground shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl transition hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
                  <stat.icon className={cn("h-5 w-5", stat.accent)} />
                </div>
                <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-medium text-emerald-300">
                  {stat.trend}
                </span>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
          <div className="rounded-[34px] border border-border/60 bg-card/80 p-6 text-card-foreground shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-2xl sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-300">
                  AI Tools
                </p>
                <h3 className="mt-2 text-3xl font-semibold tracking-tight">
                  Launch the right generator for the job
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  Every tool below keeps the existing routing intact, so you can jump
                  straight into the current conversation, code, image, music, and video flows.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-cyan-300" />
                Fast switching between AI modes
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {tools.map((tool) => (
                <button
                  key={tool.href}
                  type="button"
                  onClick={() => router.push(tool.href)}
                  className="group relative overflow-hidden rounded-[30px] border border-border/60 bg-background/70 p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_24px_70px_rgba(56,189,248,0.16)]"
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", tool.accent)} />
                  <div className="absolute -right-10 top-8 h-28 w-28 rounded-full bg-white/8 blur-3xl transition duration-300 group-hover:scale-125" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={cn(
                          "rounded-[22px] border border-border/60 p-3 shadow-sm",
                          tool.iconSurface
                        )}
                      >
                        <tool.icon className={cn("h-6 w-6", tool.iconColor)} />
                      </div>
                      <span className="rounded-full bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                        Open tool
                      </span>
                    </div>

                    <h4 className="mt-6 text-xl font-semibold">{tool.title}</h4>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {tool.description}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-cyan-300">
                      Launch workspace
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[34px] border border-border/60 bg-card/80 p-6 text-card-foreground shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-violet-300">
                    Recent Activity
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">Latest workspace events</h3>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
                  <Clock3 className="h-5 w-5 text-violet-300" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {recentActivity.map((item) => (
                  <div
                    key={`${item.title}-${item.time}`}
                    className="rounded-[24px] border border-border/60 bg-background/65 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                          item.statusClassName
                        )}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {item.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[34px] border border-border/60 bg-card/80 p-6 text-card-foreground shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-300">
                    Workspace Signals
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">System snapshot</h3>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
                  <BarChart3 className="h-5 w-5 text-emerald-300" />
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {workspaceSignals.map((signal) => (
                  <div key={signal.label}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">{signal.label}</span>
                      <span className="font-semibold">{signal.value}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-background/80">
                      <div
                        className={cn(
                          "h-2.5 rounded-full shadow-[0_0_24px_rgba(34,211,238,0.28)]",
                          signal.width,
                          signal.accent
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] border border-cyan-400/20 bg-cyan-500/10 px-4 py-4">
                <div className="flex items-center gap-2 text-sm font-medium text-cyan-300">
                  <Sparkles className="h-4 w-4" />
                  Suggestion
                </div>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Start in Conversation AI to refine your idea, then jump into Code
                  or Image tools for a faster multi-step workflow.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
