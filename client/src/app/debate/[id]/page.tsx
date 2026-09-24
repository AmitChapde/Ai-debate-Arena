"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  generateChallenge,
  getDebate,
  judgeDebate,
  startDebate,
  submitDebateResponse,
  type Debate,
  type DebateEvaluation,
  type DebateMessage,
} from "@/lib/debates";
import { getScenario, type Scenario } from "@/lib/scenarios";

export default function DebatePage() {
  const params = useParams();
  const router = useRouter();
  const debateId = params.id as string;

  const [debate, setDebate] = useState<Debate | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const startedRef = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadDebate() {
      try {
        setLoading(true);
        setError("");
        const result = await getDebate(debateId);
        if (!active) return;
        setDebate(result.debate);

        const scenarioResult = await getScenario(result.debate.scenarioId);
        if (active) setScenario(scenarioResult.scenario);
      } catch (caughtError) {
        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : "Failed to load debate");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (debateId) void loadDebate();
    return () => {
      active = false;
    };
  }, [debateId]);

  useEffect(() => {
    if (!debate || debate.status !== "created" || startedRef.current) return;
    startedRef.current = true;

    async function beginDebate() {
      try {
        setActionLoading(true);
        setError("");
        const result = await startDebate(debateId);
        setDebate(result.debate);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Failed to start debate");
        startedRef.current = false;
      } finally {
        setActionLoading(false);
      }
    }

    void beginDebate();
  }, [debate, debateId]);

  async function handleSubmitResponse() {
    const content = response.trim();
    if (!debate || content.length < 10) return;

    try {
      setActionLoading(true);
      setError("");
      const result = await submitDebateResponse(debateId, content);
      setResponse("");
      setDebate((current) => current ? {
        ...current,
        messages: [...current.messages, result.message],
        currentTurn: "challenger",
      } : current);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to submit response");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleChallenge() {
    try {
      setActionLoading(true);
      setError("");
      const result = await generateChallenge(debateId);
      setDebate(result.debate);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to generate challenge");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleJudge() {
    try {
      setActionLoading(true);
      setError("");
      const result = await judgeDebate(debateId);
      setDebate(result.debate);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to evaluate debate");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">Loading debate...</main>;
  }

  if (!debate) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Debate unavailable</h1>
          <p className="mt-2 text-slate-400">{error || "Debate not found"}</p>
          <Link href="/scenarios" className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-medium text-slate-950">Back to scenarios</Link>
        </div>
      </main>
    );
  }

  const selectedPosition = scenario?.positions.find((position) => position.id === debate.selectedPosition);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/scenarios" className="font-semibold">AI Debate Arena</Link>
          <span className="text-sm text-slate-500">Round {debate.currentRound} / 3</span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {scenario && (
          <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{scenario.category}</span>
              <span className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-400">{scenario.difficulty}</span>
            </div>
            <h1 className="mt-4 text-2xl font-bold">{scenario.title}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">{scenario.description}</p>
            {selectedPosition && (
              <div className="mt-5 rounded-xl bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">Your position</p>
                <p className="mt-1 font-semibold">{selectedPosition.label}</p>
                <p className="mt-1 text-sm text-slate-400">{selectedPosition.description}</p>
              </div>
            )}
          </section>
        )}

        {error && <div role="alert" className="mb-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">{error}</div>}

        <section className="space-y-5">
          {debate.messages.map((message, index) => <MessageCard key={`${message.createdAt}-${index}`} message={message} />)}
        </section>

        {actionLoading && <div className="mt-8 text-center text-sm text-slate-500">AI is thinking...</div>}

        {!actionLoading && debate.currentTurn === "user_response" && debate.status !== "completed" && (
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="font-semibold">Your response</h2>
            <p className="mt-2 text-sm text-slate-400">Defend your position. The challenger will stress-test your reasoning.</p>
            <textarea value={response} onChange={(event) => setResponse(event.target.value)} placeholder="Explain your reasoning..." maxLength={5000} rows={6} className="mt-5 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm outline-none placeholder:text-slate-600 focus:border-slate-500" />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-600">{response.length}/5000</span>
              <button type="button" disabled={response.trim().length < 10} onClick={handleSubmitResponse} className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40">Submit response</button>
            </div>
          </section>
        )}

        {!actionLoading && debate.currentTurn === "challenger" && (
          <div className="mt-8 text-center">
            <button type="button" onClick={handleChallenge} className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 hover:bg-slate-200">Face the challenge →</button>
          </div>
        )}

        {!actionLoading && debate.currentTurn === "judge" && debate.status !== "completed" && (
          <div className="mt-8 text-center">
            <button type="button" onClick={handleJudge} className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 hover:bg-slate-200">Evaluate my performance →</button>
          </div>
        )}

        {debate.status === "completed" && debate.evaluation && (
          <EvaluationCard evaluation={debate.evaluation} onProfile={() => router.push("/dashboard")} />
        )}
      </div>
    </main>
  );
}

function MessageCard({ message }: { message: DebateMessage }) {
  const isUser = message.speaker === "user";
  const labels = { user: "You", advocate: "The Advocate", challenger: "The Challenger", judge: "The Judge" };

  return (
    <article className={`rounded-2xl border p-6 ${isUser ? "ml-8 border-slate-700 bg-slate-900" : "mr-8 border-slate-800 bg-slate-950"}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{labels[message.speaker]}</span>
        <span className="text-xs text-slate-600">Round {message.round}</span>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">{message.content}</p>
    </article>
  );
}

function EvaluationCard({ evaluation, onProfile }: { evaluation: DebateEvaluation; onProfile: () => void }) {
  const scores: [string, number][] = [
    ["Overall", evaluation.overallScore],
    ["Reasoning", evaluation.reasoningScore],
    ["Evidence", evaluation.evidenceScore],
    ["Counter-argument", evaluation.counterArgumentScore],
    ["Consistency", evaluation.consistencyScore],
    ["Adaptability", evaluation.adaptabilityScore],
  ];

  return (
    <section className="mt-10 rounded-2xl border border-slate-700 bg-slate-900 p-7">
      <p className="text-sm uppercase tracking-widest text-slate-500">Debate complete</p>
      <h2 className="mt-2 text-3xl font-bold">Your evaluation</h2>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {scores.map(([label, score]) => (
          <div key={label} className="rounded-xl bg-slate-950 p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold">{score}<span className="text-sm font-normal text-slate-600">/100</span></p>
          </div>
        ))}
      </div>
      <div className="mt-7 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="font-semibold">Strengths</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">{evaluation.strengths.map((strength, index) => <li key={`${index}-${strength}`}>• {strength}</li>)}</ul>
        </div>
        <div>
          <h3 className="font-semibold">Areas to improve</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">{evaluation.weaknesses.map((weakness, index) => <li key={`${index}-${weakness}`}>• {weakness}</li>)}</ul>
        </div>
      </div>
      <div className="mt-7 rounded-xl bg-slate-950 p-5">
        <h3 className="font-semibold">Feedback</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-400">{evaluation.feedback}</p>
      </div>
      <button type="button" onClick={onProfile} className="mt-7 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-200">Back to dashboard</button>
    </section>
  );
}
