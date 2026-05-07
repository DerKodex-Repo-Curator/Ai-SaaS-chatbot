"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { LogIn, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type MongoAuthFormProps = {
  mode: "login" | "register";
};

type AuthResponse = {
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

export function MongoAuthForm({ mode }: MongoAuthFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(isRegister ? { name } : {}),
          email,
          password,
        }),
      });
      const data = (await response.json()) as AuthResponse;

      if (!response.ok) {
        setError(data.message ?? "Authentication failed.");
        return;
      }

      setMessage(data.message ?? "Success.");

      if (isRegister) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the auth server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-[20px] border border-[#334155] bg-[#0f172a]/70 p-5 text-slate-100 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10">
          {isRegister ? (
            <UserPlus className="h-5 w-5 text-cyan-300" />
          ) : (
            <LogIn className="h-5 w-5 text-cyan-300" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            {isRegister ? "Create account" : "Login"}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {isRegister
              ? "Your details will be saved in MongoDB Atlas."
              : "Login updates your last login in MongoDB Atlas."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister ? (
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-200">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="h-11 border-slate-600 bg-slate-900/70 text-white"
              placeholder="Your name"
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-200">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="h-11 border-slate-600 bg-slate-900/70 text-white"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-200">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            className="h-11 border-slate-600 bg-slate-900/70 text-white"
            placeholder="Minimum 6 characters"
          />
        </div>

        {message ? (
          <p className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400"
        >
          {isSubmitting
            ? "Please wait..."
            : isRegister
              ? "Register in Atlas"
              : "Login"}
        </Button>
      </form>

      <div className="mt-5 text-center text-sm text-slate-400">
        {isRegister ? "Already registered?" : "New here?"}{" "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className={cn("font-medium text-cyan-300 hover:text-cyan-200")}
        >
          {isRegister ? "Login" : "Create account"}
        </Link>
      </div>
    </div>
  );
}
