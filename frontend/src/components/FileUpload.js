"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation.js";
import { FileText, Loader2, UploadCloud, X } from "lucide-react";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.js";

export default function FileUpload({ onAnalysisComplete, onError }) {
  const router = useRouter();
  const { user } = useAuth();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const fileMeta = useMemo(() => {
    if (!file) {
      return "";
    }

    return `${file.name} - ${(file.size / (1024 * 1024)).toFixed(2)} MB`;
  }, [file]);

  const setError = (message) => {
    setLocalError(message);
    onError?.(message);
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setFile(null);
      setError("Please upload a PDF resume file only.");
      return;
    }

    setLocalError("");
    onError?.("");
    setFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      setError("Please login or create an account before analyzing a resume.");
      router.push("/login");
      return;
    }

    if (!file) {
      setError("Select a PDF resume before starting the analysis.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Paste the job description so the AI can compare your resume.");
      return;
    }

    setLoading(true);
    setLocalError("");
    onError?.("");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription.trim());

    try {
      const response = await api.post("/resumes/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const payload = response.data?.data?.analysis || response.data?.data;
      onAnalysisComplete?.(payload);
    } catch (error) {
      if (error?.response?.status === 401) {
        setError("Your session expired. Please login again to analyze a resume.");
        router.push("/login");
        return;
      }

      setError(
        error?.response?.data?.message ||
          "Unable to analyze the resume right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40"
    >
      <div className="mb-6">
        <p className="text-sm font-medium uppercase text-cyan-300">
          Resume input
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-100">
          Analyze your resume against a job description
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Upload a PDF resume, paste the target job description, and get a
          structured ATS-readiness report.
        </p>
      </div>

      {(localError || loading) && (
        <div
          className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
            localError
              ? "border-red-400/30 bg-red-400/10 text-red-200"
              : "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
          }`}
        >
          {localError || "Uploading resume and generating AI analysis..."}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          isDragging
            ? "border-cyan-300 bg-cyan-400/10"
            : "border-slate-700 bg-slate-950/60 hover:border-slate-500"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <span className="rounded-full bg-cyan-400/10 p-4 text-cyan-300">
          <UploadCloud aria-hidden="true" size={30} />
        </span>
        <span className="mt-4 text-base font-semibold text-slate-100">
          Drop your PDF resume here
        </span>
        <span className="mt-1 text-sm text-slate-400">
          or click to browse files
        </span>
      </button>

      {file && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 rounded-lg bg-slate-800 p-2 text-cyan-300">
              <FileText aria-hidden="true" size={18} />
            </span>
            <p className="truncate text-sm font-medium text-slate-200">
              {fileMeta}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
            aria-label="Remove selected file"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
      )}

      <label
        htmlFor="job-description"
        className="mt-6 block text-sm font-medium text-slate-200"
      >
        Job description
      </label>
      <textarea
        id="job-description"
        rows={10}
        value={jobDescription}
        onChange={(event) => setJobDescription(event.target.value)}
        placeholder="Paste the full job description here..."
        className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
      />

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 aria-hidden="true" className="animate-spin" size={18} />
            Analyzing resume...
          </>
        ) : (
          <>
            <UploadCloud aria-hidden="true" size={18} />
            Analyze Resume
          </>
        )}
      </button>
    </form>
  );
}
