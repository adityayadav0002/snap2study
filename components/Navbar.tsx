export default function Navbar() {
  
  return (
    <header className="w-full">
      <nav className="container flex min-h-20 items-center justify-between border-b-2 border-black">

        {/* BRAND */}

        <div className="flex items-center gap-4">

          <div className="mono text-[11px] font-bold tracking-wider">
            001
          </div>

          <div className="h-7 w-0.5 bg-black" />

          <div className="text-lg font-bold tracking-tight">
            SNAP2STUDY
          </div>

        </div>


        {/* CENTER NAVIGATION */}

        <div className="hidden items-center gap-8 md:flex">

          <a
            href="#how-it-works"
            className="
              mono
              text-[10px]
              uppercase
              tracking-[0.14em]
              transition-transform
              duration-200
              hover:-translate-y-0.5
            "
          >
            How it works
          </a>

          <a
            href="#about"
            className="
              mono
              text-[10px]
              uppercase
              tracking-[0.14em]
              transition-transform
              duration-200
              hover:-translate-y-0.5
            "
          >
            About
          </a>

        </div>


        {/* CTA */}

        <div className="flex items-center">

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
    text-[11px]
    font-bold
    uppercase
    tracking-[0.08em]
    transition-all
    duration-200
    hover:-translate-x-0.5
    hover:-translate-y-0.5
    hover:shadow-[4px_4px_0_var(--black)]
  "
>
  <span>Snap a question</span>

  <span
    className="
      inline-block
      transition-transform
      duration-200
      group-hover:translate-x-1
    "
  >
    →
  </span>
</a>

        </div>

      </nav>
    </header>
  );
}