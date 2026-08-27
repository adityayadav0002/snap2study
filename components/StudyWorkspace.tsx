"use client";

import { useState } from "react";

const demoQuestion =
  "A particle moves with a velocity of 20 m/s. If its velocity increases uniformly to 40 m/s in 5 seconds, calculate its acceleration.";

export default function StudyWorkspace() {
  const [question, setQuestion] = useState(demoQuestion);
  const [activeTool, setActiveTool] = useState("solve");

  const tools = [
    {
      id: "solve",
      number: "01",
      label: "Solve",
    },
    {
      id: "explain",
      number: "02",
      label: "Explain",
    },
    {
      id: "notes",
      number: "03",
      label: "Notes",
    },
    {
      id: "similar",
      number: "04",
      label: "Similar",
    },
  ];

  return (
    <section
      id="workspace"
      className="border-t-2 border-black bg-(--paper)"
    >
      <div className="container py-16">

        {/* =================================
            HEADER
        ================================= */}

        <div className="flex flex-col gap-5 border-b-2 border-black pb-8 md:flex-row md:items-end md:justify-between">

          <div>

            <div className="mono mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-black/50">
              Study workspace / 001
            </div>

            <h2 className="serif text-5xl leading-none sm:text-6xl">
              Let's understand
              <br />
              this question.
            </h2>

          </div>

          <div className="mono text-[9px] uppercase tracking-wider text-black/45">
            IMAGE → TEXT → KNOWLEDGE
          </div>

        </div>


        {/* =================================
            WORKSPACE GRID
        ================================= */}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">

          {/* =================================
              QUESTION PANEL
          ================================= */}

          <div>

            <div className="border-2 border-black bg-(--cream) shadow-[7px_7px_0_var(--black)]">

              {/* Panel header */}

              <div className="flex items-center justify-between border-b-2 border-black px-5 py-4">

                <span className="mono text-[9px] font-bold uppercase tracking-wider">
                  Extracted question
                </span>

                <span className="mono text-[9px] uppercase tracking-wider text-black/40">
                  OCR / READY
                </span>

              </div>


              {/* Editable question */}

              <div className="p-6 sm:p-8">

                <label className="mono mb-4 block text-[9px] uppercase tracking-wider text-black/45">
                  Edit if needed
                </label>

                <textarea
                  value={question}
                  onChange={(event) =>
                    setQuestion(event.target.value)
                  }
                  rows={7}
                  className="
                    w-full
                    resize-none
                    border-2
                    border-black
                    bg-(--paper)
                    p-5
                    text-base
                    leading-7
                    outline-none
                    transition-colors
                    focus:bg-(--yellow)
                  "
                />

              </div>


              {/* Question metadata */}

              <div className="grid border-t-2 border-black sm:grid-cols-3">

                <div className="border-b-2 border-black p-5 sm:border-b-0 sm:border-r-2">
                  <div className="mono text-[8px] uppercase tracking-wider text-black/40">
                    Subject
                  </div>

                  <div className="mt-2 text-sm font-bold">
                    Physics
                  </div>
                </div>

                <div className="border-b-2 border-black p-5 sm:border-b-0 sm:border-r-2">
                  <div className="mono text-[8px] uppercase tracking-wider text-black/40">
                    Topic
                  </div>

                  <div className="mt-2 text-sm font-bold">
                    Motion
                  </div>
                </div>

                <div className="p-5">
                  <div className="mono text-[8px] uppercase tracking-wider text-black/40">
                    Difficulty
                  </div>

                  <div className="mt-2 text-sm font-bold">
                    Medium
                  </div>
                </div>

              </div>

            </div>

          </div>


          {/* =================================
              TOOLS PANEL
          ================================= */}

          <div>

            <div className="mono mb-4 text-[9px] uppercase tracking-[0.14em] text-black/45">
              Choose what you need
            </div>


            <div className="flex flex-col gap-3">

              {tools.map((tool) => {

                const active =
                  activeTool === tool.id;

                return (
                  <button
                    key={tool.id}
                    onClick={() =>
                      setActiveTool(tool.id)
                    }
                    className={`
                      group
                      flex
                      items-center
                      justify-between
                      border-2
                      border-black
                      px-5
                      py-5
                      text-left
                      transition-all
                      duration-200
                      ${
                        active
                          ? "bg-(--coral) shadow-[5px_5px_0_var(--black)] -translate-x-1 -translate-y-1"
                          : "bg-(--cream) hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[5px_5px_0_var(--black)]"
                      }
                    `}
                  >

                    <div className="flex items-center gap-5">

                      <span className="mono text-[9px] font-bold">
                        {tool.number}
                      </span>

                      <span className="serif text-2xl">
                        {tool.label}
                      </span>

                    </div>

                    <span className="text-xl transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>

                  </button>
                );

              })}

            </div>


            {/* =================================
                RESULT PREVIEW
            ================================= */}

            <div className="mt-8 border-2 border-black bg-(--yellow) p-6">

              <div className="mono text-[9px] font-bold uppercase tracking-wider">
                {activeTool === "solve" && "Step-by-step solution"}

                {activeTool === "explain" && "Simple explanation"}

                {activeTool === "notes" && "Quick revision notes"}

                {activeTool === "similar" && "Practice question"}
              </div>


              <div className="mt-6">

                {activeTool === "solve" && (
                  <div className="space-y-4 text-sm leading-7">

                    <p>
                      Given:
                      <br />
                      Initial velocity (u) = 20 m/s
                      <br />
                      Final velocity (v) = 40 m/s
                      <br />
                      Time (t) = 5 s
                    </p>

                    <p>
                      Using:
                      <br />

                      <strong>
                        a = (v − u) / t
                      </strong>
                    </p>

                    <p>
                      a = (40 − 20) / 5
                      <br />

                      <strong>
                        a = 4 m/s²
                      </strong>
                    </p>

                  </div>
                )}


                {activeTool === "explain" && (
                  <p className="text-sm leading-7">
                    Acceleration tells us how quickly
                    velocity changes with time. Here, the
                    velocity increases by 20 m/s over
                    5 seconds, giving an acceleration of
                    4 m/s².
                  </p>
                )}


                {activeTool === "notes" && (
                  <div className="text-sm leading-7">
                    <p>• Acceleration = change in velocity / time</p>
                    <p>• SI unit = m/s²</p>
                    <p>• Uniform acceleration means velocity changes at a constant rate.</p>
                  </div>
                )}


                {activeTool === "similar" && (
                  <p className="text-sm leading-7">
                    A car increases its velocity from
                    10 m/s to 30 m/s in 4 seconds.
                    Calculate its acceleration.
                  </p>
                )}

              </div>

            </div>

          </div>

        </div>


        {/* =================================
            FOOTER META
        ================================= */}

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t-2 border-black pt-5">

          <span className="mono text-[9px] uppercase tracking-wider">
            SNAP2STUDY / WORKSPACE
          </span>

          <span className="mono text-[9px] uppercase tracking-wider text-black/40">
            EDIT → CHOOSE → LEARN
          </span>

        </div>

      </div>
    </section>
  );
}