"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, CreditCard, Loader2, Sparkles, X, Zap } from "lucide-react";
import api from "../lib/api.js";
import { useWallet } from "../context/WalletContext.js";

const PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for getting started",
    amountINR: 99,
    credits: 100,
    icon: "⚡",
    highlight: false,
  },
  {
    id: "professional",
    name: "Professional",
    description: "Great value for active job seekers",
    amountINR: 299,
    credits: 350,
    icon: "🚀",
    highlight: true,
  },
  {
    id: "ultimate",
    name: "Ultimate",
    description: "Best value for power users",
    amountINR: 499,
    credits: 650,
    icon: "👑",
    highlight: false,
  },
];

/**
 * Dynamically loads the Razorpay checkout script.
 */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function BuyCreditsModal({ isOpen, onClose }) {
  const { refreshWallet } = useWallet();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const overlayRef = useRef(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setError("");
      setSuccess("");
      setSelectedPackage(null);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, loading, onClose]);

  const handlePurchase = async (pkg) => {
    setError("");
    setSuccess("");
    setSelectedPackage(pkg.id);
    setLoading(true);

    try {
      // Step 1: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load payment gateway. Please check your internet connection.");
      }

      // Step 2: Create order on backend
      const orderResponse = await api.post("/payments/create-order", {
        packageId: pkg.id,
      });
      const order = orderResponse?.data?.data;

      if (!order?.orderId) {
        throw new Error("Failed to create payment order. Please try again.");
      }

      // Step 3: Open Razorpay Checkout
      await new Promise((resolve, reject) => {
        const options = {
          key: order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "Resumee",
          description: `${order.packageName} — ${order.credits} Credits`,
          order_id: order.orderId,
          theme: { color: "#22d3ee" },
          modal: {
            ondismiss: () => {
              reject(new Error("Payment cancelled by user."));
            },
          },
          handler: async (response) => {
            try {
              // Step 4: Verify payment on backend
              const verifyResponse = await api.post("/payments/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              const verifyData = verifyResponse?.data?.data;
              if (verifyData?.alreadyVerified) {
                setSuccess("Payment was already verified. Your credits are up to date!");
              } else {
                setSuccess(
                  `🎉 Payment successful! ${verifyData?.credits || order.credits} credits have been added to your wallet.`,
                );
              }

              // Step 5: Refresh wallet balance
              await refreshWallet();
              resolve();
            } catch (verifyError) {
              reject(
                new Error(
                  verifyError?.response?.data?.message ||
                    "Payment verification failed. Please contact support if credits were deducted.",
                ),
              );
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response) => {
          reject(
            new Error(
              response?.error?.description || "Payment failed. Please try again.",
            ),
          );
        });
        rzp.open();
      });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Something went wrong.";
      if (!message.includes("cancelled")) {
        setError(message);
      }
    } finally {
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && !loading && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buy-credits-title"
    >
      <div className="relative mx-4 w-full max-w-xl animate-scale-in rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-slate-950/80">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <CreditCard aria-hidden="true" size={20} />
            </span>
            <div>
              <h2
                id="buy-credits-title"
                className="text-lg font-bold text-slate-100"
              >
                Buy Credits
              </h2>
              <p className="text-xs text-slate-400">
                Each resume analysis costs 10 credits
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100 disabled:opacity-40"
            aria-label="Close modal"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Success message */}
          {success && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200 animate-fade-in">
              <CheckCircle aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
              <span>{success}</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200 animate-fade-in">
              <Zap aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Package cards */}
          <div className="grid gap-3 sm:grid-cols-3">
            {PACKAGES.map((pkg) => {
              const isSelected = selectedPackage === pkg.id;
              const isLoading = loading && isSelected;

              return (
                <button
                  key={pkg.id}
                  type="button"
                  id={`pkg-${pkg.id}`}
                  onClick={() => !loading && handlePurchase(pkg)}
                  disabled={loading}
                  className={`relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition ${
                    pkg.highlight
                      ? "border-cyan-400/60 bg-cyan-400/5 hover:border-cyan-300 hover:bg-cyan-400/10"
                      : "border-slate-700 bg-slate-950/60 hover:border-slate-500 hover:bg-slate-800/60"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {pkg.highlight && (
                    <span className="absolute -top-2.5 left-3 inline-flex items-center gap-1 rounded-full bg-cyan-400 px-2 py-0.5 text-xs font-bold text-slate-950">
                      <Sparkles aria-hidden="true" size={10} />
                      Best Value
                    </span>
                  )}

                  <span className="text-2xl">{pkg.icon}</span>
                  <div>
                    <p className="font-bold text-slate-100">{pkg.name}</p>
                    <p className="text-xs text-slate-400">{pkg.description}</p>
                  </div>

                  <div className="mt-1">
                    <p className="text-xl font-bold text-slate-50">
                      ₹{pkg.amountINR}
                    </p>
                    <p className="text-xs font-semibold text-cyan-300">
                      🪙 {pkg.credits} Credits
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      = {Math.floor(pkg.credits / 10)} analyses
                    </p>
                  </div>

                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900/80">
                      <Loader2
                        aria-hidden="true"
                        className="animate-spin text-cyan-300"
                        size={24}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-center text-xs text-slate-500">
            Secured by Razorpay · UPI, Cards, Net Banking accepted
          </p>
        </div>
      </div>
    </div>
  );
}
