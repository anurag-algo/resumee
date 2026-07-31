"use client";

import { useEffect, useState } from "react";
import Link from "next/link.js";
import { useParams } from "next/navigation.js";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import api from "../../../lib/api.js";
import AnalysisResults from "../../../components/AnalysisResults.js";

const formatDate = (dateString) => {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AnalysisDetailPage() {
  const params = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await api.get(`/resumes/history/${params.id}`);
        const payload = response.data?.data?.analysis;
        setAnalysis(payload);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Failed to load this analysis. It may not exist or you may not have access.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchAnalysis();
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4 text-sm text-slate-300">
          <Loader2 aria-hidden="true" className="animate-spin text-cyan-300" />
          Loading analysis report...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-slate-950 text-slate-100">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-16 text-center">
            <p className="text-sm leading-6 text-red-300">{error}</p>
            <Link
              href="/history"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:bg-cyan-300/10 hover:text-cyan-100"
            >
              <ArrowLeft aria-hidden="true" size={16} />
              Back to History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const analysisData = analysis?.analysisData || {};

  return (
    <div className="min-h-full bg-slate-950 text-slate-100">
      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-fade-in-up">
            <Link
              href="/history"
              className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-cyan-300"
            >
              <ArrowLeft aria-hidden="true" size={15} />
              Back to History
            </Link>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
                  {analysis?.jobTitle || "Target Role"}
                </h1>
                {analysis?.createdAt && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <Calendar aria-hidden="true" size={14} />
                    Analyzed on {formatDate(analysis.createdAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up stagger-2">
          <AnalysisResults
            data={analysisData}
            onReset={null}
          />
        </div>
      </main>
    </div>
  );
}
