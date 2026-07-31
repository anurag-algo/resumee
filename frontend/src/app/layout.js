import AppProviders from "../components/AppProviders.js";
import AuthGate from "../components/AuthGate.js";
import "./globals.css";

export const metadata = {
  title: "Resumee — AI Resume & ATS Analyzer",
  description:
    "Upload your PDF resume, paste a job description, and get an instant ATS compatibility score with AI-powered skill matching, missing keyword detection, and actionable improvement recommendations.",
  keywords: [
    "resume analyzer",
    "ATS score",
    "resume checker",
    "job application",
    "AI resume review",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        <AppProviders googleClientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <AuthGate>{children}</AuthGate>
        </AppProviders>
      </body>
    </html>
  );
}
