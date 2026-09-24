import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
        <div className="max-w-3xl">
          <p className="mb-6 text-sm font-medium uppercase tracking-[0.3em] text-zinc-400">
            AI Debate Arena
          </p>

          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Think better.
            <br />
            Argue better.
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
            Challenge your reasoning through realistic AI-powered debates
            and receive detailed feedback on your performance.
          </p>

          <div className="mt-10 flex gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-white px-5 py-3 font-medium text-slate-950 transition hover:bg-slate-200"
            >
              Get Started
            </Link>

            <Link
              href="/login"
              className="rounded-lg border border-slate-700 px-5 py-3 font-medium text-white transition hover:bg-slate-900"
            >
              Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
