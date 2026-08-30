export default function Loading() {
  return (
    <main className="min-h-screen bg-(--paper)">
      <div className="container py-16 sm:py-20">

        <div className="mono text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">
          SNAP2STUDY / LOADING
        </div>

        <div className="mt-6 max-w-3xl">
          <div className="h-12 w-3/4 animate-pulse bg-black/10" />
          <div className="mt-3 h-12 w-1/2 animate-pulse bg-black/10" />
        </div>

        <div className="mt-12 border-2 border-black bg-(--cream) p-6 shadow-[7px_7px_0_var(--black)]">
          <div className="h-4 w-32 animate-pulse bg-black/10" />

          <div className="mt-6 space-y-3">
            <div className="h-4 w-full animate-pulse bg-black/10" />
            <div className="h-4 w-5/6 animate-pulse bg-black/10" />
            <div className="h-4 w-2/3 animate-pulse bg-black/10" />
          </div>

          <div className="mt-8 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-(--coral)" />
            <span className="mono text-[8px] uppercase tracking-wider text-black/40">
              Preparing study workspace
            </span>
          </div>
        </div>

      </div>
    </main>
  );
}