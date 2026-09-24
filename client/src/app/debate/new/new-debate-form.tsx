"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { createDebate, startDebate } from "@/lib/debates";
import { getScenario, type Scenario } from "@/lib/scenarios";

export default function NewDebateForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scenarioId = searchParams.get("scenarioId")?.trim() ?? "";
  const positionId = searchParams.get("position")?.trim() ?? "";

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [createdDebateId, setCreatedDebateId] = useState("");

  useEffect(() => {
    if (!scenarioId || !positionId) return;

    let active = true;

    async function loadScenario() {
      try {
        const result = await getScenario(scenarioId);
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

    void loadScenario();
    return () => {
      active = false;
    };
  }, [scenarioId, positionId]);

  const selectedPosition = scenario?.positions.find(
    (position) => position.id === positionId,
  );

  if (!scenarioId || !positionId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Unable to prepare debate</h1>
          <p className="mt-3 text-slate-400">
            A scenario and position are required to start a debate.
          </p>
          <Link href="/scenarios" className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-medium text-slate-950 transition hover:bg-slate-200">
            Back to scenarios
          </Link>
        </div>
      </main>
    );
  }

  async function handleStartDebate() {
    if (!scenarioId || !positionId || !selectedPosition || starting) return;

    setStarting(true);
    setError("");

    try {
      let debateId = createdDebateId;

      if (!debateId) {
        const created = await createDebate({
          scenarioId,
          selectedPosition: positionId,
        });
        debateId = created.debate._id;
        setCreatedDebateId(debateId);
      }

      await startDebate(debateId);
      router.replace(`/debate/${encodeURIComponent(debateId)}`);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to start debate",
      );
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading scenario...
      </main>
    );
  }

  if (!scenario || !selectedPosition) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Unable to prepare debate</h1>
          <p className="mt-3 text-slate-400">
            {error || "The selected position is not available for this scenario."}
          </p>
          <Link
            href="/scenarios"
            className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-medium text-slate-950 transition hover:bg-slate-200"
          >
            Back to scenarios
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <Link href={`/scenarios/${encodeURIComponent(scenarioId)}`} className="text-sm text-slate-400 hover:text-white">
            ← Back to scenario
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-sm uppercase tracking-widest text-slate-500">Debate setup</p>
        <h1 className="mt-2 text-4xl font-bold">Ready to defend your position?</h1>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              {scenario.category}
            </span>
            <span className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-400">
              {scenario.difficulty}
            </span>
          </div>
          <h2 className="mt-5 text-2xl font-semibold">{scenario.title}</h2>
          <p className="mt-3 leading-7 text-slate-400">{scenario.description}</p>
          <div className="mt-6 rounded-xl bg-slate-950 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">Your selected position</p>
            <h3 className="mt-2 font-semibold">{selectedPosition.label}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{selectedPosition.description}</p>
          </div>
        </section>

        {error && (
          <div role="alert" className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleStartDebate}
          disabled={starting}
          className="mt-8 w-full rounded-xl bg-white px-5 py-4 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {starting ? "Starting debate..." : "Start Debate"}
        </button>
      </div>
    </main>
  );
}
