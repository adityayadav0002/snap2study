"use client";

import { FormEvent, useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  name: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await fetch(
          "/api/profile",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (
            response.status === 401
          ) {
            window.location.href =
              "/auth";
            return;
          }

          throw new Error(
            data?.error ||
              "Unable to load profile."
          );
        }

        if (!cancelled) {
          setUser(data.user);
          setName(data.user.name || "");
        }
      } catch (err) {
        console.error(
          "[Snap2Study] Profile load failed:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to load your profile."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/profile",
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to save profile."
        );
      }

      setUser(data.user);
      setName(data.user.name || "");
      setMessage(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "[Snap2Study] Profile update failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-(--cream)">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
          <p className="mono text-[10px] font-bold uppercase tracking-[0.15em]">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-(--cream)">

      {/* HEADER */}

      <header className="border-b-2 border-black">
        <div className="container flex min-h-20 items-center justify-between">

          <a
            href="/"
            className="text-lg font-black tracking-[-0.03em]"
          >
            SNAP2STUDY
          </a>

          <a
            href="/"
            className="
              mono
              border-2
              border-black
              px-4
              py-3
              text-[9px]
              font-black
              uppercase
              tracking-[0.12em]
              transition-colors
              hover:bg-black
              hover:text-(--cream)
            "
          >
            ← Home
          </a>

        </div>
      </header>

      {/* PROFILE */}

      <section className="container py-16 sm:py-24">

        <div className="max-w-3xl">

          <div className="mb-10">

            <p className="mono mb-3 text-[9px] font-bold uppercase tracking-[0.2em]">
              Account
            </p>

            <h1 className="text-5xl font-normal tracking-[-0.04em] sm:text-7xl">
              Your profile.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 opacity-70">
              Manage your Snap2Study account
              information.
            </p>

          </div>

          {/* CARD */}

          <div className="border-2 border-black bg-(--paper) p-6 shadow-[6px_6px_0_var(--black)] sm:p-10">

            <form
              onSubmit={handleSubmit}
              className="space-y-8"
            >

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="mono mb-3 block text-[9px] font-black uppercase tracking-[0.15em]"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="
                    w-full
                    border-2
                    border-black
                    bg-gray-100
                    px-4
                    py-4
                    text-sm
                    opacity-70
                    outline-none
                  "
                />

                <p className="mono mt-2 text-[8px] uppercase tracking-[0.08em] opacity-50">
                  Your login email cannot be
                  changed here.
                </p>

              </div>

              {/* NAME */}

              <div>

                <label
                  htmlFor="name"
                  className="mono mb-3 block text-[9px] font-black uppercase tracking-[0.15em]"
                >
                  Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  maxLength={50}
                  placeholder="Enter your name"
                  className="
                    w-full
                    border-2
                    border-black
                    bg-(--cream)
                    px-4
                    py-4
                    text-sm
                    outline-none
                    transition-shadow
                    focus:shadow-[4px_4px_0_var(--yellow)]
                  "
                />

              </div>

              {/* MESSAGE */}

              {message && (
                <div className="border-2 border-black bg-(--yellow) p-4">
                  <p className="mono text-[9px] font-bold uppercase tracking-[0.08em]">
                    {message}
                  </p>
                </div>
              )}

              {error && (
                <div className="border-2 border-black bg-red-100 p-4">
                  <p className="mono text-[9px] font-bold uppercase tracking-[0.08em]">
                    {error}
                  </p>
                </div>
              )}

              {/* SAVE */}

              <button
                type="submit"
                disabled={saving}
                className="
                  brutal-border
                  w-full
                  bg-(--yellow)
                  px-6
                  py-4
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.15em]
                  shadow-[4px_4px_0_var(--black)]
                  transition-all
                  hover:-translate-x-0.5
                  hover:-translate-y-0.5
                  hover:shadow-[6px_6px_0_var(--black)]
                  active:translate-x-0
                  active:translate-y-0
                  active:shadow-none
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {saving
                  ? "Saving..."
                  : "Save changes"}
              </button>

            </form>

          </div>

          {/* QUESTION HISTORY */}

<div className="mt-16 border-t-2 border-black pt-10">

  <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

    <div>
      <p className="mono mb-3 text-[9px] font-bold uppercase tracking-[0.2em]">
        Your activity
      </p>

      <h2 className="text-3xl tracking-[-0.03em]">
        Question history
      </h2>

      <p className="mt-3 max-w-xl text-sm leading-6 opacity-60">
        View the questions you have analyzed
        with Snap2Study.
      </p>
    </div>

    <a
      href="/history"
      className="
        mono
        inline-flex
        w-fit
        items-center
        gap-3
        border-2
        border-black
        bg-(--yellow)
        px-5
        py-3
        text-[9px]
        font-bold
        uppercase
        tracking-[0.12em]
        shadow-[3px_3px_0_var(--black)]
        transition-all
        hover:-translate-x-0.5
        hover:-translate-y-0.5
        hover:shadow-[5px_5px_0_var(--black)]
      "
    >
      View history
      <span className="text-base">
        →
      </span>
    </a>

  </div>

</div>

        </div>

      </section>
    </main>
  );
}