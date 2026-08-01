import mongoose from "mongoose";
import Wallet from "../models/wallet.model.js";
import CreditTransaction from "../models/creditTransaction.model.js";

const SIGNUP_CREDITS = 50;
const ANALYSIS_COST = 10;

/**
 * Creates a new wallet for a user with the welcome credit balance.
 * Also records the FREE_SIGNUP credit transaction.
 * Called during user registration (both email and Google OAuth).
 */
const createWallet = async (userId) => {
  // Use a session to ensure wallet + transaction are created atomically
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [wallet] = await Wallet.create([{ userId, balance: SIGNUP_CREDITS }], { session });

    await CreditTransaction.create(
      [
        {
          userId,
          type: "CREDIT",
          amount: SIGNUP_CREDITS,
          balanceAfter: SIGNUP_CREDITS,
          reason: "FREE_SIGNUP",
          metadata: { note: "Welcome credits on account creation" },
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return wallet;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Fetches the wallet for a given user.
 * If no wallet exists (legacy user), auto-creates one with 0 credits
 * so existing users are never broken by the credit system.
 */
const getWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    // Legacy user — create wallet with 0 credits (no transaction needed)
    wallet = await Wallet.create({ userId, balance: 0 });
    console.log(`ℹ️  Auto-created 0-credit wallet for legacy user ${userId}`);
  }

  return wallet;
};

/**
 * Adds credits to the user's wallet atomically.
 * Creates a CREDIT transaction record.
 */
const addCredits = async (userId, amount, reason, referenceId = null, metadata = null) => {
  if (!amount || amount <= 0) {
    const error = new Error("Credit amount must be a positive integer.");
    error.statusCode = 400;
    throw error;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true, upsert: true, session },
    );

    await CreditTransaction.create(
      [
        {
          userId,
          type: "CREDIT",
          amount,
          balanceAfter: wallet.balance,
          reason,
          referenceId: referenceId ? String(referenceId) : null,
          metadata,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return wallet;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Deducts credits from the user's wallet atomically.
 * Throws HTTP 402 if the user does not have enough credits.
 * Creates a DEBIT transaction record.
 */
const deductCredits = async (userId, amount, reason, referenceId = null) => {
  if (!amount || amount <= 0) {
    const error = new Error("Deduction amount must be a positive integer.");
    error.statusCode = 400;
    throw error;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Atomic update with a balance guard — only succeeds if balance >= amount
    const wallet = await Wallet.findOneAndUpdate(
      { userId, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { new: true, session },
    );

    if (!wallet) {
      // Either wallet doesn't exist or balance is insufficient
      const existingWallet = await Wallet.findOne({ userId }).session(session);
      await session.abortTransaction();

      const error = new Error(
        existingWallet
          ? `Insufficient credits. You need ${amount} credits but only have ${existingWallet.balance}.`
          : "Wallet not found. Please contact support.",
      );
      error.statusCode = 402;
      throw error;
    }

    await CreditTransaction.create(
      [
        {
          userId,
          type: "DEBIT",
          amount,
          balanceAfter: wallet.balance,
          reason,
          referenceId: referenceId ? String(referenceId) : null,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return wallet;
  } catch (error) {
    // Only abort if the session is still active (not already aborted above)
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Refunds credits back to the wallet after a failed operation.
 * Creates a REFUND transaction record.
 */
const refundCredits = async (userId, amount, referenceId = null, metadata = null) => {
  return addCredits(userId, amount, "REFUND", referenceId, {
    ...metadata,
    note: "Automatic refund due to failed operation",
  });
};

/**
 * Returns wallet summary: current balance, lifetime purchased, lifetime used credits.
 */
const getWalletSummary = async (userId) => {
  const wallet = await getWallet(userId);

  // Aggregate lifetime stats from transaction history
  const stats = await CreditTransaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  const statsMap = { CREDIT: 0, DEBIT: 0 };
  for (const stat of stats) {
    statsMap[stat._id] = stat.total;
  }

  return {
    balance: wallet.balance,
    lifetimePurchased: statsMap.CREDIT,
    lifetimeUsed: statsMap.DEBIT,
  };
};

/**
 * Returns full transaction history for a user, sorted newest-first.
 */
const getTransactionHistory = async (userId) => {
  return CreditTransaction.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
};

export {
  ANALYSIS_COST,
  SIGNUP_CREDITS,
  addCredits,
  createWallet,
  deductCredits,
  getTransactionHistory,
  getWallet,
  getWalletSummary,
  refundCredits,
};
