"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AnswerRenderer from "@/components/AnswerRenderer";

type HistoryItem = {
  id: string;
  question: string;
  subject: string;
  topic: string;
  difficulty: string;
  answer: string;
  explanation: string;
  key_points: string[];
  similar_question: string;
  createdAt: string;
};

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadHistory() {
      try {
        const response = await fetch("/api/history", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        if (response.status === 401) {
          router.replace("/auth");
          return;
        }

        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data?.error || "Unable to load question history."
          );
        }

        if (!cancelled) {
          setHistory(
            Array.isArray(data?.history) ? data.history : []
          );
        }
      } catch (err) {
        console.error( "[Snap2Study] History loading error:", err
        );

        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load question history."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const filteredHistory = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return history;
    }

    return history.filter((item) =>
      [
        item.question,
        item.subject,
        item.topic,
        item.difficulty,
      ]
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [history, search]);

  function formatDate(date: string) {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return "Unknown date";
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function getQuestionPreview(
    question: string
  ) {
    const cleaned = question
      .replace(/\s+/g, " ")
      .trim();
    if (cleaned.length <= 180) {
      return cleaned;
    }
    return (
      cleaned.slice(0, 180).trimEnd() +
      "..."
    );
  }

  function getDifficultyClass(
    difficulty: string
  ) {
    switch (
      difficulty.toLowerCase()
    ) {
      case "easy": return "bg-(--yellow)";
      case "hard": return "bg-black text-white";
      default: return "bg-(--cream)";
    }
  }

  return (
    <main className="min-h-screen bg-(--cream)">
      <section className="border-b-2 border-black">
        <div className="container py-16 sm:py-20">
          <div className="mb-5 flex items-center gap-3">
            <span className="mono border-2 border-black bg-(--yellow) px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em]">
              07 / HISTORY
            </span>

            <span className="mono text-[9px] font-bold uppercase tracking-[0.16em]">
              Your questions
            </span>
          </div>

          <h1 className="max-w-4xl text-5xl leading-[0.95] tracking-[-0.045em] sm:text-7xl">
            Your Study
            <br />
            <span className="italic">
              History.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 opacity-70 sm:text-base">
            Every question you solve with
            Snap2Study, kept in one place.
          </p>
        </div>
      </section>

      <section className="container py-10 sm:py-14">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search your questions..."
              className=" mono w-full border-2 border-black bg-white px-4 py-4 text-xs outline-none transition placeholder:opacity-50 focus:bg-(--yellow)
              "/>
          </div>

          {!loading && (
            <div className="mono text-[9px] font-bold uppercase tracking-[0.14em] opacity-60">
              {filteredHistory.length}{" "}
              {filteredHistory.length === 1 ? "question" : "questions"}
            </div>
          )}
        </div>

        {loading && (
          <div className="border-2 border-black bg-white">
            <div className="flex min-h-52 items-center justify-center">
              <div className="mono text-[10px] font-bold uppercase tracking-[0.16em]">
                Loading history...
              </div>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="border-2 border-black bg-white p-8">
            <div className="mono mb-3 text-[10px] font-bold uppercase tracking-[0.14em]">
              Unable to load
            </div>

            <p className="text-sm">
              {error}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="
                mono mt-6 border-2 border-black bg-(--yellow) px-5 py-3 text-[9px] font-bold uppercase tracking-[0.12em] shadow-[3px_3px_0_var(--black)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--black)]
              ">
              Try again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          history.length === 0 && (
            <div className="border-2 border-black bg-white">
              <div className="grid min-h-80 place-items-center px-6 py-16 text-center">
                <div>
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-2 border-black bg-(--yellow) text-2xl font-bold">
                    ?
                  </div>

                  <h2 className="text-3xl tracking-[-0.03em]">
                    No questions yet.
                  </h2>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 opacity-60">
                    Snap your first question
                    to start building your
                    study history.
                  </p>

                  <a
                    href="/#snap"
                    className="
                      mono mt-7 inline-flex items-center gap-3 border-2 border-black bg-(--yellow) px-5
                      py-4 text-[9px] font-bold uppercase tracking-[0.12em] shadow-[3px_3px_0_var(--black)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--black)]
                    ">
                    Snap a question
                    <span className="text-base">
                      →
                    </span>
                  </a>
                </div>
              </div>
            </div>
          )}

        {!loading &&
          !error &&
          history.length > 0 &&
          filteredHistory.length === 0 && (
            <div className="border-2 border-black bg-white p-12 text-center">
              <h2 className="text-2xl">
                No matches found.
              </h2>

              <p className="mt-2 text-sm opacity-60">
                Try searching for another
                subject, topic, or question.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          filteredHistory.length > 0 && (
            <div className="border-t-2 border-black">
              {filteredHistory.map(
                (item, index) => (
                  <article
                    key={item.id}
                    className="
                      group border-b-2 border-black bg-white transition-colors hover:bg-(--yellow)
                    ">
                    <div className="grid gap-6 px-5 py-7 sm:grid-cols-[70px_1fr_auto] sm:px-7 sm:py-8">

                      <div className="mono hidden text-[10px] font-bold opacity-40 sm:block">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </div>

                      <div className="min-w-0">
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                          <span className="mono border-2 border-black px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em]">
                            {item.subject}
                          </span>

                          <span className="mono border-2 border-black px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em]">
                            {item.topic}
                          </span>

                          <span
                            className={`
                              mono  border-2 border-black px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em]
                              ${getDifficultyClass(
                                item.difficulty
                              )}
                            `}>
                            {item.difficulty}
                          </span>
                        </div>

                        <h2 className="max-w-3xl text-xl leading-snug tracking-[-0.02em] sm:text-2xl">
                          <AnswerRenderer content={getQuestionPreview(item.question)} />
                        </h2>

                        <div className="mono mt-5 text-[8px] font-bold uppercase tracking-[0.12em] opacity-50">
                          {formatDate( item.createdAt )}
                        </div>
                      </div>

                      <div className="flex items-end sm:items-center">
                        <button
                          onClick={() =>
                            router.push(
                              `/result?id=${encodeURIComponent(
                                item.id
                              )}`
                            )
                          }
                          className="
                            mono inline-flex items-center gap-3 border-2 border-black 
                            bg-(--cream) px-5 py-3 text-[9px] font-bold uppercase tracking-[0.12em] transition-all group-hover:bg-white hover:bg-(--yellow)
                          "
                        >
                          View
                          <span className="text-base">
                            →
                          </span>
                        </button>
                      </div>

                    </div>
                  </article>
                )
              )}
            </div>
          )}

      </section>
    </main>
  );
}