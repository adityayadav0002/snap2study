"use client";

import UploadBox from "./UploadBox";

type HeroProps = {
  oncontinue?: (file: File) => void;
};

export default function Hero({ oncontinue }: HeroProps) {
  return (
    <section className="relative overflow-hidden">

      {/* =================================================
          BACKGROUND GRID
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.045]
          [background-image:linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)]
          [background-size:48px_48px]
        "
      />

      {/* =================================================
          DECORATIVE ORBIT
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          -right-48
          top-24
          hidden
          h-[620px]
          w-[620px]
          rounded-full
          border
          border-black/15
          lg:block
        "
      >
        <div className="absolute inset-16 rounded-full border border-black/15" />

        <div className="absolute inset-32 rounded-full border border-black/15" />

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

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="container relative">

        <div
          className="
            grid
            min-h-[calc(100vh-80px)]
            items-center
            gap-12
            py-16
            sm:py-20
            lg:grid-cols-[1.1fr_0.9fr]
            lg:py-20
          "
        >

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="relative z-10 snap-reveal">

            {/* EYEBROW */}

            <div
              className="
                mono
                mb-7
                flex
                items-center
                gap-3
                text-[9px]
                font-black
                uppercase
                tracking-[0.18em]
                text-black/65
              "
            >
              <span className="snap-pulse h-2 w-2 rounded-full bg-(--coral)" />

              Frictionless study / 001
            </div>

            {/* HEADLINE */}

            <h1
              className="
                serif
                max-w-5xl
                text-[clamp(3.5rem,8vw,8rem)]
                leading-[0.86]
                tracking-[-0.055em]
              "
            >
              Turn questions
              <br />

              <span className="relative inline-block">
                into{" "}

                <span className="relative inline-block text-(--coral)">
                  understanding.
                </span>
              </span>
            </h1>

            {/* DESCRIPTION */}

            <p
              className="
                mt-8
                max-w-xl
                text-[15px]
                leading-7
                text-black/60
                sm:text-lg
              "
            >
              Snap a question and turn it into a simple,
              useful study experience. No unnecessary
              steps. Just learn.
            </p>

            {/* =================================================
                UPLOAD
            ================================================= */}

            <div
              id="snap"
              className="mt-9 max-w-2xl"
            >
              <UploadBox onContinue={oncontinue} />
            </div>

          </div>

          {/* =================================================
              RIGHT VISUAL
          ================================================= */}

          <div
            className="
              relative
              mt-8
              flex
              min-h-[420px]
              items-center
              justify-center
              lg:mt-0
            "
          >

            {/* BLUE SHAPE */}

            <div
              className="
                absolute
                right-2
                top-4
                h-20
                w-20
                rotate-6
                border-2
                border-black
                bg-(--blue)
                transition-transform
                duration-500
                hover:rotate-12
              "
            />

            {/* CORAL SHAPE */}

            <div
              className="
                snap-float
                absolute
                bottom-3
                left-3
                h-28
                w-28
                -rotate-6
                border-2
                border-black
                bg-(--coral)
              "
            />

            {/* =================================================
                MAIN CARD
            ================================================= */}

            <div
              className="
                group
                relative
                z-10
                w-full
                max-w-sm
                border-2
                border-black
                bg-(--yellow)
                p-6
                shadow-[10px_10px_0_var(--black)]
                transition-all
                duration-300
                hover:-translate-y-2
                hover:shadow-[14px_14px_0_var(--black)]
              "
            >

              {/* CARD HEADER */}

              <div
                className="
                  mono
                  flex
                  items-center
                  justify-between
                  border-b-2
                  border-black
                  pb-4
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.15em]
                "
              >
                <span>SNAP / 001</span>

                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-black" />
                  READY
                </span>
              </div>

              {/* CARD BODY */}

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
                    shadow-[4px_4px_0_var(--black)]
                    transition-transform
                    duration-300
                    group-hover:rotate-3
                  "
                >
                  +
                </div>

                <p className="serif mt-8 text-center text-3xl leading-none">
                  Drop a question.
                </p>

                <p className="mt-3 text-center text-xs text-black/55">
                  One image. One clear explanation.
                </p>

              </div>

              {/* CARD FOOTER */}

              <div
                className="
                  mono
                  border-t-2
                  border-black
                  pt-4
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.13em]
                "
              >
                IMAGE → TEXT → KNOWLEDGE
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* =================================================
          META STRIP
      ================================================= */}

      <div className="container border-t-2 border-black">

        <div className="grid grid-cols-2 divide-x-2 divide-black md:grid-cols-4">

          {[
            "01 / SNAP",
            "02 / UNDERSTAND",
            "03 / LEARN",
            "SNAP2STUDY / 2026",
          ].map((item, index) => (
            <div
              key={item}
              className={`
                mono
                px-3
                py-5
                text-[8px]
                font-bold
                uppercase
                tracking-[0.12em]
                transition-colors
                hover:bg-(--yellow)
                ${
                  index === 3
                    ? "text-black/40"
                    : ""
                }
              `}
            >
              {item}
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}