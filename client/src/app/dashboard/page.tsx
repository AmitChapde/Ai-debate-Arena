"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleUserRound } from "lucide-react";

import { getCurrentUser, logoutUser, type User } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const result = await getCurrentUser();
        if (active) setUser(result.user);
      } catch {
        router.replace("/login");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadUser();
    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    try {
      await logoutUser();
      router.replace("/login");
    } catch {
      // Keep the dashboard visible if the logout request fails.
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading...
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="font-semibold">AI Debate Arena</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
              aria-label={`View ${user.name}'s profile`}
            >
              <CircleUserRound aria-hidden="true" size={20} />
              <span>{user.name}</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm text-slate-400">Welcome back</p>
        <h2 className="mt-2 text-4xl font-bold">{user.name}</h2>

        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h3 className="text-xl font-semibold">
            Ready to test your reasoning?
          </h3>

          <p className="mt-2 text-slate-400">
            Choose a scenario and enter the debate arena.
          </p>

          <Link
            href="/scenarios"
            className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Explore Scenarios →
          </Link>
        </div>
      </div>
    </main>
  );
}
