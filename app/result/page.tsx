"use client";

import AnswerRenderer from "@/components/AnswerRenderer";
import { useCallback, useEffect, useState, } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type AnalysisResult = {
  question: string;
  subject: string;
  topic: string;
  difficulty: string;
  answer: string;
  explanation: string;
  key_points: string[];
  similar_question: string;
};

function isValidResult(
  value: unknown
): value is AnalysisResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;
  return (
    typeof data.question === "string" &&
    typeof data.subject === "string" &&
    typeof data.topic === "string" &&
    typeof data.difficulty === "string" &&
    typeof data.answer === "string" &&
    typeof data.explanation === "string" &&
    Array.isArray(data.key_points) &&
    data.key_points.every(
      (item) => typeof item === "string"
    ) &&
    typeof data.similar_question === "string"
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const historyId = searchParams.get("id");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [copied, setCopied] = useState("");
  const [showPractice, setShowPractice] = useState(false);
  const [showKeyPoints, setShowKeyPoints] = useState(true);
  const [showOriginal, setShowOriginal] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isHistoryResult, setIsHistoryResult] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadResult() {
      setLoading(true);
      setError("");

      try {
        if (historyId) {
          setIsHistoryResult(true);

          const response = await fetch(
            `/api/history?id=${encodeURIComponent(
              historyId
            )}`,
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }
          );
          if (response.status === 401) {
            router.replace("/auth");
            return;
          }

          const data = await response.json();
          if (!response.ok) {
            throw new Error(
              data?.error || "Unable to load this analysis."
            );
          }

          const historyResult = data?.history;
          if (
            !isValidResult(
              historyResult
            )
          ) {
            throw new Error(
              "The saved analysis is invalid."
            );
          }
          if (!cancelled) {
            setResult(historyResult);
            setImage(null);
          }
          return;
        }

        setIsHistoryResult(false);
        const savedResult = sessionStorage.getItem( "snap2study_result" );
        const savedImage = sessionStorage.getItem( "snap2study_image" );
        if (!savedResult) {
          router.replace("/");
          return;
        }

        const parsed = JSON.parse(savedResult);
        if (!isValidResult(parsed)) {
          sessionStorage.removeItem(
            "snap2study_result"
          );
          router.replace("/");
          return;
        }
        if (!cancelled) {
          setResult(parsed);
          setImage(savedImage);
        }
      } catch (err) {
        console.error( "[Snap2Study] Failed to load result:", err );

        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load analysis."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResult();
    return () => {
      cancelled = true;
    };
  }, [historyId, router]);

  const copyText = useCallback(
    async (
      text: string,
      type: string
    ) => {
      try {
        await navigator.clipboard.writeText(
          text
        );
        setCopied(type);
        window.setTimeout(() => {
          setCopied("");
        }, 1800);
      } catch (error) {
        console.error( "[Snap2Study] Copy failed:", error );
      }
    },
    []
  );

  const handleNewQuestion = () => {
    sessionStorage.removeItem( "snap2study_result" );
    sessionStorage.removeItem( "snap2study_image" );
    router.push("/");
  };

  const handleBack = () => {
    if (isHistoryResult) {
      router.push("/history");
      return;
    }
    handleNewQuestion();
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--cream)">
        <div className="text-center">
          <div className="mono mb-4 text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
            SNAP2STUDY / RESULT
          </div>
          <div className="serif text-3xl">
            Loading analysis...
          </div>
        </div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--cream) px-6">
        <div className="w-full max-w-xl border-2 border-black bg-(--paper) p-8 shadow-[6px_6px_0_var(--black)]">
          <div className="mono mb-4 text-[9px] font-bold uppercase tracking-[0.18em] text-black/40">
            SNAP2STUDY / ERROR
          </div>

          <h1 className="serif text-4xl">
            Unable to load analysis.
          </h1>

          <p className="mt-4 text-sm leading-7 text-black/60">
            {error || "This analysis could not be loaded."}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                router.push("/history")
              }
              className="
                mono border-2 border-black bg-(--yellow) px-5 py-3 text-[9px] font-bold uppercase tracking-[0.12em] 
                shadow-[3px_3px_0_var(--black)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--black)]
              ">
              Back to History
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/")
              }
              className="
                mono border-2 border-black bg-(--paper) px-5 py-3 text-[9px] font-bold uppercase tracking-[0.12em] transition-colors hover:bg-white
              ">
              Home
            </button>

          </div>
        </div>

      </main>
    );
  }

  return (
    <main className="result-page min-h-screen bg-(--cream)">

      <div className="border-b-2 border-black bg-(--cream)">
        <div className="container flex min-h-16 items-center justify-between gap-4">

          <button
            type="button"
            onClick={handleBack}
            className="
              group mono flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] transition-transform duration-200 hover:-translate-x-1
            ">

            <span className="text-base transition-transform duration-200 group-hover:-translate-x-1">
              ←
            </span>

            {isHistoryResult ? "History" : "Snap2Study"}
          </button>

          <div className="mono hidden text-[9px] uppercase tracking-[0.14em] text-black/40 sm:block">
            {isHistoryResult ? "HISTORY / VIEWING" : "ANALYSIS / COMPLETE"}
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="
              mono border-2 border-black bg-(--paper) px-3 py-2 text-[9px] font-bold
              uppercase tracking-wider transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--black)]
            ">
            Print
          </button>

        </div>
      </div>

      <div className="container">

        <header className="relative overflow-hidden border-b-2 border-black py-12 sm:py-16 lg:py-20">
          <div className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 lg:block">

            <span className="serif text-[15rem] leading-none text-black/[0.035]">
              01
            </span>

          </div>

          <div className="relative z-10 max-w-4xl">
            <div className="mono mb-5 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em] text-black/45">
              <span className="inline-block h-2 w-2 rounded-full bg-(--coral)" />

              {isHistoryResult ? "SAVED ANALYSIS / READY" : "AI ANALYSIS / READY"}

            </div>

            <h1 className="serif max-w-4xl text-5xl leading-[0.92] tracking-tight sm:text-7xl lg:text-8xl">
              Your question,
              <br />

              <span className="text-(--coral)">
                understood.
              </span>

            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-black/60 sm:text-lg">

              Here's a focused breakdown of the question,
              solution, and key ideas worth remembering.

            </p>
          </div>
        </header>

        <section className="grid border-b-2 border-black sm:grid-cols-3">
          <div className="border-b-2 border-black bg-(--yellow) p-5 sm:border-b-0 sm:border-r-2">
            <div className="flex items-start justify-between gap-4">
              <span className="mono text-[8px] font-bold uppercase tracking-[0.16em] text-black/45">
                Subject
              </span>

              <span className="mono text-[8px] text-black/30">
                01
              </span>

            </div>

            <div className="mt-3 text-lg font-bold">
              <AnswerRenderer content={result.subject}/>
            </div>

          </div>


          <div className="border-b-2 border-black bg-(--paper) p-5 sm:border-b-0 sm:border-r-2">
            <div className="flex items-start justify-between gap-4">

              <span className="mono text-[8px] font-bold uppercase tracking-[0.16em] text-black/45">
                Topic
              </span>

              <span className="mono text-[8px] text-black/30">
                02
              </span>

            </div>

            <div className="mt-3 text-lg font-bold">
              <AnswerRenderer content={result.topic} />
            </div>
          </div>

          <div className="bg-(--coral) p-5">
            <div className="flex items-start justify-between gap-4">

              <span className="mono text-[8px] font-bold uppercase tracking-[0.16em] text-black/50">
                Difficulty
              </span>

              <span className="mono text-[8px] text-black/35">
                03
              </span>

            </div>
            <div className="mt-3 text-lg font-bold">
              <AnswerRenderer content={result.difficulty} />
            </div>
          </div>

        </section>

        <div className="relative grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_180px] lg:gap-12 lg:py-14">
          <div className="min-w-0">

            {image && (
              <section className="mb-8 border-2 border-black bg-(--paper) shadow-[6px_6px_0_var(--black)]">
                <button
                  type="button"
                  onClick={() =>
                    setShowOriginal(
                      (value) => !value
                    )
                  }
                  className="
                    flex w-full items-center justify-between gap-4 border-b-2 border-black px-5 py-4 text-left transition-colors hover:bg-black/[0.025]
                  ">

                  <div>
                    <div className="mono text-[9px] font-bold uppercase tracking-[0.16em] text-black/45">
                      SOURCE / 001
                    </div>

                    <div className="serif mt-1 text-xl">
                      Original question
                    </div>

                  </div>
                  <span className="mono flex h-7 w-7 items-center justify-center border-2 border-black text-sm">
                    {showOriginal
                      ? "−"
                      : "+"}
                  </span>
                </button>

                {showOriginal && (
                  <div className="p-4">
                    <div className="relative overflow-hidden border-2 border-black bg-white">

                      <img
                        src={image}
                        alt="Uploaded question"
                        className=" mx-auto max-h-[560px] w-full object-contain"
                      />
                    </div>
                    <div className="mono mt-3 text-[8px] uppercase tracking-wider text-black/35">
                      SOURCE IMAGE / OCR INPUT
                    </div>
                  </div>
                )}
              </section>
            )}

            <section className="mb-8 border-2 border-black bg-(--paper)">
              <div className="flex items-center justify-between gap-4 border-b-2 border-black px-6 py-5">
                <div>

                  <p className="mono text-[9px] font-bold uppercase tracking-[0.16em] text-black/45">
                    QUESTION / 01
                  </p>

                  <h2 className="serif mt-1 text-2xl">
                    What are we solving?
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      result.question,
                      "question"
                    )
                  }
                  className="
                    mono shrink-0 border-2 border-black px-3 py-2 text-[8px] font-bold
                    uppercase tracking-wider transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-(--yellow)
                  ">
                  {copied === "question" ? "Copied ✓" : "Copy"}
                </button>
              </div>

              <div className="p-6 sm:p-8">
                <div className="border-l-4 border-(--coral) pl-5 text-lg leading-8 sm:text-xl">
                  <AnswerRenderer content={ result.question } />
                </div>
              </div>

            </section>

            <section
              id="answer-section"
              className="relative mb-8 overflow-hidden border-2 border-black bg-(--black)/69 text-(--cream) shadow-[8px_8px_0_var(--coral)]"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-2 -top-2 h-20 w-20 rounded-full border border-white/10" />
              <div className="relative z-10 border-b border-white/15 px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>

                    <p className="mono text-[9px] font-bold uppercase tracking-[0.16em] text-(--cream)/45">
                      RESULT / 02
                    </p>

                    <h2 className="serif mt-1 text-2xl text-(--cream)/45">
                      Final answer
                    </h2>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        result.answer,
                        "answer"
                      )
                    }
                    className="
                      mono shrink-0 border border-white/30 px-3 py-2 text-[8px] font-bold
                      uppercase tracking-wider text-(--cream)/70 transition-colors hover:bg-white/10 hover:text-white
                    ">
                    {copied === "answer" ? "Copied ✓" : "Copy Answer"}
                  </button>
                </div>
              </div>

              <div className="relative z-10 p-7 sm:p-10">
                <div className="serif max-w-3xl text-3xl leading-[1.35] sm:text-4xl lg:text-5xl">
                  <AnswerRenderer content={ result.answer } />
                </div>
              </div>

              <div className="relative z-10 border-t border-white/15 px-6 py-4">
                <div className="mono flex items-center gap-3 text-[8px] uppercase tracking-[0.16em] text-(--cream)/35">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-(--coral)" />

                  {isHistoryResult ? "Loaded from your study history" : "Answer generated from your question"}

                </div>
              </div>

            </section>

            <section className="mb-8 border-2 border-black bg-(--paper)">
              <div className="flex flex-col gap-4 border-b-2 border-black px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
                <div>

                  <p className="mono text-[9px] font-bold uppercase tracking-[0.16em] text-black/45">
                    METHOD / 03
                  </p>

                  <h2 className="serif mt-1 text-3xl">
                    Step-by-step
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      result.explanation,
                      "explanation"
                    )
                  }
                  className="
                    mono self-start border-2 border-black px-3 py-2 text-[8px] font-bold uppercase 
                    tracking-wider transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-(--yellow) sm:self-auto
                  ">
                  {copied === "explanation" ? "Copied ✓" : "Copy"}
                </button>
              </div>

              <div className="p-6 sm:p-8">
                <div className="relative border-l-2 border-black/15 pl-6 sm:pl-8">
                  <div className="absolute -left-[7px] top-0 h-3 w-3 border-2 border-black bg-(--coral)" />
                  <div className="text-base leading-8 sm:text-[17px]">
                    <AnswerRenderer content={ result.explanation } />
                  </div>
                </div>
              </div>

            </section>

            <section id="revision-section" className="mb-8 border-2 border-black bg-(--paper)" >

              <button
                type="button"
                onClick={() =>
                  setShowKeyPoints(
                    (value) => !value
                  )
                }
                className="
                flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-black/[0.025] 
                ">

                <div>
                  <p className="mono text-[9px] font-bold uppercase tracking-[0.16em] text-black/45">
                    REVISION / 04
                  </p>

                  <h2 className="serif mt-1 text-3xl">
                    Key points
                  </h2>

                </div>
                <span className="mono flex h-8 w-8 items-center justify-center border-2 border-black text-sm">
                  {showKeyPoints
                    ? "−"
                    : "+"}
                </span>
              </button>

              {showKeyPoints && (
                <div className="border-t-2 border-black">
                  {result.key_points.map(
                    (point, index) => (
                      <div
                        key={`${index}-${point}`}
                        className="
                          group flex gap-5 border-b border-black/10 px-6 py-5 last:border-0 sm:px-8 
                          ">

                        <div className="shrink-0">
                          <span className="
                            mono flex h-8 w-8 items-center justify-center border-2 border-black
                            text-[9px] font-bold transition-colors group-hover:bg-(--yellow)
                          ">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                        </div>
                        <div className="min-w-0 flex-1 pt-0.5 text-sm leading-7">
                          <AnswerRenderer content={point} />
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

            </section>

            <section id="practice-section" className="mb-8 overflow-hidden border-2 border-black bg-(--yellow)">

              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-xl">

                    <div className="mono text-[9px] font-bold uppercase tracking-[0.16em] text-black/45">
                      PRACTICE / 05
                    </div>

                    <h2 className="serif mt-2 text-3xl sm:text-4xl">
                      Ready to test yourself?
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-black/60">
                      Try a similar question to check
                      whether the concept actually stuck.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowPractice(
                        (value) => !value
                      )
                    }
                    className="
                      brutal-border shrink-0 bg-(--black) px-5 py-3 text-[10px] font-bold uppercase tracking-wide
                      text-(--cream) transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[5px_5px_0_var(--coral)]
                    ">
                    {showPractice ? "Hide Question" : "Practice Now →"}
                  </button>

                </div>
              </div>

              {showPractice && (
                <div className="border-t-2 border-black bg-(--paper) p-6 sm:p-8">
                  <div className="mb-5 flex items-center justify-between gap-4">

                    <p className="mono text-[9px] font-bold uppercase tracking-[0.16em] text-black/45">
                      PRACTICE QUESTION
                    </p>

                    <span className="mono text-[8px] uppercase tracking-wider text-black/30">
                      TRY WITHOUT HELP
                    </span>

                  </div>

                  <div className="border-l-4 border-(--coral) pl-5 text-base leading-8 sm:text-lg">
                    <AnswerRenderer content={ result.similar_question }/>
                  </div>
                </div>
              )}

            </section>

            <section className="border-t-2 border-black py-10 sm:py-12">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>

                  <div className="mono mb-3 text-[9px] font-bold uppercase tracking-[0.16em] text-black/40">
                    NEXT / 06
                  </div>

                  <h2 className="serif text-3xl sm:text-4xl">
                    Keep the momentum.
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-black/50">
                    Upload another question and turn
                    another problem into understanding.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNewQuestion}
                  className="
                    brutal-border flex items-center justify-center gap-3 bg-(--black) px-6 py-4 text-xs font-bold uppercase tracking-wide 
                    text-(--cream) transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[5px_5px_0_var(--coral)]
                  ">
                  Solve Another
                  <span className="text-base">
                    →
                  </span>

                </button>
              </div>
            </section>

          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <div className="mono mb-3 text-[8px] font-bold uppercase tracking-[0.16em] text-black/40">
                QUICK ACTIONS
              </div>
              <div className="border-2 border-black bg-(--paper)">

                <button
                  type="button"
                  onClick={() =>
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    })
                  }
                  className="
                    flex w-full items-center justify-between border-b border-black px-4 py-4 text-left transition-colors hover:bg-(--yellow)
                  ">

                  <span className="mono text-[9px] font-bold uppercase tracking-wider">
                    Top
                  </span>

                  <span>↑</span>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById(
                        "answer-section"
                      )
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                  className="
                    flex w-full items-center justify-between border-b border-black px-4 py-4 text-left transition-colors hover:bg-(--coral)
                  ">

                  <span className="mono text-[9px] font-bold uppercase tracking-wider">
                    Answer
                  </span>

                  <span>→</span>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById(
                        "revision-section"
                      )
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                  className="
                    flex w-full items-center justify-between border-b border-black px-4 py-4 text-left transition-colors hover:bg-(--yellow)
                  ">

                  <span className="mono text-[9px] font-bold uppercase tracking-wider">
                    Revision
                  </span>

                  <span>→</span>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById(
                        "practice-section"
                      )
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                  className="
                    flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-(--coral)
                  ">

                  <span className="mono text-[9px] font-bold uppercase tracking-wider">
                    Practice
                  </span>

                  <span>→</span>

                </button>

              </div>


              <div className="mt-5 border-2 border-black bg-(--black) p-4 text-(--cream)">
                <div className="mono text-[8px] uppercase tracking-[0.14em] text-white/40">
                  WORKFLOW
                </div>

                <div className="mt-3 space-y-2">

                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-(--coral)" />

                    <span className="mono text-[8px] uppercase tracking-wider">
                      Question
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-(--coral)" />

                    <span className="mono text-[8px] uppercase tracking-wider">
                      Solution
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-(--coral)" />

                    <span className="mono text-[8px] uppercase tracking-wider">
                      Revision
                    </span>
                  </div>

                </div>

              </div>

            </div>

          </aside>

        </div>

        <footer className="border-t-2 border-black py-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="mono text-[8px] font-bold uppercase tracking-[0.16em]">
              SNAP2STUDY / RESULT
            </div>

            <div className="mono text-[8px] uppercase tracking-[0.16em] text-black/35">
              SNAP → UNDERSTAND → LEARN
            </div>
          </div>

        </footer>
      </div>

    </main>
  );
}