import Link from "next/link";
import { CheckCircle2, ShieldCheck, Sparkles, Zap } from "lucide-react";

import BrandLogo from "@/components/brand-logo";

const AuthLayout = ({
    children
}:{
    children : React.ReactNode;
}) => {
    return (
        <>
            <style>{`
                body:has([data-auth-shell]) > header {
                    display: none;
                }

                body:has([data-auth-shell]) {
                    background: #0f172a;
                    color-scheme: dark;
                }

                [data-auth-shell] {
                    --auth-clerk-primary: #3b82f6;
                    --auth-clerk-primary-hover: #2563eb;
                    --auth-clerk-text: #f1f5f9;
                    --auth-clerk-text-secondary: #cbd5f5;
                    --auth-clerk-card-bg-start: #1e293b;
                    --auth-clerk-card-bg-end: #1e293b;
                    --auth-clerk-card-border: #334155;
                    --auth-clerk-input-bg: #334155;
                    --auth-clerk-input-bg-focus: #334155;
                    --auth-clerk-input-text: #f8fafc;
                    --auth-clerk-input-border: #475569;
                    --auth-clerk-placeholder: #94a3b8;
                    --auth-clerk-link: #60a5fa;
                    --auth-clerk-link-hover: #93c5fd;
                    --auth-clerk-danger-bg: rgba(239, 68, 68, 0.12);
                    --auth-clerk-danger-border: rgba(239, 68, 68, 0.35);
                    --auth-clerk-danger-text: #ef4444;
                    --auth-clerk-success: #22c55e;
                    --auth-clerk-social-bg: #475569;
                    --auth-clerk-social-bg-hover: #52657b;
                    --auth-clerk-social-border: #64748b;
                    --auth-frame-bg-start: rgba(15, 23, 42, 0.92);
                    --auth-frame-bg-end: rgba(30, 41, 59, 0.88);
                    --auth-frame-border: #334155;
                }
            `}</style>

            <main
                data-auth-shell
                className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#132238_52%,#1e293b_100%)] text-white"
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_30%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.08),transparent_38%)]" />
                <div className="pointer-events-none absolute inset-0 opacity-50 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:72px_72px]" />
                <div className="pointer-events-none absolute left-[6%] top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl motion-safe:animate-[auth-float_14s_ease-in-out_infinite]" />
                <div className="pointer-events-none absolute right-[8%] top-32 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl motion-safe:animate-[auth-float_16s_ease-in-out_infinite]" />
                <div className="pointer-events-none absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl motion-safe:animate-[auth-float_18s_ease-in-out_infinite]" />

                <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-6 sm:px-6 lg:px-8">
                    <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(400px,440px)] lg:gap-8">
                        <section className="rounded-[40px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] p-6 shadow-[0_30px_120px_rgba(2,6,23,0.38)] backdrop-blur-2xl transition-all duration-500 motion-safe:animate-[auth-fade-up_0.75s_cubic-bezier(0.16,1,0.3,1)_both] sm:p-8 lg:min-h-[calc(100vh-3rem)] lg:p-10">
                            <div className="flex h-full flex-col">
                                <div className="flex items-center justify-between gap-4">
                                    <BrandLogo href="/" size="lg" theme="light" />
                                    <Link
                                        href="/"
                                        className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
                                    >
                                        Back to Home
                                    </Link>
                                </div>

                                <div className="mt-10 max-w-xl">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 shadow-[0_12px_30px_rgba(6,182,212,0.14)]">
                                        <Sparkles className="h-4 w-4" />
                                        Secure Genius AI access
                                    </div>

                                    <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                                        Enter your premium AI workspace
                                    </h1>
                                    <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">
                                        Sign in or create your account to unlock prompt-based
                                        generation for chat, code, images, music, and video in one place.
                                    </p>
                                </div>

                                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-[30px] border border-white/10 bg-slate-950/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/20">
                                        <div className="flex items-center gap-2 text-sm font-medium text-cyan-300">
                                            <Zap className="h-4 w-4" />
                                            Fast access
                                        </div>
                                        <p className="mt-3 text-sm leading-7 text-slate-300">
                                            Jump into your dashboard and switch between AI tools
                                            without extra setup.
                                        </p>
                                    </div>

                                    <div className="rounded-[30px] border border-white/10 bg-slate-950/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400/20">
                                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
                                            <ShieldCheck className="h-4 w-4" />
                                            Secure account
                                        </div>
                                        <p className="mt-3 text-sm leading-7 text-slate-300">
                                            Clerk authentication stays unchanged while the UI
                                            gets a cleaner premium presentation.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(8,145,178,0.14),rgba(15,23,42,0.74),rgba(91,33,182,0.16))] p-6 shadow-[0_20px_60px_rgba(2,6,23,0.24)]">
                                    <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-300">
                                        What you get
                                    </p>
                                    <div className="mt-5 space-y-4">
                                        {[
                                            "AI conversation generation",
                                            "Code, image, music, and video workflows",
                                            "Instant redirect to dashboard after login or sign up",
                                        ].map((item) => (
                                            <div key={item} className="flex items-start gap-3">
                                                <CheckCircle2 className="mt-0.5 h-5 w-5 text-cyan-300" />
                                                <p className="text-sm leading-7 text-slate-200">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="flex items-center justify-center motion-safe:animate-[auth-fade-up_0.8s_cubic-bezier(0.16,1,0.3,1)_both] motion-safe:[animation-delay:120ms]">
                            <div className="relative mx-auto w-full max-w-[440px]">
                                <div className="pointer-events-none absolute -inset-4 rounded-[44px] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.24),transparent_58%)] blur-3xl" />
                                <div className="relative rounded-[28px] border border-[var(--auth-frame-border)] bg-[linear-gradient(180deg,var(--auth-frame-bg-start),var(--auth-frame-bg-end))] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.4)] backdrop-blur-3xl transition-all duration-500 sm:p-5">
                                    <div className="mb-4 flex items-center justify-between rounded-[18px] border border-[#334155] bg-[#0f172a]/80 px-4 py-3 text-xs font-medium uppercase tracking-[0.22em] text-slate-200">
                                        <span className="inline-flex items-center gap-2 text-cyan-300">
                                            <ShieldCheck className="h-4 w-4" />
                                            Protected Session
                                        </span>
                                        <span className="text-slate-400">Clerk Secure Auth</span>
                                    </div>

                                    <div className="rounded-[20px] border border-[#334155] bg-[#0f172a]/30 p-1.5">
                                        {children}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}

export default AuthLayout;
