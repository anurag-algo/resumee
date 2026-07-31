"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation.js";
import { AlertTriangle, Loader2, LockKeyhole, Sparkles } from "lucide-react";
import GoogleLoginBtn from "../../components/GoogleLoginBtn.js";
import { useAuth } from "../../context/AuthContext.js";

export default function LoginPage() {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isSignup = mode === "signup";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup") {
      setMode("signup");
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
      router.replace("/");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          `${isSignup ? "Account creation" : "Login"} failed. Please check your details and try again.`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-slate-950/70 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden border-r border-slate-800 bg-slate-950/70 p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
              <Sparkles aria-hidden="true" size={24} />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight">
              Resume ATS Analyzer
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Sign in to upload resumes, compare them against job descriptions,
              and turn AI feedback into a stronger application.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
            <p className="text-sm font-semibold text-cyan-200">
              Protected workspace
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Your resume analysis flow starts after authentication.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-200 lg:hidden">
              <Sparkles aria-hidden="true" size={16} />
              Resume ATS Analyzer
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-slate-950 p-3 text-cyan-300">
                <LockKeyhole aria-hidden="true" size={22} />
              </span>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-50">
                  {isSignup ? "Create your account" : "Welcome back"}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {isSignup
                    ? "Use email and password, or continue with Google."
                    : "Sign in to analyze your resume and view saved sessions."}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-100">
              <AlertTriangle
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                size={18}
              />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-6 grid grid-cols-2 rounded-xl border border-slate-800 bg-slate-950/70 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                !isSignup
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                isSignup
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required={isSignup}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2
                    aria-hidden="true"
                    className="animate-spin"
                    size={18}
                  />
                  {isSignup ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                isSignup ? "Create Account" : "Sign in"
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs font-medium uppercase text-slate-500">
              OR
            </span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <div className="flex justify-center">
            <GoogleLoginBtn />
          </div>
        </div>
      </section>
    </main>
  );
}
