"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getEvaluationDetails,
  getProfile,
  type EvaluationDetails,
  type RecentEvaluationSummary,
  type UserProfile,
} from "@/lib/profile";

interface RecentEvaluation extends RecentEvaluationSummary {
  details?: EvaluationDetails;
  detailError?: boolean;
}

const scoreLabels = [
  ["Overall", "overall"],
  ["Reasoning", "reasoning"],
  ["Evidence", "evidence"],
  ["Counter-argument", "counterArgument"],
  ["Consistency", "consistency"],
  ["Adaptability", "adaptability"],
] as const;

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentEvaluations, setRecentEvaluations] = useState<RecentEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const result = await getProfile();
        if (!active) return;

        setProfile(result.profile);

        const recentWithDetails = await Promise.all(
          result.profile.recentEvaluations.map(async (summary) => {
            try {
              const result = await getEvaluationDetails(summary.evaluationId);
              return { ...summary, details: result.evaluation };
            } catch {
              return { ...summary, detailError: true };
            }
          }),
        );

        if (active) setRecentEvaluations(recentWithDetails);
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Could not load your profile.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading your profile...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="font-semibold">AI Debate Arena</h1>
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
            Back to dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm uppercase tracking-widest text-slate-500">Your progress</p>
        <h2 className="mt-2 text-4xl font-bold">Profile</h2>

        {error && (
          <section role="alert" className="mt-8 rounded-2xl border border-red-900 bg-red-950/40 p-6">
            <h3 className="font-semibold text-red-200">Couldn&apos;t load your profile</h3>
            <p className="mt-2 text-sm text-red-300">{error}</p>
          </section>
        )}

        {profile && (
          <>
            <section className="mt-8">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Completed evaluations</p>
                <p className="mt-2 text-4xl font-bold">{profile.totalEvaluations}</p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {scoreLabels.map(([label, key]) => (
                  <div key={key} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <p className="text-sm text-slate-400">Average {label.toLowerCase()} score</p>
                    <p className="mt-2 text-3xl font-semibold">{profile.averageScores[key]}<span className="ml-1 text-sm font-normal text-slate-500">/100</span></p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <h3 className="text-2xl font-semibold">Recent evaluations</h3>

              {recentEvaluations.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
                  No completed debates yet. Start your first debate.
                  <Link href="/scenarios" className="ml-2 text-white underline underline-offset-4">
                    Explore scenarios
                  </Link>
                </div>
              ) : (
                <div className="mt-5 space-y-5">
                  {recentEvaluations.map((evaluation) => (
                    <RecentEvaluationCard key={evaluation.evaluationId} evaluation={evaluation} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function RecentEvaluationCard({ evaluation }: { evaluation: RecentEvaluation }) {
  const details = evaluation.details;

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h4 className="font-semibold">Debate evaluation</h4>
          <p className="mt-1 text-sm text-slate-500">
            {new Date(evaluation.createdAt).toLocaleDateString()} · Debate {evaluation.debateId}
          </p>
        </div>
        <p className="rounded-lg bg-slate-950 px-4 py-2 text-sm text-slate-300">
          Overall <span className="ml-1 font-semibold text-white">{evaluation.overallScore}/100</span>
        </p>
      </div>

      {details ? (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {scoreLabels.slice(1).map(([label, key]) => {
              const detailKey = `${key}Score` as keyof EvaluationDetails;
              const score = details[detailKey];

              return (
                <div key={key} className="rounded-xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 text-xl font-semibold">{typeof score === "number" ? score : "—"}<span className="ml-1 text-xs font-normal text-slate-600">/100</span></p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <h5 className="text-sm font-semibold">Strengths</h5>
              {details.strengths.length > 0 ? (
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-400">
                  {details.strengths.map((strength, index) => <li key={`${index}-${strength}`}>{strength}</li>)}
                </ul>
              ) : <p className="mt-2 text-sm text-slate-500">None listed.</p>}
            </div>
            <div>
              <h5 className="text-sm font-semibold">Areas to improve</h5>
              {details.weaknesses.length > 0 ? (
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-400">
                  {details.weaknesses.map((weakness, index) => <li key={`${index}-${weakness}`}>{weakness}</li>)}
                </ul>
              ) : <p className="mt-2 text-sm text-slate-500">None listed.</p>}
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-slate-950 p-4">
            <h5 className="text-sm font-semibold">Feedback</h5>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">{details.feedback}</p>
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          {evaluation.detailError ? "Detailed scores and feedback could not be loaded." : "Loading evaluation details..."}
        </p>
      )}
    </article>
  );
}
