"use client";

import { useState } from "react";
import { CreditCard, Sparkles, Wallet } from "lucide-react";
import WalletDisplay from "../../components/WalletDisplay.js";
import BuyCreditsModal from "../../components/BuyCreditsModal.js";
import { useWallet } from "../../context/WalletContext.js";

export default function WalletPage() {
  const { wallet } = useWallet();
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const balance = wallet?.balance ?? 0;

  return (
    <div className="min-h-full bg-slate-950 text-slate-100">
      {/* Page Header */}
      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.6fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-200">
                <Wallet aria-hidden="true" size={16} />
                Credit Wallet
              </div>
              <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
                Manage your credits
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
                Purchase credits to run AI-powered resume analyses. Each
                analysis costs{" "}
                <span className="font-semibold text-cyan-300">10 credits</span>.
                Credits never expire.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300">
                  <Sparkles aria-hidden="true" size={24} />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    Current balance
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-100">
                    🪙 {balance.toLocaleString()} Credits
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="wallet-page-buy-btn"
                onClick={() => setBuyModalOpen(true)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                <CreditCard aria-hidden="true" size={16} />
                Buy More Credits
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Wallet Details */}
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <WalletDisplay />
      </main>

      <BuyCreditsModal
        isOpen={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
      />
    </div>
  );
}
