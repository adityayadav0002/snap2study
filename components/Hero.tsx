"use client";

import UploadBox from "./UploadBox";

export default function Hero() {

  return (
    <section className="relative overflow-hidden">

      {/* =================================
          ARTISTIC ORBIT
      ================================= */}

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          top-20
          hidden
          h-130
          w-130
          rounded-full
          border
          border-black/20
          lg:block
        "
      >
        <div
          className="
            absolute
            inset-12
            rounded-full
            border
            border-black/20
          "
        />

        <div
          className="
            absolute
            inset-28
            rounded-full
            border
            border-black/20
          "
        />

        {/* ORBIT DOT */}

        <div
          className="
            absolute
            left-1/2
            top-0
            h-3
            w-3
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border-2
            border-black
            bg-(--coral)
          "
        />

      </div>


      {/* =================================
          HERO CONTENT
      ================================= */}

      <div className="container relative">

        <div className="grid min-h-[calc(100vh-80px)] items-center py-20 lg:grid-cols-[1fr_0.75fr] lg:gap-16">

          {/* LEFT */}

          <div className="relative z-10">

            {/* EYEBROW */}

            <div
              className="
                mono
                mb-7
                flex
                items-center
                gap-3
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
              "
            >

              <span
                className="
                  inline-block
                  h-2
                  w-2
                  rounded-full
                  bg-(--coral)
                "
              />

              Frictionless study / 001

            </div>


            {/* HEADLINE */}

            <h1
              className="
                serif
                max-w-4xl
                text-6xl
                leading-[0.9]
                tracking-tight
                sm:text-7xl
                lg:text-8xl
                xl:text-9xl
              "
            >
              Turn questions
              <br />

              <span className="relative inline-block">

                into

                <span
                  className="
                    relative
                    ml-3
                    inline-block
                    text-(--coral)
                  "
                >
                  understanding.
                </span>

              </span>

            </h1>


            {/* DESCRIPTION */}

            <p
              className="
                mt-8
                max-w-lg
                text-base
                leading-7
                text-black/65
                sm:text-lg
              "
            >
              Snap a question and turn it into a simple,
              useful study experience. No unnecessary
              steps. Just learn.
            </p>


            {/* Upload */}

            <div id="snap" className="mt-9 max-w-xl">
              <UploadBox />
            </div>

          </div>


          {/* RIGHT — ARTISTIC PANEL */}

          <div
            className="
              relative
              mt-16
              flex
              min-h-100
              items-center
              justify-center
              lg:mt-0
            "
          >

            {/* Main yellow card */}

            <div
              className="
                relative
                z-10
                w-full
                max-w-sm
                border-2
                border-black
                bg-(--yellow)
                p-7
                shadow-[9px_9px_0_var(--black)]
                transition-transform
                duration-300
                hover:-translate-y-2
              "
            >

              <div
                className="
                  mono
                  flex
                  items-center
                  justify-between
                  border-b-2
                  border-black
                  pb-4
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wider
                "
              >

                <span>
                  SNAP / 001
                </span>

                <span>
                  READY
                </span>

              </div>


              <div className="py-12">

                <div
                  className="
                    mx-auto
                    flex
                    h-28
                    w-28
                    items-center
                    justify-center
                    border-2
                    border-black
                    bg-(--cream)
                    text-5xl
                  "
                >
                  +
                </div>

                <p
                  className="
                    serif
                    mt-7
                    text-center
                    text-3xl
                    leading-none
                  "
                >
                  Drop a question.
                </p>

              </div>


              <div
                className="
                  mono
                  border-t-2
                  border-black
                  pt-4
                  text-[9px]
                  uppercase
                  tracking-wider
                "
              >
                IMAGE → TEXT → KNOWLEDGE
              </div>

            </div>


            {/* Coral shape */}

            <div
              className="
                absolute
                -bottom-3
                -left-3
                h-28
                w-28
                border-2
                border-black
                bg-(--coral)
                lg:left-0
              "
            />


            {/* Blue shape */}

            <div
              className="
                absolute
                -right-2
                top-2
                h-20
                w-20
                border-2
                border-black
                bg-(--blue)
                lg:right-8
              "
            />

          </div>

        </div>

      </div>


      {/* =================================
          BOTTOM META BAR
      ================================= */}

      <div
        className="
          container
          border-t-2
          border-black
        "
      >

        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-5
            py-5
          "
        >

          <div className="mono text-[9px] uppercase tracking-wider">
            01 / SNAP
          </div>

          <div className="mono text-[9px] uppercase tracking-wider">
            02 / UNDERSTAND
          </div>

          <div className="mono text-[9px] uppercase tracking-wider">
            03 / LEARN
          </div>

          <div className="mono text-[9px] uppercase tracking-wider text-black/40">
            SNAP2STUDY / 2026
          </div>

        </div>

      </div>

    </section>
  );
}