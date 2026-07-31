"use client";

import { useEffect, useState } from "react";
import Link from "next/link.js";
import {
  Calendar,
  ChevronRight,
  FileSearch,
  History,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import api from "../../lib/api.js";

const getScoreColor = (score) => {
  if (score >= 75) return "text-emerald-300";
  if (score >= 50) return "text-amber-300";
  return "text-red-300";
};

const getScoreBadge = (score) => {
  if (score >= 75)
    return {
      label: "Strong",
      className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    };
  if (score >= 50)
    return {
      label: "Moderate",
      className: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    };
  return {
    label: "Needs Work",
    className: "border-red-400/30 bg-red-400/10 text-red-200",
  };
};

const formatDate = (dateString) => {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/resumes/history");
        const payload = response.data?.data?.analyses || [];
        setAnalyses(payload);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
          "Failed to load analysis history. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4 text-sm text-slate-300">
          <Loader2 aria-hidden="true" className="animate-spin text-cyan-300" />
          Loading your analysis history...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-200">
                <History aria-hidden="true" size={16} />
                Analysis History
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
                Your past analyses
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Review scores and recommendations from every resume you've
                analyzed. Click any card to view the full report.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              <Sparkles aria-hidden="true" size={16} />
              New Analysis
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {analyses.length === 0 && !error ? (
          <div className="animate-fade-in-up flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-16 text-center">
            <span className="rounded-2xl bg-cyan-400/10 p-5 text-cyan-300">
              <FileSearch aria-hidden="true" size={40} />
            </span>
            <h2 className="mt-6 text-xl font-bold text-slate-100">
              No analyses yet
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
              Upload your first resume and paste a job description to get an
              AI-powered ATS compatibility report.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              <Sparkles aria-hidden="true" size={16} />
              Analyze Your First Resume
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {analyses.map((analysis, index) => {
              const score =
                typeof analysis.atsScore === "number"
                  ? Math.round(analysis.atsScore)
                  : 0;
              const badge = getScoreBadge(score);
              const staggerClass =
                index < 8 ? `stagger-${index + 1}` : "stagger-8";

              return (
                <Link
                  key={analysis._id}
                  href={`/history/${analysis._id}`}
                  className={`animate-fade-in-up ${staggerClass} group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition hover:border-cyan-400/40 hover:bg-slate-900 hover:shadow-lg hover:shadow-cyan-950/20`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold text-slate-100 group-hover:text-cyan-100">
                        {analysis.jobTitle || "Target Role"}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <Calendar aria-hidden="true" size={13} />
                        <span>{formatDate(analysis.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-2xl font-bold ${getScoreColor(score)}`}
                      >
                        {score}
                      </span>
                      <span className="text-xs text-slate-500">/100</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                    >
                      <TrendingUp
                        aria-hidden="true"
                        className="mr-1"
                        size={12}
                      />
                      {badge.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 transition group-hover:text-cyan-300">
                      View report
                      <ChevronRight aria-hidden="true" size={14} />
                    </span>
                  </div>

                  {/* Subtle hover shimmer overlay */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100 animate-shimmer" />
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
