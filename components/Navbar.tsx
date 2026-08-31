"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  name: string;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          if (!cancelled) {
            setUser(null);
          }
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          if (data?.authenticated && data?.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error(
          "[Snap2Study] Navbar auth check failed:",
          error
        );

        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Logout request failed.");
      }

      setUser(null);

      window.location.href = "/";
    } catch (error) {
      console.error(
        "[Snap2Study] Logout failed:",
        error
      );

      setLoggingOut(false);
      alert("Unable to log out. Please try again.");
    }
  }

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

        {/* RIGHT SIDE */}

        <div className="flex items-center gap-3">

          {/* AUTH */}

          {!loading && (
            <>
              {user ? (
                <div className="hidden items-center gap-2 sm:flex">

                  {/* PROFILE */}

                  <a
                    href="/profile"
                    className="
                      mono
                      border-2
                      border-black
                      bg-(--cream)
                      px-4
                      py-3
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.12em]
                      transition-all
                      hover:-translate-x-0.5
                      hover:-translate-y-0.5
                      hover:bg-(--yellow)
                    "
                  >
                    {user.name || "Account"}
                  </a>

                  {/* LOGOUT */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="
                      mono
                      border-2
                      border-black
                      bg-transparent
                      px-3
                      py-3
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.12em]
                      transition-all
                      hover:bg-black
                      hover:text-(--cream)
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>

                </div>
              ) : (
                <a
                  href="/auth"
                  className="
                    mono
                    hidden
                    px-2
                    py-3
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.12em]
                    underline
                    underline-offset-4
                    transition-opacity
                    hover:opacity-50
                    sm:block
                  "
                >
                  Log in
                </a>
              )}
            </>
          )}

          {/* MAIN CTA */}

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

        </div>
      </nav>
    </header>
  );
}