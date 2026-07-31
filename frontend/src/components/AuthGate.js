"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation.js";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import Navbar from "./Navbar.js";

const PUBLIC_PATHS = ["/login"];

export default function AuthGate({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (loading || !user || !isPublicPath) {
      return;
    }

    router.replace("/");
  }, [isPublicPath, loading, router, user]);

  // Redirect unauthenticated users to login for protected routes
  useEffect(() => {
    if (loading || user || isPublicPath) {
      return;
    }

    router.replace("/login");
  }, [isPublicPath, loading, router, user]);

  // Show loading spinner during auth check or while redirecting
  if (loading || (user && isPublicPath) || (!user && !isPublicPath && !loading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4 text-sm text-slate-300">
          <Loader2 aria-hidden="true" className="animate-spin text-cyan-300" />
          Preparing your workspace...
        </div>
      </div>
    );
  }

  if (isPublicPath) {
    return children;
  }

  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
