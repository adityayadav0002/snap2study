"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    console.error("[Snap2Study] Application error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-(--paper)">
      <div className="container flex min-h-screen items-center justify-center py-16">

        <section className="w-full max-w-xl border-2 border-black bg-(--cream) p-8 shadow-[8px_8px_0_var(--black)]">

          <div className="mono text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">
            SNAP2STUDY / ERROR
          </div>

          <h1 className="serif mt-5 text-5xl leading-none">
            Something went wrong.
          </h1>

          <p className="mt-5 text-sm leading-6 text-black/55">
            We couldn't load this part of Snap2Study.
            Your question has not been lost.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">

            <button
              type="button"
              onClick={reset}
              className="
                brutal-border
                bg-(--yellow)
                px-5
                py-3
                text-[9px]
                font-bold
                uppercase
                tracking-[0.12em]
                shadow-[4px_4px_0_var(--black)]
                transition-all
                hover:-translate-x-0.5
                hover:-translate-y-0.5
                hover:shadow-[6px_6px_0_var(--black)]
              "
            >
              Try again
            </button>

            <a
              href="/"
              className="
                brutal-border
                bg-(--paper)
                px-5
                py-3
                text-[9px]
                font-bold
                uppercase
                tracking-[0.12em]
                transition-colors
                hover:bg-(--coral)
              "
            >
              Back home
            </a>

          </div>

        </section>

      </div>
    </main>
  );
}