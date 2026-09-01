"use client";

import { FormEvent, useEffect, useRef, useState, } from "react";
import { useRouter } from "next/navigation";

type AuthStep = "email" | "otp";
type ApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
};

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const response =
          await fetch("/api/auth/me", {
            method: "GET",
            cache: "no-store",
          });
        if (!response.ok) return;

        const data: ApiResponse = await response.json();

        if ( 
          !cancelled && data.success !== false && data.user
        ) {
          router.replace("/");
        }
      } catch {

      }
    }
    checkSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // OTP TIMER

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer =
      window.setInterval(() => {
        setCooldown((current) =>
          current > 0 ? current - 1 : 0
        );
      }, 1000);
    return () =>
      window.clearInterval(timer);
  }, [cooldown]);

  //OTP SENDING

  const requestOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError( "Please enter your email address." );
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/auth/request-otp",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: normalizedEmail,
            }),
          }
        );

      const data: ApiResponse = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "Unable to send verification code."
        );
      }

      setEmail(normalizedEmail);
      setOtp("");
      setStep("otp");
      setCooldown(60);
      setMessage( "Verification code sent. Check your email." );

      window.setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message : "Unable to send verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  //OTP VERIFICATION

  const verifyOtp = async () => {
    const normalizedOtp = otp.trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      setError( "Enter the 6-digit verification code." );
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/auth/verify-otp",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email,
              otp: normalizedOtp,
            }),
          }
        );

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to verify the code."
        );
      }
      if (
        !data.user || !data.user.id
      ) {
        throw new Error( "Authentication succeeded but no user was returned." );
      }

      setMessage( "Verified successfully. Welcome to Snap2Study." );

      window.setTimeout(() => {
        router.replace("/");
        router.refresh();
      }, 300);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message : "Unable to verify the code."
      );
    } finally {
      setLoading(false);
    }
  };

  // HANDLING FORM SUBMISSIONS

  const handleEmailSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (loading) return;
    await requestOtp();
  };

  const handleOtpSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (loading) return;
    await verifyOtp();
  };

  //CHANGE EMAIL

  const changeEmail = () => {
    if (loading) return;
    setStep("email");
    setOtp("");
    setError("");
    setMessage("");
  };

  // RESEND OTP
  const resendOtp = async () => {
    if ( 
      loading || cooldown > 0
    ) {
      return;
    }
    await requestOtp();
  };

  // MASKED EMAIL DISPLAY

  const maskedEmail = (() => {
    const parts = email.split("@");
    if (
      parts.length !== 2
    ) {
      return email;
    }

    const username = parts[0];
    const domain = parts[1];

    if (username.length <= 2) {
      return `${username[0] || "*"}***@${domain}`;
    }
    return `${username.slice(
      0,
      2
    )}${"*".repeat(
      Math.max(
        2,
        username.length - 2
      )
    )}@${domain}`;
  })();

  return (
    <main className=" min-h-screen bg-(--cream) px-5 py-8 sm:px-8 sm:py-12 ">
      <div className=" mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col ">

        <header className=" flex items-center justify-between border-b-2 border-black pb-5 ">
          <button type="button"
            onClick={() =>
              router.push("/")
            }
            className=" serif text-2xl leading-none transition- hover:opacity-60 ">
            SNAP2STUDY
          </button>
          <span className=" mono text-[8px] font-bold uppercase tracking-[0.15em] text-black/40 ">
            ACCOUNT / 01
          </span>
        </header>

        <section className=" flex flex-1 items-center justify-center py-12 sm:py-16 ">
          <div className=" grid w-full max-w-5xl overflow-hidden border-2 border-black bg-(--paper) shadow-[8px_8px_0_var(--black)] lg:grid-cols-[0.85fr_1.15fr] ">

            <div className=" hidden border-r-2 border-black bg-(--yellow) p-8 lg:flex lg:flex-col lg:justify-between ">
              <div>
                <p className=" mono text-[9px] font-bold uppercase tracking-[0.15em] ">
                  SNAP2STUDY
                </p>

                <h1 className=" serif mt-8 text-6xl leading-[0.88] tracking-tight ">
                  Learn
                  <br />
                  smarter.
                </h1>

                <p className=" mt-7 max-w-xs text-sm leading-6  text-black/60 ">
                  Save your questions,
                  revisit your answers,
                  and keep your learning
                  in one place.
                </p>
              </div>

              <div>
                <div className=" mb-5 h-px w-full bg-black/20 "/>

                <p className=" mono text-[8px] uppercase tracking-[0.12em] text-black/45 ">
                  SNAP.
                  <br />
                  UNDERSTAND.
                  <br />
                  LEARN.
                </p>
              </div>
            </div>

            <div className=" p-6 sm:p-10 lg:p-12 ">
              {step === "email" ? (
                <>
                  <div>
                    <p className=" mono text-[9px] font-bold uppercase tracking-[0.15em] text-black/45 ">
                      WELCOME / 01
                    </p>

                    <h2 className=" serif mt-4 text-4xl leading-none sm:text-5xl ">
                      Welcome to
                      <br />
                      Snap2Study.
                    </h2>
                    <p className=" mt-5 max-w-md text-smleading-6 text-black/50 ">
                      Enter your email to
                      create an account or
                      continue where you left
                      off.
                    </p>
                  </div>
                  <form onSubmit={ handleEmailSubmit } className="mt-10">
                    <label htmlFor="email" className=" mono mb-2 block text-[9px] font-bold uppercase tracking-[0.12em] ">
                      Email address
                    </label>

                    <input id="email" type="email" inputMode="email" autoComplete="email" value={email}
                      onChange={(event) => {
                        setEmail(
                          event.target.value
                        );
                        setError("");
                      }}
                      placeholder="you@example.com" disabled={loading}
                      className=" w-full border-2 border-black bg-white px-4 py-4 text-sm outline-none 
                      transition-shadow placeholder:text-black/25 focus:shadow-[4px_4px_0_var(--yellow)] disabled:cursor-not-allowed disabled:opacity-60 "
                      />

                    <button type="submit"
                      disabled={
                        loading ||
                        !email.trim()
                      }
                      className="
                        mt-5 flex w-full items-center justify-center gap-3 border-2 border-black bg-(--black) px-5 py-4 text-[10px] font-bold
                        uppercase tracking-[0.1em] text-(--cream) shadow-[4px_4px_0_var(--coral)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5
                        hover:shadow-[6px_6px_0_var(--coral)] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40
                      ">
                      {loading ? (
                        <>
                          Sending
                          <span className="animate-pulse">
                            ...
                          </span>
                        </>
                      ) : (
                        <>
                          Send verification code
                          <span className="text-base">
                            →
                          </span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className=" mt-7 border-t border-black/10 pt-5 ">
                    <p className=" mono text-[8px] uppercase leading-5 tracking-[0.08em] text-black/35  ">
                      No password required.
                      <br />
                      We will send a secure
                      verification code to
                      your email.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <button type="button"
                      onClick={ changeEmail }
                      disabled={loading}
                      className=" 
                      mono text-[9px] font-bold uppercase tracking-[0.1em] underline underline-offset-4 transition-opacity hover:opacity-50 disabled:opacity-30
                      ">
                      ← Change email
                    </button>

                    <p className=" mono mt-8 text-[9px] font-bold uppercase tracking-[0.15em] text-black/45 ">
                      VERIFY / 02
                    </p>

                    <h2 className=" serif mt-4 text-4xl leading-none sm:text-5xl ">
                      Check your
                      <br />
                      email.
                    </h2>

                    <p className=" mt-5 max-w-md text-sm leading-6 text-black/50 ">
                      We sent a 6-digit
                      verification code to
                    </p>

                    <p className=" mono mt-2 break-all text-[10px] font-bold ">
                      {maskedEmail}
                    </p>
                  </div>

                  <form onSubmit={ handleOtpSubmit } className="mt-10" >
                    <label htmlFor="otp" className=" mono mb-2 block text-[9px] font-bold uppercase tracking-[0.12em] ">
                      Verification code
                    </label>

                    <input
                      ref={otpInputRef}
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={otp}
                      onChange={(event) => {
                        const value =
                          event.target.value
                            .replace(
                              /\D/g,
                              ""
                            )
                            .slice(0, 6);
                        setOtp(value);
                        setError("");
                      }}
                      placeholder="000000"
                      disabled={loading}
                      className="
                        mono w-full border-2 border-black bg-white px-4 py-5 text-center text-3xl font-bold
                        tracking-[0.35em] outline-none transition-shadow placeholder:text-black/15 focus:shadow-[4px_4px_0_var(--yellow)] disabled:cursor-not-allowed disabled:opacity-60
                         "/>

                    <button
                      type="submit"
                      disabled={
                        loading || otp.length !== 6
                      }
                      className="
                        mt-5 flex w-full items-center justify-center gap-3 border-2 border-black bg-(--black)
                        px-5 py-4 text-[10px] font-bold uppercase tracking-[0.1em] text-(--cream) shadow-[4px_4px_0_var(--coral)] transition-all
                        hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--coral)] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40
                      ">
                      {loading ? (
                        <>
                          Verifying
                          <span className="animate-pulse">
                            ...
                          </span>
                        </>
                      ) : (
                        <>
                          Verify & continue
                          <span className="text-base">
                            →
                          </span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className=" mt-6 flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between ">
                    <button
                      type="button"
                      onClick={ resendOtp }
                      disabled={
                        loading || cooldown > 0
                      }
                      className="
                        mono text-left text-[8px] font-bold uppercase tracking-[0.1em]
                        underline underline-offset-4 transition-opacity hover:opacity-50 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-30
                      ">
                      {cooldown > 0
                        ? `Resend code in ${cooldown}s` : "Resend code"}
                    </button>

                    <span className=" mono text-[8px] uppercase tracking-[0.08em] text-black/30 ">
                      Code expires in 10 minutes
                    </span>
                  </div>
                </>
              )}

              {message && (
                <div className=" mt-5 border-2 border-black bg-(--yellow) px-4 py-3 shadow-[3px_3px_0_var(--black)] ">
                  <p className=" mono text-[8px] font-bold uppercase leading-5 tracking-[0.08em] ">
                    {message}
                  </p>
                </div>
              )}

              {error && (
                <div className=" mt-5 border-2 border-black bg-(--coral) px-4 py-3 shadow-[3px_3px_0_var(--black)] ">
                  <p className=" mono text-[8px] font-bold uppercase leading-5 tracking-[0.08em] ">
                    Error: {error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className=" border-t border-black/10 pt-5 ">
          <div className=" flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ">
            <span className=" mono text-[8px] uppercase tracking-[0.1em] text-black/30 ">
              Snap. Understand. Learn.
            </span>

            <span className=" mono text-[8px] uppercase tracking-[0.1em] text-black/30 ">
              Secure email authentication
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}