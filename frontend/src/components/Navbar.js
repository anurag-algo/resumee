"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link.js";
import { usePathname, useRouter } from "next/navigation.js";
import {
  ChevronDown,
  CreditCard,
  History,
  LogIn,
  LogOut,
  Sparkles,
  UserCircle,
  UserPlus,
  Wallet,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { useWallet } from "../context/WalletContext.js";

const getInitials = (user) => {
  const source = user?.name || user?.email || "User";
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { wallet } = useWallet();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const balance = wallet?.balance ?? null;
  const displayName = user?.name || "Resume Analyst";
  const displayEmail = user?.email || "Signed in";
  const initials = useMemo(() => getInitials(user), [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    router.replace("/login");
  };

  const navLinks = [
    { href: "/", label: "Analyze" },
    { href: "/history", label: "History", icon: History },
    { href: "/wallet", label: "Wallet", icon: Wallet },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <nav className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
              <Sparkles aria-hidden="true" size={21} />
            </span>
            <span>
              <span className="block text-base font-bold tracking-tight text-slate-50">
                Resumee
              </span>
              <span className="hidden text-xs font-medium text-slate-400 sm:block">
                AI-powered ATS analyzer
              </span>
            </span>
          </Link>

          {user && (
            <div className="hidden items-center gap-1 sm:flex">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-cyan-400/10 text-cyan-200"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                    }`}
                  >
                    {link.icon && <link.icon aria-hidden="true" size={15} />}
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          {user ? (
            <button
              type="button"
              onClick={() => setProfileOpen((current) => !current)}
              className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 text-left transition hover:border-cyan-400/50 hover:bg-slate-900/80"
              aria-expanded={profileOpen}
              aria-label="Open user profile menu"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 text-sm font-bold text-slate-950">
                {initials || <UserCircle aria-hidden="true" size={20} />}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block max-w-40 truncate text-sm font-semibold text-slate-100">
                  {displayName}
                </span>
                {/* Credit badge */}
                {balance !== null && (
                  <span className="block text-xs font-medium text-cyan-300">
                    🪙 {balance.toLocaleString()} Credits
                  </span>
                )}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`text-slate-400 transition ${
                  profileOpen ? "rotate-180" : ""
                }`}
                size={17}
              />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-800 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/50 hover:bg-cyan-400/10"
              >
                <LogIn aria-hidden="true" size={16} />
                Login
              </Link>
              <Link
                href="/login?mode=signup"
                className="hidden items-center gap-2 rounded-xl bg-cyan-400 px-3 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 sm:inline-flex"
              >
                <UserPlus aria-hidden="true" size={16} />
                Create Account
              </Link>
            </div>
          )}

          {user && profileOpen && (
            <div className="animate-scale-in absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-slate-950/70">
              <div className="border-b border-slate-800 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-base font-bold text-slate-950">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-100">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {displayEmail}
                    </p>
                    {balance !== null && (
                      <p className="mt-0.5 text-xs font-semibold text-cyan-300">
                        🪙 {balance.toLocaleString()} Credits
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-2">
                {/* Mobile-only nav links */}
                <div className="sm:hidden">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-slate-100"
                    >
                      {link.icon && <link.icon aria-hidden="true" size={17} />}
                      {link.label}
                    </Link>
                  ))}
                  <div className="my-2 h-px bg-slate-800" />
                </div>

                <div className="rounded-xl bg-slate-950/70 px-3 py-3">
                  <p className="text-xs font-medium uppercase text-slate-500">
                    Credits
                  </p>
                  {balance !== null ? (
                    <p className="mt-1 text-sm text-slate-300">
                      You have{" "}
                      <span className="font-bold text-cyan-300">
                        {balance.toLocaleString()} credits
                      </span>{" "}
                      available.
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-slate-300">
                      Loading credits...
                    </p>
                  )}
                  <Link
                    href="/wallet"
                    className="mt-2 flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300"
                  >
                    <CreditCard aria-hidden="true" size={12} />
                    Buy more credits →
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-400/10 hover:text-red-100"
                >
                  <LogOut aria-hidden="true" size={17} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
