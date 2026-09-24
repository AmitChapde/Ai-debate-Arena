"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getScenario, type Scenario } from "@/lib/scenarios";

export default function ScenarioPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadScenario() {
      try {
        const result = await getScenario(id);
        if (active) setScenario(result.scenario);
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Failed to load scenario",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (id) void loadScenario();
    return () => {
      active = false;
    };
  }, [id]);

  function handleStartDebate() {
    if (!selectedPosition) return;

    router.push(
      `/debate/new?scenarioId=${encodeURIComponent(id)}&position=${encodeURIComponent(selectedPosition)}`,
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading scenario...
      </main>
    );
  }

  if (error || !scenario) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Scenario unavailable</h1>
          <p className="mt-2 text-slate-400">{error || "Scenario not found"}</p>
          <Link href="/scenarios" className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-medium text-slate-950">
            Back to scenarios
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <Link href="/scenarios" className="text-sm text-slate-400 hover:text-white">
            ← Back to scenarios
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
            {scenario.category}
          </span>
          <span className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-400">
            {scenario.difficulty}
          </span>
        </div>

        <h1 className="mt-6 text-4xl font-bold">{scenario.title}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-400">{scenario.description}</p>

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Situation</h2>
          <p className="mt-3 leading-7 text-slate-400">{scenario.context}</p>
        </section>

        {scenario.constraints.length > 0 && (
          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Constraints</h2>
            <ul className="mt-4 space-y-3 text-slate-400">
              {scenario.constraints.map((constraint, index) => (
                <li key={`${index}-${constraint}`} className="flex gap-3">
                  <span className="text-slate-600">•</span>
                  {constraint}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Take a position</h2>
          <p className="mt-2 text-slate-400">
            Choose the position you want to defend. The AI will challenge your reasoning.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {scenario.positions.map((position) => {
              const selected = selectedPosition === position.id;

              return (
                <button
                  key={position.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedPosition(position.id)}
                  className={`rounded-2xl border p-6 text-left transition ${selected ? "border-white bg-slate-800" : "border-slate-800 bg-slate-900 hover:border-slate-600"}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{position.label}</h3>
                    <span className={`h-4 w-4 rounded-full border ${selected ? "border-white bg-white" : "border-slate-600"}`} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{position.description}</p>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!selectedPosition}
            onClick={handleStartDebate}
            className="mt-8 w-full rounded-xl bg-white px-5 py-4 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue to Debate →
          </button>
        </section>
      </div>
    </main>
  );
}
