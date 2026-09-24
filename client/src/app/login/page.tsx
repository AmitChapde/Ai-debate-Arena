"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { loginUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser({ email, password });
      router.push("/dashboard");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/" className="text-sm text-slate-400 hover:text-white">
            ← AI Debate Arena
          </Link>
          <h1 className="mt-6 text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-slate-400">Sign in to continue your debates.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-slate-400" placeholder="you@example.com" />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">Password</label>
            <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-slate-400" placeholder="••••••••" />
          </div>

          {error && <div role="alert" className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">{error}</div>}

          <button type="submit" disabled={loading} className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-white hover:underline">Create one</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
