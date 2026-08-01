"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../lib/api.js";
import { useAuth } from "./AuthContext.js";

const WalletContext = createContext(null);

const WalletProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWallet = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.get("/wallet");
      const data = response?.data?.data;
      setWallet(data || null);
    } catch (error) {
      console.error("Failed to fetch wallet:", error?.response?.data?.message || error.message);
    }
  }, [token]);

  const fetchTransactions = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.get("/wallet/history");
      const data = response?.data?.data?.transactions;
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch transactions:", error?.response?.data?.message || error.message);
    }
  }, [token]);

  /**
   * Refreshes both wallet balance and transaction history.
   * Call this after a successful payment or any credit event.
   */
  const refreshWallet = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchWallet(), fetchTransactions()]);
    } finally {
      setLoading(false);
    }
  }, [fetchWallet, fetchTransactions]);

  // Auto-fetch when user logs in
  useEffect(() => {
    if (user && token) {
      refreshWallet();
    } else {
      setWallet(null);
      setTransactions([]);
    }
  }, [user, token]);

  const value = useMemo(
    () => ({
      wallet,
      transactions,
      loading,
      refreshWallet,
      fetchWallet,
      fetchTransactions,
    }),
    [wallet, transactions, loading, refreshWallet, fetchWallet, fetchTransactions],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export { WalletContext, WalletProvider, useWallet };
export default WalletProvider;
