"use client";

import { useState } from "react";
import { AlertTriangle, FileText, Sparkles } from "lucide-react";
import AnalysisResults from "../components/AnalysisResults.js";
import FileUpload from "../components/FileUpload.js";
import DemoReport from "../components/DemoReport.js";

export default function Home() {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  const handleAnalysisComplete = (result) => {
    setError("");
    setAnalysis(result);
  };

  const handleReset = () => {
    setAnalysis(null);
    setError("");
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100">
      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-200">
                <Sparkles aria-hidden="true" size={16} />
                AI Resume ATS Analyzer
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
                See how your resume performs before recruiters do.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
                Upload a PDF resume and paste a job description to get an ATS
                score, skill match breakdown, missing keywords, strengths, and
                prioritized recommendations.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300">
                  <FileText aria-hidden="true" size={24} />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    Production workflow
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-100">
                    Upload, analyze, improve, apply
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-100">
              <AlertTriangle
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                size={18}
              />
              <span>{error}</span>
            </div>
          )}
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {analysis ? (
          <AnalysisResults data={analysis} onReset={handleReset} />
        ) : (
          <FileUpload
            onAnalysisComplete={handleAnalysisComplete}
            onError={setError}
          />
        )}
      </main>

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <DemoReport />
      </div>
    </div>
  );
}
