"use client";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-(--paper)/95 backdrop-blur-md">
      <nav className="container flex min-h-20 items-center justify-between">

        {/* BRAND */}

        <a
          href="/"
          className="group flex items-center gap-3"
        >
          <div className="mono flex h-8 w-8 items-center justify-center border-2 border-black bg-(--yellow) text-[9px] font-bold transition-transform duration-200 group-hover:rotate-3">
            S2S
          </div>

          <div className="hidden h-7 w-px bg-black sm:block" />

          <div className="text-[15px] font-black tracking-[-0.03em] sm:text-lg">
            SNAP2STUDY
          </div>
        </a>

        {/* CENTER NAVIGATION */}

        <div className="hidden items-center gap-9 md:flex">
          <a
            href="#how-it-works"
            className="mono relative text-[9px] font-bold uppercase tracking-[0.15em] after:absolute after:-bottom-2 after:left-0 after:h-px after:w-0 after:bg-black after:transition-all hover:after:w-full"
          >
            How it works
          </a>

          <a
            href="#about"
            className="mono relative text-[9px] font-bold uppercase tracking-[0.15em] after:absolute after:-bottom-2 after:left-0 after:h-px after:w-0 after:bg-black after:transition-all hover:after:w-full"
          >
            About
          </a>
        </div>

        {/* CTA */}

        <a
          href="#snap"
          className="
            group
            brutal-border
            flex
            items-center
            gap-3
            bg-(--yellow)
            px-4
            py-3
            text-[9px]
            font-black
            uppercase
            tracking-[0.12em]
            shadow-[3px_3px_0_var(--black)]
            transition-all
            duration-200
            hover:-translate-x-0.5
            hover:-translate-y-0.5
            hover:shadow-[5px_5px_0_var(--black)]
            active:translate-x-0
            active:translate-y-0
            active:shadow-none
          "
        >
          <span className="hidden sm:inline">
            Snap a question
          </span>

          <span className="sm:hidden">
            Snap
          </span>

          <span className="text-base transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </a>
      </nav>
    </header>
  );
}