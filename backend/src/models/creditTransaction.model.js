import mongoose from "mongoose";

const TRANSACTION_TYPES = ["CREDIT", "DEBIT"];
const TRANSACTION_REASONS = [
  "FREE_SIGNUP",
  "RESUME_ANALYSIS",
  "PAYMENT",
  "REFUND",
  "ADMIN",
];

const creditTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: TRANSACTION_TYPES,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Transaction amount must be at least 1."],
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      enum: TRANSACTION_REASONS,
      required: true,
    },
    // Optional reference to an external entity (e.g., Payment._id, Analysis._id)
    referenceId: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for fast per-user queries sorted by newest first
creditTransactionSchema.index({ userId: 1, createdAt: -1 });

const CreditTransaction = mongoose.model(
  "CreditTransaction",
  creditTransactionSchema,
);

export { TRANSACTION_REASONS, TRANSACTION_TYPES };
export default CreditTransaction;
