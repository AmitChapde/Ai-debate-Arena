"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getScenarios,
  type Scenario,
  type ScenarioCategory,
  type ScenarioDifficulty,
} from "@/lib/scenarios";

const categories: ScenarioCategory[] = [
  "business",
  "technology",
  "leadership",
  "ethics",
  "crisis",
  "strategy",
];

const difficulties: ScenarioDifficulty[] = [
  "easy",
  "medium",
  "hard",
  "expert",
];

export default function ScenariosPage() {
  const [scenarios, setScenarios] =
    useState<Scenario[]>([]);

  const [category, setCategory] =
    useState("");

  const [difficulty, setDifficulty] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadScenarios() {
      setLoading(true);
      setError("");

      try {
        const result =
          await getScenarios({
            category: category || undefined,
            difficulty:
              difficulty || undefined,
            status: "published",
          });

        setScenarios(result.scenarios);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load scenarios",
        );
      } finally {
        setLoading(false);
      }
    }

    loadScenarios();
  }, [category, difficulty]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/dashboard"
            className="font-semibold"
          >
            AI Debate Arena
          </Link>

          <Link
            href="/dashboard"
            className="text-sm text-slate-400 hover:text-white"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div>
          <p className="text-sm uppercase tracking-widest text-slate-500">
            Debate Arena
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Choose your challenge
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Pick a scenario, take a position, and defend
            your reasoning against an AI challenger.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
          >
            <option value="">
              All categories
            </option>

            {categories.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item.charAt(0).toUpperCase() +
                  item.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={(event) =>
              setDifficulty(event.target.value)
            }
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
          >
            <option value="">
              All difficulties
            </option>

            {difficulties.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item.charAt(0).toUpperCase() +
                  item.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mt-8 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-12 text-slate-400">
            Loading scenarios...
          </div>
        ) : scenarios.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-xl font-semibold">
              No scenarios found
            </h2>

            <p className="mt-2 text-slate-400">
              Try changing your filters.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario._id}
                scenario={scenario}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ScenarioCard({
  scenario,
}: {
  scenario: Scenario;
}) {
  return (
    <Link
      href={`/scenarios/${scenario._id}`}
      className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-slate-600"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
          {scenario.category}
        </span>

        <span className="text-xs text-slate-500">
          {scenario.difficulty}
        </span>
      </div>

      <h2 className="mt-5 text-xl font-semibold group-hover:text-slate-200">
        {scenario.title}
      </h2>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
        {scenario.description}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {scenario.positions.length} positions
        </span>

        <span className="text-sm font-medium text-white">
          Explore →
        </span>
      </div>
    </Link>
  );
}