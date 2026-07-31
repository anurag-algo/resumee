"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import AtsScoreCard from "./AtsScoreCard.js";

const asArray = (value) => (Array.isArray(value) ? value : []);

const getValue = (item, keys, fallback) => {
  for (const key of keys) {
    if (item?.[key]) {
      return item[key];
    }
  }

  return fallback;
};

export default function AnalysisResults({ data = {}, onReset }) {
  const matchingSkills = asArray(data.matchingSkills);
  const missingKeywords = asArray(data.missingKeywords);
  const strengths = asArray(data.strengths);
  const improvements = asArray(data.areasOfImprovement);

  return (
    <section className="space-y-6">
      <div className="animate-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase text-cyan-300">
            AI analysis complete
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-100">
            ATS report dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Review your match score, missing keywords, strengths, and concrete
            edits before submitting your application.
          </p>
        </div>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:bg-cyan-300/10 hover:text-cyan-100"
          >
            <ArrowRight aria-hidden="true" size={17} />
            Analyze Another Resume
          </button>
        )}
      </div>

      <AtsScoreCard atsScore={data.atsScore} />

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40">
        <p className="text-sm font-medium uppercase text-slate-400">
          Executive Summary
        </p>
        <p className="mt-3 text-base leading-7 text-slate-200">
          {data.matchSummary || "No executive summary was returned."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 aria-hidden="true" className="text-emerald-300" />
            <h2 className="text-lg font-semibold text-slate-100">
              Matching Skills
            </h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {matchingSkills.length > 0 ? (
              matchingSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-200"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                No matching skills were returned.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle aria-hidden="true" className="text-amber-300" />
            <h2 className="text-lg font-semibold text-slate-100">
              Missing Keywords
            </h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {missingKeywords.length > 0 ? (
              missingKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-sm font-medium text-amber-200"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                No missing keywords were returned.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <h2 className="text-lg font-semibold text-slate-100">Strengths</h2>
        {strengths.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {strengths.map((strength) => (
              <li
                key={strength}
                className="flex gap-3 text-sm leading-6 text-slate-300"
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-emerald-300"
                  size={18}
                />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-400">
            No strengths were returned.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex items-center gap-2">
          <Lightbulb aria-hidden="true" className="text-cyan-300" />
          <h2 className="text-lg font-semibold text-slate-100">
            Actionable Recommendations
          </h2>
        </div>
        {improvements.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {improvements.map((item, index) => {
              const category = getValue(
                item,
                ["category", "area", "name"],
                "Recommendation",
              );
              const issue = getValue(
                item,
                ["issue", "identifiedIssue", "problem"],
                "No detected issue was provided.",
              );
              const fix = getValue(
                item,
                ["suggestedFix", "suggestion", "fix"],
                "No concrete suggestion was provided.",
              );

              return (
                <article
                  key={`${category}-${index}`}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-5"
                >
                  <p className="text-sm font-semibold text-cyan-200">
                    {category}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    <span className="font-semibold text-slate-200">
                      Detected issue:
                    </span>{" "}
                    {issue}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    <span className="font-semibold text-slate-100">
                      Suggested fix:
                    </span>{" "}
                    {fix}
                  </p>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">
            No recommendations were returned.
          </p>
        )}
      </div>
    </section>
  );
}
