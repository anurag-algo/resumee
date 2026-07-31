"use client";

const clampScore = (value) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(parsed)));
};

const getScoreTheme = (score) => {
  if (score >= 75) {
    return {
      label: "Strong ATS Match",
      ring: "stroke-emerald-400",
      glow: "shadow-emerald-500/20",
      text: "text-emerald-300",
      badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    };
  }

  if (score >= 50) {
    return {
      label: "Moderate ATS Match",
      ring: "stroke-amber-400",
      glow: "shadow-amber-500/20",
      text: "text-amber-300",
      badge: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    };
  }

  return {
    label: "Low ATS Match",
    ring: "stroke-red-400",
    glow: "shadow-red-500/20",
    text: "text-red-300",
    badge: "border-red-400/30 bg-red-400/10 text-red-200",
  };
};

export default function AtsScoreCard({ atsScore = 0 }) {
  const score = clampScore(atsScore);
  const theme = getScoreTheme(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <section
      aria-label="ATS score"
      className={`rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl ${theme.glow}`}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase text-slate-400">
            ATS Score
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-100">
            Resume match rating
          </h2>
          <p
            className={`mt-4 inline-flex rounded-full border px-3 py-1 text-sm font-medium ${theme.badge}`}
          >
            {theme.label}
          </p>
        </div>

        <div className="relative h-36 w-36 shrink-0">
          <svg viewBox="0 0 140 140" className="-rotate-90">
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              strokeWidth="12"
              className="stroke-slate-800"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              strokeLinecap="round"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={`${theme.ring} transition-all duration-700`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${theme.text}`}>{score}</span>
            <span className="text-sm font-medium text-slate-400">/100</span>
          </div>
        </div>
      </div>
    </section>
  );
}
