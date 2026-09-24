import { Suspense } from "react";
import NewDebateForm from "./new-debate-form";

export default function NewDebatePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
          Loading debate setup...
        </main>
      }
    >
      <NewDebateForm />
    </Suspense>
  );
}
