"use client";

import { useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  History,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useWallet } from "../context/WalletContext.js";
import BuyCreditsModal from "./BuyCreditsModal.js";

const REASON_LABELS = {
  FREE_SIGNUP: "Welcome Bonus",
  RESUME_ANALYSIS: "Resume Analysis",
  PAYMENT: "Credit Purchase",
  REFUND: "Analysis Refund",
  ADMIN: "Admin Adjustment",
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function WalletDisplay() {
  const { wallet, transactions, loading, refreshWallet } = useWallet();
  const [buyModalOpen, setBuyModalOpen] = useState(false);

  const balance = wallet?.balance ?? 0;
  const lifetimePurchased = wallet?.lifetimePurchased ?? 0;
  const lifetimeUsed = wallet?.lifetimeUsed ?? 0;

  const recentTransactions = transactions.slice(0, 10);

  return (
    <>
      <div className="space-y-6 animate-fade-in-up">
        {/* Wallet Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Balance */}
          <div className="relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/10 to-slate-900 p-5">
            <div className="absolute right-4 top-4 opacity-10">
              <Wallet size={48} className="text-cyan-300" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
              Current Balance
            </p>
            <p className="mt-2 text-4xl font-bold text-slate-50">
              🪙 {balance.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Credits available
            </p>
            <button
              type="button"
              id="wallet-buy-credits-btn"
              onClick={() => setBuyModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              <CreditCard aria-hidden="true" size={15} />
              Buy Credits
            </button>
          </div>

          {/* Lifetime Purchased */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <TrendingUp aria-hidden="true" size={18} />
              </span>
              <p className="text-sm font-medium text-slate-400">
                Lifetime Purchased
              </p>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-100">
              {lifetimePurchased.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500">Total credits ever added</p>
          </div>

          {/* Lifetime Used */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-400/10 text-orange-300">
                <TrendingDown aria-hidden="true" size={18} />
              </span>
              <p className="text-sm font-medium text-slate-400">
                Lifetime Used
              </p>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-100">
              {lifetimeUsed.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-slate-500">Total credits consumed</p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <div className="flex items-center gap-2">
              <History aria-hidden="true" className="text-slate-400" size={18} />
              <h2 className="text-sm font-semibold text-slate-200">
                Transaction History
              </h2>
            </div>
            <button
              type="button"
              onClick={refreshWallet}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50"
              aria-label="Refresh wallet"
            >
              <RefreshCw
                aria-hidden="true"
                size={13}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-slate-500">No transactions yet.</p>
              <p className="mt-1 text-xs text-slate-600">
                Your credit history will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {recentTransactions.map((tx) => (
                <div
                  key={tx._id}
                  className="flex items-center justify-between gap-4 px-5 py-3 transition hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        tx.type === "CREDIT"
                          ? "bg-emerald-400/10 text-emerald-300"
                          : tx.type === "DEBIT"
                          ? "bg-orange-400/10 text-orange-300"
                          : "bg-blue-400/10 text-blue-300"
                      }`}
                    >
                      {tx.type === "CREDIT" ? (
                        <ArrowUpCircle aria-hidden="true" size={18} />
                      ) : (
                        <ArrowDownCircle aria-hidden="true" size={18} />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-200">
                        {REASON_LABELS[tx.reason] || tx.reason}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p
                      className={`text-sm font-bold ${
                        tx.type === "CREDIT"
                          ? "text-emerald-300"
                          : "text-orange-300"
                      }`}
                    >
                      {tx.type === "CREDIT" ? "+" : "-"}
                      {tx.amount}
                    </p>
                    <p className="text-xs text-slate-500">
                      bal: {tx.balanceAfter}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BuyCreditsModal
        isOpen={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
      />
    </>
  );
}
